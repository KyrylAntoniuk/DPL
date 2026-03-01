import express from 'express';
import {
  getStripePublishableKey,
  createPaymentIntent,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/config/stripe').get(protect, getStripePublishableKey);
router.route('/create-payment-intent').post(protect, createPaymentIntent);

export default router;