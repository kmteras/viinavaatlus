const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');
const db = require('../bin/db');
const productService = require('../bin/productService');

let cheapestCache = null;

/* GET home page. */
router.get('/', (req, res, next) => {
    db.getDb().collection("products").find({}).sort({viewCount: -1}).limit(4).toArray((err, result) => {
        if (err) {
            console.error(err);
        }

        result = productService.prepareSearchResultsForRender(result, false);

        db.getDb().collection("cheapestCache").find({}).limit(4).toArray((err, cheapestCache) => {
            if (err) {
                console.error(err);
            }

            if (!cheapestCache.length) {
                db.getDb().collection("products").find({}).toArray((err, cheapestResult) => {
                    cheapestCache = productService.findCheapestPerVol(cheapestResult);
                    cheapestCache = productService.prepareSearchResultsForRender(cheapestResult, false);

                    let cheapest = [];

                    if (cheapestCache.length > 0) {
                        for (let i = 0; i < 4; i++) {
                            cheapest.push(cheapestCache[i]);
                        }
                    }

                    res.render('index', {products: result, cheapestProducts: cheapest});

                    if (cheapestCache.length > 0) {
                        db.getDb().collection("cheapestCache").insertMany(cheapestCache, (err, result) => {
                            if (err) {
                                console.error(err);
                            }

                            console.info("Updated cheapest cache");
                        });
                    }
                });
            }
            else {
                res.render('index', {products: result, cheapestProducts: cheapestCache});
            }
        });
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

router.get('/product/:productName/:productSize/:productVol', (req, res, next) => {
    productService.findProduct(req.params.productName, req.params.productSize, req.params.productVol, (err, result) => {
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
