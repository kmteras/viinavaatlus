const db = require('./db');

const scraperClasses = [
    require("./scrapers/maxima"),
    require("./scrapers/selver"),
    require('./scrapers/coop'),
    require("./scrapers/alko1000"),
    require("./scrapers/cityalko"),
    require("./scrapers/viinarannasta"),
    require("./scrapers/superalko"),
    require("./scrapers/liviko"),
    require("./scrapers/sadamamarket"),
    require("./scrapers/alkoshop"),
    require("./scrapers/prisma")
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

                const searchQuery = {
                    name: el.name,
                    ml: el.ml,
                    vol: el.vol
                };

                db.getDb().collection("products").findOne(searchQuery, (err, result) => {
                    if (err) {
                        console.error(err);
                    }

                    // If the product exists in the database
                    if (result) {
                        updateExistingProduct(result, el);
                    } else {
                        // If the product does not exist in the database
                        addNewProduct(result, el);
                    }
                })
            });
        });
    }
}

function updateExistingProduct(result, el) {
    let storeFound = false;
    let storeIndex = null;

    for (let j = 0; j < result.stores.length; j++) {
        if (result.stores[j].storeName === el.store) {
            storeFound = true;
            storeIndex = j;
            break
        }
    }

    // If the store exist, lets update the price if needed or the last scrape timestamp
    if (storeFound) {
        updateStoreInfo(result, el, storeIndex);
    } else {
        addStore(result, el);
    }
}

function updateStoreInfo(result, el, storeIndex) {
    let lastPriceIndex = result.stores[storeIndex].prices.length - 1;
    let lastPrice = result.stores[storeIndex].prices[lastPriceIndex];

    // If the price has not changed
    if (lastPrice.price === el.price) {
        result.stores[storeIndex].prices[lastPriceIndex].lastScrape = new Date();

        if (!result.stores[storeIndex].lastPrice) {
            result.stores[storeIndex].lastPrice = el.price;
        }
    } else {
        // If the price has changed
        result.stores[storeIndex].prices.unshift(getPriceObject(el));
        result.stores[storeIndex].lastPrice = el.price;
    }

    let updateValues = {
        $set: {
            stores: result.stores
        }
    };

    db.getDb().collection("products").updateOne({
        name: result.name,
        ml: result.ml,
        vol: result.vol
    }, updateValues, {}, (err, res) => {
        if (err) {
            console.error(err);
        }
    });
}

function addStore(result, el) {
    let updateValues = {
        "$push": {
            "stores": getStoreObject(el)
        }
    };

    if (!result.category) {
        if (!updateValues["$set"]) {
            updateValues["$set"] = {};
        }
        updateValues["$set"]["category"] = el.category;
    }

    db.getDb().collection("products").updateOne({
        name: result.name,
        ml: result.ml,
        vol: result.vol
    }, updateValues, (err, res) => {
        if (err) {
            console.error(err);
        }
    });
}

String.prototype.toPascalCase = function () {
    return this.match(/[a-z]+/gi)
        .map(function (word) {
            return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
        })
        .join('')
};

function addNewProduct(result, el) {
    if (!el.name) {
        console.warn(`Name value is missing, will not add to database ${el.url}`);
        return;
    } else if (!el.ml) {
        console.warn(`Ml value is missing, will not add to database ${el.url}`);
        return;
    } else if (!el.vol) {
        console.warn(`Vol value is missing, will not add to database ${el.url}`);
        return;
    } else if (!el.price) {
        console.warn(`Price is missing, will not add to database ${el.url}`);
        return;
    }

    // Double check that the price is float
    el.price = parseFloat(el.price);

    if (isNaN(parseFloat(el.price))) {
        console.warn(`Price is not float ${el.url}`)
        return;
    }

    // The overall product object
    let product = {
        name: el.name,
        showName: el.showName,
        ml: el.ml,
        vol: el.vol,
        category: el.category,
        viewCount: 0,
        stores: []
    };

    // The store product object
    product.stores.push(getStoreObject(el));

    db.getDb().collection("products").insertOne(product, (err, response) => {
        if (err) {
            if (err.code === 11000) {
                db.getDb().collection("products").findOne({
                    name: el.name,
                    ml: el.ml,
                    vol: el.vol
                }, (err, result) => {
                    console.warn(`Product ${el.name}, ${el.vol}, ${el.ml} exists, updating old`);
                    updateExistingProduct(result, el);
                });
            } else {
                console.error(err, product);
            }
        }
    })
}

// Helper function for adding store objects
function getStoreObject(el) {
    return {
        storeName: el.store,
        storeCounty: el.storeCounty,
        originalName: el.originalName,
        url: el.url,
        imageUrl: el.imageUrl,
        lastPrice: el.price,
        prices: [
            getPriceObject(el)
        ]
    };
}

// Helper function for getting price object
function getPriceObject(el) {
    return {
        firstScrape: new Date(),
        lastScrape: new Date(),
        sale: el.sale,
        price: el.price,
        unitPrice: el.unitPrice,
        oldPrice: el.oldPrice,
        oldUnitPrice: el.oldUnitPrice
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

function getScraperObjects() {
    return scraperObjects;
}

module.exports = {
    setupScraperClasses,
    deepScrape,
    shallowScrape,
    getScraperObjects
};
