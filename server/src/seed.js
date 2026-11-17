import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models.js';
const products = [
  { sku: 'FK-101', name: 'Canvas Backpack', category: 'Accessories', price: 899, stock: 12 },
  { sku: 'FK-102', name: 'USB-C Charging Cable', category: 'Electronics', price: 249, stock: 30 },
  { sku: 'FK-103', name: 'Wireless Mouse', category: 'Electronics', price: 749, stock: 18 },
  { sku: 'FK-104', name: 'Ceramic Coffee Mug', category: 'Home', price: 399, stock: 8 },
  { sku: 'FK-105', name: 'Desk Organizer', category: 'Home', price: 549, stock: 15 },
  { sku: 'FK-106', name: 'Stainless Steel Bottle', category: 'Accessories', price: 699, stock: 9 }
];
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faultkart');
for (const product of products) await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true });
console.log('Seeded ' + products.length + ' demo products');
await mongoose.disconnect();
