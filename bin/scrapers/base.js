const volRegex = /[\D]((\d[\d.,]*)[%])/;
const mlRegex = /[\D]((\d+)(\s?[mM][lL]|[mM][lL]?))/;
const clRegex = /[\D]((\d+)\s?[cC][lL])/;
const lRegex = /[\D]((\d[\d,.]*)\s?[lL])/;
const priceRegex = /€([\d,.]*)/;

const illegalWords = [
    "muu p.j.", "muu piir.jook", "muu p.jook", "muu piiritusjook", "muu alk.jk.",
    "m.alkohoolne jook", "karp", "\(karp\)", "muu piir.j.", "muu piir.j", "karbis", ", pet", "kohver",

    "maits.viin", "rumm", "rum", "cognac", "whisky", "whiskey", "gin",
    "liköör", "brandy", "viin", "vodka",
];

class Scraper {
    constructor(storeName) {
        this.storeName = storeName;

    }

    shallowScrape() {
        console.info(`Starting shallow scrape for ${this.storeName}`);
    }

    deepScrape() {
        console.info(`Starting deep scrape for ${this.storeName}`);
    }

    static getVol(name) {
        if (!name) {
            return name
        }
        const volResult = volRegex.exec(name);

        if (volResult) {
            const parsed = parseFloat(volResult[2].replace(",", '.'));
            if (isNaN(parsed)) {
                console.error(`Could not parse vol float from ${name}`);
                return null
            } else {
                return parsed
            }
        } else {
            console.error(`Could not parse vol float from ${name}`);
            return null;
        }
    }

    static getMl(name) {
        if (!name) {
            return null
        }

        const mlResult = mlRegex.exec(name);

        if (mlResult) {
            const parsed = parseInt(mlResult[2]);
            if (isNaN(parsed)) {
                console.error(`Could not parse ml integer from ${name}`);
                return null
            } else {
                return parsed
            }
        }

        const clResult = clRegex.exec(name);

        if (clResult) {
            const parsed = parseInt(clResult[2]);
            if (isNaN(parsed)) {
                console.error(`Could not parse cl integer from ${name}`);
                return null
            } else {
                return parsed * 10
            }
        }

        const lResult = lRegex.exec(name);

        if (lResult) {
            const parsed = parseFloat(lResult[2].replace(",", "."));
            if (isNaN(parsed)) {
                console.error(`Could not parse liter float from ${name}`);
                return null
            } else {
                return parsed * 1000
            }
        } else {
            console.error(`Could not parse volume from ${name}`);
            return null;
        }
    }

    static getPrice(priceString) {
        if (!priceString) {
            return null;
        }

        const priceResult = priceRegex.exec(priceString);
        if (priceResult) {
            const parsed = parseFloat(priceResult[1].replace(",", "."));
            if (isNaN(parsed)) {
                console.error(`Could not parse price float from ${priceString}`)
            } else {
                return parsed
            }
        } else {
            console.error(`Could not parse price from ${priceString}`);
            return null;
        }
    }

    static getCleanName(name) {
        const regexRemove = [volRegex, mlRegex, clRegex, lRegex, priceRegex];

        name = name.toLowerCase().trim();

        for (let i = 0; i < illegalWords.length; i++) {
            name = name.replace(new RegExp(illegalWords[i], "g"), "").trim();
        }

        for (let i = 0; i < regexRemove.length; i++) {
            const result = regexRemove[i].exec(name);

            if(result && result[1]) {
                name = name.replace(new RegExp(result[1], 'g'), "").trim();
            }
        }

        name = name.replace(",", "");

        return name;
    }
}

module.exports = Scraper;
