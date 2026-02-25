import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    // Ссылка на покупателя
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Массив купленных товаров (исторический снимок корзины)
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        // Уникальный ID модификации, чтобы знать, что именно списывать со склада
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOptions: [
          {
            optionName: { type: String, required: true }, // например, "Цвет"
            optionValue: { type: String, required: true }, // например, "Синий"
          },
        ],
      },
    ],
    // Адрес доставки
    shippingAddress: {
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      postalCode: { type: String, required: true },
      deliveryService: { type: String, required: true },
      branchNumber: { type: String }, // Может быть пустым, если курьер
    },
    // Метод оплаты
    paymentMethod: {
      type: String,
      required: true,
    },
    // Результат оплаты (заполняется ответом от платежного шлюза, например Stripe/LiqPay)
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    // Финансы
    itemsPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    // Статусы
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['Новый', 'Оплачен', 'В обработке', 'Отправлен', 'Доставлен', 'Отменен'],
      default: 'Новый',
    },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;