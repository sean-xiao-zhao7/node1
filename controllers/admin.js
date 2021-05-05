const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(
        title,
        price,
        description,
        imageUrl,
        null,
        req.user._id
    );
    product
        .save()
        .then((_) => {
            res.redirect("/admin/products");
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect("/admin/products");
    } else {
        Product.fetchOne(req.params.id).then((product) => {
            if (!product) {
                res.redirect("/admin/products");
            } else {
                res.render("admin/edit-product", {
                    pageTitle: "Edit Product",
                    path: "/admin/edit-product",
                    editing: editMode,
                    product: product,
                });
            }
        });
    }
};

exports.postEditProduct = (req, res, next) => {
    const newProduct = new Product(
        req.body.title,
        req.body.price,
        req.body.description,
        req.body.imageUrl,
        req.body.id
    );
    newProduct
        .save()
        .then((result) => {
            res.redirect("/admin/products");
        })
        .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll().then((products) => {
        res.render("admin/products", {
            prods: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    });
};

exports.deleteProduct = (req, res, next) => {
    Product.deleteOne(req.body.id).then(() => {
        res.redirect("/admin/products");
    });
};
