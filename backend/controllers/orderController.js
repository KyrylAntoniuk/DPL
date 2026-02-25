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

  // Проверяем, не пустая ли корзина пришла
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('Нет товаров для заказа');
  } else {
    // Создаем экземпляр заказа, привязывая его к ID текущего пользователя (req.user._id берется из токена)
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    // Сохраняем в базу данных
    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  }
});

// @desc    Получить заказ по ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  // Ищем заказ и заодно подтягиваем (populate) имя и email пользователя, который его сделал
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    // Проверка безопасности: только владелец заказа или админ/менеджер могут его просматривать
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

// @desc    Получить все заказы (для панели управления)
// @route   GET /api/orders
// @access  Private/Manager/Admin
const getOrders = asyncHandler(async (req, res) => {
  // Подтягиваем заказы и заодно ID и имя пользователя
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Обновить статус заказа
// @route   PUT /api/orders/:id/status
// @access  Private/Manager/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    
    // Если статус "Доставлен", фиксируем время
    if (req.body.status === 'Доставлен') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

// Обновляем export
export { addOrderItems, getOrderById, getOrders, updateOrderStatus };