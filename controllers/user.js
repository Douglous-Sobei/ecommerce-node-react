// Import the User model from the '../models/user' file
const User = require("../models/user");

// Define an async function named 'userById'
// This function retrieves a user from the database based on the provided ID
// It attaches the user object to the request object under the 'profile' property
// If the user is not found, it returns a JSON response with an error message
exports.userById = async (req, res, next, id) => {
  try {
    // Find the user by ID using the User model's 'findById' static method
    const user = await User.findById(id);

    // If the user is not found, return a JSON response with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive fields from the user object (e.g., password hash and salt)
    user.hashed_password = undefined;
    user.salt = undefined;

    // Attach the user object to the request object under the 'profile' property
    req.profile = user;

    // Call the next middleware function
    next();
  } catch (err) {
    // If an error occurs, return a JSON response with an error message
    return res.status(400).json({ error: "Could not retrieve user" });
  }
};

// Define an async function named 'readUserProfile'
// This function retrieves the user profile from the request object and returns it as a JSON response
exports.readUserProfile = async (req, res) => {
  try {
    // Get the user profile from the request object
    const userProfile = req.profile;

    // Remove sensitive fields from the user profile object (e.g., password hash and salt)
    userProfile.hashed_password = undefined;
    userProfile.salt = undefined;

    // Return the user profile as a JSON response
    res.json(userProfile);
  } catch (err) {
    // If an error occurs, return a JSON response with an error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Define an async function named 'updateUserProfile'
// This function updates the user profile with the provided data and returns the updated user as a JSON response
exports.updateUserProfile = async (req, res) => {
  try {
    // Destructure the request body to get the user's name, email, old password, and new password
    const { name, email, password, newPassword } = req.body;

    // Get the user ID from the request object
    const userId = req.profile._id;

    // Find the user by ID using the User model's 'findById' static method
    let user = await User.findById(userId);

    // If the user is not found, return a JSON response with an error message
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If a new password is provided, authenticate the old password first
    if (newPassword && password) {
      // Check if the provided old password matches the user's password
      if (!user.authenticate(password)) {
        // If the old password is incorrect, return a JSON response with an error message
        return res.status(400).json({ error: "Incorrect old password" });
      }
    }

    // Update the user's fields based on the provided values
    if (name) user.name = name;
    if (email) user.email = email;
    if (newPassword) user.password = newPassword; // This triggers the virtual setter for the password

    // Save the updated user to the database
    await user.save();

    // Remove sensitive fields from the user object (e.g., password hash and salt)
    user.hashed_password = undefined;
    user.salt = undefined;

    // Return the updated user as a JSON response
    res.json(user);
  } catch (error) {
    // If an error occurs, log the error and return a JSON response with an error message
    console.error("Error updating user profile:", error);
    res.status(400).json({ error: "User update failed" });
  }
};
