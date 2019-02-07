const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class CityAlkoScraper extends Scraper {
    constructor() {
        super("CityAlko", "EE");
        this.baseUrl = "https://cityalko.ee";
        this.categoryPages = [
            {url: "https://cityalko.ee/tootekategooria/kange-alkohol/?products-per-page=all", category: "kange"},
            {url: "https://cityalko.ee/tootekategooria/likoorid/?products-per-page=all", category: "liköör"}
        ];

        super.priceRegex = /([\d,.]*\s€)/;
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
                const $products = $(".clearfix.products").find(".instock");
                let products = [];

                $products.each((index, value) => {

                    const $meta = $(value).find(".product-meta");
                    const name = $meta.find("h3[class='product-name'] > a").text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: false,
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: $(value).find("a[class='woocommerce-LoopProduct-link woocommerce-loop-product__link']").attr("href"),
                        price: this.getPrice($(value).find("span[class='woocommerce-Price-amount amount']").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: this.removeEstonianLetters($meta.find(".product-brand > a").last().text()).toLowerCase(),
                        imageUrl: $(value).find("a[class='thumb'] > span > img").attr("src")
                    };

                    if (product.ml === null) return;
                    products.push(product);
                });
                callback(products);
            })
            .catch((err) => {
                console.error(err);
            });

    }
}

module.exports = CityAlkoScraper;
