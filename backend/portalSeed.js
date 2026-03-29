import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer.js';
import Sale from './models/Sale.js';
import User from './models/User.js';

dotenv.config();

const seedPortalCustomer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        let admin = await User.findOne({ isAdmin: true });
        if (!admin) {
            admin = await User.findOne();
        }
        if (!admin) {
            console.error('No user found at all. Seed aborted.');
            process.exit(1);
        }

        const email = 'customer@test.com';
        const password = 'password123';

        // Delete existing if any
        await Customer.deleteOne({ email });

        const customer = await Customer.create({
            name: 'John Doe Test',
            email: email,
            phone: '555-0199',
            address: '456 Customer St, New York',
            password: password, // This will be hashed by the pre-save hook
            user: admin._id,
            totalSpent: 1250.75,
            totalOrders: 3,
            lastPurchase: new Date()
        });

        console.log(`✅ Test customer created!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`URL: http://localhost:5173/portal/login`);

        // Create some sample sales for this customer
        await Sale.deleteMany({ customerName: 'John Doe Test' });
        await Sale.insertMany([
            {
                invoiceId: 'TEST-INV-' + Date.now(),
                customerName: 'John Doe Test',
                totalAmount: 450.25,
                totalCost: 300,
                profit: 150.25,
                paymentMethod: 'Card',
                status: 'Completed',
                products: [],
                user: admin._id,
                createdAt: new Date(Date.now() - 86400000 * 5)
            },
            {
                invoiceId: 'TEST-INV-' + (Date.now() + 1),
                customerName: 'John Doe Test',
                totalAmount: 800.50,
                totalCost: 500,
                profit: 300.50,
                paymentMethod: 'Cash',
                status: 'Completed',
                products: [],
                user: admin._id,
                createdAt: new Date(Date.now() - 86400000 * 2)
            }
        ]);

        process.exit();
    } catch (e) {
        console.error('❌ Seeding failed:', e.message);
        process.exit(1);
    }
};

seedPortalCustomer();
