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
        if (result.length === 0) {
            db.getDb().collection("products").find({name: {$regex: req.params.search}}).toArray((err, result) => {
            });
        } else {
            for (let i = 0; i < result.length; i++) {
                result[i].url = `/product/${result[i].name.replace(/ /g, "_")}/${result[i].ml}`;

                if (result[i].vol) {
                    result[i].url += `/${result[i].vol}`;
                }

                let cheapest = Number.POSITIVE_INFINITY;

                for (let j = 0; j < result[i].stores.length; j++) {
                    const price = result[i].stores[j].prices[result[i].stores[j].prices.length - 1].price;
                    if (price < cheapest) {
                        cheapest = price;
                    }

                }

                result[i].cheapestPrice = cheapest.toLocaleString("ee-EE", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
            }

            res.render('search', {products: result});
        }
    });
});

router.get('/scrape', (req, res, next) => {
    scraper.shallowScrape();
    res.redirect('/');
});

router.get('/product/:productName/:productSize', (req, res, next) => {
    search(req.params.productName, req.params.productSize, null, (err, result) => {
        res.render("product", {product: result});
    })
});

router.get('/product/:productName/:productSize/:productVol', (req, res, next) => {
    search(req.params.productName, req.params.productSize, req.params.productVol, (err, result) => {
        res.render("product", {product: result});

    })
});

function search(productNameRaw, productSize, productVol, callback) {
    const productName = productNameRaw.replace(/_/g, " ").toLowerCase();
    const ml = parseInt(productSize);

    let query = {
        name: productName,
        ml: ml,
        vol: productVol ? parseInt(productVol) : null
    };

    db.getDb().collection("products").findOne(query, callback);
}

module.exports = router;
