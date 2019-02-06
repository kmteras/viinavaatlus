const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class SelverScraper extends Scraper {
    constructor() {
        super("Selver");
        this.baseUrl = "https://www.selver.ee";
        this.categoryPages = [
            {url: "https://www.selver.ee/joogid/kange-alkohol/viinad", category: "vodka"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/dzinnid", category: "gin"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/viskid", category: "whiskey"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/konjakid-brandid", category: "cognac"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/rummid", category: "rum"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/aperitiiviid", category: "digestifs"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/likoorid", category: "digestifs"},
            {url: "https://www.selver.ee/joogid/kange-alkohol/muud-kanged-alkohoolsed-joogid", category: "other"}
        ];

        this.priceRegex = /([\d,.]*\s€)/
    }

    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        rp(category.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const $products = $('.category-products').find(".item.age-restricted");

                let products = [];

                $products.each((index, value) => {
                    const name = $(value).find("h5[class='product-name']").text();

                    const $regularEl = $(value).find("span[class*='regular-price']");

                    let priceString = null;
                    let unitPriceString = null;

                    let oldPriceString = null;
                    let oldUnitPriceString = null;

                    if ($regularEl.length) {
                        priceString = $regularEl.find("span[class='price']").text();
                        unitPriceString = $regularEl.find("span[class='unit-price']").text();
                    } else {
                        const $spans = $(value).find("span[class='price'] > span");
                        priceString = $spans.text();
                        unitPriceString = $spans.next().text();

                        const $oldPrice = $(value).find("p[class*='old-price'] > span > span");
                        oldPriceString = $oldPrice.text();
                        oldUnitPriceString = $oldPrice.next().text();
                    }

                    const product = {
                        name: this.getCleanName(name),
                        sale: !!!$regularEl.length,
                        originalName: name,
                        store: this.storeName,
                        url: $(value).find("a[class='product-image']").attr("href"),
                        price: this.getPrice(priceString),
                        unitPrice: this.getPrice(unitPriceString),
                        oldPrice: this.getPrice(oldPriceString),
                        oldUnitPrice: this.getPrice(oldUnitPriceString),
                        vol: null,
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find("a[class='product-image'] > img").attr("src")
                    };

                    products.push(product);
                    // console.log(product);
                });
                callback(products);

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
