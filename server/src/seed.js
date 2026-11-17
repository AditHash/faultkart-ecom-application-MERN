import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models.js';
import { demoProducts } from './seed-data.js';

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faultkart');
for (const product of demoProducts) {
  await Product.updateOne({ sku: product.sku }, { $set: product }, { upsert: true });
}
console.log('Seeded ' + demoProducts.length + ' demo products');
await mongoose.disconnect();
