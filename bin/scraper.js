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
        });
    }
}

function getData() {
    return temporaryDatabase;
}

module.exports = {
    setupScraperClasses,
    deepScrape,
    shallowScrape,
    getData
};
