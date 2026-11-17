import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Product, Cart, Order } from './models.js';
import { summarizeCart } from './pricing.js';

export const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
function session(req) {
  const value = req.header('x-demo-session') || 'demo';
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value) ? value : 'demo';
}
async function getCart(sessionId) { return (await Cart.findOne({ sessionId })) || new Cart({ sessionId, items: [] }); }
async function hydrated(cart) {
  const products = await Product.find({ _id: { $in: cart.items.map(i => i.productId) } }).lean();
  return cart.items.flatMap(item => {
    const product = products.find(p => String(p._id) === String(item.productId));
    return product ? [{ productId: String(product._id), sku: product.sku, name: product.name, price: product.price, stock: product.stock, quantity: item.quantity }] : [];
  });
}
function safe(handler) { return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next); }
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/products', safe(async (req, res) => {
  const { q = '', category = '', sort = 'name' } = req.query;
  const criteria = category ? { category } : {};
  let products = await Product.find(criteria).lean();
  if (q) products = products.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()));
  if (sort === 'price-asc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'price-desc') products.sort((a, b) => a.price - b.price);
  else products.sort((a, b) => a.name.localeCompare(b.name));
  res.json(products);
}));
app.get('/api/cart', safe(async (req, res) => {
  const cart = await getCart(session(req));
  const items = await hydrated(cart);
  res.json({ items, ...summarizeCart(items, req.query.coupon || '') });
}));
app.post('/api/cart/items', safe(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
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
  const quantity = req.body.quantity;
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
app.post('/api/orders', safe(async (req, res) => {
  const cart = await getCart(session(req));
  const items = await hydrated(cart);
  if (!items.length) return res.status(400).json({ error: 'Cart is empty' });
  if (items.some(i => i.quantity > i.stock)) return res.status(409).json({ error: 'Insufficient stock' });
  const summary = summarizeCart(items, req.body.coupon || '');
  const order = await Order.create({ sessionId: session(req), lines: items.map(i => ({ sku: i.sku, name: i.name, unitPrice: i.price, quantity: i.quantity })), ...summary });
  for (const item of items) await Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } });
  cart.items = [];
  await cart.save();
  res.status(201).json({ orderId: order.id, ...summary });
}));
app.get('/api/orders', safe(async (req, res) => {
  res.json(await Order.find({ sessionId: session(req) }).sort({ createdAt: 1 }).lean());
}));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error' });
});
