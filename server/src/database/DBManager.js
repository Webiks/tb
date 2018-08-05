const mongoose = require("mongoose");

class DBManager {

    static connect(Url) {

        return new Promise((resolve, reject) => {
            mongoose.connect(Url);
            const db = mongoose.connection;
            db.on("error", (err) => {
                console.error('connection error!: ' + err);
                return reject(err);
            });
            db.once("open", function () {
                console.log("connected to mongo!!!");
                return resolve();
            });
        });
    }

    static disconnect(done) {
        mongoose.disconnect(done);
    }
}

module.exports = DBManager;