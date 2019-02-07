const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class AlkoshopScraper extends Scraper {
    constructor() {
        super("Alkoshop", "LV");
        this.baseUrl = "https://www.alkoshop.ee/";
        this.categoryPages = [
            {url: "https://alkoshop.ee/et/33-absint?id_category=33&n=1000", category: "absint"},
            {url: "https://alkoshop.ee/et/13-viin?id_category=13&n=1000", category: "viin"},
            {url: "https://alkoshop.ee/et/24-dzinn?id_category=24&n=1000", category: "dzinn"},
            {url: "https://alkoshop.ee/et/23-rumm?id_category=23&n=1000", category: "rumm"},
            {url: "https://alkoshop.ee/et/27-tekiila?id_category=27&n=1000", category: "tekiila"},
            {url: "https://alkoshop.ee/et/22-konjak?id_category=22&n=1000", category: "konjak"},
            {url: "https://alkoshop.ee/et/21-braendi?id_category=21&n=1000", category: "brandi"},
            {url: "https://alkoshop.ee/et/20-viski?id_category=20&n=1000", category: "viski"},
            {url: "https://alkoshop.ee/et/25-likoeoer?id_category=25&n=1000", category: "likoor"},
            {url: "https://alkoshop.ee/et/12-olu?id_category=12&n=1000", category: "olu"},
            {url: "https://alkoshop.ee/et/15-siider?id_category=15&n=1000", category: "siider"},
            {url: "https://alkoshop.ee/et/14-long-drink?id_category=14&n=1000", category: "long-drink"},
            {url: "https://alkoshop.ee/et/28-kokteil?id_category=28&n=1000", category: "kokteilijook"}
        ];

        super.priceRegex = /([\d,.]*\s€)/
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
                const $products = $("ul[class='product_list grid row']").find(".product-container");
                let products = [];

                $products.each((index, value) => {

                    const $name = $(value).find("h5[itemprop='name'] > a");
                    const name = $name.attr("title");
                    const $price = $(value).find(".product-price");

                    const product = {
                        name: this.getCleanName(name),
                        sale: $price.hasClass("good-price"),
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: $name.attr("href"),
                        price: this.getPrice($price.text()),
                        unitPrice: this.getPrice($(value).find(".priceperliter").text()),
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find("img[itemprop='image']").attr("src")
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

module.exports = AlkoshopScraper;
