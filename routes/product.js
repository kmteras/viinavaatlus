const express = require('express');
const router = express.Router();
const productService = require('../bin/productService');

router.get('/:productName/:productSize/:productVol', (req, res, next) => {
    productService.findProduct(req.params.productName, req.params.productSize, req.params.productVol, (err, result) => {
        if (err) {
            console.error(err);
            res.redirect("/");
        }

        if (!result) {
            console.error("Empty product");
            res.render("product", {product: null});
        }

        result = productService.prepareProductForShowing(result);
        res.render("product", {product: result});
    });
    productService.updateViewCount(req.params.productName, req.params.productSize, req.params.productVol);
});

module.exports = router;
