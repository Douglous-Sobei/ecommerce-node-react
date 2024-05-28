//
const express = require("express");
const router = express.Router();

const {
  create,
  productById,
  read,
  removeProduct,
  updateProduct,
  listProducts,
  listRelated,
  listBySearch,
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
router.get("/products", listProducts);
router.get("/products/related/:productId", listRelated);

router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
