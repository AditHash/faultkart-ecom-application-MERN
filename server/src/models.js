import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({ sku: { type: String, required: true, unique: true }, name: { type: String, required: true }, category: String, price: Number, stock: Number }, { versionKey: false });
const cartSchema = new mongoose.Schema({ sessionId: { type: String, required: true, unique: true }, items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }] }, { versionKey: false });
const orderSchema = new mongoose.Schema({ sessionId: String, lines: [{ sku: String, name: String, unitPrice: Number, quantity: Number }], subtotal: Number, discount: Number, total: Number, createdAt: { type: Date, default: Date.now } }, { versionKey: false });
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Order = mongoose.model('Order', orderSchema);
