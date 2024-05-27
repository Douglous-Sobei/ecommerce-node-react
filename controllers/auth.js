const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Ensure email is in lowercase
    const lowercaseEmail = email.toLowerCase();

    // check if this is the first user being created
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 1 : 0;

    const user = new User({
      name,
      email: lowercaseEmail,
      password,
      role, // Set the role based on user count
    });

    // save user to db
    await user.save();

    // Remove sensitive information from the request body
    user.salt = undefined;
    user.hashed_password = undefined;

    // send response to user
    res.status(201).json({ user });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: errorHandler(err),
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure email is in lowercase
    const normalizedEmail = email.toLowerCase();

    // Find user in the database by email
    const user = await User.findOne({ email: normalizedEmail });

    // If user not found, return error
    if (!user) {
      return res.status(400).json({
        error: "User with that email does not exist. Please sign up.",
      });
    }

    // If password does not match, return error
    if (!user.authenticate(password)) {
      return res
        .status(401)
        .json({ error: "Email and password do not match." });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    // Set token in cookie for future requests
    res.cookie("t", token, { expire: new Date() + 9999 });

    // Omit sensitive fields from user object
    const { _id, name, role } = user;
    // Respond with token and user details (excluding sensitive fields)
    res.json({ token, user: { _id, email: normalizedEmail, name, role } });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: errorHandler(err),
    });
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
