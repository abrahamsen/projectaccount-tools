const MongoClient = require("mongodb").MongoClient
const config = require("./config");

var db;
MongoClient.connect(config.get("MONGODB_URI"), (err, database) => {
    if (err) {
        return console.error(err);
    }
    db = database;
});

var data = module.exports = {
    user: {
        get: (id, cb) => {
            db.collection("users").find({ id: id }).toArray((err, result) => {
                cb(err, (result && result.length) ? result[0] : null);
            });
        },
        save: (user, cb) => {
            db.collection("users").save(user, (err, result) => {
                cb(err, result);
            });
        }
    },
    getDB: function() {
        return db;
    }
};