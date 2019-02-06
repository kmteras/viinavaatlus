const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class Alko1000Scraper extends Scraper {
    constructor() {
        super("Alko1000");
        this.baseUrl = "https://alko1000.ee";
        this.categoryPages = [
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/viin/", category: "vodka"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/dzinn/", category: "gin"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/viski/", category: "whiskey"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/rumm/", category: "rum"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/likoor/", category: "liquor"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/tekiila/", category: "tequila"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/konjak/", category: "cognac"},
            {url: "http://alko1000.ee/alko1000/product-category/kange-alkohol/brandi/", category: "brandy"}

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
                const $products = $(".tooted").find(".instock");

                let products = [];

                $products.each((index, value) => {
                    const name = $(value).find("h2[class='woocommerce-loop-product__title']").text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: false,
                        originalName: name,
                        store: this.storeName,
                        url: $(value).find("a[class='woocommerce-LoopProduct-link woocommerce-loop-product__link']").attr("href"),
                        price: this.getPrice($(value).find("span[class='woocommerce-Price-amount amount']").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find("div[class='archive-img-wrap'] > img").attr("src")
                    };

                    if (product.ml === null) return;
                    products.push(product);
                    console.log(product)
                });
                callback(products);

                const $next = $("a[class='next page-numbers']")
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

module.exports = Alko1000Scraper;