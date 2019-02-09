const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');


class CoopScraper extends Scraper {
    constructor () {
        super("Coop", "EE");
        this.baseUrl = 'https://ecoop.ee/';
        this.categoryPages = [
            {url: ['https://ecoop.ee/api/v1/products?page=', 1, '&category=59&ordering=popularity'], category: 'punane vein'},
            {url: ["https://ecoop.ee/api/v1/products?page=", 1, "&category=57&ordering=popularity"], category: 'valge vein'},
            {url: ["https://ecoop.ee/api/v1/products?page=", 1, "&category=53&ordering=popularity"], category: 'vahuvein'},
            {url: ["https://ecoop.ee/api/v1/products?page=", 1, "&category=52&ordering=popularity"], category: 'olu'},
            {url: ["https://ecoop.ee/api/v1/products?page=", 1, "&ordering=popularity&category=51"], category: 'lahja'},
            {url: ["https://ecoop.ee/api/v1/products?page=", 1, "&category=58&ordering=popularity"], category: 'kange'}
        ];
    }


    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        rp(category.url.join("")).then((html) => {
            const json = JSON.parse(html);
            const results = json["results"];
            let products = [];
            results.forEach((item) => {
                let sale = Boolean(item["campaigns"].length);
                const product = {
                    name: this.getCleanName(item["name"]),
                    sale: sale,
                    originalName: item["name"],
                    storeCounty: this.storeCounty,
                    store: this.storeName,
                    url: "https://ecoop.ee/et/toode/" + item["slug_et"],
                    price: sale ? parseFloat(item["campaigns"][0]["discounts"][0]["price"]) : parseFloat(item["sell_price"]),
                    unitPrice: null,
                    oldPrice: sale ? item["sell_price"] : null,
                    oldUnitPrice : null,
                    vol: parseFloat(item["alcohol"]["percent"]),
                    ml: this.getMl(" " + item["content_quantity"] + item["content_measure_unit"]),
                    category : item["alcohol"]["type"].toLowerCase(),
                    imageUrl: this.baseUrl + "media/" + item["images"][0]["image"]
                };
                products.push(product);
            });
            callback(products);
            const nextPage = json["next"];
            if (nextPage != null) {
                const newCategory = {
                    url: [category.url[0], nextPage, category.url[2]],
                    category: category.category
                };
                this.scrapeCategoryPage(newCategory, callback);
            }
        }).catch((err) => {
            console.error(err)
        });


    }


}
module.exports = CoopScraper;
