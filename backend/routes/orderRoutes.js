import express from 'express';
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus, // <-- Импортируем новый контроллер
  getMyOrders,
  getOrders,
} from '../controllers/orderController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, manager, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, manager, updateOrderStatus); // <-- Обновили маршрут

export default router;