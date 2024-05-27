const User = require("../models/user");

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
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    console.error("Error occurred during signup:", err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
