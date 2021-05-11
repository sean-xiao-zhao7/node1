const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: "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",
        },
    })
);
const crypto = require("crypto");
const { validationResult } = require("express-validator");

exports.login = (req, res, next) => {
    console.log(res.locals);
    res.render("auth/login", {
        path: "/",
        pageTitle: "Login",
        errorMessage: req.flash("error"),
    });
};

exports.loginPOST = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            path: "/",
            pageTitle: "Login",
            errorMessage: errors.array()[0].msg,
        });
    }
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
            } else {
                req.flash("error", "No user found with email " + req.body.username);
                res.redirect("/auth/login");
            }
        })
        .catch((e) => console.log(e));
};

exports.logout = (req, res, next) => {
    console.log(req.session);
    req.session.destroy((result) => {
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Sign up",
            errorMessage: errors.array(),
        });
    }
    User.findOne({ email: req.body.username })
        .then((user) => {
            if (!user) {
                bcrypt.hash(req.body.password, 12).then((password) => {
                    const newUser = new User({
                        email: req.body.username,
                        password: password,
                    });
                    newUser.save().then((_) => {
                        // transporter
                        //     .sendMail({
                        //         to: "john316rocks@gmail.com",
                        //         from: "shop@node-complete.com",
                        //         subject: "Welcome to Node1",
                        //         html: "<h1>Welcome to Node1</h1>",
                        //     })
                        //     .then((_) => {});
                        this.loginPOST(req, res, next);
                    });
                });
            } else {
                this.loginPOST(req, res, next);
            }
        })
        .catch((e) => console.log(e));
};

exports.reset = (req, res, next) => {
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset Password",
        errorMessage: req.flash("error"),
    });
};

exports.resetPOST = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.username }).then((user) => {
            if (user) {
                user.resetToken = token;
                user.resetTokenExpire = Date.now();
                user.save().then((_) => {
                    return res.redirect("/");
                });
            } else {
                req.flash("error", "No user found with email " + req.body.username);
                return res.redirect("/auth/reset");
            }
        });
    });
};

exports.newPassword = (req, res, next) => {
    const token = req.params.token;
    console.log(token);
    User.findOne({ resetToken: token, resetTokenExpire: { $lt: Date.now() } }).then((user) => {
        if (user) {
            return res.render("auth/reset-form", {
                path: "/reset",
                pageTitle: "Reset Password",
                errorMessage: req.flash("error"),
                userId: user._id,
                token: token,
            });
        } else {
            console.log("No user found with email with valid token: " + token);
            req.flash("error", "No user found with email with valid token: " + token);
            return res.redirect("/");
        }
    });
};

exports.newPasswordPOST = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;
    User.findOne({ _id: userId, resetToken: token }).then((user) => {
        bcrypt.hash(newPassword, 12).then((hashed) => {
            user.password = hashed;
            user.resetToken = undefined;
            user.resetTokenExpire = undefined;
            user.save().then((_) => {
                return res.redirect("/auth/login");
            });
        });
    });
};
