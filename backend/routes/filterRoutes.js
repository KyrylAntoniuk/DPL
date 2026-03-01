import express from 'express';
import { getFilterConfig, updateFilterConfig, getFilters } from '../controllers/filterController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getFilters);
router.route('/config').get(getFilterConfig).put(protect, admin, updateFilterConfig);

export default router;
