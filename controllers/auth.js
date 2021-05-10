const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.login = (req, res, next) => {
    res.render("auth/login", {
        path: "/",
        pageTitle: "Login",
    });
};

exports.loginPOST = (req, res, next) => {
    User.findOne({ email: req.body.username })
        .then((user) => {
            if (user) {
                bcrypt
                    .compare(req.body.password, user.password)
                    .then((result) => {
                        if (result) {
                            req.session.user = user;
                            req.session.save((_) => res.redirect("/"));
                        } else {
                            res.redirect("/auth/login");
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            }
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
    User.findOne({ email: req.body.username })
        .then((user) => {
            if (!user) {
                bcrypt.hash(req.body.password, 12).then((password) => {
                    const newUser = new User({
                        email: req.body.username,
                        password: password,
                    });
                    newUser.save().then((_) => {
                        this.loginPOST(req, res, next);
                    });
                });
            } else {
                this.loginPOST(req, res, next);
            }
        })
        .catch((e) => console.log(e));
};
