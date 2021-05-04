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
    req.user
        .createProduct({
            title: title,
            price: price,
            imageUrl: imageUrl,
            description: description,
        })
        .then((result) => {
            res.redirect("/admin/products");
        })
        .catch();
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        res.redirect("/admin/products");
    } else {
        req.user
            .getProducts({ where: { id: req.params.id } })
            .then((product) => {
                if (!product) {
                    res.redirect("/admin/products");
                } else {
                    res.render("admin/edit-product", {
                        pageTitle: "Edit Product",
                        path: "/admin/edit-product",
                        editing: editMode,
                        product: product[0],
                    });
                }
            });
    }
};

exports.postEditProduct = (req, res, next) => {
    const newProduct = new Product(
        req.body.id,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    Product.findByPk(req.body.id)
        .then((product) => {
            product.title = newProduct.title;
            product.imageUrl = newProduct.imageUrl;
            product.description = newProduct.description;
            product.price = newProduct.price;
            return product.save();
        })
        .then(() => res.redirect("/admin/products"));
};

exports.getProducts = (req, res, next) => {
    req.user.getProducts().then((products) => {
        res.render("admin/products", {
            prods: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    });
};

exports.deleteProduct = (req, res, next) => {
    Product.findByPk(req.body.id)
        .then((product) => {
            return product.destroy();
        })
        .then(() => {
            res.redirect("/admin/products");
        });
};
