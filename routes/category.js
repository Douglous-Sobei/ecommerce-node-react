// user.js

const express = require("express");
const router = express.Router();

const {
  create,
  categoryById,
  read,
  updateCategory,
  removeCategory,
  listCategory,
} = require("../controllers/category");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");

router.get("/category/:categoryId", read);
router.post("/category/create/:userId", requireSignin, isAuth, isAdmin, create);
router.put(
  "/category/:categoryId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  updateCategory
);
router.delete(
  "/category/:categoryId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  removeCategory
);
router.get("/categories", listCategory);

router.param("userId", userById);
router.param("categoryId", categoryById);

module.exports = router;
