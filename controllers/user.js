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
  // find the user based on email
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+hashed_password");
  if (!user) {
    return res.status(401).json({
      error: "User with that email does not exist. Please signup",
    });
  }
  // if the user is found make sure email and password matches
  // create authenticate method in user model
  if (!user.authenticate(password)) {
    return res.status(401).json({
      error: "Email and password do not match",
    });
  }
  // generate a signed token with user id and secret
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  // persist the token as 't' in cookie with expiration date
  res.cookie("t", token, { expire: new Date() + 9999 });
  // return response with user and token to frontend client
  const { _id, name, role } = user;
  return res.json({ token, user: { _id, name, email: user.email, role } });
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
