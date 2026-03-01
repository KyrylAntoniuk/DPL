import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';
import FilterConfig from '../models/filterConfigModel.js';

// Update filter config based on product specifications
const updateFilterConfigFromProduct = async (product) => {
  if (!product.specifications?.length) return;

  let config = await FilterConfig.findOne();
  if (!config) {
    config = new FilterConfig({ filterableFields: [{ key: 'brand', label: { en: 'Brand', uk: 'Бренд' } }] });
  }

  let isModified = false;

  product.specifications.forEach((spec) => {
    const key = `specifications.${spec.name}`;
    const exists = config.filterableFields.some((field) => field.key === key);

    if (!exists) {
      config.filterableFields.push({
        key: key,
        label: { en: spec.name, uk: spec.name },
      });
      isModified = true;
    }
  });

  if (isModified) await config.save();
};

// @desc    Fetch all products with filtering and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const queryParams = { ...req.query };
  const excludedFields = ['keyword', 'pageNumber', 'pageSize', 'sort'];
  excludedFields.forEach((field) => delete queryParams[field]);

  const filter = {};

  if (req.query.keyword) {
    filter.name = { $regex: req.query.keyword, $options: 'i' };
  }

  // Build filter object
  for (const key in queryParams) {
    if (key.startsWith('specifications.')) {
      const specName = key.split('.')[1];
      const values = Array.isArray(queryParams[key]) ? queryParams[key] : [queryParams[key]];

      if (!filter.specifications) filter.specifications = { $all: [] };

      // Filter by specification name and value(s)
      filter.specifications.$all.push({
        $elemMatch: { name: specName, value: { $in: values } }
      });

    } else if (key === 'brand') {
      const values = Array.isArray(queryParams[key]) ? queryParams[key] : [queryParams[key]];
      filter.brand = { $in: values };
    } else if (key === 'category') {
       filter.category = queryParams[key];
    } else {
      filter[key] = queryParams[key];
    }
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get unique categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

// @desc    Get available filters
// @route   GET /api/products/filters
// @access  Public
const getProductFilters = asyncHandler(async (req, res) => {
  const queryParams = { ...req.query };
  const products = await Product.find(queryParams);
  const brands = [...new Set(products.map(p => p.brand))];
  res.json({ brands });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const reviews = await Review.find({ product: product._id });
    res.json({ ...product.toObject(), reviews });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    const allReviews = await Review.find({ product: product._id });
    product.numReviews = allReviews.length;
    product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added', review });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, basePrice, description, generalImages, brand, category, specifications, variants,
  } = req.body;

  const product = new Product({
    name, basePrice, user: req.user._id, generalImages, brand, category,
    countInStock: 0, numReviews: 0, description, specifications, variants,
  });

  const createdProduct = await product.save();
  await updateFilterConfigFromProduct(createdProduct);
  res.status(201).json(createdProduct);
});

// @desc    Import products from JSON
// @route   POST /api/products/import
// @access  Private/Admin
const importProducts = asyncHandler(async (req, res) => {
  let products = req.body;
  if (!Array.isArray(products)) products = [products];

  const productsWithUser = products.map((product) => {
    const { _id, createdAt, updatedAt, __v, ...rest } = product;
    return { ...rest, user: req.user._id };
  });

  const createdProducts = await Product.insertMany(productsWithUser);

  for (const product of createdProducts) {
    await updateFilterConfigFromProduct(product);
  }

  res.status(201).json({ message: 'Products imported' });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, basePrice, description, generalImages, brand, category, specifications, variants } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.basePrice = basePrice || product.basePrice;
    product.description = description || product.description;
    product.generalImages = generalImages || product.generalImages;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.specifications = specifications || product.specifications;
    product.variants = variants || product.variants;

    const updatedProduct = await product.save();
    await updateFilterConfigFromProduct(updatedProduct);
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product deleted' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

export {
  getProducts,
  getProductById,
  getProductCategories,
  getProductFilters,
  createProductReview,
  createProduct,
  importProducts,
  updateProduct,
  deleteProduct,
};
