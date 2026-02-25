import mongoose from 'mongoose';

// 1. Схема для характеристик (Specifications)
// Например: { name: "Диагональ экрана", value: "6.1 дюйма" }
const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

// 2. Схема для модификаций (Variants)
// Отвечает за конкретные версии товара (цвет, память, цена, остаток)
const variantSchema = new mongoose.Schema({
  // options хранит гибкий объект, например: { color: "Синий", storage: "256GB" }
  options: { type: Map, of: String, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  images: [{ type: String }], // Картинки конкретно для этого цвета
});

// 3. Основная схема товара (Product)
const productSchema = new mongoose.Schema(
  {
    // Ссылка на пользователя (админа/менеджера), который создал товар
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    generalImages: [{ type: String }], // Общие фото товара
    specifications: [specificationSchema], // Встраиваем массив характеристик
    variants: [variantSchema], // Встраиваем массив модификаций
    rating: {
      type: Number,
      required: true,
      default: 0, // Пересчитывается позже при добавлении отзывов в коллекцию Reviews
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true, // Автоматические createdAt и updatedAt
  }
);

// Создаем текстовые индексы для реализации "умного" поиска по сайту
// Это позволит искать товары не по точному совпадению, а по ключевым словам в названии и описании
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;