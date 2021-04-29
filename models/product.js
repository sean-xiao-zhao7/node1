const fs = require("fs");
const path = require("path");
const Cart = require("../models/cart");

const p = path.join(
    path.dirname(process.mainModule.filename),
    "data",
    "products.json"
);

const getProductsFromFile = (cb) => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            cb([]);
        } else {
            cb(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        if (!this.id) {
            this.id = Math.random().toString();
            getProductsFromFile((products) => {
                products.push(this);
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            });
        } else {
            getProductsFromFile((products) => {
                const targetId = products.findIndex((p) => p.id === this.id);
                const newProducts = [...products];
                newProducts[targetId] = this;
                fs.writeFile(p, JSON.stringify(newProducts), (err) => {
                    console.log(err);
                });
            });
        }
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }

    static getById(id, callback) {
        getProductsFromFile((products) => {
            const product = products.find((p) => p.id === id);
            callback(product);
        });
    }

    static deleteById(id, price) {
        getProductsFromFile((products) => {
            const newProducts = products.filter((p) => p.id !== id);
            fs.writeFile(p, JSON.stringify(newProducts), (err) => {
                console.log(err);
                if (!err) {
                    Cart.deleteById(id, price, "all", (result) => {
                        if (result) {
                            return;
                        }
                    });
                }
            });
        });
    }
};
