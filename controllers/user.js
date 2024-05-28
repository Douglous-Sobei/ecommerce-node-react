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

// read user profile
exports.read = async (req, res) => {
  try {
    const userProfile = req.profile;
    userProfile.hashed_password = undefined;
    userProfile.salt = undefined;
    res.json(userProfile);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, password, newPassword } = req.body;
    const userId = req.profile._id;

    // Construct the update object based on provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (newPassword) updateFields.password = newPassword;

    // if new password is provided. authenticate old password first
    if (newPassword && password) {
      const user = await User.findById(userId);
      if (!user.authenticate(password)) {
        return res.status(400).json({ error: "Incorrecr old password" });
      }
    }

    // Update user profile
    const updateUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: updateFields },
      { new: true }
    );

    // remove sensitive fields from the response
    updateUser.hashed_password = undefined;
    updateUser.salt = undefined;

    res.json(updateUser);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
