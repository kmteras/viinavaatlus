const db = require("./db");

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

function findCheapestPerVol(products) {
    for (let i = 0; i < products.length; i++) {
        let price = findCheapestEE(products[i]);

        if (!price || products[i].ml > 1000) {
            price = Number.POSITIVE_INFINITY;
        }

        products[i].pricePerVol = products[i].vol / (price / products[i].ml);
    }

    products.sort((a, b) => {
        return b.pricePerVol - a.pricePerVol;
    });

    let cheapestProducts = [];

    for (let i = 0; i < 4; i++) {
        cheapestProducts.push(products[i]);
    }

    return cheapestProducts;
}

function prepareSearchResultsForRender(result, sort = true) {
    for (let i = 0; i < result.length; i++) {
        result[i].url = `/product/${result[i].name.replace(/ /g, "_")}/${result[i].ml}`;

        if (result[i].vol) {
            result[i].url += `/${result[i].vol}`;
        }

        let cheapest = findCheapest(result[i]);
        let cheapestEE = findCheapestEE(result[i]);

        if (cheapest) {
            result[i].cheapestPerL = cheapest / (result[i].ml / 1000);
            result[i].cheapest = cheapest.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            result[i].cheapestPerLString = result[i].cheapestPerL.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
        }

        if(cheapestEE) {
            result[i].cheapestPerLEE = cheapestEE / (result[i].ml / 1000);
            result[i].cheapestEE = cheapestEE.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            result[i].cheapestPerLStringEE = result[i].cheapestPerLEE.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
        }

        result[i].showName = titleCase(result[i].name);
    }

    if (sort) {
        result.sort((a, b) => {
            return a.cheapestPerL - b.cheapestPerL
        });
    }

    return result
}

function updateViewCount(productNameRaw, productSize, productVol) {
    const productName = productNameRaw.replace(/_/g, " ").toLowerCase();
    const ml = parseInt(productSize);

    let query = {
        name: productName,
        ml: ml,
        vol: productVol ? parseFloat(productVol) : null
    };

    const updateQuery = {
        "$inc": {
            "viewCount": 1
        }
    };

    db.getDb().collection("products").updateOne(query, updateQuery, (err, res) => {
        if (err) {
            console.error(err);
        }
    });
}

function findProduct(productNameRaw, productSize, productVol, callback) {
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

    let cheapest = findCheapest(result);
    let cheapestEE = findCheapestEE(result);

    for (let i = 0; i < result.stores.length; i++) {
        const price = result.stores[i].prices[result.stores[i].prices.length - 1].price;
        result.stores[i].showPrice =
            price.toLocaleString("ee-EE", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
    }

    result.stores.sort((a, b) => {
        return a.prices[a.prices.length - 1].price - b.prices[b.prices.length - 1].price;
    });

    if (cheapestEE) {
        result.cheapestEE = cheapestEE.toLocaleString("ee-EE", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    }

    if (cheapest) {
        result.cheapest = cheapest.toLocaleString("ee-EE", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
    }

    return result
}

function findCheapest(product) {
    let cheapest = Number.POSITIVE_INFINITY;

    for (let i = 0; i < product.stores.length; i++) {
        const price = product.stores[i].prices[product.stores[i].prices.length - 1].price;

        if (price < cheapest) {
            cheapest = price;
        }
    }

    if (cheapest !== Number.POSITIVE_INFINITY) {
        return cheapest;
    }
    else {
        return null;
    }
}

function findCheapestEE(product) {
    let cheapestEE = Number.POSITIVE_INFINITY;

    for (let i = 0; i < product.stores.length; i++) {
        const price = product.stores[i].prices[product.stores[i].prices.length - 1].price;
        if (product.stores[i].storeCounty === "EE" && price < cheapestEE) {
            cheapestEE = price;
        }
    }

    if (cheapestEE !== Number.POSITIVE_INFINITY) {
        return cheapestEE;
    }
    else {
        return null;
    }
}

module.exports = {
    prepareSearchResultsForRender,
    findProduct: findProduct,
    prepareProductForShowing,
    updateViewCount,
    findCheapestPerVol
};
