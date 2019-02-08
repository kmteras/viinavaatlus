const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class SuperAlkoScraper extends Scraper {
    constructor() {
        super("SuperAlko LV", "LV");
        this.baseUrl = "https://www.superalko.lv/";
        this.categoryPages = [
            {url: "https://www.superalko.lv/tootekataloog/4/65", category: "absint"},
            {url: "https://www.superalko.lv/tootekataloog/4/7", category: "viin"},
            {url: "https://www.superalko.lv/tootekataloog/4/8", category: "viin"},
            {url: "https://www.superalko.lv/tootekataloog/4/6", category: "viin"},
            {url: "https://www.superalko.lv/tootekataloog/5/9", category: "rumm"},
            {url: "https://www.superalko.lv/tootekataloog/6/10", category: "tekiila"},
            {url: "https://www.superalko.lv/tootekataloog/7/11", category: "konjak"},
            {url: "https://www.superalko.lv/tootekataloog/8/12", category: "brandi"},
            {url: "https://www.superalko.lv/tootekataloog/9/56", category: "viski"},
            {url: "https://www.superalko.lv/tootekataloog/9/57", category: "viski"},
            {url: "https://www.superalko.lv/tootekataloog/9/58", category: "viski"},
            {url: "https://www.superalko.lv/tootekataloog/9/55", category: "viski"},
            {url: "https://www.superalko.lv/tootekataloog/9/106", category: "viski"},
            {url: "https://www.superalko.lv/tootekataloog/10/14", category: "likoor"},
            {url: "https://www.superalko.lv/tootekataloog/11/15", category: "dzinn"},
            {url: "https://www.superalko.lv/tootekataloog/27/67", category: "muu"},
            {url: "https://www.superalko.lv/tootekataloog/2/4", category: "siider"},
            {url: "https://www.superalko.lv/tootekataloog/3/5", category: "long-drink"},
            {url: "https://www.superalko.lv/tootekataloog/1/2", category: "olu"},
            {url: "https://www.superalko.lv/tootekataloog/1/3", category: "olu"},
            {url: "https://www.superalko.lv/tootekataloog/1/3", category: "vermut"}
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
                const $products = $("div[class='table'] > div").has("> .cell");
                let products = [];

                $products.each((index, value) => {

                    const $name = $(value).find(".col2 > span > a");
                    const name = $name.text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: $(value).find("span[style*='color:']").attr("style") === "color:#FF0000",
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: this.baseUrl + $name.attr("href"),
                        price: this.getPrice($(value).find("span[style*='color:']").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find(".col1 > a > img").attr("src").replace("-thumb-", "-")
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

module.exports = SuperAlkoScraper;
