const Scraper = require('./base');
const rp = require('request-promise');
const cheerio = require('cheerio');


class CoopScraper extends Scraper
{
    constructor () {
        super("Coop");
        this.baseUrl = 'https://ecoop.ee/';
        this.categoryPages = [
            // {url: 'https://ecoop.ee/et/kategooriad/kange-alkohol/',             category: 'Strong alcohol'},
            // {url: 'https://ecoop.ee/et/kategooriad/punased-veinid/',            category: 'Red wine'},
            // {url: 'https://ecoop.ee/et/kategooriad/valged-veinid/',             category: 'White wine'},
            // {url: 'https://ecoop.ee/et/kategooriad/vahuveinid/',                category: 'Sparklin wine'},
            // {url: 'https://ecoop.ee/et/kategooriad/olled/',                     category: 'Beer'},
            // {url: 'https://ecoop.ee/et/kategooriad/lahjad-alkohoolsed-joogid/', category: 'Light beverages'},
            // {url: 'https://ecoop.ee/et/kategooriad/alkoholivabad-joogid/',      category: 'Non-alcoholic'},
            {url: ['https://ecoop.ee/api/v1/products?page=', '&category=58&ordering=popularity'], category: 'placeholder'}
        ];
    }


    shallowScrape(callback) {
        super.shallowScrape();
        for (let i = 0; i < this.categoryPages.length; i++) {
            this.scrapeCategoryPage(this.categoryPages[i], callback);
        }
    }

    scrapeCategoryPage(category, callback) {
        let index = 18;
        let responseObjects = [];
        populateResponseObject(url, index);


    }

    populateResponseObject(url, index) {
        console.info('\nScraping: ' + category.url[0] + index + category.url[1]);
        
        let options = {
            uri: category.url[0] + index + category.url[1],
            headers: {
                'User-Agent': 'Request-Promise'
            },
            json: true // Automatically parses the JSON string in the response
        };

        rp(options)
            .then(function (response) {
                responseObjects.push(response.results);

                if (response.next != null) this.populateResponseObject(url, index + 1);
            })
            .catch(function (err) {
                console.error('Connection to API failed');
        });
    }
}
module.exports = CoopScraper;
