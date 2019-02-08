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

function prepareSearchResultsForRender(result, sort=true) {
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

        result[i].cheapest = cheapest;
        result[i].showName = titleCase(result[i].name);
    }

    if (sort) {
        result.sort((a, b) => {
            return a.cheapest - b.cheapest
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

module.exports = {
    prepareSearchResultsForRender,
    search,
    prepareProductForShowing,
    updateViewCount
};
