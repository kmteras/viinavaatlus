const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');
const db = require('../bin/db');
const productService = require('../bin/productService');

/* GET home page. */
router.get('/', (req, res, next) => {
    db.getDb().collection("products").find({}).sort({viewCount: -1}).limit(10).toArray((err, result) => {
        if (err) {
            console.error(err);
            res.render('index', {products: null});
        }

        result = productService.prepareSearchResultsForRender(result, false);

        res.render('index', {products: result});
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

router.get('/product/:productName/:productSize/:productVol', (req, res, next) => {
    productService.search(req.params.productName, req.params.productSize, req.params.productVol, (err, result) => {
        if (err) {
            console.error(err);
            res.redirect("/error");
        }

        result = productService.prepareProductForShowing(result);
        res.render("product", {product: result});
    });
    productService.updateViewCount(req.params.productName, req.params.productSize, req.params.productVol);
});

router.get('/shop/:shop', (req, res, next) => {
    db.getDb().collection("products").find({shops: {storeName: {$regex: req.params.shop}}}).toArray((err, result) => {
        result = productService.prepareSearchResultsForRender(result);
        res.render('search', {products: result});
    });
});

router.get('/limpa', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('limpa', {title: 'Viinavaatlus', products: products});
    });
});

module.exports = router;
