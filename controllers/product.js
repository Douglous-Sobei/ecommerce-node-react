const formidable = require("formidable");
const fs = require("fs").promises; // Assuming fs.promises is used for file operations
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

// Controller to create a new product
exports.create = async (req, res) => {
  try {
    const parseFormData = async (req) => {
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

    const extractFields = (fields) => {
      return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [key, value[0]])
      );
    };

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

    const handlePhoto = async (photos, product) => {
      if (!photos || !photos[0]) return;
      const photo = photos[0];
      if (!photo.filepath) throw new Error("File path is not defined");
      if (photo.size > 1000000)
        throw new Error("Image should be less than 1mb in size");
      product.photo.data = await fs.readFile(photo.filepath);
      product.photo.contentType = photo.mimetype;
    };

    const createProduct = async (req) => {
      const { fields, files } = await parseFormData(req);
      const extractedFields = extractFields(fields);
      validateFields(extractedFields);
      const product = new Product(extractedFields);
      await handlePhoto(files.photo, product);
      return product.save();
    };

    const product = await createProduct(req);
    res.json(product);
  } catch (err) {
    res.status(400).json({
      error: errorHandler(err),
    });
  }
};
