const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class ViinarannastaScraper extends Scraper {
    constructor() {
        super("SuperAlko EE", "EE");
        this.baseUrl = "https://www.viinarannasta.com/";
        this.categoryPages = [
            {url: "https://www.viinarannasta.com/articlesr.php?sid=65&gid=4", category: "absint"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=7&gid=4", category: "viin"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=8&gid=4", category: "viin"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=6&gid=4", category: "viin"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=9&gid=5", category: "rumm"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=10&gid=6", category: "tekiila"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=11&gid=7", category: "konjak"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=12&gid=8", category: "brandi"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=56&gid=9", category: "viski"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=58&gid=9", category: "viski"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=55&gid=9", category: "viski"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=13&gid=9", category: "viski"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=14&gid=10", category: "likoor"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=15&gid=11", category: "dzinn"},
            {url: "https://www.viinarannasta.com/articlesr.php?sid=67&gid=27", category: "muu"},
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
                const $products = $("tr[bgcolor='#E6F3FC']").first().parent().children();
                let products = [];

                $products.each((index, value) => {

                    const $name = $(value).find("td[width='420'] > a");
                    const name = $name.text();

                    const product = {
                        name: this.getCleanName(name),
                        sale: $(value).find("td[width='80'] > strong > font").attr("style") === "color:#FF0000",
                        originalName: name,
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: this.baseUrl + $name.attr("href"),
                        price: this.getPrice($(value).find("td[width='80'] > strong > font").text()),
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: this.baseUrl + $(value).find("td[width='20'] > a > img").attr("src").replace("-thumb-", "-")
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

module.exports = ViinarannastaScraper;
