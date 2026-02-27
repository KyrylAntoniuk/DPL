import express from 'express';
import {
  getFiltersByCategory,
  createFilter,
  updateFilter,
  getFilters,
  deleteFilter,
} from '../controllers/filterController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/filters - получить все фильтры (для админки)
// POST /api/filters - создать новый фильтр
router.route('/')
  .get(protect, manager, getFilters)
  .post(protect, manager, createFilter);

// GET /api/filters/:category - получить фильтры для категории (публичный)
router.route('/:category').get(getFiltersByCategory);

// PUT /api/filters/:id - обновить фильтр
// DELETE /api/filters/:id - удалить фильтр
router.route('/:id')
  .put(protect, manager, updateFilter)
  .delete(protect, admin, deleteFilter);

export default router;