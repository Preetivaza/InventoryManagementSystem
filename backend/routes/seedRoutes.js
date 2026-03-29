import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';
import Return from '../models/Return.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

router.post('/quick', async (req, res) => {
    try {
        console.log('🌱 Full seed starting...');

        await Promise.all([
            User.deleteMany({}), Product.deleteMany({}),
            Sale.deleteMany({}), Purchase.deleteMany({}),
            Customer.deleteMany({}), Return.deleteMany({})
        ]);

        // Users
        const salt = bcrypt.genSaltSync(10);
        const usersData = await User.insertMany([
            { name: 'Admin User', email: 'admin@example.com', password: bcrypt.hashSync('123456', salt), role: 'admin' },
            { name: 'Sarah Manager', email: 'manager@example.com', password: bcrypt.hashSync('123456', salt), role: 'manager' },
            { name: 'Tom Staff', email: 'staff@example.com', password: bcrypt.hashSync('123456', salt), role: 'staff' },
        ]);
        const admin = usersData[0];

        // Products with costPrice
        const productList = [
            { name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', price: 29.99, costPrice: 12.00, quantity: 148, minStockLevel: 30, description: 'Ergonomic 2.4GHz wireless mouse' },
            { name: 'Mechanical Keyboard', sku: 'MK-002', category: 'Electronics', price: 89.99, costPrice: 40.00, quantity: 82, minStockLevel: 20, description: 'RGB backlit mechanical keyboard' },
            { name: 'USB-C Hub 7-in-1', sku: 'HUB-003', category: 'Electronics', price: 44.99, costPrice: 18.00, quantity: 115, minStockLevel: 25, description: 'HDMI, USB3, SD Card, PD Charging' },
            { name: 'Laptop Stand', sku: 'LS-004', category: 'Electronics', price: 34.99, costPrice: 14.00, quantity: 95, minStockLevel: 20, description: 'Adjustable aluminum laptop stand' },
            { name: 'Webcam 1080p', sku: 'WC-005', category: 'Electronics', price: 69.99, costPrice: 30.00, quantity: 58, minStockLevel: 15, description: 'Full HD webcam with microphone' },
            { name: 'Bluetooth Headphones', sku: 'BH-006', category: 'Electronics', price: 129.99, costPrice: 55.00, quantity: 43, minStockLevel: 10, description: 'Noise-cancelling over-ear headphones' },
            { name: 'Wireless Charger', sku: 'WCH-007', category: 'Electronics', price: 24.99, costPrice: 9.00, quantity: 160, minStockLevel: 35, description: '15W fast wireless charging pad' },
            { name: 'Ergonomic Chair', sku: 'EC-008', category: 'Furniture', price: 299.99, costPrice: 130.00, quantity: 28, minStockLevel: 5, description: 'Mesh back ergonomic office chair' },
            { name: 'Standing Desk', sku: 'SD-009', category: 'Furniture', price: 449.99, costPrice: 200.00, quantity: 14, minStockLevel: 3, description: 'Height-adjustable electric standing desk' },
            { name: 'Monitor Arm', sku: 'MA-010', category: 'Furniture', price: 49.99, costPrice: 20.00, quantity: 72, minStockLevel: 15, description: 'Dual monitor arm VESA compatible' },
            { name: 'Desk Lamp LED', sku: 'DL-011', category: 'Furniture', price: 39.99, costPrice: 15.00, quantity: 130, minStockLevel: 25, description: 'Dimmable LED with USB charging' },
            { name: 'Notebook Set (3pk)', sku: 'NB-012', category: 'Stationery', price: 14.99, costPrice: 5.00, quantity: 220, minStockLevel: 50, description: 'A5 lined notebooks, pack of 3' },
            { name: 'Ballpoint Pens (10pk)', sku: 'BP-013', category: 'Stationery', price: 6.99, costPrice: 2.00, quantity: 350, minStockLevel: 80, description: 'Smooth writing pens, black ink' },
            { name: 'Sticky Notes (6pk)', sku: 'SN-014', category: 'Stationery', price: 8.99, costPrice: 3.00, quantity: 280, minStockLevel: 60, description: 'Assorted color sticky notes' },
            { name: 'Desk Organizer', sku: 'DO-015', category: 'Stationery', price: 22.99, costPrice: 9.00, quantity: 88, minStockLevel: 20, description: 'Multi-compartment mesh organizer' },
            { name: 'Yoga Mat Pro', sku: 'YM-016', category: 'Sports', price: 34.99, costPrice: 13.00, quantity: 105, minStockLevel: 20, description: 'Non-slip 6mm exercise yoga mat' },
            { name: 'Resistance Bands Set', sku: 'RB-017', category: 'Sports', price: 19.99, costPrice: 7.00, quantity: 175, minStockLevel: 40, description: 'Set of 5 resistance bands' },
            { name: 'Water Bottle 1L', sku: 'WB-018', category: 'Sports', price: 22.99, costPrice: 8.00, quantity: 190, minStockLevel: 40, description: 'BPA-free insulated steel bottle' },
            { name: 'Coffee Maker Pro', sku: 'CM-019', category: 'Home', price: 79.99, costPrice: 35.00, quantity: 38, minStockLevel: 8, description: '12-cup programmable coffee maker' },
            { name: 'Air Purifier', sku: 'AP-020', category: 'Home', price: 149.99, costPrice: 65.00, quantity: 22, minStockLevel: 5, description: 'HEPA filter air purifier 400sqft' },
            { name: 'Premium T-Shirt', sku: 'PT-021', category: 'Clothing', price: 24.99, costPrice: 8.00, quantity: 240, minStockLevel: 60, description: '100% organic cotton t-shirt' },
            { name: 'Hoodie Classic', sku: 'HC-022', category: 'Clothing', price: 49.99, costPrice: 20.00, quantity: 120, minStockLevel: 30, description: 'Fleece-lined pullover hoodie' },
            { name: 'Smart Speaker', sku: 'SS-023', category: 'Electronics', price: 89.99, costPrice: 40.00, quantity: 8, minStockLevel: 15, description: 'Voice-controlled smart speaker' },
            { name: 'Cable Management Kit', sku: 'CMK-024', category: 'Electronics', price: 16.99, costPrice: 6.00, quantity: 12, minStockLevel: 20, description: 'Complete cable organizer kit' },
        ];
        const products = await Product.insertMany(productList.map(p => ({ ...p, user: admin._id })));

        // Customers
        const customerData = await Customer.insertMany([
            { name: 'James Wilson', email: 'james@email.com', phone: '555-0101', address: '123 Oak Street', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Emma Thompson', email: 'emma@email.com', phone: '555-0102', address: '456 Maple Ave', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Liam Johnson', email: 'liam@email.com', phone: '555-0103', address: '789 Pine Road', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Olivia Davis', email: 'olivia@email.com', phone: '555-0104', address: '321 Elm Street', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Noah Martinez', email: 'noah@email.com', phone: '555-0105', address: '654 Cedar Lane', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Ava Anderson', email: 'ava@email.com', phone: '555-0106', address: '987 Birch Blvd', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Elijah Taylor', email: 'elijah@email.com', phone: '555-0107', address: '246 Walnut Way', totalOrders: 0, totalSpent: 0, user: admin._id },
            { name: 'Sophia Brown', email: 'sophia@email.com', phone: '555-0108', address: '135 Spruce Court', totalOrders: 0, totalSpent: 0, user: admin._id },
        ]);

        // Purchases (last 90 days)
        const suppliers = ['TechSupply Co.', 'Global Distributors', 'Prime Wholesale', 'Office Direct', 'SportZone Supply'];
        const purchaseDocs = [];
        for (let day = 90; day >= 1; day -= rand(4, 8)) {
            const prod = products[rand(0, products.length - 1)];
            const qty = rand(20, 100);
            purchaseDocs.push({
                product: prod._id, quantity: qty,
                purchasePrice: prod.costPrice || randFloat(prod.price * 0.4, prod.price * 0.65),
                supplierName: suppliers[rand(0, suppliers.length - 1)],
                notes: `Restock - ${prod.name}`, user: admin._id,
                createdAt: daysAgo(day), updatedAt: daysAgo(day)
            });
        }
        await Purchase.insertMany(purchaseDocs);

        // Sales (last 60 days) with profit
        const paymentMethods = ['Cash', 'Card', 'UPI', 'Bank Transfer'];
        const saleDocs = [];
        let invoiceCounter = 1000;
        const customerSpend = {};

        for (let day = 60; day >= 0; day--) {
            const saleDate = daysAgo(day);
            const dow = saleDate.getDay();
            const numSales = (dow === 0 || dow === 6) ? rand(1, 3) : rand(3, 8);

            for (let s = 0; s < numSales; s++) {
                const prod1 = products[rand(0, products.length - 1)];
                const qty1 = rand(1, 4);
                const isMulti = Math.random() < 0.3;
                const items = [{ product: prod1._id, quantity: qty1, price: prod1.price, costPrice: prod1.costPrice || 0 }];
                let total = qty1 * prod1.price;
                let cost = qty1 * (prod1.costPrice || 0);

                if (isMulti) {
                    const prod2 = products[rand(0, products.length - 1)];
                    const qty2 = rand(1, 2);
                    items.push({ product: prod2._id, quantity: qty2, price: prod2.price, costPrice: prod2.costPrice || 0 });
                    total += qty2 * prod2.price;
                    cost += qty2 * (prod2.costPrice || 0);
                }

                const customer = Math.random() < 0.7 ? customerData[rand(0, customerData.length - 1)] : null;
                const saleTime = new Date(saleDate);
                saleTime.setHours(rand(8, 21), rand(0, 59));

                saleDocs.push({
                    products: items,
                    totalAmount: parseFloat(total.toFixed(2)),
                    totalCost: parseFloat(cost.toFixed(2)),
                    profit: parseFloat((total - cost).toFixed(2)),
                    customerName: customer ? customer.name : ['Walk-in', 'Anonymous', 'Cash Customer'][rand(0, 2)],
                    customer: customer?._id,
                    invoiceId: `INV-${invoiceCounter++}`,
                    paymentMethod: paymentMethods[rand(0, paymentMethods.length - 1)],
                    processedBy: usersData[rand(0, usersData.length - 1)]._id,
                    createdAt: saleTime, updatedAt: saleTime
                });

                if (customer) {
                    if (!customerSpend[customer._id]) customerSpend[customer._id] = { spent: 0, orders: 0, last: saleTime };
                    customerSpend[customer._id].spent += total;
                    customerSpend[customer._id].orders += 1;
                    if (saleTime > customerSpend[customer._id].last) customerSpend[customer._id].last = saleTime;
                }
            }
        }
        await Sale.insertMany(saleDocs);

        // Update customer stats
        for (const [custId, stats] of Object.entries(customerSpend)) {
            await Customer.findByIdAndUpdate(custId, {
                totalSpent: parseFloat(stats.spent.toFixed(2)),
                totalOrders: stats.orders,
                lastPurchase: stats.last
            });
        }

        const totalRevenue = saleDocs.reduce((s, x) => s + x.totalAmount, 0);
        const totalProfit = saleDocs.reduce((s, x) => s + x.profit, 0);

        res.json({
            success: true,
            message: '✅ Full database seed complete!',
            summary: {
                users: usersData.length, products: products.length,
                customers: customerData.length, purchases: purchaseDocs.length,
                sales: saleDocs.length,
                totalRevenue: `$${totalRevenue.toFixed(2)}`,
                totalProfit: `$${totalProfit.toFixed(2)}`,
            }
        });
    } catch (error) {
        console.error('❌ Seed error:', error);
        res.status(500).json({ success: false, message: 'Seed failed', error: error.message });
    }
});

export default router;
