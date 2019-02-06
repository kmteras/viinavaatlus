const scraperClasses = [
    require("./scrapers/maxima")
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

function shallowScraper(callback) {
    for (let i = 0; i < scraperClasses.length; i++) {
        scraperObjects[i].shallowScrape(callback);
    }
}

module.exports = {
    setupScraperClasses,
    deepScrape,
    shallowScraper
};
