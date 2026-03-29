import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Sale from './models/Sale.js';
import Purchase from './models/Purchase.js';
import Customer from './models/Customer.js';
import Return from './models/Return.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected for Seeding');
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        console.log('🗑️  Clearing all existing data...');
        await User.deleteMany();
        await Product.deleteMany();
        await Sale.deleteMany();
        await Purchase.deleteMany();
        await Customer.deleteMany();
        await Return.deleteMany();

        // 1. CREATE USERS
        console.log('👥 Seeding Users...');
        const createdUsers = await User.insertMany(users);
        const adminId = createdUsers[0]._id;
        const managerId = createdUsers[1]._id;

        // 2. CREATE PRODUCTS
        console.log('📦 Seeding Products...');
        const productsWithCosts = products.map(p => {
            const costPrice = p.costPrice || Math.round((p.price * (0.4 + Math.random() * 0.3)) * 100) / 100;
            return { ...p, costPrice, user: adminId };
        });
        const createdProducts = await Product.insertMany(productsWithCosts);

        // 3. CREATE CUSTOMERS
        console.log('👤 Seeding Customers...');
        const customerNames = [
            'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
            'David Wilson', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Martinez',
            'James Garcia', 'Maria Rodriguez', 'Christopher Lee', 'Nancy White',
            'Daniel Harris', 'Jessica Thompson', 'Matthew Clark', 'Ashley Lewis',
            'Andrew Walker', 'Elizabeth Hall', 'Joshua Allen', 'Amanda Young'
        ];

        const customerDocs = customerNames.map((name, i) => ({
            name,
            email: name.toLowerCase().replace(' ', '.') + '@example.com',
            phone: `555-01${i < 10 ? '0' + i : i}`,
            address: `${100 + i} Main St, Business City`,
            user: adminId,
            totalSpent: 0,
            totalOrders: 0
        }));
        const createdCustomers = await Customer.insertMany(customerDocs);

        // 4. CREATE PURCHASES (Restock items)
        console.log('🛒 Seeding Purchases (60 days)...');
        const purchases = [];
        const suppliers = ['Global Tech', 'MegaWholesale', 'Prime Logistics', 'Elite Supplies'];

        for (let i = 60; i >= 1; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            // 1-3 purchases per day
            const dailyCount = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < dailyCount; j++) {
                const prod = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const qty = Math.floor(Math.random() * 30) + 10;
                purchases.push({
                    product: prod._id,
                    quantity: qty,
                    purchasePrice: prod.costPrice,
                    supplierName: suppliers[Math.floor(Math.random() * suppliers.length)],
                    user: adminId,
                    createdAt: date,
                    updatedAt: date
                });
            }
        }
        await Purchase.insertMany(purchases);

        // 5. CREATE SALES
        console.log('💰 Seeding Sales (45 days)...');
        const sales = [];
        const today = new Date();

        for (let i = 45; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Weekend boost
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const count = isWeekend ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 5) + 2;

            for (let j = 0; j < count; j++) {
                const cust = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
                const saleItems = [];
                let totalAmount = 0;
                let totalCost = 0;

                // 1-4 random products per sale
                const itemsInSale = Math.floor(Math.random() * 4) + 1;
                const usedIndices = new Set();

                for (let k = 0; k < itemsInSale; k++) {
                    let idx = Math.floor(Math.random() * createdProducts.length);
                    while (usedIndices.has(idx)) idx = Math.floor(Math.random() * createdProducts.length);
                    usedIndices.add(idx);

                    const prod = createdProducts[idx];
                    const qty = Math.floor(Math.random() * 2) + 1;

                    saleItems.push({
                        product: prod._id,
                        quantity: qty,
                        price: prod.price,
                        costPrice: prod.costPrice
                    });

                    totalAmount += (prod.price * qty);
                    totalCost += (prod.costPrice * qty);
                }

                const profit = totalAmount - totalCost;
                const saleDate = new Date(date);
                saleDate.setHours(9 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));

                const sale = {
                    products: saleItems,
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    totalCost: Math.round(totalCost * 100) / 100,
                    profit: Math.round(profit * 100) / 100,
                    customer: cust._id,
                    customerName: cust.name,
                    invoiceId: `INV-${1000 + sales.length}`,
                    processedBy: Math.random() > 0.5 ? adminId : managerId,
                    createdAt: saleDate,
                    updatedAt: saleDate
                };
                sales.push(sale);

                // Update customer totals (locally for speed, then we'll save)
                cust.totalSpent += totalAmount;
                cust.totalOrders += 1;
                cust.lastPurchase = saleDate;
            }
        }
        const createdSales = await Sale.insertMany(sales);

        // Update Customers with their new totals
        console.log('🔄 Updating Customer totals...');
        for (const cust of createdCustomers) {
            await Customer.findByIdAndUpdate(cust._id, {
                totalSpent: Math.round(cust.totalSpent * 100) / 100,
                totalOrders: cust.totalOrders,
                lastPurchase: cust.lastPurchase
            });
        }

        // 6. CREATE RETURNS
        console.log('↩️  Seeding Returns...');
        const returns = [];
        const returnReasons = ['Defective', 'Wrong Item', 'Customer Changed Mind', 'Damaged in Transit', 'Other'];

        // Return ~5% of sales
        const returnCount = Math.floor(createdSales.length * 0.05);
        for (let i = 0; i < returnCount; i++) {
            const randomSale = createdSales[Math.floor(Math.random() * createdSales.length)];
            const randomProd = randomSale.products[Math.floor(Math.random() * randomSale.products.length)];

            returns.push({
                sale: randomSale._id,
                product: randomProd.product,
                quantity: 1,
                refundAmount: randomProd.price,
                reason: returnReasons[Math.floor(Math.random() * returnReasons.length)],
                status: 'Completed',
                processedBy: adminId,
                createdAt: new Date(randomSale.createdAt.getTime() + (24 * 60 * 60 * 1000)) // 1 day later
            });
        }
        await Return.insertMany(returns);

        console.log('\n🌟 ALL DATA FIELDS POPULATED SUCCESSFULLY!');
        console.log('============================================');
        console.log(`👤 Users: ${createdUsers.length}`);
        console.log(`📦 Products: ${createdProducts.length}`);
        console.log(`👥 Customers: ${createdCustomers.length}`);
        console.log(`💰 Sales: ${createdSales.length}`);
        console.log(`🛒 Purchases: ${purchases.length}`);
        console.log(`↩️  Returns: ${returns.length}`);
        console.log('============================================\n');

        process.exit();
    } catch (error) {
        console.error(`❌ Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Sale.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Purchase.deleteMany();
        await Customer.deleteMany();
        await Return.deleteMany();
        console.log('🗑️  Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error during destruction: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
