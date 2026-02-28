import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';

// @desc    Создать новый заказ
// @route   POST /api/orders
// @access  Private (только авторизованные пользователи)
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('Нет товаров для заказа');
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});

// @desc    Получить заказ по ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    if (
      order.user._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      req.user.role === 'manager'
    ) {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('У вас нет прав для просмотра этого заказа');
    }
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

// @desc    Обновить статус заказа на "Оплачен"
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

// @desc    Обновить статус заказа на "Доставлен"
// @route   PUT /api/orders/:id/deliver
// @access  Private/Manager/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

// @desc    Получить список заказов текущего пользователя
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Получить все заказы (для панели управления)
// @route   GET /api/orders
// @access  Private/Manager/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export { 
  addOrderItems, 
  getOrderById, 
  updateOrderToPaid, 
  updateOrderToDelivered, // <-- Добавили экспорт
  getMyOrders, 
  getOrders
};