const formidable = require("formidable");
const fs = require("fs").promises; // Assuming fs.promises is used for file operations
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

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
exports.read = async (req, res, next) => {
  const product = req.product;
  req.product.photo = undefined;
  res.json(product);
};

// Parse form data
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

// Extract fields from form data
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
