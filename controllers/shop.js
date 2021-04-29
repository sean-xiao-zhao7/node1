const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/product-list", {
            prods: products,
            pageTitle: "All Products",
            path: "/products",
        });
    });
};

exports.getProduct = (req, res, next) => {
    const id = req.params.id;
    Product.getById(id, (resultProduct) => {
        res.render("shop/product-details", {
            product: resultProduct,
            path: "/product-details",
            pageTitle: `Details for ${resultProduct.title}`,
        });
    });
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/index", {
            prods: products,
            pageTitle: "Shop",
            path: "/",
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getItems((cart) => {
        if (!cart || cart.products.length <= 0) {
            res.render("shop/cart", {
                path: "/cart",
                pageTitle: "Your Cart",
                cartItems: [],
                totalPrice: 0,
            });
        } else {
            Product.fetchAll((allProducts) => {
                const cartItems = [];
                cart.products.forEach((cartItem) => {
                    const targetProduct = allProducts.find(
                        (p) => p.id === cartItem.id
                    );
                    if (targetProduct) {
                        cartItems.push({
                            product: targetProduct,
                            qty: cartItem.qty,
                        });
                    }
                });

                res.render("shop/cart", {
                    path: "/cart",
                    pageTitle: "Your Cart",
                    cartItems: cartItems,
                    totalPrice: cart.totalPrice,
                });
            });
        }
    });
};

exports.addToCart = (req, res, next) => {
    const id = req.body.id;
    Product.getById(id, (product) => {
        Cart.addProduct(id, product.price);
    });
    res.redirect("/products");
};

exports.removeFromCart = (req, res, next) => {
    Cart.deleteById(req.body.id, req.body.price, 1, (result) => {
        if (result) {
            res.redirect("/cart");
        }
    });
};

exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
    });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
    });
};
