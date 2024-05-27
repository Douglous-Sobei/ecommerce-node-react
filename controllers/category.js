const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = async (req, res) => {
  try {
    // Assuming category data is available in the request body
    const { name } = req.body;

    // Create a new category
    const category = new Category({ name });

    // Save the category to the database
    await category.save();

    // Respond with the created category
    res.status(201).json({ category });
  } catch (err) {
    // Handle errors and return an error response
    res.status(400).json({
      error: errorHandler(err),
    });
  }
};
