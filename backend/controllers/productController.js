import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Review from '../models/reviewModel.js';
// @desc    Получить список всех товаров
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // 1. Настройка пагинации
  const pageSize = 10; // Сколько товаров выводить на одной странице
  const page = Number(req.query.pageNumber) || 1; // Берем номер страницы из URL (например, ?pageNumber=2)

  // 2. Настройка поиска по ключевому слову
  // Если в URL есть ?keyword=iphone, создаем объект для поиска по регулярному выражению
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i', // 'i' означает регистронезависимый поиск (Iphone == iphone)
        },
      }
    : {};

  // 3. Считаем общее количество товаров, удовлетворяющих поиску (нужно фронтенду для отрисовки кнопок страниц 1, 2, 3...)
  const count = await Product.countDocuments({ ...keyword });

  // 4. Ищем товары в базе с лимитом и пропуском
  const products = await Product.find({ ...keyword })
    .limit(pageSize) // Ограничиваем количество
    .skip(pageSize * (page - 1)); // Пропускаем товары предыдущих страниц

  // 5. Возвращаем объект с товарами и данными для пагинации
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
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
  createProductReview, 
  createProduct, 
  updateProduct, 
  deleteProduct 
};