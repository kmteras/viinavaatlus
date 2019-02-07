const db = require('./db');

const scraperClasses = [
    require("./scrapers/maxima"),
    require("./scrapers/selver"),
    //require('./scrapers/coop'),
    require("./scrapers/alko1000"),
    require("./scrapers/cityalko")
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

                    // If the product exists in the database
                    if (result) {
                        let storeFound = false;

                        for(let j = 0; j < result.stores.length; j++) {
                            if (result.stores[j].storeName === el.store) {
                                storeFound = true;
                            }
                        }

                        let updateValues = {};

                        // If the store exist, lets update the price if needed or the last scrape timestamp
                        if (storeFound) {

                        } else {
                            // console.log(result);
                            updateValues = {
                                "$push": {
                                    "stores": getStoreObject(el)
                                }
                            };

                            if (!result.vol) {
                                updateValues["$set"] = {};
                                updateValues["$set"]["vol"] = el.vol;
                            }

                            if (!result.category) {
                                if (!updateValues["$set"]) {
                                    updateValues["$set"] = {};
                                }
                                updateValues["$set"]["category"] = el.category;
                            }
                        }

                        const updateQuery = {
                            name: result.name,
                            ml: result.ml
                        };

                        db.getDb().collection("products").updateOne(updateQuery, updateValues, (err, res) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    } else {
                        // If the product does not exist in the database

                        if (!el.name || !el.ml) {
                            console.error(`Ml value is missing, will not add to database`);
                            return;
                        }

                        // The overall product object
                        let product = {
                            name: el.name,
                            showName: el.originalName,
                            ml: el.ml,
                            vol: el.vol,
                            category: el.category,
                            stores: []
                        };

                        // The store product object
                        product.stores.push(getStoreObject(el));

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

// Helper function for adding store objects
function getStoreObject(el) {
    return {
        storeName: el.store,
        originalName: el.originalName,
        url: el.url,
        imageUrl: el.imageUrl,
        prices: [
            {
                firstScrape: new Date(),
                lastScrape: new Date(),
                sale: el.sale,
                price: el.price,
                unitPrice: el.unitPrice,
                oldPrice: el.oldPrice,
                oldUnitPrice: el.oldUnitPrice
            }
        ]
    };
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
