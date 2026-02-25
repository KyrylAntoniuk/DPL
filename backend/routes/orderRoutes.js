import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/orders - список всех заказов для менеджера
router.route('/').post(protect, addOrderItems).get(protect, manager, getOrders);

router.route('/:id').get(protect, getOrderById);

// PUT /api/orders/:id/status - изменение статуса
router.route('/:id/status').put(protect, manager, updateOrderStatus);

export default router;