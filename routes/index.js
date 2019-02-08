const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');
const db = require('../bin/db');
const productService = require('../bin/productService');

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

                    if (cheapest.length > 0) {
                        db.getDb().collection("cheapestCache").insertMany(cheapest, (err, result) => {
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

module.exports = router;
