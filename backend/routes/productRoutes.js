import express from 'express';
import {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичный GET и защищенный POST (создание пустышки для менеджеров)
router.route('/')
  .get(getProducts)
  .post(protect, manager, createProduct);

// Работа с конкретным товаром по ID
router.route('/:id')
  .get(getProductById)
  .put(protect, manager, updateProduct) // Менеджер может обновлять
  .delete(protect, admin, deleteProduct); // Удалять может только админ

// Добавление отзыва (любой авторизованный пользователь)
router.route('/:id/reviews').post(protect, createProductReview);

export default router;