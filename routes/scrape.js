const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');

router.get('/', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

module.exports = router;
