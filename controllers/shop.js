const Product = require("../models/product");
const Order = require("../models/order");

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
    let cart;
    req.user
        .getCart()
        .then((cart2) => {
            cart = cart2;
            return cart2.getProducts();
        })
        .then((products) => {
            if (products.length <= 0) {
                res.render("shop/cart", {
                    path: "/cart",
                    pageTitle: "Your Cart",
                    cartItems: [],
                    totalPrice: 0,
                });
            } else {
                res.render("shop/cart", {
                    path: "/cart",
                    pageTitle: "Your Cart",
                    cartItems: products,
                    totalPrice: cart.totalPrice,
                });
            }
        });
};

exports.addToCart = (req, res, next) => {
    const id = req.body.id;
    let cart;
    req.user
        .getCart()
        .then((cart2) => {
            cart = cart2;
            return cart2.getProducts({ where: { id: id } });
        })
        .then((products) => {
            let qty = 1;
            if (products.length > 0) {
                // product already in cart, increase quantity
                qty = products[0].cartItem.qty + 1;
            }
            return Product.findByPk(id)
                .then((product) => {
                    return cart.addProduct(product, { through: { qty: qty } });
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .then((products) => {
            res.redirect("/products");
        });
};

exports.removeFromCart = (req, res, next) => {
    const id = req.body.id;
    let cart;
    req.user
        .getCart()
        .then((cart2) => {
            cart = cart2;
            return cart2.getProducts({ where: { id: id } });
        })
        .then((products) => {
            let qty = products[0].cartItem.qty;
            if (qty == 1) {
                return products[0].cartItem.destroy();
            } else {
                qty = products[0].cartItem.qty - 1;
            }

            return Product.findByPk(id).then((product) => {
                return cart.addProduct(product, { through: { qty: qty } });
            });
        })
        .then((_) => {
            res.redirect("/cart");
        });
};

exports.getOrders = (req, res, next) => {
    res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
    });
};

exports.doCheckout = (req, res, next) => {
    let cart;
    req.user
        .getCart()
        .then((cart2) => {
            cart = cart2;
            return cart2.getProducts();
        })
        .then((products) => {
            req.user.createOrder().then((order) => {
                return order.addProducts(
                    products.map((p) => {
                        p.orderItem = { qty: products.cartItem.qty };
                        return p;
                    })
                );
            });
        })
        .then((_) => {
            res.render("shop/orders", {
                path: "/orders",
                pageTitle: "Your Orders",
            });
        });
};

exports.getCheckout = (req, res, next) => {
    res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
    });
};
