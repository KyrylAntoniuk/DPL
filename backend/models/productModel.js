import mongoose from 'mongoose';

// 1. Схема для характеристик (Specifications)
const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

// 2. Схема для модификаций (Variants)
const variantSchema = new mongoose.Schema({
  // ИСПРАВЛЕНО: Меняем Map на Object, чтобы Mongoose корректно читал любые JSON-объекты из БД
  options: { type: Object, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
});

// 3. Основная схема товара (Product)
const productSchema = new mongoose.Schema(
  {
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
    generalImages: [{ type: String }],
    specifications: [specificationSchema],
    variants: [variantSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;