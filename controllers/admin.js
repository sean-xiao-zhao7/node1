const Product = require("../models/product").Product;
const deleteFile = require("../util/file");

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.file;
    const price = req.body.price;
    const description = req.body.description;

    if (!imageUrl) {
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl.path,
        userId: req.user,
    });
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
        Product.findById(req.params.id).then((product) => {
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
    const imageFile = req.file;
    Product.findById(req.body.id)
        .then((product) => {
            product.title = req.body.title;
            product.price = req.body.price;
            product.description = req.body.description;
            if (imageFile) {
                deleteFile(product.imageUrl);
                product.imageUrl = imageFile.path;
            }
            return product.save();
        })
        .then((_) => {
            res.redirect("/admin/products");
        })
        .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.find().then((products) => {
        res.render("admin/products", {
            prods: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
        });
    });
};

exports.deleteProduct = (req, res, next) => {
    Product.findByIdAndRemove(req.body.id).then((product) => {
        deleteFile(product.imageUrl);
        res.redirect("/admin/products");
    });
};

exports.deleteProductJSON = (req, res, next) => {
    Product.findByIdAndRemove(req.params.id).then((product) => {
        deleteFile(product.imageUrl);
        res.status(200).json({
            message: "Success",
        });
    });
};
