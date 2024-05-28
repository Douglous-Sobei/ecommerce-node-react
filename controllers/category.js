const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

// Get the category By ID
exports.categoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(400).json({
        error: "Category not found",
      });
    }

    req.category = category;
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// single category
exports.read = async (req, res) => {
  try {
    const category = req.category;
    res.json(category);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

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
