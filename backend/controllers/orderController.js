import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import sendEmail from '../utils/sendEmail.js';

// --- Вспомогательная функция для генерации HTML письма ---
const generateOrderEmailHtml = (order, title) => {
  const itemsList = order.orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #007bff;">${title}</h2>
      <p><strong>Номер заказа:</strong> ${order._id}</p>
      <p><strong>Статус:</strong> ${order.status}</p>
      
      <h3>Состав заказа:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="text-align: left; padding: 8px;">Товар</th>
            <th style="text-align: center; padding: 8px;">Кол-во</th>
            <th style="text-align: right; padding: 8px;">Цена</th>
            <th style="text-align: right; padding: 8px;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="text-align: right; margin-bottom: 20px;">
        <p style="margin: 5px 0;">Товары: $${order.itemsPrice}</p>
        <p style="margin: 5px 0;">Доставка: $${order.shippingPrice}</p>
        <h3 style="margin: 10px 0; color: #28a745;">Итого: $${order.totalPrice}</h3>
      </div>

      <div style="background-color: #f1f1f1; padding: 15px; border-radius: 5px;">
        <h3 style="margin-top: 0;">Адрес доставки:</h3>
        <p style="margin-bottom: 0;">
          ${order.shippingAddress.street || order.shippingAddress.address}, ${order.shippingAddress.city}<br>
          ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
        </p>
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #777;">Спасибо за покупку в DPL Shop!</p>
    </div>
  `;
};
// ---------------------------------------------------------

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

    // Отправка красивого HTML письма
    await sendEmail({
      to: req.user.email,
      subject: `DPL Shop: Заказ #${createdOrder._id} оформлен`,
      text: `Ваш заказ #${createdOrder._id} успешно создан. Сумма: ${totalPrice}`,
      html: generateOrderEmailHtml(createdOrder, 'Спасибо за ваш заказ!'),
    });

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
  const order = await Order.findById(req.params.id).populate('user', 'email name');

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

    // Отправка письма об оплате
    await sendEmail({
      to: order.user.email,
      subject: `DPL Shop: Оплата заказа #${order._id} получена`,
      text: `Ваш заказ #${order._id} был успешно оплачен.`,
      html: generateOrderEmailHtml(updatedOrder, 'Оплата прошла успешно!'),
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Заказ не найден');
  }
});

// @desc    Обновить статус заказа
// @route   PUT /api/orders/:id/status
// @access  Private/Manager/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email name');

  if (order) {
    order.status = req.body.status;

    if (req.body.status === 'Доставлен') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Отправка письма о смене статуса
    await sendEmail({
      to: order.user.email,
      subject: `DPL Shop: Статус заказа #${order._id} обновлен`,
      text: `Новый статус вашего заказа: ${order.status}`,
      html: generateOrderEmailHtml(updatedOrder, `Статус заказа изменен на: ${order.status}`),
    });

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
  updateOrderStatus, 
  getMyOrders, 
  getOrders
};