const db = require('./db');

const scraperClasses = [
    require("./scrapers/maxima")
];

let scraperObjects = null;

let temporaryDatabase = [];

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
            temporaryDatabase = temporaryDatabase.concat(result);
            db.getDb().collection("products").insertMany(result, (err, response) => {
                if (err) {
                    console.error(err);
                    return
                }

                console.info("Added products to the database");
            })
        });
    }
}

function getData(callback) {
    db.getDb().collection("products").find({}).toArray((err, result) => {
        if(err) {
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
