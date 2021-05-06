const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
            res.render("shop/product-list", {
                prods: products,
                pageTitle: "All Products",
                path: "/products",
            });
        })
        .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.fetchOne(id)
        .then((product) => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("shop/product-details", {
                product: product,
                path: "/product-details",
                pageTitle: `Details for ${product.title}`,
            });
        })
        .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll()
        .then((products) => {
            res.render("shop/index", {
                prods: products,
                pageTitle: "Shop",
                path: "/",
            });
        })
        .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
    const cart = req.user.getCart();

    // calc total price
    let total = 0;
    for (const cartItemId in cart) {
        total += +cart[cartItemId].product.price;
    }

    res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        cart: cart,
        totalPrice: total,
    });
};

exports.addToCart = (req, res, next) => {
    const id = req.body.id;
    Product.fetchOne(id)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((_) => {
            res.redirect("/cart");
        })
        .catch((e) => console.log(e));
};

exports.removeFromCart = (req, res, next) => {
    const id = req.body.id;
    req.user
        .deleteFromCart(id)
        .then((_) => {
            res.redirect("/cart");
        })
        .catch((e) => console.log(e));
};

exports.getOrders = (req, res, next) => {
    req.user.getOrders().then((orders) => {
        res.render("shop/orders", {
            path: "/orders",
            pageTitle: "Your Orders",
            orders: orders,
        });
    });
};

exports.doCheckout = (req, res, next) => {
    req.user.checkout().then((_) => {
        this.getOrders(req, res, next);
    });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
    });
};

