const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class SelverScraper extends Scraper {
    constructor() {
        super("Selver", "EE");
        this.baseUrl = "https://www.selver.ee";
        this.categoryPages = [
            {url: "https://www.selver.ee/joogid/kange-alkohol/viinad", category: "viin"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/dzinnid", category: "dzinn"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/viskid", category: "viski"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/konjakid-brandid", category: "konjak/brandi"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/rummid", category: "rumm"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/aperitiiviid", category: "aperitiiv"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/likoorid", category: "likoor"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/muud-kanged-alkohoolsed-joogid", category: "muu"},
            {url: "https://www.selver.ee/joogid/lahja-alkohol/olled-siidrid-segud-kokteilid?product_segment=3849,4037,4413,4118,4291,4292,4046", category: "olu"},
            {url: "https://www.selver.ee/joogid/lahja-alkohol/olled-siidrid-segud-kokteilid?product_segment=3939,4034,3940,4986", category: "siider"},
        ];

        super.priceRegex = /([\d,.]*)/;
        super.volRegex = /((\d[\d.,]*)[%])/;
    }


    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeProductPage(url, category, callback) {
        rp(url).then((html) => {
            const $ = cheerio.load(html);
            const $product = $(".product-essential");
            const name = $product.find(".page-title > h1").text();
            const $oldPrice = $product.find("p[class='old-price left'] > .price");
            const sale = Boolean($oldPrice.length);
            const $price = $product.find("span[itemprop='price']");
            const info = $product.find("table[class='product-attributes']").find("th:contains('Alkoholi liik')").next().text();

            const price = parseFloat($price.attr("content"));

            if (isNaN(price)) {
                console.warn(`Price is NaN will not add ${url}`);
                return;
            }

            const product = {
                name: this.getCleanName(name),
                sale: sale,
                originalName: name,
                storeCounty: this.storeCounty,
                store: this.storeName,
                url: url,
                price: price,
                unitPrice: this.getPrice($price.next().text()),
                oldPrice: (sale ? this.getPrice($oldPrice.children().first().text()) : null),
                oldUnitPrice: (sale ? this.getPrice($oldPrice.children().last().text()) : null),
                vol: this.getVol(info),
                ml: this.getMl(name),
                category: category.category,
                imageUrl: "https:" + $product.find("img[itemprop='image']").attr("src")
            };
            callback(product);
        });
    }

    scrapeCategoryPage(category, callback) {

        rp(category.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const $items = $('.category-products').find(".age-restricted > a");
                $items.each((index, value) => {
                    this.scrapeProductPage($(value).attr("href"), category, (product) => {
                        callback([product]);
                    });

                });


                const nextPageUrl = this.getNextPage($);
                if (nextPageUrl) {
                    const newCategory = {
                        url: nextPageUrl,
                        category: category.category
                    };

                    this.scrapeCategoryPage(newCategory, callback);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    getNextPage($) {
        let $el = $("a[class='next i-next']");
        if ($el.length) {
            return $el.attr("href");
        }
        return null
    }
}

module.exports = SelverScraper;
