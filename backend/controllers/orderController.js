import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import sendEmail from '../utils/sendEmail.js';

// Generate HTML email template for orders
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
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      
      <h3>Order Items:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="text-align: left; padding: 8px;">Item</th>
            <th style="text-align: center; padding: 8px;">Qty</th>
            <th style="text-align: right; padding: 8px;">Price</th>
            <th style="text-align: right; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
      </table>

      <div style="text-align: right; margin-bottom: 20px;">
        <p style="margin: 5px 0;">Items: $${order.itemsPrice}</p>
        <p style="margin: 5px 0;">Shipping: $${order.shippingPrice}</p>
        <h3 style="margin: 10px 0; color: #28a745;">Total: $${order.totalPrice}</h3>
      </div>

      <div style="background-color: #f1f1f1; padding: 15px; border-radius: 5px;">
        <h3 style="margin-top: 0;">Shipping Address:</h3>
        <p style="margin-bottom: 0;">
          ${order.shippingAddress.street || order.shippingAddress.address}, ${order.shippingAddress.city}<br>
          ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
        </p>
      </div>
      <p style="margin-top: 30px; font-size: 12px; color: #777;">Thank you for shopping with DPL Shop!</p>
    </div>
  `;
};

// Update product stock based on order items
const updateStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);

    if (product) {
      let variant = null;

      if (item.variantId) {
        variant = product.variants.id(item.variantId);
      }

      // Fallback: find variant by matching options
      if (!variant && item.options) {
        variant = product.variants.find(v => JSON.stringify(v.options) === JSON.stringify(item.options));
      }

      if (variant) {
        if (variant.countInStock < item.qty) throw new Error(`Insufficient stock for ${item.name} (variant)`);
        variant.countInStock -= item.qty;
      } else {
        if (product.countInStock < item.qty) throw new Error(`Insufficient stock for ${item.name}`);
        product.countInStock -= item.qty;
      }
      
      await product.save();
    } else {
      throw new Error(`Product ${item.name} not found`);
    }
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems?.length) {
    res.status(400);
    throw new Error('No order items');
  } else {
    await updateStock(orderItems);

    const order = new Order({
      user: req.user._id, orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice,
    });

    const createdOrder = await order.save();

    await sendEmail({
      to: req.user.email,
      subject: `DPL Shop: Order #${createdOrder._id} Placed`,
      text: `Order #${createdOrder._id} created. Total: ${totalPrice}`,
      html: generateOrderEmailHtml(createdOrder, 'Thank you for your order!'),
    });

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    if (order.user._id.toString() === req.user._id.toString() || req.user.role === 'admin' || req.user.role === 'manager') {
      res.json(order);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email name');

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    await sendEmail({
      to: order.user.email,
      subject: `DPL Shop: Order #${order._id} Paid`,
      text: `Order #${order._id} has been paid.`,
      html: generateOrderEmailHtml(updatedOrder, 'Payment Successful!'),
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email name');

  if (order) {
    order.status = req.body.status;
    if (req.body.status === 'Доставлен') order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    await sendEmail({
      to: order.user.email,
      subject: `DPL Shop: Order #${order._id} Updated`,
      text: `New status: ${order.status}`,
      html: generateOrderEmailHtml(updatedOrder, `Order status changed to: ${order.status}`),
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export {
  addOrderItems, getOrderById, updateOrderToPaid, updateOrderStatus, getMyOrders, getOrders,
};
