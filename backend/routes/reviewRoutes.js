import express from 'express';
import {
  getProductReviews,
  createProductReview,
  updateReview,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/reviews/product/:productId - получить отзывы
// POST /api/reviews/product/:productId - добавить отзыв
router.route('/product/:productId')
  .get(getProductReviews)
  .post(protect, createProductReview);

// PUT /api/reviews/:id - обновить отзыв
// DELETE /api/reviews/:id - удалить отзыв
router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;