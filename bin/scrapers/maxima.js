const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class MaximaScraper extends Scraper {
    constructor() {
        super("Maxima", "EE");
        this.baseUrl = "https://www.barbora.ee";
        this.categoryPages = [
            {url: "https://www.barbora.ee/joogid-tubakatooted/kange-alkohol/viinad", category: "viin"},
            {url: "https://www.barbora.ee/joogid-tubakatooted/kange-alkohol/viskid-konjakid-ja-brandid", category: "viski/konjak/brandi"},
            {url: "https://www.barbora.ee/joogid-tubakatooted/kange-alkohol/rummid", category: "rumm"},
            {url: "https://www.barbora.ee/joogid-tubakatooted/kange-alkohol/likoorid", category: "likoor"},
            {url: "https://www.barbora.ee/joogid-tubakatooted/kange-alkohol/muu-kange-alkohol", category: "muu"}
        ];
    }

    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    deepScrape(callback) {
        super.deepScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        rp(category.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const $products = $('.b-products-list--wrapper').find(".b-product--wrap");

                let products = [];

                $products.each((index, value) => {
                    const name = $(value).find("span[itemprop='name']").text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: false,
                        originalName: name,
                        store: this.storeName,
                        url: this.baseUrl + $(value).find("a[class*='b-product--imagelink']").attr("href"),
                        price: this.getPrice($(value).find("span[itemprop='price']").text()),
                        unitPrice: this.getPrice($(value).find("div[class='b-product-price--extra'] > div").text()),
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: this.baseUrl + $(value).find("img[itemprop='image']").attr("src")
                    };

                    products.push(product);
                });
                callback(products);
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

module.exports = MaximaScraper;
