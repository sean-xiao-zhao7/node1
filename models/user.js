const getDb = require("../util/database").getDb;
const mongodb = require("mongodb");

class User {
    constructor(name, email, id, cart) {
        this.name = name;
        this.email = email;
        this._id = id ? new mongodb.ObjectID(id) : null;
        this.cart = cart;
    }

    save() {
        const db = getDb();
        if (this._id) {
            return db
                .collection("users")
                .updateOne({ _id: this._id }, { $set: this })
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
        return db
            .collection("users")
            .findOne({ _id: mongodb.ObjectID(id) })
            .then()
            .catch((err) => {
                console.log(err);
            });
    }

    addToCart(product) {
        if (this.cart[product._id]) {
            // increase quantity
            this.cart[product._id].quantity += 1;
            return this.save();
        }

        // no such item yet, add it
        this.cart[product._id] = { product: product, quantity: 1 };
        return this.save();
    }

    getCart() {
        return this.cart;
    }

    deleteFromCart(productId) {
        if ((this.cart[productId].quantity -= 1) == 0) {
            delete this.cart[productId];
        }
        return this.save();
    }

    checkout() {
        const db = getDb();
        return db
            .collection("orders")
            .insertOne({
                cart: this.cart,
                user: { name: this.name, email: this.email, id: this._id },
            })
            .then((_) => {
                this.cart = {};
                return db
                    .collection("users")
                    .updateOne({ _id: this._id }, { $set: { cart: {} } });
            })
            .catch((err) => {
                console.log(err);
            });
    }

    getOrders() {
        const db = getDb();
        return db
            .collection("orders")
            .find({ "user.id": this._id })
            .toArray()
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = User;
