const MongoClient = require("mongodb").MongoClient;
const config = require("../config");

let _db;

function setUpDb(callback) {
    const db = _db;
    db.createCollection("products", {
        validator: {
            $and: [
                {
                    "name": {$type: "string", $exists: true}
                },
                {
                    "ml": {$type: "number", $exists: true}
                }
            ]
        }
    });
}

function initDb(callback) {
    if (_db) {
        console.warn("Trying to init the database again");
        return callback(null, _db);
    }

    MongoClient.connect(config.databaseUrl, {useNewUrlParser: true}, (err, db) => {
        if (err) {
            return callback(err);
        }
        console.log("Database connected");

        _db = db.db(config.database);

        setUpDb();
        callback(null, _db);
    });
}

function getDb() {
    if (_db) {
        return _db;
    }
    else {
        console.error("Database is not defined", _db);
        return _db
    }
}

module.exports = {
    getDb,
    initDb,
};
