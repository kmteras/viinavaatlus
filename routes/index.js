const express = require('express');
const router = express.Router();
const scraper = require('../bin/scraper');
const db = require('../bin/db');

/* GET home page. */
router.get('/', (req, res, next) => {
    db.getDb().collection("products").find({}).limit(10).toArray((err, result) => {
        if (err) {
            console.error(err);
            res.render('index', {products: null});
        }

        result = prepareSearchResultsForRender(result);

        res.render('index', {products: result});
    });
});

function capitalizeFirstLetter(string) {
    if (string[0]) {
        return string[0].toUpperCase() + string.slice(1).toLowerCase();
    } else {
        return string
    }
}

function titleCase(string) {
    return string.split(" ").map(x => capitalizeFirstLetter(x)).join(" ");
}

router.get('/search/:search', (req, res, next) => {
    db.getDb().collection("products").find({name: {$regex: req.params.search}}).toArray((err, result) => {
        if (err) {
            console.error(err);
            res.render('search', {products: null});
        }

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
        } else {
            result[i].cheapestPrice = cheapest.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
        }

        result[i].showName = titleCase(result[i].name);
    }

    result.sort((a, b) => {
        if (a.name < b.name) {
            return -1
        } else if (a.name > b.name) {
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
        if (err) {
            console.error(err);
            res.redirect("/error");
        }

        result = prepareProductForShowing(result);
        res.render("product", {product: result});
    })
});

router.get('/product/:productName/:productSize/:productVol', (req, res, next) => {
    search(req.params.productName, req.params.productSize, req.params.productVol, (err, result) => {
        if (err) {
            console.error(err);
            res.redirect("/error");
        }

        result = prepareProductForShowing(result);
        res.render("product", {product: result});
    });
    updateViewCount(req.params.productName, req.params.productSize, req.params.productVol);
});

router.get('/shop/:shop', (req, res, next) => {
    db.getDb().collection("products").find({shops: {storeName: {$regex: req.params.shop}}}).toArray((err, result) => {
        result = prepareSearchResultsForRender(result);
        res.render('search', {products: result});
    });
});

router.get('/limpa', (req, res, next) => {
    scraper.getData((err, products) => {
        res.render('limpa', {title: 'Viinavaatlus', products: products});
    });
});

function updateViewCount(productNameRaw, productSize, productVol) {
    const productName = productNameRaw.replace(/_/g, " ").toLowerCase();
    const ml = parseInt(productSize);

    let query = {
        name: productName,
        ml: ml,
        vol: productVol ? parseInt(productVol) : null
    };

    const updateQuery = {
        "viewCount": {
            "$inc": 1
        }
    };

    db.getDb().collection("products").updateOne(query, updateQuery, (err, res) => {
        if (err) {
            console.error(err);
        }
    });
}

function search(productNameRaw, productSize, productVol, callback) {
    const productName = productNameRaw.replace(/_/g, " ").toLowerCase();
    const ml = parseInt(productSize);

    let query = {
        name: productName,
        ml: ml,
        vol: productVol ? parseFloat(productVol) : null
    };

    db.getDb().collection("products").findOne(query, callback);
}

function prepareProductForShowing(result) {
    result.showName = titleCase(result.name);

    for (let i = 0; i < result.stores.length; i++) {
        result.stores[i].showPrice =
            result.stores[i].prices[result.stores[i].prices.length - 1].price
                .toLocaleString("ee-EE", {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                });
    }

    result.stores.sort((a, b) => {
        return a.prices[a.prices.length - 1].price > b.prices[b.prices.length - 1].price;
    });

    return result
}

module.exports = router;
