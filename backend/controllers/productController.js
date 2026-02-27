import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';

// @desc    Получить список всех товаров с фильтрацией и пагинацией
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 10; // Количество товаров на странице
  const page = Number(req.query.pageNumber) || 1; // Номер страницы

  // --- ДИНАМИЧЕСКАЯ ФИЛЬТРАЦИЯ ---
  const queryParams = { ...req.query };
  const excludedFields = ['keyword', 'pageNumber', 'pageSize', 'sort'];
  excludedFields.forEach((field) => delete queryParams[field]);

  // Создаем объект для поиска в MongoDB
  const filter = {};

  // 1. Поиск по ключевому слову (остается без изменений)
  if (req.query.keyword) {
    filter.name = {
      $regex: req.query.keyword,
      $options: 'i', // регистронезависимый поиск
    };
  }

  // 2. Динамическое добавление остальных фильтров (category, brand, ram и т.д.)
  for (const key in queryParams) {
    filter[key] = queryParams[key];
  }
  // --- КОНЕЦ ДИНАМИЧЕСКОЙ ФИЛЬТРАЦИИ ---

  // Считаем общее количество товаров по фильтру
  const count = await Product.countDocuments(filter);

  // Ищем товары в базе с фильтром, лимитом и пропуском
  const products = await Product.find(filter)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  // Возвращаем товары и информацию для пагинации
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});


// @desc    Получить список уникальных категорий
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});


// @desc    Получить информацию о конкретном товаре по ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    // Если id корректного формата, но товара нет
    res.status(404);
    throw new Error('Товар не найден');
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    // Проверяем, не оставлял ли уже этот пользователь отзыв
    const alreadyReviewed = await Review.findOne({
      product: product._id,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Вы уже оставили отзыв к этому товару');
    }

    const review = await Review.create({
      user: req.user._id,
      product: product._id,
      rating: Number(rating),
      comment,
    });

    // Пересчитываем общий рейтинг товара
    const allReviews = await Review.find({ product: product._id });
    product.numReviews = allReviews.length;
    product.rating =
      allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;

    await product.save();
    res.status(201).json({ message: 'Отзыв добавлен', review });
  } else {
    res.status(404);
    throw new Error('Товар не найден');
  }
});

// @desc    Создать новый товар
// @route   POST /api/products
// @access  Private/Manager/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Новый товар',
    basePrice: 0,
    user: req.user._id,
    generalImages: ['/images/sample.jpg'],
    brand: 'Бренд',
    category: 'Категория',
    countInStock: 0,
    numReviews: 0,
    description: 'Описание товара',
    specifications: [],
    variants: [],
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Обновить товар (редактирование)
// @route   PUT /api/products/:id
// @access  Private/Manager/Admin
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
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Товар не найден');
  }
});

// @desc    Удалить товар
// @route   DELETE /api/products/:id
// @access  Private/Admin (только Админ)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Товар успешно удален' });
  } else {
    res.status(404);
    throw new Error('Товар не найден');
  }
});

// Не забудь обновить export в самом низу файла!
export {
  getProducts,
  getProductById,
  getProductCategories, // <-- Добавили экспорт
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};