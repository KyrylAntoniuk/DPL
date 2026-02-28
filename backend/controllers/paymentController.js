import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Order from '../models/orderModel.js';

// @desc    Отправить публичный ключ Stripe на фронтенд
// @route   GET /api/config/stripe
// @access  Private
const getStripePublishableKey = asyncHandler(async (req, res) => {
  console.log('STRIPE_PUBLISHABLE_KEY:', process.env.STRIPE_PUBLISHABLE_KEY); // ЛОГ
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// @desc    Создать PaymentIntent для оплаты заказа
// @route   POST /api/create-payment-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  // Инициализируем Stripe внутри функции, чтобы гарантировать доступность переменных окружения
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (order) {
    // Stripe ожидает сумму в центах (копейках), поэтому умножаем на 100 и округляем
    const amount = Math.round(order.totalPrice * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Или 'rub', 'eur' в зависимости от вашего магазина
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order._id.toString(),
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

export { getStripePublishableKey, createPaymentIntent };