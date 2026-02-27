import asyncHandler from 'express-async-handler';
import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';

// @desc    Получить все отзывы для конкретного товара
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Review.countDocuments({ product: req.params.productId });
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name') // Подтягиваем имя автора отзыва
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ reviews, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Создать отзыв
// @route   POST /api/reviews/product/:productId
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);

  if (product) {
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

    // Пересчитываем рейтинг товара
    const reviews = await Review.find({ product: product._id });
    product.numReviews = reviews.length;
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await product.save();
    res.status(201).json({ message: 'Отзыв добавлен' });
  } else {
    res.status(404);
    throw new Error('Товар не найден');
  }
});

// @desc    Обновить свой отзыв
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Проверяем, что это отзыв текущего пользователя
    if (review.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Вы не можете редактировать чужой отзыв');
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    // Пересчитываем рейтинг товара
    const product = await Product.findById(review.product);
    const reviews = await Review.find({ product: product._id });
    product.rating =
      reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await product.save();

    res.json(review);
  } else {
    res.status(404);
    throw new Error('Отзыв не найден');
  }
});

// @desc    Удалить отзыв
// @route   DELETE /api/reviews/:id
// @access  Private (User/Admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Удалить может либо автор, либо админ
    if (
      review.user.toString() === req.user._id.toString() ||
      req.user.role === 'admin'
    ) {
      await Review.deleteOne({ _id: review._id });

      // Пересчитываем рейтинг товара
      const product = await Product.findById(review.product);
      const reviews = await Review.find({ product: product._id });
      
      product.numReviews = reviews.length;
      if (reviews.length > 0) {
        product.rating =
          reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
      } else {
        product.rating = 0;
      }
      await product.save();

      res.json({ message: 'Отзыв удален' });
    } else {
      res.status(401);
      throw new Error('Нет прав для удаления отзыва');
    }
  } else {
    res.status(404);
    throw new Error('Отзыв не найден');
  }
});

export { 
  getProductReviews, 
  createProductReview, 
  updateReview, 
  deleteReview 
};