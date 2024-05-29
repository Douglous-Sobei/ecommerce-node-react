const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");

// controllers/auth.js

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user with the same name already exists
    let user = await User.findOne({ name });
    if (user) {
      return res
        .status(400)
        .json({ error: "User with this name already exists" });
    }

    // Check if user with the same email already exists
    user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Determine role for the new user
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 1 : 0;

    // Create new user
    user = new User({ name, email, password, role });

    // Save user to database
    await user.save();

    // Remove sensitive information from response
    user.hashed_password = undefined;
    user.salt = undefined;

    // Send success response
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please sign up.",
      });
    }

    if (!user.authenticate(password)) {
      return res
        .status(401)
        .json({ error: "Email and password do not match." });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("t", token, { expire: new Date() + 9999 });

    const { _id, name, role } = user;
    res.json({ token, user: { _id, email: normalizedEmail, name, role } });
  } catch (err) {
    res.status(400).json({ error: errorHandler(err) });
  }
};

exports.signout = async (req, res) => {
  res.clearCookie("t");
  return res.json({ message: "Signout success" });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  const user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res.status(403).json({
      error: "Admin resource. Access denied",
    });
  }
  next();
};
