const formidable = require("formidable");
const fs = require("fs").promises; // Assuming fs.promises is used for file operations
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

// Helper function to parse the data
const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject("Image could not be uploaded");
      } else {
        resolve({ fields, files });
      }
    });
  });
};

// Helper function to extract the data from the form data
const extractFields = (fields) => {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value[0]])
  );
};

// Validate product fields
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

// single product
exports.read = async (req, res, next) => {
  const product = req.product;
  req.product.photo = undefined;
  res.json(product);
};

// Create a new product
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

// remove product
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

// update the production
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

/**
 * sell / arrivals
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=created_at&order=desc&limit=4
 * if no params are sent, then all products are returned
 */

// get all products
exports.listProducts = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "asc";
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find()
      .select("-photo")
      .populate("category")
      .sort({ [sortBy]: order })
      .limit(limit)
      .exec();

    if (!products) {
      return res.status(404).json({ error: "Products not found" });
    }

    res.json(products);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

/**
 * It will find the products based on the req product category
 * Other products with same category will be returned
 */

// Controller to list related products
exports.listRelated = async (req, res) => {
  try {
    // Extract productId from request parameters
    const productId = req.params.productId;

    // Find the product by productId
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find related products based on the same category
    const relatedProducts = await Product.find({
      _id: { $ne: product._id }, // Exclude the current product
      category: product.category, // Match the same category as the current product
    })
      .limit(4) // Limit the number of related products to 4
      .select("-photo") // Exclude the photo field
      .populate("category", "_id name"); // Populate the category field

    res.json(relatedProducts);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// Controller to list products by search criteria
exports.listBySearch = async (req, res) => {
  const order = req.body.order ? req.body.order : "desc";
  const sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  const limit = req.body.limit ? parseInt(req.body.limit) : 100;
  const skip = parseInt(req.body.skip);
  const findArgs = {};

  // Iterate over each filter in the request body
  for (let key in req.body.filters) {
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
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec();

    if (!products) {
      return res.status(404).json({ error: "Products not found" });
    }

    res.json({
      size: products.length,
      data: products,
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};

// list categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    if (!categories) {
      return res.status(404).json({ error: "Categories not found" });
    }
    res.json(categories);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler(err),
    });
  }
};
