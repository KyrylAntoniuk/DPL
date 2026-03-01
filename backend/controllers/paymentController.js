import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/orderModel.js';

// @desc    Send Stripe publishable key to frontend
// @route   GET /api/config/stripe
// @access  Private
const getStripePublishableKey = asyncHandler(async (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// @desc    Create PaymentIntent
// @route   POST /api/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  // Initialize Stripe inside function to ensure env vars are loaded
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (order) {
    const amount = Math.round(order.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: { order_id: order._id.toString() },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export { getStripePublishableKey, createPaymentIntent };
