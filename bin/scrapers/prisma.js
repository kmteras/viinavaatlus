const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');



class PrismaScraper extends Scraper {
    constructor () {
        super("Prisma", "EE");
        this.baseUrl = 'https://prismamarket.ee/';

        //process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        this.categoryPages = [
            {url: ['https://www.prismamarket.ee/products/17253/page/', 1], category: 'olu'},
            {url: ['https://www.prismamarket.ee/products/17254/page/', 1], category: 'siider'},
            {url: ['https://www.prismamarket.ee/products/17255/page/', 1], category: 'long-drink'},
            {url: ['https://www.prismamarket.ee/products/17256/page/', 1], category: 'kokteilijook'},
            {url: ['https://www.prismamarket.ee/products/19208/page/', 1], category: 'kange'},
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
            console.info(json);

            console.info(results);
            let products = [];
            results.forEach((item) => {
                let sale = item.hasOwnProperty("original_price");
                const product = {
                    name: this.getCleanName(item["name"]),
                    sale: sale,
                    originalName: item["name"],
                    storeCounty: this.storeCounty,
                    store: this.storeName,
                    url: "https://www.prismamarket.ee/entry/" + item["ean"],
                    price: item["price"],
                    unitPrice: item["comp_price"],
                    oldPrice: sale ? item["original_price"] : null,
                    oldUnitPrice : null,
                    vol: this.getVol(item["name"]),
                    ml: this.getMl(" " + item["quantity"] + item["unit_name"]),
                    category : category.category,
                    imageUrl: null,
                };
                console.info(product);
                products.push(product);
            });
            callback(products);
            /*const nextPage = json["next"];
            if (nextPage != null) {
                const newCategory = {
                    url: [category.url[0], nextPage, category.url[2]],
                    category: category.category
                };
                this.scrapeCategoryPage(newCategory, callback);
            }*/
        }).catch((err) => {
            console.error(err)
        });


    }


}
module.exports = PrismaScraper;
