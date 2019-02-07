const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class LivikoScraper extends Scraper {
    constructor() {
        super("Liviko", "EE");
        this.baseUrl = "https://www.livikostore.ee/";
        this.categoryPages = [
            {url: "https://www.livikostore.ee/products/aniisiviin/", category: "absint"},
            {url: "https://www.livikostore.ee/products/viin/", category: "viin"},
            {url: "https://www.livikostore.ee/products/maitseviin/", category: "viin"},
            {url: "https://www.livikostore.ee/products/dzinn-6/", category: "dzinn"},
            {url: "https://www.livikostore.ee/products/rumm/", category: "rumm"},
            {url: "https://www.livikostore.ee/products/tekiila/", category: "tekiila"},
            {url: "https://www.livikostore.ee/products/konjak/", category: "konjak"},
            {url: "https://www.livikostore.ee/products/brandi/", category: "brandi"},
            {url: "https://www.livikostore.ee/products/viski/", category: "viski"},
            {url: "https://www.livikostore.ee/products/likoor/", category: "likoor"},
            {url: "https://www.livikostore.ee/products/grappa/", category: "grappa"},
            {url: "https://www.livikostore.ee/products/vermut/", category: "vermut"},
            {url: "https://www.livikostore.ee/products/armanjakk/", category: "armanjakk"},
            {url: "https://www.livikostore.ee/products/sake/", category: "sake"},
            {url: "https://www.livikostore.ee/products/bitter/", category: "bitter"},
            {url: "https://www.livikostore.ee/products/olu/", category: "olu"},
            {url: "https://www.livikostore.ee/products/siider/", category: "siider"},
            {url: "https://www.livikostore.ee/products/siider-naturaalne/", category: "siider"},
            {url: "https://www.livikostore.ee/products/long-drink/", category: "long-drink"},
            {url: "https://www.livikostore.ee/products/kokteilijook/", category: "kokteilijook"},
            {url: "https://www.livikostore.ee/products/kalvados/", category: "kalvados"}
        ];

        super.priceRegex = /([\d,.]*\s€)/;
        super.lRegex = /((\d[\d,.]*)\s?[lL])/;
        super.volRegex = /((\d[\d.,]*)[°])/;
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
                const $products = $("ul[class='list product-list']").find(".item-inner");
                let products = [];

                $products.each((index, value) => {

                    const name = $(value).find("h2[class='title']").text();
                    const $price = $(value).find(".price");
                    const info = $(value).find("p[class='info']").text().split(" | ");

                    const product = {
                        name: this.getCleanName(name),
                        sale: $price.hasClass("good-price"),
                        originalName: name,
                        store: this.storeName,
                        url: $(value).find("a[class='link']").attr("href"),
                        price: this.getPrice($price.text()),
                        unitPrice: null,
                        vol: this.getVol(info[0]),
                        ml: this.getMl(info[2]),
                        category: category.category,
                        imageUrl: $(value).find(".photo > img").attr("src")
                    };
                    products.push(product);

                });
                callback(products);

                const $next = $("a[class='nextpostslink']");
                if ($next.length) {
                    const newCategory = {
                        url: $next.attr("href"),
                        category: category.category
                    };
                    this.scrapeCategoryPage(newCategory, callback)
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
}

module.exports = LivikoScraper;
