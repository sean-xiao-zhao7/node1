const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectID(id) : null;
        this.userId = userId;
    }

    save() {
        const db = getDb();
        if (this._id) {
            return db
                .collection("products")
                .updateOne(
                    {
                        _id: this._id,
                    },
                    {
                        $set: this,
                    }
                )
                .then()
                .catch((err) => console.log(err));
        } else {
            return db
                .collection("products")
                .insertOne(this)
                .then()
                .catch((err) => console.log(err));
        }
    }

    static fetchAll() {
        const db = getDb();
        return db
            .collection("products")
            .find()
            .toArray()
            .then((products) => {
                return products;
            })
            .catch((err) => console.log(err));
    }

    static fetchOne(id) {
        const db = getDb();
        return db
            .collection("products")
            .findOne({ _id: mongodb.ObjectID(id) })
            .then((product) => {
                return product;
            })
            .catch((err) => console.log(err));
    }

    static deleteOne(id) {
        const db = getDb();
        return db
            .collection("products")
            .deleteOne({ _id: mongodb.ObjectID(id) })
            .then((result) => {
                return result;
            })
            .catch((err) => console.log(err));
    }
}

module.exports = Product;
