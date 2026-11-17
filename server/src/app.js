import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Product, Cart, Order, Wishlist, User } from './models.js';
import { summarizeCart } from './pricing.js';
import { session, safe } from './http.js';
import { imageRouter } from './images.js';
import { accountRouter, getUser, notify, trackOrder } from './account.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));

async function getCart(sessionId) {
  return (await Cart.findOne({ sessionId })) || new Cart({ sessionId, items: [] });
}
async function hydrated(cart) {
  const products = await Product.find({ _id: { $in: cart.items.map(i => i.productId) } }).lean();
  return cart.items.flatMap(item => {
    const product = products.find(p => String(p._id) === String(item.productId));
    return product ? [{ productId: String(product._id), sku: product.sku, name: product.name,
      image: product.image, price: product.price, mrp: product.mrp, stock: product.stock,
      quantity: item.quantity }] : [];
  });
}

app.use('/api/images', imageRouter);
app.use('/api', accountRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'FaultKart Marketplace Demo' }));
app.get('/api/categories', safe(async (_req, res) => {
  res.json(await Product.distinct('category'));
}));
app.get('/api/products', safe(async (req, res) => {
  const { q = '', category = '', sort = 'name', minPrice, maxPrice } = req.query;
  const criteria = category ? { category: String(category) } : {};
  let products = await Product.find(criteria).lean();
  if (q) products = products.filter(p => (p.name + ' ' + p.brand + ' ' + p.category).toLowerCase().includes(String(q).toLowerCase()));
  if (minPrice && Number.isFinite(Number(minPrice))) products = products.filter(p => p.price >= Number(minPrice));
  if (maxPrice && Number.isFinite(Number(maxPrice))) products = products.filter(p => p.price <= Number(maxPrice));
  const { brand = '', minRating, minDiscount } = req.query;
  const brands = String(brand).split(',').map(b => b.trim()).filter(Boolean);
  if (brands.length) products = products.filter(p => brands.includes(p.brand));
  if (minRating && Number.isFinite(Number(minRating))) products = products.filter(p => p.rating >= Number(minRating));
  if (minDiscount && Number.isFinite(Number(minDiscount)))
    products = products.filter(p => p.mrp > 0 && (p.mrp - p.price) / p.mrp * 100 >= Number(minDiscount));
  if (sort === 'popularity') products.sort((a, b) => b.reviewCount - a.reviewCount);
  else if (sort === 'newest') products.sort((a, b) => b.sku.localeCompare(a.sku));
  else if (sort === 'discount') products.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
  else if (sort === 'price-asc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'price-desc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else products.sort((a, b) => a.name.localeCompare(b.name));
  res.json(products);
}));
app.get('/api/products/:id', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product' });
  const product = await Product.findById(req.params.id).lean();
  return product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
}));

app.get('/api/cart', safe(async (req, res) => {
  const cart = await getCart(session(req));
  const items = await hydrated(cart);
  res.json({ items, ...summarizeCart(items, req.query.coupon || '') });
}));
app.post('/api/cart/items', safe(async (req, res) => {
  const { productId, quantity = 1 } = req.body || {};
  if (!mongoose.isValidObjectId(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20)
    return res.status(400).json({ error: 'Invalid product or quantity' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const cart = await getCart(session(req));
  const item = cart.items.find(i => String(i.productId) === productId);
  if (item) item.quantity = quantity;
  else cart.items.push({ productId, quantity });
  await cart.save();
  res.status(201).json({ ok: true });
}));
app.patch('/api/cart/items/:productId', safe(async (req, res) => {
  const quantity = req.body?.quantity;
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > 20) return res.status(400).json({ error: 'Invalid quantity' });
  const cart = await getCart(session(req));
  const item = cart.items.find(i => String(i.productId) === req.params.productId);
  if (!item) return res.status(404).json({ error: 'Item not in cart' });
  if (quantity === 0) cart.items = cart.items.filter(i => String(i.productId) !== req.params.productId);
  else item.quantity = quantity;
  await cart.save();
  res.json({ ok: true });
}));
app.delete('/api/cart/items/:productId', safe(async (req, res) => {
  const cart = await getCart(session(req));
  cart.items = cart.items.filter(i => String(i.productId) !== req.params.productId);
  await cart.save();
  res.json({ ok: true });
}));

app.get('/api/wishlist', safe(async (req, res) => {
  const wishlist = await Wishlist.findOne({ sessionId: session(req) });
  if (!wishlist) return res.json([]);
  res.json(await Product.find({ _id: { $in: wishlist.productIds } }).lean());
}));
app.post('/api/wishlist/:productId', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product' });
  if (!await Product.exists({ _id: req.params.productId })) return res.status(404).json({ error: 'Product not found' });
  await Wishlist.updateOne({ sessionId: session(req) }, { $addToSet: { productIds: req.params.productId } }, { upsert: true });
  res.status(201).json({ ok: true });
}));
app.delete('/api/wishlist/:productId', safe(async (req, res) => {
  await Wishlist.updateOne({ sessionId: session(req) }, { $pull: { productIds: req.params.productId } });
  res.json({ ok: true });
}));

app.post('/api/orders', safe(async (req, res) => {
  const cart = await getCart(session(req));
  const items = await hydrated(cart);
  if (!items.length) return res.status(400).json({ error: 'Cart is empty' });
  if (items.some(i => i.quantity > i.stock)) return res.status(409).json({ error: 'Insufficient stock' });
  const delivery = req.body?.delivery;
  if (delivery) {
    const fields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    if (fields.some(k => typeof delivery[k] !== 'string' || !delivery[k].trim() || delivery[k].length > 200) ||
      !/^\d{10}$/.test(delivery.phone) || !/^\d{6}$/.test(delivery.pincode)) {
      return res.status(400).json({ error: 'Please provide a valid name, address, 10-digit phone and 6-digit PIN code' });
    }
  }
  const paymentMethod = ['cod', 'demo-online', 'upi', 'card', 'netbanking', 'wallet'].includes(req.body?.paymentMethod) ? req.body.paymentMethod : 'cod';
  const summary = summarizeCart(items, req.body?.coupon || '');
  if (paymentMethod === 'wallet') {
    await getUser(session(req));
    const paid = await User.updateOne({ sessionId: session(req), giftCardBalance: { $gte: summary.total } },
      { $inc: { giftCardBalance: -summary.total } });
    if (!paid.modifiedCount) return res.status(402).json({ error: 'Gift card balance is not enough for this order' });
  }
  let order;
  try {
    order = await Order.create({
      sessionId: session(req), lines: items.map(i => ({ sku: i.sku, name: i.name, image: i.image, unitPrice: i.price, quantity: i.quantity })),
      ...summary, delivery: delivery || undefined, paymentMethod, status: 'Placed'
    });
  } catch (error) {
    if (paymentMethod === 'wallet') await User.updateOne({ sessionId: session(req) }, { $inc: { giftCardBalance: summary.total } });
    throw error;
  }
  for (const item of items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } });
  cart.items = [];
  await cart.save();
  const user = await getUser(session(req));
  const coinsEarned = Math.min(user.plusMember ? 200 : 100, Math.floor(summary.total / 100) * (user.plusMember ? 4 : 2));
  await Order.updateOne({ _id: order._id }, { $set: { coinsEarned } });
  await User.updateOne({ sessionId: session(req) }, {
    $inc: { supercoins: coinsEarned },
    $push: { coinHistory: { delta: coinsEarned, reason: 'Order #' + order.id.slice(-8).toUpperCase() } }
  });
  await notify(session(req), 'Order placed', 'Your order #' + order.id.slice(-8).toUpperCase() + ' is confirmed. You earned ' + coinsEarned + ' SuperCoins.', 'orders/' + order.id);
  res.status(201).json({ orderId: order.id, ...summary });
}));
app.get('/api/orders', safe(async (req, res) => {
  res.json((await Order.find({ sessionId: session(req) }).sort({ createdAt: 1 }).lean()).map(trackOrder));
}));
app.get('/api/orders/:id', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order' });
  const order = await Order.findOne({ _id: req.params.id, sessionId: session(req) }).lean();
  return order ? res.json(trackOrder(order)) : res.status(404).json({ error: 'Order not found' });
}));
app.post('/api/orders/:id/cancel', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order' });
  const existing = await Order.findOne({ _id: req.params.id, sessionId: session(req) }).lean();
  if (!existing) return res.status(404).json({ error: 'Order not found' });
  if (!trackOrder(existing).cancellable) return res.status(409).json({ error: 'This order can no longer be cancelled' });
  // Conditional update so a double click cannot restock or refund twice.
  const order = await Order.findOneAndUpdate({ _id: existing._id, status: { $ne: 'Cancelled' } },
    { $set: { status: 'Cancelled', cancelledAt: new Date() } }, { new: true }).lean();
  if (!order) return res.status(409).json({ error: 'Order is already cancelled' });
  for (const line of order.lines) await Product.updateOne({ sku: line.sku }, { $inc: { stock: line.quantity } });
  const refund = { $inc: { supercoins: -(order.coinsEarned || 0) } };
  if (order.paymentMethod === 'wallet') refund.$inc.giftCardBalance = order.total;
  if (order.coinsEarned) refund.$push = { coinHistory: { delta: -order.coinsEarned, reason: 'Cancelled #' + order._id.toString().slice(-8).toUpperCase() } };
  await User.updateOne({ sessionId: session(req) }, refund);
  await notify(session(req), 'Order cancelled', 'Order #' + order._id.toString().slice(-8).toUpperCase() + ' was cancelled.' +
    (order.paymentMethod === 'cod' ? '' : ' Your demo refund has been initiated.'), 'orders/' + order._id);
  res.json(trackOrder(order));
}));

// Save for later: moves a cart line into the shopper's saved list and back.
app.post('/api/cart/items/:productId/save-for-later', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product' });
  const cart = await getCart(session(req));
  if (!cart.items.some(i => String(i.productId) === req.params.productId)) return res.status(404).json({ error: 'Item not in cart' });
  cart.items = cart.items.filter(i => String(i.productId) !== req.params.productId);
  await cart.save();
  await getUser(session(req));
  await User.updateOne({ sessionId: session(req) }, { $addToSet: { savedForLater: req.params.productId } });
  res.json({ ok: true });
}));
app.post('/api/saved/:productId/move-to-cart', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product' });
  if (!await Product.exists({ _id: req.params.productId })) return res.status(404).json({ error: 'Product not found' });
  const cart = await getCart(session(req));
  if (!cart.items.some(i => String(i.productId) === req.params.productId)) cart.items.push({ productId: req.params.productId, quantity: 1 });
  await cart.save();
  await User.updateOne({ sessionId: session(req) }, { $pull: { savedForLater: req.params.productId } });
  res.json({ ok: true });
}));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});
