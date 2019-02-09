const express = require('express');
const router = express.Router();
const db = require('../bin/db');
const productService = require('../bin/productService');
const scraper = require('../bin/scraper');

let storePages = null;
let storePagesSingle = null;

let categories = [
    {id: 0, name: "Viin"},
    {id: 1, name: "Džinn"},
    {id: 2, name: "Rumm"},
    {id: 3, name: "Liköör"},
    {id: 4, name: "Viski"},
    {id: 5, name: "Konjak"},
    {id: 6, name: "Brändi"},
    {id: 7, name: "Vein"},
    {id: 8, name: "Õlu"},
    {id: 9, name: "Siider"},
    {id: 10, name: "Muu"}
];

let categoriesColumns = [];

let column = [];
for (let i = 0; i < categories.length; i++) {
    column.push(categories[i]);

    if ((i + 1) % 6 === 0) {
        categoriesColumns.push(column);
        column = [];
    }
}

if (column.length > 0) {
    categoriesColumns.push(column);
}

router.get('/', (req, res, next) => {
    updateStorePages();
    res.render('search', {
        products: [],
        search: req.params.search,
        stores: storePages,
        storeCodes: [],
        categoryColumns: categoriesColumns,
        selectedCategories: [],
        pagesBefore: [],
        pagesAfter: []
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

            if (!isNaN(storeCode)) {
                storeCodes.push(storeCode);

                storeList.push({
                    "stores.storeName": storePagesSingle[storeCode].name
                });
            }
        }
    }

    let categoriesString = req.query.type;

    let selectedCategories = [];
    let categoryList = [];

    if (categoriesString) {
        const categoryStrings = categoriesString.split(",");

        for (let i = 0; i < categoryStrings.length; i++) {
            const categoryCode = parseInt(categoryStrings[i]);

            if (!isNaN(categoryCode)) {
                selectedCategories.push(categoryCode);

                categoryList.push({
                    "category": removeEstonianLetters(categories[categoryCode].name.toLowerCase())
                })
            }
        }
    }

    let searchQuery = {
        name: {
            $regex: removeEstonianLetters(req.params.search)
        }
    };

    if (storeList.length > 0) {
        searchQuery["$and"] = [
            {
                "$or": storeList
            }
        ];
    }

    if (categoryList.length > 0) {
        if (searchQuery['$and']) {
            searchQuery["$and"].push({
                "$or": categoryList
            });
        } else {
            searchQuery["$or"] = categoryList;
        }
    }

    db.getDb().collection("products").find(searchQuery).count((err, results) => {
        const totalPages = Math.ceil(results / pageLimit);
        db.getDb().collection("products").find(searchQuery).limit(pageLimit).skip((page - 1) * pageLimit).toArray((err, result) => {
            if (err) {
                console.error(err);
                result = [];
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
                storeCodes: storeCodes,
                categoryColumns: categoriesColumns,
                selectedCategories: selectedCategories
            });
        });
    });
});

function removeEstonianLetters(string) {
    string = string.replace(/ä/g, "a");
    string = string.replace(/ö/g, "o");
    string = string.replace(/õ/g, "o");
    string = string.replace(/ü/g, "u");
    string = string.replace(/ž/g, "z");
    string = string.replace(/š/g, "s");
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

        if (storeColumn.length > 0) {
            storePages.push(storeColumn)
        }
    }
}

module.exports = router;
