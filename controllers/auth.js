const User = require("../models/user");

exports.login = (req, res, next) => {
    res.render("auth/login", {
        path: "/",
        pageTitle: "Login",
    });
};

exports.loginPOST = (req, res, next) => {
    User.findOne({ email: req.body.username })
        .then((user) => {
            req.session.user = user;
            req.session.save((_) => res.redirect("/"));
        })
        .catch((e) => console.log(e));
};

exports.logout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
};

exports.signup = (req, res, next) => {
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Sign up",
    });
};

exports.signupPOST = (req, res, next) => {
    User.insertOne({ email: req.body.username, password: req.body.password })
        .then((_) => {
            this.loginPOST(req, res, next);
        })
        .catch((e) => console.log(e));
};
