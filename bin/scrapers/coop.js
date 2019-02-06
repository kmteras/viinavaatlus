const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');


class CoopScraper extends Scraper
{
    constructor () {
        super("Coop");
        this.baseUrl = 'https://ecoop.ee/';
        this.categoryPages = [
            {url: 'https://ecoop.ee/et/kategooriad/kange-alkohol/',             category: 'Strong alcohol'},
            {url: 'https://ecoop.ee/et/kategooriad/punased-veinid/',            category: 'Red wine'},
            {url: 'https://ecoop.ee/et/kategooriad/valged-veinid/',             category: 'White wine'},
            {url: 'https://ecoop.ee/et/kategooriad/vahuveinid/',                category: 'Sparklin wine'},
            {url: 'https://ecoop.ee/et/kategooriad/olled/',                     category: 'Beer'},
            {url: 'https://ecoop.ee/et/kategooriad/lahjad-alkohoolsed-joogid/', category: 'Light beverages'},
            {url: 'https://ecoop.ee/et/kategooriad/alkoholivabad-joogid/',      category: 'Non-alcoholic'}
        ];
    }


    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {

        console.log(category);
        console.log(callback);

    }
}