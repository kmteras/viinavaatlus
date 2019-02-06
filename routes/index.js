const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');
const db = require('../bin/db');

/* GET home page. */
router.get('/', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('index', {title: 'Viinavaatlus', products: products});
    });
});

router.get('/searchResults', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('searchResults', {title: 'Viinavaatlus', products: products});
    });
});

router.get('/productPage', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('productPage', {title: 'Viinavaatlus', products: products});
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

router.get('/product/:productName/:productSize', (req, res, next) => {
    const productName = req.params.productName.replace("_", " ").toLowerCase();
    const ml = parseInt(req.params.productSize);

    db.getDb().collection("products").findOne({name: productName, ml: ml}, (err, result) => {
        res.render("product", {title: "Jager", product: result});
    });
});

module.exports = router;
