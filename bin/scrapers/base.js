const illegalWords = [
    "muu p.j.", "muu piir.jook", "muu p.jook", "muu piiritusjook", "muu alk.jk.",
    "m.alkohoolne jook", "karp", "\(karp\)", "muu piir.j.", "muu piir.j", "karbis", ", pet", "kohver",

    "maits.viin", "rumm", "rum", "cognac", "whisky", "whiskey", "gin",
    "liköör", "brandy", "viin", "vodka",
];

class Scraper {
    constructor(storeName) {
        this.storeName = storeName;
        this.volRegex = /[\D]((\d[\d.,]*)[%])/;
        this.mlRegex = /[\D]((\d+)(\s?[mM][lL]|[mM][lL]?))/;
        this.clRegex = /[\D]((\d+)\s?[cC][lL])/;
        this.lRegex = /[\D]((\d[\d,.]*)\s?[lL])/;
        this.priceRegex = /€([\d,.]*)/;
    }

    shallowScrape() {
        console.info(`Starting shallow scrape for ${this.storeName}`);
    }

    deepScrape() {
        console.info(`Starting deep scrape for ${this.storeName}`);
    }

    getVol(name) {
        if (!name) {
            return name
        }
        const volResult = this.volRegex.exec(name);

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

    getMl(name) {
        if (!name) {
            return null
        }

        const mlResult = this.mlRegex.exec(name);

        if (mlResult) {
            const parsed = parseInt(mlResult[2]);
            if (isNaN(parsed)) {
                console.error(`Could not parse ml integer from ${name}`);
                return null
            } else {
                return parsed
            }
        }

        const clResult = this.clRegex.exec(name);

        if (clResult) {
            const parsed = parseInt(clResult[2]);
            if (isNaN(parsed)) {
                console.error(`Could not parse cl integer from ${name}`);
                return null
            } else {
                return parsed * 10
            }
        }

        const lResult = this.lRegex.exec(name);

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

    getPrice(priceString) {
        if (!priceString) {
            return null;
        }

        const priceResult = this.priceRegex.exec(priceString);
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

    getCleanName(name) {
        const regexRemove = [this.volRegex, this.mlRegex, this.clRegex, this.lRegex, this.priceRegex];

        name = name.toLowerCase().trim();

        for (let i = 0; i < illegalWords.length; i++) {
            name = name.replace(new RegExp(illegalWords[i], "g"), "").trim();
        }

        for (let i = 0; i < regexRemove.length; i++) {
            const result = regexRemove[i].exec(name);

            if (result && result[1]) {
                name = name.replace(new RegExp(result[1], 'g'), "").trim();
            }
        }

        name = name.replace(",", "");

        return name;
    }
}

module.exports = Scraper;
