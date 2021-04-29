const fs = require("fs");
const path = require("path");

const p = path.join(
    path.dirname(process.mainModule.filename),
    "data",
    "cart.json"
);

module.exports = class Cart {
    static getItems(callback) {
        fs.readFile(p, (err, content) => {
            try {
                const cart = JSON.parse(content);
                callback(cart);
            } catch (e) {
                console.log(e.message);
                callback(null);
            }
        });
    }

    static addProduct(id, productPrice) {
        fs.readFile(p, (err, content) => {
            let cart = { products: [], totalPrice: 0 };
            if (!err) {
                // cart already exists
                cart = JSON.parse(content);
            }
            const existingProductIndex = cart.products.findIndex(
                (p) => p.id === id
            );
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if (existingProduct) {
                updatedProduct = { ...existingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;

                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }

    static deleteById(id, price, qty, callback) {
        fs.readFile(p, (err, content) => {
            if (err) {
                return;
            }
            const cart = JSON.parse(content);
            const newCart = { ...cart };

            // calc price to deduct
            const targetProduct = newCart.products.find(
                (product) => product.id === id
            );
            if (qty === "all" || qty === targetProduct.qty) {
                newCart.totalPrice =
                    newCart.totalPrice - price * targetProduct.qty;
                // remove
                newCart.products.splice(
                    newCart.products.findIndex((product) => product.id === id),
                    1
                );
            } else {
                newCart.totalPrice = newCart.totalPrice - price * qty;
                // remove
                targetProduct.qty = targetProduct.qty - qty;
                newCart.products.splice(
                    newCart.products.findIndex((product) => product.id === id),
                    1,
                    targetProduct
                );
            }

            fs.writeFile(p, JSON.stringify(newCart), (err) => {
                if (!err) {
                    callback(true);
                } else {
                    console.log(err);
                }
            });
        });
    }
};
