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

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function titleCase(string) {
    console.log(string);
    return string.split(" ").map(x => capitalizeFirstLetter(x)).join(" ");
}

router.get('/search/:search', (req, res, next) => {
    db.getDb().collection("products").find({name: {$regex: req.params.search}}).toArray((err, result) => {
        if (result.length === 0) {
            db.getDb().collection("products").find({category: {$regex: req.params.search}}).toArray((err, result) => {
                result = prepareSearchResultsForRender(result);
                res.render('search', {products: result});
            });
        } else {
            result = prepareSearchResultsForRender(result);
            res.render('search', {products: result});
        }
    });
});

function prepareSearchResultsForRender(result) {
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

        if (!cheapest) {
            result[i].cheapestPrice = cheapest;
        }
        else {
            result[i].cheapestPrice = cheapest.toLocaleString("ee-EE", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        result[i].showName = titleCase(result[i].name);
    }

    result.sort((a, b) => {
        if (a.name < b.name) {
            return -1
        }
        else if (a.name > b.name) {
            return 1;
        }

        return a.ml - b.ml
    });

    return result
}

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
        result.showName = titleCase(result.name);
        res.render("product", {product: result});
    })
});

router.get('/limpa', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('limpa', {title: 'Viinavaatlus', products: products});
    });
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
