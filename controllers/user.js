const User = require("../models/user");

exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Omit sensitive fields from user object
    user.hashed_password = undefined;
    user.salt = undefined;

    req.profile = user; // Attach the user object to the request
    next();
  } catch (err) {
    return res.status(400).json({ error: "Could not retrieve user" });
  }
};
