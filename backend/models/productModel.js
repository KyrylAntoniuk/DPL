import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
});

const variantSchema = new mongoose.Schema({
  options: { type: Object, required: true },
  price: { type: Number, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  images: [{ type: String }],
});

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, default: 0 },
    generalImages: [{ type: String }],
    specifications: [specificationSchema],
    variants: [variantSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
