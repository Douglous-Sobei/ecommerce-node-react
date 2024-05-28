const express = require("express");
const router = express.Router();
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const {
  userById,
  readUserProfile,
  updateUserProfile,
} = require("../controllers/user");

// Define a protected route
router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

// Routes for user profile
router.get("/user/:userId", requireSignin, isAuth, readUserProfile);
router.put("/user/:userId", requireSignin, isAuth, updateUserProfile);

// Middleware to get user by ID
router.param("userId", userById);

module.exports = router;