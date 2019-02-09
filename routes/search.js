const express = require('express');
const router = express.Router();
const db = require('../bin/db');
const productService = require('../bin/productService');
const scraper = require('../bin/scraper');

let storePages = null;

let storePagesSingle = null;

router.get('/', (req, res, next) => {
    updateStorePages();
    res.render('search', {
        products: null,
        search: req.params.search,
        stores: storePages
    });
});

const pageLimit = 10;

router.get('/:search', (req, res, next) => {
    updateStorePages();
    let page = parseInt(req.query.page);

    if (!page) {
        page = 1;
    }

    let sortType = parseInt(req.query.sort);

    if (!sortType) {
        sortType = 0;
    }

    let storesString = req.query.stores;

    let storeList = [];
    let storeCodes = [];

    if (storesString) {
        const storeCodeStrings = storesString.split(",");

        for (let i = 0; i < storeCodeStrings.length; i++) {
            const storeCode = parseInt(storeCodeStrings[i]);

            if (storeCode) {
                storeCodes.push(storeCode);

                storeList.push({
                    "stores.storeName": storePagesSingle[storeCode].name
                });
            }
        }
    }

    let searchQuery = {
        name: {
            $regex: removeEstonianLetters(req.params.search)
        }
    };

    if (storeList.length > 0) {
        searchQuery["$or"] = storeList;
    }

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
                } else {
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

            result = productService.prepareSearchResultsForRender(result, sortType);
            res.render('search', {
                products: result,
                search: req.params.search,
                stores: storePages,
                sortType: sortType,
                pagesBefore: pagesBefore,
                page: page,
                pagesAfter: pagesAfter,
                storeCodes: storeCodes
            });
        });
    });
});

function removeEstonianLetters(string) {
    string = string.replace(/ä/g, "a");
    string = string.replace(/ö/g, "o");
    string = string.replace(/õ/g, "o");
    string = string.replace(/ü/g, "u");
    return string;
}


function updateStorePages() {
    if (!storePages) {
        storePages = [];
        storePagesSingle = [];

        const scraperObject = scraper.getScraperObjects();

        let storeColumn = [];

        for (let i = 0; i < scraperObject.length; i++) {
            const storePage = {
                id: i,
                name: scraperObject[i].storeName
            };

            storeColumn.push(storePage);
            storePagesSingle.push(storePage);

            if ((i + 1) % 5 === 0) {
                storePages.push(storeColumn);
                storeColumn = [];
            }
        }

        if (storeColumn !== []) {
            storePages.push(storeColumn)
        }
    }
}

module.exports = router;
