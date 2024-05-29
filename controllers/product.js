// Required modules
const formidable = require("formidable"); // Form data parsing module
const fs = require("fs").promises; // File system promises
const Product = require("../models/product"); // Product model
const { errorHandler } = require("../helpers/dbErrorHandler"); // Error handling helper

// Helper function to parse the form data
// Returns a promise that resolves to an object containing the fields and files
const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true; // Keep file extensions
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject("Image could not be uploaded"); // Reject if there's an error
      } else {
        resolve({ fields, files }); // Resolve with the fields and files
      }
    });
  });
};

// Helper function to extract the fields from the form data
// Returns an object with the fields extracted from the form data
const extractFields = (fields) => {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value[0]])
  );
};

// Validate product fields
// Throws an error if any required fields are missing
const validateFields = ({
  name,
  description,
  price,
  category,
  quantity,
  shipping,
}) => {
  const errors = {};
  if (!name) {
    errors.name = "Name is required";
  }
  if (!description) {
    errors.description = "Description is required";
  }
  if (!price) {
    errors.price = "Price is required";
  }
  if (!category) {
    errors.category = "Category is required";
  }
  if (!quantity) {
    errors.quantity = "Quantity is required";
  }
  if (!shipping) {
    errors.shipping = "Shipping information is required";
  }
  if (Object.keys(errors).length > 0) {
    throw errors; // Throw the specific errors object
  }
};

// Handle product photo
// Reads the photo file and sets the data and content type of the product
const handlePhoto = async (photos, product) => {
  if (!photos || !photos[0]) return;
  const photo = photos[0];
  if (!photo.filepath) throw new Error("File path is not defined");
  if (photo.size > 1000000)
    throw new Error("Image should be less than 1mb in size");
  product.photo.data = await fs.readFile(photo.filepath);
  product.photo.contentType = photo.mimetype;
};

// Controller functions

// Middleware to fetch a product by ID and attach it to the request
exports.productById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    req.product = product;
    next();
  } catch (error) {
    return res.status(400).json({
      error: errorHandler(error),
    });
  }
};

// Controller to get a single product
exports.read = async (req, res, next) => {
  const product = req.product;
  req.product.photo = undefined;
  res.json(product);
};

// Controller to create a new product
exports.create = async (req, res) => {
  try {
    const { fields, files } = await parseFormData(req);
    const extractedFields = extractFields(fields);
    validateFields(extractedFields);
    const product = new Product(extractedFields);
    await handlePhoto(files.photo, product);
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(400).json({ errors: errorHandler(error) });
  }
};

// Controller to remove a product
exports.removeProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    await Product.findByIdAndDelete(productId);
    res.json({
      message: "Product deleted successfully",
    });
    next();
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Controller to update a product
exports.updateProduct = async function (req, res) {
  try {
    const { fields, files } = await parseFormData(req);
    const extractedFields = extractFields(fields);
    validateFields(extractedFields);
    const productId = req.params.productId;
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: extractedFields },
      { new: true }
    );
    await handlePhoto(files.photo, product);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ errors: errorHandler(error) });
  }
};

// Controller to get all products
exports.listProducts = async (req, res) => {
  try {
    // Extract sortBy, order, and limit from query parameters
    const sortBy = req.query.sortBy || "createdAt"; // Sort by createdAt by default
    const order = req.query.order || "asc"; // Sort in ascending order by default
    const limit = parseInt(req.query.limit) || 10; // Limit the number of products to 10 by default

    // Find products based on the specified parameters
    const products = await Product.find()
      .select("-photo") // Exclude the photo field from the result
      .populate("category") // Populate the category field
      .sort({ [sortBy]: order }) // Sort the products based on the specified field and order
      .limit(limit) // Limit the number of products returned
      .exec(); // Execute the query and return the products

    if (!products) {
      // If no products are found, return a 404 error
      return res.status(404).json({ error: "Products not found" });
    }

    // If products are found, return them as a JSON response
    res.json(products);
  } catch (err) {
    // If an error occurs, return a 400 error with the error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

exports.listRelated = async (req, res) => {
  try {
    // Extract productId from request parameters
    const productId = req.params.productId;

    // Find the product by productId
    const product = await Product.findById(productId);

    if (!product) {
      // If the product is not found, return a 404 error
      return res.status(404).json({ error: "Product not found" });
    }

    // Find related products based on the same category
    const relatedProducts = await Product.find({
      _id: { $ne: product._id }, // Exclude the current product
      category: product.category, // Match the same category as the current product
    })
      .limit(4) // Limit the number of related products to 4
      .select("-photo") // Exclude the photo field from the result
      .populate("category", "_id name"); // Populate the category field

    // Return the related products as a JSON response
    res.json(relatedProducts);
  } catch (err) {
    // If an error occurs, return a 400 error with the error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Controller to list categories
exports.listCategories = async (req, res) => {
  try {
    // Find distinct categories from the Product collection
    const categories = await Product.distinct("category");

    if (!categories) {
      // If no categories are found, return a 404 error
      return res.status(404).json({ error: "Categories not found" });
    }

    // Return the categories as a JSON response
    res.json(categories);
  } catch (err) {
    // If an error occurs, return a 400 error with the error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Controller to list products by search criteria
exports.listBySearch = async (req, res) => {
  // Extract order, sortBy, limit, and skip from request body
  const order = req.body.order ? req.body.order : "desc"; // Sort in descending order if not specified
  const sortBy = req.body.sortBy ? req.body.sortBy : "_id"; // Sort by _id if not specified
  const limit = req.body.limit ? parseInt(req.body.limit) : 100; // Limit the number of products to 100 if not specified
  const skip = parseInt(req.body.skip); // Skip the specified number of products

  // Create an empty filter object
  const findArgs = {};

  // Iterate over each filter in the request body
  for (let key in req.body.filters) {
    // If the filter has a value, add it to the filter object
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // For price filter, use greater than and less than or equal to operators
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        // For other filters, directly assign the filter values
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    // Execute the query with the specified filters, sorting, and pagination
    const products = await Product.find(findArgs)
      .select("-photo") // Exclude the photo field from the result
      .populate("category") // Populate the category field
      .sort([[sortBy, order]]) // Sort the products based on the specified field and order
      .skip(skip) // Skip the specified number of products
      .limit(limit) // Limit the number of products returned
      .exec(); // Execute the query and return the products

    if (!products) {
      // If no products are found, return a 404 error
      return res.status(404).json({ error: "Products not found" });
    }

    // Return the products as a JSON response with the size and data fields
    res.json({
      size: products.length,
      data: products,
    });
  } catch (err) {
    // If an error occurs, return a 400 error with the error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Controller to get product photo
exports.photo = async (req, res, next) => {
  try {
    // Extract productId from request parameters
    const productId = req.params.productId;

    // Find the product by productId and select only the photo field
    const product = await Product.findById(productId).select("photo");

    if (!product || !product.photo || !product.photo.data) {
      // If the product or the photo is not found, return a 400 error
      return res.status(400).json({ error: "Photo not found" });
    }

    // Set the content type of the response to the content type of the photo
    res.set("Content-Type", product.photo.contentType);

    // Send the photo data as the response
    return res.send(product.photo.data);
  } catch (err) {
    // If an error occurs, return a 400 error with the error message
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
