const express = require('express');
const router = express.Router();
const db = require('../bin/db');
const productService = require('../bin/productService');

router.get('/', (req, res, next) => {
    db.getDb().collection("products").find({}).sort({viewCount: -1}).limit(10).toArray((err, result) => {
        if (err) {
            console.error(err);
        }

        result = productService.prepareSearchResultsForRender(result);

        res.render('popular', {popular: result});
    });
});

module.exports = router;
