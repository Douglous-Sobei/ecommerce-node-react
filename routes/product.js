//
const express = require("express");
const router = express.Router();

const {
  create,
  productById,
  read,
  removeProduct,
  updateProduct,
} = require("../controllers/product");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const { userById } = require("../controllers/user");

router.get("/product/:productId", read);
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.delete(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  removeProduct
);
router.put(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateProduct
);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
