const express = require('express');
const router = express.Router();
const db = require('../bin/db');
const productService = require('../bin/productService');

router.get('/', (req, res, next) => {

});

router.get('/:search', (req, res, next) => {
    db.getDb().collection("products").find({name: {$regex: req.params.search}}).limit(10).toArray((err, result) => {
        if (err) {
            console.error(err);
            res.render('search', {products: null});
        }

        if (result.length === 0) {
            db.getDb().collection("products").find({category: {$regex: req.params.search}}).limit(10).toArray((err, result) => {
                result = productService.prepareSearchResultsForRender(result);
                res.render('search', {products: result});
            });
        } else {
            result = productService.prepareSearchResultsForRender(result);
            res.render('search', {products: result});
        }
    });
});

function search() {

}

module.exports = router;
