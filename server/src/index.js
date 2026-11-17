import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app.js';
const port = Number(process.env.PORT || 4000);
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/faultkart');
app.listen(port, () => console.log('FaultKart API listening on http://localhost:' + port));
