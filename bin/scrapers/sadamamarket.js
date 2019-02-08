const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');

class SadamaMarketScraper extends Scraper {
    constructor() {
        super("SadamaMarket", "EE");
        this.baseUrl = "http://www.sadamamarket.ee/";
        this.categoryPages = [
            {url: "http://www.sadamamarket.ee/index.php?cnt=bitter&page=1501&lang=est&sel=176", category: "bitter"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=vahuvein&page=1501&lang=est&sel=26", category: "vahuvein"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=%C5%A0ampanja&page=1501&lang=est&sel=17", category: "sampanja"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=169&cnt=valge_vein", category: "valge vein"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=206&cnt=valge_vein_-_bib", category: "valge vein kast"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=205&cnt=punane_vein_-__bib", category: "punane vein kast"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=170&cnt=roosa_vein", category: "roosa vein"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=portvein&page=1501&lang=est&sel=15", category: "portvein"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=muud&page=1501&lang=est&sel=20", category: "muu"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=118&cnt=vs", category: "konjak"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=24&cnt=vsop", category: "konjak"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=119&cnt=xo", category: "konjak"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=191&cnt=kalvados", category: "kalvados"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=vermut&page=1501&lang=est&sel=18", category: "vermut"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=br%C3%A4ndi&page=1501&lang=est&sel=9", category: "brandi"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=167&cnt=eesti", category: "likoor lahja"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=168&cnt=muu", category: "likoor lahja"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=165&cnt=eesti", category: "likoor kange"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=muu&page=1501&lang=est&sel=166", category: "likoor kange"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=d%C5%BEinn&page=1501&lang=est&sel=13", category: "dzinn"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=50&cnt=%C5%A0oti", category: "viski"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=234&cnt=malt", category: "viski"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=51&cnt=iiri", category: "viski"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=235&cnt=malt", category: "viski"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=164&cnt=ameerika_/_kanada", category: "viski"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=tekiila&page=1501&lang=est&sel=7", category: "tekiila"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=53&cnt=soome", category: "viin"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=52&cnt=eesti", category: "viin"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=54&cnt=muu", category: "viin"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=183&cnt=vene", category: "viin"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=rumm&page=1501&lang=est&sel=6", category: "rumm"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=21&cnt=eesti", category: "olu"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=22&cnt=soome", category: "olu"},
            {url: "http://www.sadamamarket.ee/index.php?page=1501&lang=est&sel=23&cnt=muu", category: "olu"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=siider&page=1501&lang=est&sel=3", category: "siider"},
            {url: "http://www.sadamamarket.ee/index.php?cnt=long_drink&page=1501&lang=est&sel=4", category: "long-drink"}
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
                const $products = $("td[width='760'][background='image/taust_kesk.gif']").find("div[id^='Toode']");
                let products = [];
                $products.each((index, value) => {
                    const name = $(value).find("td[class='pealkiriTooted']").text();
                    const $price = $(value).find("span[class^='textTootedHind']");
                    const sale = $price.attr("class") === "textTootedHind";
                    const price = $price.text();
                    const url = $(value).find("td[background='image/taust_tooted.gif']").attr("onclick");
                    if (url == null) return;

                    const product = {
                        name: this.getCleanName(name),
                        sale: sale,
                        originalName: name.trim(),
                        storeCounty: this.storeCounty,
                        store: this.storeName,
                        url: this.baseUrl + url.slice(15, -1),
                        price: this.getPrice(price),
                        oldPrice: null,
                        unitPrice: null,
                        vol: this.getVol(name),
                        ml: this.getMl(name),
                        category: category.category,
                        imageUrl: this.baseUrl + $(value).find("#TootePilt").find("img").attr("src").replace("/thumbs/", "/")
                    };

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

module.exports = SadamaMarketScraper;
