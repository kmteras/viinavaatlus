const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('bluebird');

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
            {url: "https://www.selver.ee/joogid/lahja-alkohol/olled-siidrid-segud-kokteilid", category: "lahja"}

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

    scrapeProductPage(url, category) {
        return rp({url: url, transform: html => cheerio.load(html)}).then($ => {
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

            return {
                name: this.getCleanName(name),
                sale: sale,
                originalName: name,
                storeCounty: this.storeCounty,
                store: this.storeName,
                url: url,
                price: price,
                unitPrice: this.getPrice($price.next().text()),
                oldPrice: sale ? this.getPrice($oldPrice.children().first().text()) : null,
                oldUnitPrice: sale ? this.getPrice($oldPrice.children().last().text()) : null,
                vol: this.getVol(info),
                ml: this.getMl(name),
                category: category,
                imageUrl: "https:" + $product.find("img[itemprop='image']").attr("src")
            }
        })
    }

    getProductPages(category, pages = []) {
        return rp({url: category.url, transform: html => cheerio.load(html)}).then($ => {
            pages = pages.concat($('.category-products').find(".age-restricted > a").map((i, v) => $(v).attr("href")).get());
            const $next = $("a[class='next i-next']");
            const nextUrl = $next.length ? $next.attr("href") : null;
            if (nextUrl) {
                category.url = nextUrl;
                return this.getProductPages(category, pages);
            }
            return pages;
        })

    }

    scrapeCategoryPage(category, callback) {
        this.getProductPages(category).then(links => {
            return Promise.map(links, (link) => {
                return this.scrapeProductPage(link, category.category);
            }, {concurrency: 10})

        }).then(res => callback(res));
    }
}

module.exports = SelverScraper;
