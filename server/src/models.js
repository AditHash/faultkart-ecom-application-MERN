import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, default: 'FaultKart Select' },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  stock: { type: Number, default: 0 },
  image: String,
  description: String,
  rating: { type: Number, default: 4.3 },
  reviewCount: { type: Number, default: 0 },
  badge: String,
  features: [String]
}, { versionKey: false });

const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }]
}, { versionKey: false });

const wishlistSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { versionKey: false });

const orderSchema = new mongoose.Schema({
  sessionId: String,
  lines: [{ sku: String, name: String, image: String, unitPrice: Number, quantity: Number }],
  subtotal: Number,
  discount: Number,
  total: Number,
  delivery: {
    fullName: String, phone: String, address: String, city: String, state: String, pincode: String
  },
  paymentMethod: { type: String, default: 'cod' },
  status: { type: String, default: 'Placed' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const Order = mongoose.model('Order', orderSchema);
