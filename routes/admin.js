const express = require("express");
const adminController = require("../controllers/admin");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/add-product", authMiddleware, adminController.getAddProduct);
router.get("/products", authMiddleware, adminController.getProducts);
router.post("/add-product", authMiddleware, adminController.postAddProduct);
router.get("/edit-product/:id", authMiddleware, adminController.getEditProduct);
router.post("/edit-product/", authMiddleware, adminController.postEditProduct);
router.post("/delete-product/", authMiddleware, adminController.deleteProduct);
router.delete("/delete-product-json/:id", authMiddleware, adminController.deleteProductJSON);

module.exports = router;
