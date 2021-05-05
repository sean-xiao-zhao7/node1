const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/delete", );

router.get("/products/:id", shopController.getProduct);

router.get("/cart", shopController.getCart);
router.post("/cart", shopController.addToCart);
router.post("/cart/remove", shopController.removeFromCart);

router.get("/orders", shopController.getOrders);
router.post("/checkout", shopController.doCheckout);
router.get("/checkout", shopController.getCheckout);

module.exports = router;
