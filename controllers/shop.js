const Product = require("../models/product").Product;
const Order = require("../models/order");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const PDF = require("pdfkit");
const stripe = require("stripe")("sk_test_e0ZOwmIiZzNMMeUI2tkUpcy0");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then((num) => {
            totalItems = num;
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .then((products) => {
                    res.render("shop/product-list", {
                        prods: products,
                        pageTitle: "All Products",
                        path: "/products",
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                        url: "/products",
                    });
                })
                .catch((err) => console.log(err));
        });
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.findById(id)
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then((num) => {
            totalItems = num;
            Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
                .then((products) => {
                    return res.render("shop/index", {
                        prods: products,
                        pageTitle: "Shop",
                        path: "/",
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                        url: "/",
                    });
                })
                .catch((err) => console.log(err));
        });
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
    Product.findById(id)
        .then((product) => {
            return req.user.addToCart(product);
        })
        .then((result) => {
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
    Order.findById(req.params.orderId)
        .then((order) => {
            stripe.checkout.sessions
                .create({
                    payment_method_types: ["card"],
                    line_items: Object.keys(order.cart).map((productId) => {
                        return {
                            name: order.cart[productId].product.title,
                            description: order.cart[productId].product.description,
                            amount: order.cart[productId].product.price,
                            currency: "usd",
                            quantity: order.cart[productId].quantity,
                        };
                    }),
                    success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
                    cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
                })
                .then((session) => {
                    res.render("shop/checkout", {
                        path: "/checkout",
                        pageTitle: "Checkout",
                        cart: order.cart,
                        sessionId: session.id,
                    });
                });
        })
        .catch((e) => console.log(e));
};

exports.getOrderInvoice = (req, res, next) => {
    const newPDF = new PDF();
    newPDF.pipe(fs.createWriteStream(path.join("data", "invoices", "invoice.pdf")));
    newPDF.pipe(res);

    // make PDF
    newPDF.fontSize("26").text("Invoice", {
        underline: true,
    });

    // send PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    newPDF.end();
};
