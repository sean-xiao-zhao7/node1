const path = require("path");
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.login);
router.post("/login", authController.loginPOST);
router.get("/logout", authController.logout);
router.get("/signup", authController.signup);

module.exports = router;
