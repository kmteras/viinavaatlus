const db = require('./db');

const scraperClasses = [
    require("./scrapers/maxima"),
    require("./scrapers/selver"),
    // require('./scrapers/coop'),
];

let scraperObjects = null;

function setupScraperClasses() {
    scraperObjects = [];
    for (let i = 0; i < scraperClasses.length; i++) {
        scraperObjects.push(new scraperClasses[i]);
    }
    console.info("Scraper classes set up");
}

function deepScrape(callback) {
    for (let i = 0; i < scraperClasses.length; i++) {
        scraperObjects[i].deepScrape(callback);
    }
}

function shallowScrape() {
    for (let i = 0; i < scraperClasses.length; i++) {
        scraperObjects[i].shallowScrape((result) => {

            result.forEach((el) => {
                db.getDb().collection("products").findOne({name: el.name, ml: el.ml}, (err, result) => {
                    if (err) {
                        console.error(err);
                    }

                    const storeName = el.store.toLowerCase();

                    if (result) {

                    } else {
                        let product = {
                            name: el.name,
                            ml: el.ml,
                            stores: {}
                        };

                        product.stores[storeName] = el;

                        db.getDb().collection("products").insertOne(product, (err, response) => {
                            if (err) {
                                console.error(err, product);
                            }
                        })
                    }
                })
            });
        });
    }
}

function getData(callback) {
    db.getDb().collection("products").find({}).toArray((err, result) => {
        if (err) {
            console.error(err);
            callback(err);
        }

        callback(null, result);
    });
}

module.exports = {
    setupScraperClasses,
    deepScrape,
    shallowScrape,
    getData
};
