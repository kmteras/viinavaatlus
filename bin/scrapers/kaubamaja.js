const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class KaubamajaScraper extends Scraper {
    constructor() {
        super("Kaubamaja", "EE");
        this.baseUrl = "https://www.kaubamaja.ee/";
        this.categoryPages = [
            /*{url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/kalvados", category: "kalvados"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/vahuveinid", category: "vahuvein"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/roosa-vein", category: "roosa vein"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/valge-vein", category: "valge vein"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/punane-vein", category: "punane vein"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/portvein", category: "portvein"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/muu-kange-alkohol", category: "muu"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/konjak", category: "konjak"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/vermut", category: "vermut"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/brandi", category: "brandi"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/likoor", category: "likoor"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/d-inn", category: "dzinn"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/viski", category: "viski"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/viin", category: "viin"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/rumm", category: "rumm"},*/
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/olled", category: "olu"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/siidrid-ja-alkoholi-kokteilid/siider", category: "siider"},
            {url: "https://www.kaubamaja.ee/gurmee/alkohoolsed-joogid/siidrid-ja-alkoholi-kokteilid/kokteilid", category: "kokteilijook"}
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
                const $products = $(".category-products").find(".item.age-restricted");
                let products = [];
                $products.each((index, value) => {

                    const name = $(value).find("h5[class='products-grid__name product-name']")
                        .clone().find(".products-grid__brand").remove().end().text();
                    const $price = $(value).find(".price-box");
                    const $oldPrice = $price.find(".old-price.left");
                    const sale = Boolean($oldPrice.length);

                    const product = {
                        name: this.getCleanName(name),
                        sale: sale,
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: $(value).find(".product-image").attr("href"),
                        price: this.getPrice($price.find(".price").first().text()),
                        oldPrice: sale ? this.getPrice($price.find(".old-price.left > span > span").text()) : null,
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: $(value).find(".product-image > div > img").attr("src")
                    };

                    if (product.vol === null) return;
                    if (product.ml === null) return;
                    products.push(product);


                });
                callback(products);
                const $next = $("a[class='pagination__link pagination__link--next']");
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

module.exports = KaubamajaScraper;
