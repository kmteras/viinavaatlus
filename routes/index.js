const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');

/* GET home page. */
router.get('/', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('index', {title: 'Viinavaatlus', products: products});
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();

    // Added for testing so something can be scraped
    setTimeout(() => {
        res.redirect('/');
    }, 1000);
});

module.exports = router;
