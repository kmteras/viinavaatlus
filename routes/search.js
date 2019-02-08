const express = require('express');
const router = express.Router();
const db = require('../bin/db');
const productService = require('../bin/productService');

router.get('/', (req, res, next) => {
    res.render('search', {products: null, search: req.params.search});
});

const pageLimit = 10;

router.get('/:search', (req, res, next) => {
    let page = parseInt(req.query.page);

    if (!page) {
        page = 1;
    }

    let searchQuery = {
        name: {
            $regex: req.params.search
        }
    };

    db.getDb().collection("products").find(searchQuery).count((err, results) => {
        const totalPages = Math.ceil(results / pageLimit);
        db.getDb().collection("products").find(searchQuery).limit(pageLimit).skip((page - 1) * pageLimit).toArray((err, result) => {
            if (err) {
                console.error(err);
                result = null;
            }

            let pagesBefore = [];

            let setBreak = false;

            let url = req.originalUrl;

            if (!url.includes(`?page=${page}`)) {
                if (!url.includes("?")) {
                    url += `?page=${page}`;
                }
                else {
                    url += `&page=${page}`;
                }
            }

            for (let i = 0; i < page - 1; i++) {
                if ((page - 1) - i > 1 && i > 0) {
                    setBreak = true;
                    continue;
                }

                if (setBreak) {
                    pagesBefore.push({
                        pageNumber: -1
                    });
                    setBreak = false;
                }

                const pageNumber = i + 1;
                pagesBefore.push({
                    pageNumber: pageNumber,
                    pageUrl: url.replace(new RegExp(`page=${page}`), `page=${pageNumber}`)
                });
            }

            let pagesAfter = [];

            setBreak = false;

            for (let i = page; i < totalPages; i++) {
                if (i - (page - 1) > 1 && (totalPages) - i > 1) {
                    setBreak = true;
                    continue;
                }

                const pageNumber = i + 1;
                if (setBreak) {
                    pagesAfter.push({
                        pageNumber: -1
                    });
                    setBreak = false;
                }

                pagesAfter.push({
                    pageNumber: pageNumber,
                    pageUrl: url.replace(new RegExp(`page=${page}`), `page=${pageNumber}`)
                });
            }

            result = productService.prepareSearchResultsForRender(result);
            res.render('search', {
                products: result,
                search: req.params.search,
                pagesBefore: pagesBefore,
                page: page,
                pagesAfter: pagesAfter});
        });
    });
});

function search() {

}

module.exports = router;
