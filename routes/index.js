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

router.get('/search/:search', (req, res, next) => {
    db.getDb().collection("products").find({name: {$regex: req.params.search}}).toArray((err, result) => {
        for(let i = 0; i < result.length; i++) {
            result[i].url = `/product/${result[i].name.replace(/ /g, "_")}/${result[i].ml}`
        }

        res.render('search', {products: result});
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

router.get('/product/:productName/:productSize', (req, res, next) => {
    const productName = req.params.productName.replace(/_/g, " ").toLowerCase();
    console.log(productName);
    const ml = parseInt(req.params.productSize);

    db.getDb().collection("products").findOne({name: productName, ml: ml}, (err, result) => {
        res.render("product", {product: result});
    });
});

module.exports = router;
