import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "https://your-frontend.vercel.app",
    credentials: true,
  }),
);
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import seedRoutes from './routes/seedRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import portalRoutes from './routes/portalRoutes.js';

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/portal', portalRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
    });
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => res.send('InventoTrack API v2.0 running...'));

// Auto-seed helpers
import users from './data/users.js';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';

// Full Auto-seed logic for a rich demo experience
import Sale from './models/Sale.js';
import Purchase from './models/Purchase.js';
import Customer from './models/Customer.js';
import Return from './models/Return.js';

const autoSeed = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('🌱 Full Seeding Database for Demo...');

            // 1. Users
            const createdUsers = await User.insertMany(users);
            const adminId = createdUsers[0]._id;
            const managerId = createdUsers[1]._id;

            // 2. Products
            const sampleProducts = products.map(p => ({
                ...p,
                user: adminId,
                costPrice: p.costPrice || Math.round((p.price * 0.6) * 100) / 100
            }));
            const createdProducts = await Product.insertMany(sampleProducts);

            // 3. Customers
            const customerNames = ['Alex Rivera', 'Jordan Lee', 'Taylor Smith', 'Morgan Freeman', 'Casey Jones'];
            const createdCustomers = await Customer.insertMany(customerNames.map(name => ({
                name,
                email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
                password: bcrypt.hashSync('password123', 10), // Correctly hashed
                user: adminId
            })));

            // 4. Sales & Purchases (Last 30 days)
            const sales = [];
            const purchases = [];
            for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                // Random purchase
                if (Math.random() > 0.5) {
                    const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                    purchases.push({
                        product: prod._id, quantity: 20, purchasePrice: prod.costPrice,
                        supplierName: 'Demo Supplier', user: adminId, createdAt: date
                    });
                }

                // Random sales
                const dailySales = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < dailySales; j++) {
                    const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                    const cust = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
                    const qty = Math.floor(Math.random() * 2) + 1;
                    const totalAmount = prod.price * qty;
                    const totalCost = prod.costPrice * qty;

                    sales.push({
                        products: [{ product: prod._id, quantity: qty, price: prod.price, costPrice: prod.costPrice }],
                        totalAmount, totalCost, profit: totalAmount - totalCost,
                        customer: cust._id, customerName: cust.name,
                        invoiceId: `INV-${1000 + sales.length}`,
                        processedBy: managerId, createdAt: date
                    });
                }
            }
            await Purchase.insertMany(purchases);
            const savedSales = await Sale.insertMany(sales);

            // 5. Some Returns
            await Return.insertMany([{
                sale: savedSales[0]._id, product: savedSales[0].products[0].product,
                quantity: 1, refundAmount: savedSales[0].products[0].price,
                reason: 'Defective', status: 'Completed', processedBy: adminId
            }]);

            console.log('✅ Full Database Seeded Automatically!');
        }
    } catch (e) {
        console.log('⚠️ Seeding skipped:', e.message);
    }
};

import { MongoMemoryServer } from 'mongodb-memory-server';

const startServer = async () => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
        console.log('✅ MongoDB Connected!');
        await autoSeed();
    } catch (err) {
        console.error('❌ Local MongoDB not found. Starting MongoMemoryServer...');
        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            console.log('✨ Memory Database Started & Connected!');
            await autoSeed();
        } catch (memErr) {
            console.error('❌ Failed to start Memory Database:', memErr.message);
        }
    }
};

startServer();
