import express from 'express';
import mongoose from 'mongoose';
import { Product, User, Review, SellerApplication, SupportTicket, Order, Wishlist } from './models.js';
import { session, safe, isText, cleanText } from './http.js';

// Account, engagement and service modules for the demo marketplace. Every record is scoped to the
// caller's demo session; there is no real authentication, payment, shipping or travel booking.
export const accountRouter = express.Router();

const MINUTE = 60 * 1000;
const phoneOk = value => typeof value === 'string' && /^[6-9]\d{9}$/.test(value);
const emailOk = value => typeof value === 'string' && value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const pincodeOk = value => typeof value === 'string' && /^[1-9]\d{5}$/.test(value);
const shortId = id => String(id).slice(-8).toUpperCase();

export async function getUser(sessionId) {
  const defaults = {
    sessionId,
    coinHistory: [{ delta: 50, reason: 'Welcome bonus' }],
    notifications: [{ title: 'Welcome to FaultKart', body: 'Here are 50 SuperCoins to get you started. Explore offers in the Offer Zone.', link: 'offers' }]
  };
  try {
    return await User.findOneAndUpdate({ sessionId }, { $setOnInsert: defaults }, { upsert: true, new: true });
  } catch (error) {
    if (error?.code === 11000) return User.findOne({ sessionId }); // concurrent first request created it
    throw error;
  }
}
export async function notify(sessionId, title, body, link = '') {
  await User.updateOne({ sessionId }, { $push: { notifications: { $each: [{ title, body, link }], $slice: -50 } } });
}

const stages = [
  ['Order confirmed', 0], ['Packed', 5 * MINUTE], ['Shipped', 60 * MINUTE],
  ['Out for delivery', 24 * 60 * MINUTE], ['Delivered', 48 * 60 * MINUTE]
];
// Demo tracking: stages advance with time since the order was placed.
export function trackOrder(order) {
  const placed = new Date(order.createdAt).getTime();
  const cancelled = order.status === 'Cancelled';
  const now = Date.now();
  const tracking = stages.map(([label, offset]) => ({
    label, at: new Date(placed + offset), done: !cancelled && now >= placed + offset
  }));
  if (cancelled) tracking.splice(1, tracking.length, { label: 'Cancelled', at: order.cancelledAt || new Date(), done: true });
  tracking[0].done = true;
  const current = [...tracking].reverse().find(stage => stage.done);
  return {
    ...order, tracking,
    displayStatus: cancelled ? 'Cancelled' : current.label === 'Order confirmed' ? 'Placed' : current.label,
    expectedDelivery: new Date(placed + stages.at(-1)[1]),
    cancellable: !cancelled && now < placed + stages[3][1]
  };
}

function profile(user) {
  return {
    loggedIn: user.loggedIn, name: user.name, email: user.email, phone: user.phone, gender: user.gender,
    supercoins: user.supercoins, plusMember: user.plusMember, giftCardBalance: user.giftCardBalance,
    addresses: user.addresses, preferences: user.preferences, unread: user.notifications.filter(n => !n.read).length, memberSince: user.createdAt
  };
}

// ---- Profile & demo login -------------------------------------------------------------
accountRouter.get('/me', safe(async (req, res) => res.json(profile(await getUser(session(req))))));
accountRouter.post('/auth/login', safe(async (req, res) => {
  const { phone, name, email } = req.body || {};
  if (!phoneOk(phone)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  if (name !== undefined && name !== '' && !isText(name, 60)) return res.status(400).json({ error: 'Name is too long' });
  if (email && !emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  const user = await getUser(session(req));
  const firstLogin = !user.phone;
  user.loggedIn = true;
  user.phone = phone;
  if (name) user.name = name.trim();
  if (email) user.email = email.trim();
  if (!user.name) user.name = 'Customer';
  await user.save();
  if (firstLogin) await notify(session(req), 'Signed in', 'Your demo account is ready. Add an address to check out faster.', 'account/addresses');
  res.json(profile(await getUser(session(req))));
}));
accountRouter.post('/auth/logout', safe(async (req, res) => {
  await User.updateOne({ sessionId: session(req) }, { $set: { loggedIn: false } });
  res.json({ ok: true });
}));
accountRouter.patch('/me', safe(async (req, res) => {
  const { name, email, gender } = req.body || {};
  const update = { ...req.body };
  if (name !== undefined) { if (!isText(name, 60)) return res.status(400).json({ error: 'Enter your name (max 60 characters)' }); update.name = name.trim(); }
  if (email !== undefined) { if (email && !emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address' }); update.email = email.trim(); }
  if (gender !== undefined) { if (!['', 'male', 'female', 'other'].includes(gender)) return res.status(400).json({ error: 'Invalid gender' }); update.gender = gender; }
  await getUser(session(req));
  await User.updateOne({ sessionId: session(req) }, { $set: update });
  res.json(profile(await getUser(session(req))));
}));

// ---- Notification preferences ----------------------------------------------------------
function mergeSettings(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = mergeSettings(target[key] || {}, source[key]);
    } else if (typeof source[key] === 'boolean') {
      target[key] = source[key];
    }
  }
  return target;
}
accountRouter.patch('/me/preferences', safe(async (req, res) => {
  if (!req.body || typeof req.body !== 'object') return res.status(400).json({ error: 'Invalid preferences' });
  const user = await getUser(session(req));
  user.preferences = mergeSettings(JSON.parse(JSON.stringify(user.preferences || {})), req.body);
  user.markModified('preferences');
  await user.save();
  res.json(user.preferences);
}));

// ---- Saved addresses -------------------------------------------------------------------
function readAddress(body = {}) {
  const fields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
  if (fields.some(k => !isText(body[k], 200)) || !/^\d{10}$/.test(body.phone) || !/^\d{6}$/.test(body.pincode)) return null;
  if (body.locality && !isText(body.locality, 100)) return null;
  return {
    label: ['Home', 'Work', 'Other'].includes(body.label) ? body.label : 'Home',
    fullName: body.fullName.trim(), phone: body.phone, address: body.address.trim(), locality: cleanText(body.locality, 100),
    city: body.city.trim(), state: body.state.trim(), pincode: body.pincode, isDefault: body.isDefault === true
  };
}
const addressError = { error: 'Please provide a valid name, address, 10-digit phone and 6-digit PIN code' };
accountRouter.get('/me/addresses', safe(async (req, res) => res.json((await getUser(session(req))).addresses)));
accountRouter.post('/me/addresses', safe(async (req, res) => {
  const address = readAddress(req.body);
  if (!address) return res.status(400).json(addressError);
  const user = await getUser(session(req));
  if (user.addresses.length >= 10) return res.status(400).json({ error: 'You can save up to 10 addresses' });
  if (address.isDefault || !user.addresses.length) { user.addresses.forEach(a => { a.isDefault = false; }); address.isDefault = true; }
  user.addresses.push(address);
  await user.save();
  res.status(201).json(user.addresses.at(-1));
}));
accountRouter.put('/me/addresses/:id', safe(async (req, res) => {
  const address = readAddress(req.body);
  if (!address) return res.status(400).json(addressError);
  const user = await getUser(session(req));
  const existing = user.addresses.id(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Address not found' });
  if (address.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
  else address.isDefault = existing.isDefault;
  existing.set(address);
  await user.save();
  res.json(existing);
}));
accountRouter.delete('/me/addresses/:id', safe(async (req, res) => {
  const user = await getUser(session(req));
  const existing = user.addresses.id(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Address not found' });
  const wasDefault = existing.isDefault;
  existing.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
  await user.save();
  res.json({ ok: true });
}));

// ---- Notifications ---------------------------------------------------------------------
accountRouter.get('/me/notifications', safe(async (req, res) => {
  res.json([...(await getUser(session(req))).notifications].reverse());
}));
accountRouter.post('/me/notifications/read', safe(async (req, res) => {
  await getUser(session(req));
  await User.updateOne({ sessionId: session(req) }, { $set: { 'notifications.$[].read': true } });
  res.json({ ok: true });
}));

// ---- Coupons, SuperCoins, Plus, gift cards ----------------------------------------------
const coupons = [
  { code: 'SAVE10', title: '10% off on your cart', description: 'Get 10% off on the cart value. Demo coupon.', validTill: '2026-12-31' },
  { code: 'FLAT100', title: 'Flat ₹100 off', description: 'Flat ₹100 discount on your order. Demo coupon.', validTill: '2026-12-31' }
];
const giftCards = { FKGIFT500: 500, FKGIFT1000: 1000, WELCOME250: 250 };
const PLUS_THRESHOLD = 200;
const REDEEM_COINS = 100;
const REDEEM_VALUE = 50;
accountRouter.get('/coupons', (_req, res) => res.json(coupons));
accountRouter.get('/me/coins', safe(async (req, res) => {
  const user = await getUser(session(req));
  res.json({ balance: user.supercoins, history: [...user.coinHistory].reverse(), plusThreshold: PLUS_THRESHOLD,
    redeem: { coins: REDEEM_COINS, value: REDEEM_VALUE } });
}));
accountRouter.post('/me/coins/redeem', safe(async (req, res) => {
  await getUser(session(req));
  const result = await User.updateOne({ sessionId: session(req), supercoins: { $gte: REDEEM_COINS } }, {
    $inc: { supercoins: -REDEEM_COINS, giftCardBalance: REDEEM_VALUE },
    $push: { coinHistory: { delta: -REDEEM_COINS, reason: 'Redeemed for ₹' + REDEEM_VALUE + ' gift card balance' } }
  });
  if (!result.modifiedCount) return res.status(400).json({ error: 'You need at least ' + REDEEM_COINS + ' SuperCoins to redeem' });
  res.json(profile(await getUser(session(req))));
}));
accountRouter.post('/me/plus/join', safe(async (req, res) => {
  const user = await getUser(session(req));
  if (user.plusMember) return res.json(profile(user));
  if (user.supercoins <= PLUS_THRESHOLD) return res.status(400).json({ error: 'Collect ' + PLUS_THRESHOLD + ' SuperCoins to unlock FaultKart Plus' });
  user.plusMember = true;
  await user.save();
  await notify(session(req), 'Welcome to FaultKart Plus', 'You now earn double SuperCoins on every order.', 'account/plus');
  res.json(profile(await getUser(session(req))));
}));
accountRouter.post('/me/giftcards/redeem', safe(async (req, res) => {
  const entered = String(req.body?.code || '').trim();
  const code = entered.toUpperCase();
  if (!giftCards[code]) return res.status(400).json({ error: 'Invalid gift card code' });
  await getUser(session(req));
  const result = await User.updateOne({ sessionId: session(req), redeemedGiftCards: { $ne: entered } },
    { $inc: { giftCardBalance: giftCards[code] }, $push: { redeemedGiftCards: entered } });
  if (!result.modifiedCount) return res.status(409).json({ error: 'This gift card was already added to your account' });
  await notify(session(req), 'Gift card added', '₹' + giftCards[code] + ' was added to your gift card balance.', 'account/giftcards');
  res.json(profile(await getUser(session(req))));
}));

// ---- Saved for later & recently viewed --------------------------------------------------
async function productsInOrder(ids) {
  const products = await Product.find({ _id: { $in: ids } }).lean();
  return ids.flatMap(id => products.filter(p => String(p._id) === String(id)));
}
accountRouter.get('/saved', safe(async (req, res) => res.json(await productsInOrder((await getUser(session(req))).savedForLater))));
accountRouter.delete('/saved/:productId', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product' });
  await User.updateOne({ sessionId: session(req) }, { $pull: { savedForLater: req.params.productId } });
  res.json({ ok: true });
}));
accountRouter.get('/me/recent', safe(async (req, res) => res.json(await productsInOrder((await getUser(session(req))).recentlyViewed))));
accountRouter.post('/me/recent/:productId', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ error: 'Invalid product' });
  if (!await Product.exists({ _id: req.params.productId })) return res.status(404).json({ error: 'Product not found' });
  await getUser(session(req));
  await User.updateOne({ sessionId: session(req) }, { $pull: { recentlyViewed: req.params.productId } });
  await User.updateOne({ sessionId: session(req) }, { $push: { recentlyViewed: { $each: [req.params.productId], $position: 0, $slice: 12 } } });
  res.json({ ok: true });
}));

// ---- Search suggestions & delivery estimate ----------------------------------------------
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
accountRouter.get('/search/suggest', safe(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 60);
  if (!q) return res.json([]);
  const pattern = new RegExp(escapeRegex(q), 'i');
  const products = await Product.find({ $or: [{ name: pattern }, { brand: pattern }, { category: pattern }] })
    .sort({ reviewCount: -1 }).limit(8).select('name brand category image').lean();
  res.json(products);
}));
accountRouter.get('/delivery/:pincode', (req, res) => {
  const { pincode } = req.params;
  if (!pincodeOk(pincode)) return res.status(400).json({ error: 'Enter a valid 6-digit PIN code' });
  const days = 2 + [...pincode].reduce((sum, d) => sum + Number(d), 0) % 5;
  const date = new Date(Date.now() + days * 24 * 60 * MINUTE);
  res.json({ pincode, deliverable: true, days, date, cod: true, fastDelivery: days <= 3 });
});

// ---- Ratings & reviews ------------------------------------------------------------------
const reviewers = ['Ananya S.', 'Rahul K.', 'Priya M.', 'Arjun D.', 'Neha P.', 'Vikram R.', 'Sneha G.', 'Karan T.'];
const reviewTitles = [[5, 'Wonderful', 'Exactly as described. Build quality is great for the price.'],
  [4, 'Value-for-money', 'Good product overall. Delivery was quick and packaging was neat.'],
  [5, 'Must buy!', 'Using it daily for two weeks now and very happy with it.'],
  [3, 'Nice', 'Decent quality, but could be slightly better for the price.'],
  [4, 'Really Nice', 'Looks premium and works well. Would recommend to friends.']];
function sampleReviews(product) {
  const seed = [...product.sku].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return [0, 1, 2].map(i => {
    const [rating, title, body] = reviewTitles[(seed + i) % reviewTitles.length];
    return { _id: product.sku + '-sample-' + i, author: reviewers[(seed + i * 3) % reviewers.length], rating, title, body,
      sample: true, createdAt: new Date(Date.UTC(2026, (seed + i) % 10, 1 + (seed * (i + 1)) % 27)) };
  });
}
function breakdown(product) {
  const total = product.reviewCount || 0;
  const weights = { 5: 0.55, 4: 0.25, 3: 0.1, 2: 0.04, 1: 0.06 };
  const shift = (product.rating || 4.3) - 4.3;
  return Object.fromEntries([5, 4, 3, 2, 1].map(star => [star,
    Math.max(0, Math.round(total * Math.max(0.01, weights[star] + (star >= 4 ? shift / 4 : -shift / 6))))]));
}
accountRouter.get('/products/:id/reviews', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product' });
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 }).limit(50).lean();
  const mine = reviews.find(r => r.sessionId === session(req));
  res.json({
    average: product.rating, count: product.reviewCount + reviews.length, breakdown: breakdown(product),
    reviews: [...reviews.map(r => ({ ...r, mine: r.sessionId === session(req) })), ...sampleReviews(product)],
    mine: mine ? { rating: mine.rating, title: mine.title, body: mine.body } : null
  });
}));
accountRouter.post('/products/:id/reviews', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product' });
  const { rating, title, body } = req.body || {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5 stars' });
  if (!isText(title, 80) || !isText(body, 1000)) return res.status(400).json({ error: 'Add a title (max 80) and a review (max 1000 characters)' });
  if (!await Product.exists({ _id: req.params.id })) return res.status(404).json({ error: 'Product not found' });
  const user = await getUser(session(req));
  await Review.updateOne({ productId: req.params.id, sessionId: session(req) },
    { $set: { rating, title: title.trim(), body: body.trim(), author: user.name || 'FaultKart Customer', createdAt: new Date() } },
    { upsert: true });
  res.status(201).json({ ok: true });
}));

// ---- Become a seller ----------------------------------------------------------------------
accountRouter.get('/seller/applications', safe(async (req, res) => {
  if (req.query.all === 'true') return res.json(await SellerApplication.find().sort({ createdAt: -1 }).limit(200).lean());
  res.json(await SellerApplication.find({ sessionId: session(req) }).sort({ createdAt: -1 }).select('-sessionId').lean());
}));
accountRouter.post('/seller/applications', safe(async (req, res) => {
  const { businessName, contactName, email, phone, gstin = '', category } = req.body || {};
  if (!isText(businessName, 100) || !isText(contactName, 60) || !emailOk(email) || !phoneOk(phone) ||
    !isText(category, 40) || (gstin && !/^[0-9A-Z]{15}$/.test(gstin))) {
    return res.status(400).json({ error: 'Fill in business name, contact name, valid email, 10-digit mobile, category and a 15-character GSTIN (optional)' });
  }
  if (await SellerApplication.countDocuments({ sessionId: session(req) }) >= 3) return res.status(400).json({ error: 'You already have 3 applications in review' });
  const application = await SellerApplication.create({ sessionId: session(req), businessName: businessName.trim(),
    contactName: contactName.trim(), email: email.trim(), phone, gstin, category: category.trim() });
  await getUser(session(req));
  await notify(session(req), 'Seller application received', businessName.trim() + ' is under review. (Demo only — no real onboarding.)', 'seller');
  const { sessionId, ...result } = application.toObject();
  res.status(201).json(result);
}));

// ---- Help centre ------------------------------------------------------------------------
const topics = ['Order related', 'Returns & refunds', 'Payments', 'Account', 'Delivery', 'Other'];
accountRouter.get('/support/tickets', safe(async (req, res) => {
  res.json(await SupportTicket.find({ sessionId: session(req) }).sort({ createdAt: -1 }).select('-sessionId').lean());
}));
accountRouter.get('/support/tickets/:id', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid ticket' });
  const ticket = await SupportTicket.findById(req.params.id).select('-sessionId').lean();
  return ticket ? res.json(ticket) : res.status(404).json({ error: 'Ticket not found' });
}));
accountRouter.post('/support/tickets', safe(async (req, res) => {
  const { topic, orderId = '', message } = req.body || {};
  if (!topics.includes(topic) || !isText(message, 1000) || (orderId && !/^[0-9a-fA-F]{8,24}$/.test(orderId))) {
    return res.status(400).json({ error: 'Choose a topic and describe the issue (max 1000 characters)' });
  }
  if (await SupportTicket.countDocuments({ sessionId: session(req) }) >= 20) return res.status(400).json({ error: 'Too many open tickets' });
  const ticket = await SupportTicket.create({ sessionId: session(req), topic, orderId, message: message.trim() });
  await getUser(session(req));
  await notify(session(req), 'We received your request', 'Ticket #' + shortId(ticket._id) + ' (' + topic + '). Our demo support team will respond soon.', 'help');
  const { sessionId, ...result } = ticket.toObject();
  res.status(201).json(result);
}));

// ---- Travel (demo flights) ---------------------------------------------------------------
export const airports = { DEL: 'New Delhi', BOM: 'Mumbai', BLR: 'Bengaluru', CCU: 'Kolkata', MAA: 'Chennai', HYD: 'Hyderabad', GOI: 'Goa', PNQ: 'Pune' };
const airlines = [['SkyLark Air', 'SL'], ['IndiGlide', 'IG'], ['AirVista', 'AV'], ['Zephyr Jet', 'ZJ']];
const clock = minutes => String(Math.floor(minutes / 60) % 24).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
function flightsFor(from, to, date) {
  const seed = [...(from + to + date)].reduce((sum, c) => sum * 31 + c.charCodeAt(0), 7) >>> 0;
  return Array.from({ length: 6 }, (_, i) => {
    const [airline, code] = airlines[(seed + i) % airlines.length];
    const departs = 330 + ((seed >> i) % 16) * 60 + (i * 25) % 60;
    const duration = 95 + (seed + i * 37) % 110;
    const stops = (seed + i) % 4 === 0 ? 1 : 0;
    return { id: code + (100 + (seed + i * 97) % 900), airline, flightNo: code + '-' + (100 + (seed + i * 97) % 900),
      from, to, date, depart: clock(departs), arrive: clock(departs + duration + stops * 70),
      duration: duration + stops * 70, stops, price: 2899 + (seed + i * 811) % 6200 };
  }).sort((a, b) => a.price - b.price);
}
function readTrip(query) {
  const from = String(query.from || '').toUpperCase();
  const to = String(query.to || '').toUpperCase();
  const date = String(query.date || '');
  if (!airports[from] || !airports[to] || from === to || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return null;
  return { from, to, date };
}
accountRouter.get('/travel/airports', (_req, res) => res.json(airports));
accountRouter.get('/travel/flights', (req, res) => {
  const trip = readTrip(req.query);
  if (!trip) return res.status(400).json({ error: 'Choose two different cities and a valid date' });
  res.json(flightsFor(trip.from, trip.to, trip.date));
});
accountRouter.get('/travel/trips', safe(async (req, res) => res.json([...(await getUser(session(req))).trips].reverse())));
accountRouter.post('/travel/bookings', safe(async (req, res) => {
  const trip = readTrip(req.body || {});
  const passengers = req.body?.passengers;
  if (!trip || !Number.isInteger(passengers) || passengers < 1 || passengers > 6) return res.status(400).json({ error: 'Invalid trip details' });
  const flight = flightsFor(trip.from, trip.to, trip.date).find(f => f.id === req.body.flightId);
  if (!flight) return res.status(404).json({ error: 'Flight not found' });
  const pnr = Math.random().toString(36).slice(2, 8).toUpperCase();
  const booking = { pnr, from: flight.from, to: flight.to, date: flight.date, airline: flight.airline, flightNo: flight.flightNo,
    depart: flight.depart, arrive: flight.arrive, price: flight.price, passengers };
  await getUser(session(req));
  await User.updateOne({ sessionId: session(req) }, { $push: { trips: booking } });
  await notify(session(req), 'Trip booked (demo)', flight.from + ' → ' + flight.to + ' on ' + flight.date + '. PNR ' + pnr + '.', 'travel');
  res.status(201).json(booking);
}));

// ---- Sponsored placements -----------------------------------------------------------------
const adClicks = new Map();
accountRouter.get('/ads/click', (req, res) => {
  const id = String(req.query.id || 'unknown').slice(0, 40);
  adClicks.set(id, (adClicks.get(id) || 0) + 1);
  res.redirect(302, String(req.query.to || '/'));
});

// ---- Guest order tracking ------------------------------------------------------------------
accountRouter.get('/orders/lookup', safe(async (req, res) => {
  const { phone, pincode } = req.query;
  if (!phone || !pincode) return res.status(400).json({ error: 'Enter the mobile number and PIN code used for the order' });
  const order = await Order.findOne({ 'delivery.phone': phone, 'delivery.pincode': pincode }).sort({ createdAt: -1 }).lean();
  if (!order) return res.status(404).json({ error: 'No order found for these details' });
  const { sessionId, ...rest } = trackOrder(order);
  res.json(rest);
}));

// ---- Shareable wishlists -------------------------------------------------------------------
const shareToken = sessionId => Buffer.from(sessionId).toString('base64url');
accountRouter.get('/wishlist/share', safe(async (req, res) => res.json({ token: shareToken(session(req)) })));
accountRouter.get('/wishlist/shared/:token', safe(async (req, res) => {
  const owner = Buffer.from(String(req.params.token), 'base64url').toString();
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(owner)) return res.status(400).json({ error: 'Invalid share link' });
  const [wishlist, user] = await Promise.all([Wishlist.findOne({ sessionId: owner }).lean(), User.findOne({ sessionId: owner }).lean()]);
  if (!wishlist) return res.status(404).json({ error: 'This wishlist is empty or no longer shared' });
  res.json({ owner: user?.name || 'A FaultKart shopper', products: await Product.find({ _id: { $in: wishlist.productIds } }).lean() });
}));

// ---- Printable invoice ---------------------------------------------------------------------
accountRouter.get('/orders/:id/invoice', safe(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send('Invalid order');
  const order = await Order.findById(req.params.id).lean();
  if (!order || (req.query.s && order.sessionId !== req.query.s)) return res.status(404).send('Invoice not found');
  const d = order.delivery || {};
  const rows = order.lines.map(l => '<tr><td>' + l.name + '</td><td>' + l.quantity + '</td><td>₹' + l.unitPrice + '</td><td>₹' + l.unitPrice * l.quantity + '</td></tr>').join('');
  res.type('html').send('<!doctype html><html><head><meta charset="utf-8"><title>Invoice #' + shortId(order._id) + '</title>' +
    '<style>body{font-family:Arial,sans-serif;max-width:760px;margin:30px auto;color:#222}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left}h1{color:#2874f0}</style></head><body>' +
    '<h1>FaultKart Tax Invoice (demo)</h1><p>Order #' + shortId(order._id) + ' · ' + new Date(order.createdAt).toDateString() + '</p>' +
    '<h3>Billing / shipping address</h3><p>' + (d.fullName || 'Guest') + '<br>' + (d.address || '') + '<br>' + (d.city || '') + ', ' + (d.state || '') + ' - ' + (d.pincode || '') + '<br>Phone: ' + (d.phone || '') + '</p>' +
    '<table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>' + rows + '</table>' +
    '<p>Subtotal: ₹' + order.subtotal + '<br>Discount: ₹' + order.discount + '<br><strong>Total: ₹' + order.total + '</strong></p>' +
    '<p><small>Demo invoice for training purposes. Not a valid tax document.</small></p><script>window.print()</script></body></html>');
}));
