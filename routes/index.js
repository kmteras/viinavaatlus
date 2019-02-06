const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');

/* GET home page. */
router.get('/', (req, res, next) => {
  scraper.shallowScraper((products) => {
    res.render('index', { title: 'Viinavaatlus', products: products });
  });
});

module.exports = router;
