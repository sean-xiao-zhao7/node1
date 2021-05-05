const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class User {
    constructor(name, email, id) {
        this.name = name;
        this.email = email;
        this._id = id ? new mongodb.ObjectID(id) : null;
    }

    save() {
        const db = getDb();
        if (this.id) {
            return db
                .collection("users")
                .updateOne({ _id: this._id }, this)
                .then()
                .catch((err) => {
                    console.log(err);
                });
        } else {
            return db
                .collection("users")
                .insertOne(this)
                .then()
                .catch((err) => {
                    console.log(err);
                });
        }
    }

    static findById(id) {
        const db = getDb();
        console.log(id)
        return db
            .collection("users")
            .findOne({ _id: mongodb.ObjectID(id) })
            .then()
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = User;
