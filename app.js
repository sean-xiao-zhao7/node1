const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const MONGOURI =
    "mongodb+srv://****@cluster0.aeflw.mongodb.net/node1?retryWrites=true&w=majority";
const store = new MongoDBStore({
    uri: MONGOURI,
    collection: "sessions",
});
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const multer = require("multer");

// serve

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        callback(null, file.filename + "-" + file.originalname);
    },
});
const fileFilter = (req, file, callback) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        callback(null, true);
    } else {
        callback(null, false);
    }
};
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageUrl"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));

app.use((req, res, next) => {
    if (req.session.user) {
        User.findById(req.session.user._id)
            .then((user) => {
                req.user = user;
                next();
            })
            .catch((err) => console.log(err));
    } else {
        next();
    }
});
app.use(csrfProtection);
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(flash());

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use(shopRoutes);

app.get("/error", errorController.get500);
app.use(errorController.get404);

mongoose
    .connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        app.listen(3000);
    })
    .catch((e) => {
        console.log(e);
    });
