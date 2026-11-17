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
  coinsEarned: { type: Number, default: 0 },
  cancelledAt: Date,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: String, phone: String, address: String, locality: String,
  city: String, state: String, pincode: String,
  isDefault: { type: Boolean, default: false }
});

// One demo account per browser session. There are no passwords: "login" only attaches a profile.
const userSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  loggedIn: { type: Boolean, default: false },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  gender: { type: String, default: '' },
  preferences: { type: mongoose.Schema.Types.Mixed, default: () => ({
    email: { orders: true, offers: true }, sms: { orders: true, offers: false }, push: { orders: true, offers: true } }) },
  supercoins: { type: Number, default: 50 },
  plusMember: { type: Boolean, default: false },
  giftCardBalance: { type: Number, default: 0 },
  redeemedGiftCards: [String],
  addresses: [addressSchema],
  savedForLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  coinHistory: [{ delta: Number, reason: String, createdAt: { type: Date, default: Date.now } }],
  trips: [{ pnr: String, from: String, to: String, date: String, airline: String, flightNo: String,
    depart: String, arrive: String, price: Number, passengers: Number, createdAt: { type: Date, default: Date.now } }],
  notifications: [{ title: String, body: String, link: String, read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  sessionId: String,
  author: String,
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });
reviewSchema.index({ productId: 1, sessionId: 1 }, { unique: true });

const sellerSchema = new mongoose.Schema({
  sessionId: String, businessName: String, contactName: String, email: String, phone: String,
  gstin: String, category: String, status: { type: String, default: 'Under review' },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const ticketSchema = new mongoose.Schema({
  sessionId: String, topic: String, orderId: String, message: String,
  status: { type: String, default: 'Open' }, createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

export const Product = mongoose.model('Product', productSchema);
export const User = mongoose.model('User', userSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const SellerApplication = mongoose.model('SellerApplication', sellerSchema);
export const SupportTicket = mongoose.model('SupportTicket', ticketSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const Order = mongoose.model('Order', orderSchema);
