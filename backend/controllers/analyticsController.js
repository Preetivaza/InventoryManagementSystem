import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import Customer from '../models/Customer.js';
import Return from '../models/Return.js';
import { linearRegression } from 'simple-statistics';
import { subDays, startOfDay, format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// @desc   Dashboard stats (KPIs)
// @route  GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const start30 = subDays(now, 30);
    const start60 = subDays(now, 60);

    const [
        allSales,
        sales30,
        salesPrev30,
        totalProducts,
        lowStockCount,
        totalCustomers,
        returns30,
        purchases30
    ] = await Promise.all([
        Sale.find({}),
        Sale.find({ createdAt: { $gte: start30 } }),
        Sale.find({ createdAt: { $gte: start60, $lte: start30 } }),
        Product.countDocuments({}),
        Product.countDocuments({ $expr: { $lte: ['$quantity', '$minStockLevel'] } }),
        Customer.countDocuments({}),
        Return.find({ createdAt: { $gte: start30 } }),
        Purchase.find({ createdAt: { $gte: start30 } })
    ]);

    const totalRevenue = allSales.reduce((s, x) => s + x.totalAmount, 0);
    const revenue30 = sales30.reduce((s, x) => s + x.totalAmount, 0);
    const revenuePrev30 = salesPrev30.reduce((s, x) => s + x.totalAmount, 0);
    const profit30 = sales30.reduce((s, x) => s + (x.profit || 0), 0);
    const revenueGrowth = revenuePrev30 > 0
        ? parseFloat(((revenue30 - revenuePrev30) / revenuePrev30 * 100).toFixed(1))
        : 0;

    const totalRefunds30 = returns30.reduce((s, r) => s + r.refundAmount, 0);
    const totalPurchaseCost30 = purchases30.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);

    // Daily revenue chart – last 14 days
    const dailyRevenue = await Sale.aggregate([
        { $match: { createdAt: { $gte: subDays(now, 14) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, profit: { $sum: '$profit' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        totalRevenue,
        revenue30,
        revenueGrowth,
        profit30,
        totalProducts,
        lowStockCount,
        totalCustomers,
        totalSales: allSales.length,
        sales30Count: sales30.length,
        totalRefunds30,
        totalPurchaseCost30,
        dailyRevenue
    });
};

// @desc   Top selling products
// @route  GET /api/analytics/top-selling
const getTopSellingProducts = async (req, res) => {
    const topProducts = await Sale.aggregate([
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.product',
                totalSold: { $sum: '$products.quantity' },
                revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                profit: { $sum: { $multiply: ['$products.quantity', { $subtract: ['$products.price', '$products.costPrice'] }] } }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'pd' } },
        { $unwind: '$pd' },
        { $project: { _id: 1, name: '$pd.name', category: '$pd.category', sku: '$pd.sku', totalSold: 1, revenue: 1, profit: 1 } }
    ]);
    res.json(topProducts);
};

// @desc   Sales forecast (linear regression)
// @route  GET /api/analytics/forecast
const getSalesForecast = async (req, res) => {
    const dailySales = await Sale.aggregate([
        { $match: { createdAt: { $gte: subDays(new Date(), 30) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$totalAmount' } } },
        { $sort: { _id: 1 } }
    ]);

    if (dailySales.length < 2) {
        return res.json({ message: 'Insufficient data', data: [] });
    }

    const data = dailySales.map((d, i) => [i, d.total]);
    const { m, b } = linearRegression(data);
    const lastIdx = data.length - 1;
    const forecast = Array.from({ length: 7 }, (_, i) => ({
        day: `Day +${i + 1}`,
        predictedSales: Math.max(0, Math.round(m * (lastIdx + i + 1) + b))
    }));

    res.json({ trend: m > 0 ? 'Up' : 'Down', slope: parseFloat(m.toFixed(2)), forecast });
};

// @desc   Dead stock
// @route  GET /api/analytics/dead-stock
const getDeadStock = async (req, res) => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const deadStock = await Product.find({
        $or: [
            { lastSoldDate: { $lt: thirtyDaysAgo } },
            { lastSoldDate: { $exists: false }, createdAt: { $lt: thirtyDaysAgo } }
        ]
    }).limit(15);
    res.json(deadStock);
};

// @desc   Monthly revenue & profit summary (last 6 months)
// @route  GET /api/analytics/monthly
const getMonthlySummary = async (req, res) => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(new Date(), i);
        months.push({ start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM yyyy') });
    }

    const results = await Promise.all(months.map(async ({ start, end, label }) => {
        const sales = await Sale.find({ createdAt: { $gte: start, $lte: end } });
        const purchases = await Purchase.find({ createdAt: { $gte: start, $lte: end } });
        const returns = await Return.find({ createdAt: { $gte: start, $lte: end } });

        const revenue = sales.reduce((s, x) => s + x.totalAmount, 0);
        const profit = sales.reduce((s, x) => s + (x.profit || 0), 0);
        const cost = purchases.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
        const refunds = returns.reduce((s, r) => s + r.refundAmount, 0);

        return { month: label, revenue: parseFloat(revenue.toFixed(2)), profit: parseFloat(profit.toFixed(2)), cost: parseFloat(cost.toFixed(2)), refunds: parseFloat(refunds.toFixed(2)), orders: sales.length };
    }));

    res.json(results);
};

// @desc   Category breakdown
// @route  GET /api/analytics/categories
const getCategoryBreakdown = async (req, res) => {
    const data = await Sale.aggregate([
        { $unwind: '$products' },
        { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'pd' } },
        { $unwind: '$pd' },
        {
            $group: {
                _id: '$pd.category',
                revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                unitsSold: { $sum: '$products.quantity' }
            }
        },
        { $sort: { revenue: -1 } }
    ]);
    res.json(data);
};

// @desc   Profit report
// @route  GET /api/analytics/profit
const getProfitReport = async (req, res) => {
    const sales = await Sale.find({}).sort({ createdAt: -1 }).limit(100);
    const totalRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
    const totalProfit = sales.reduce((s, x) => s + (x.profit || 0), 0);
    const totalCost = sales.reduce((s, x) => s + (x.totalCost || 0), 0);
    const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    const topProfitProducts = await Sale.aggregate([
        { $unwind: '$products' },
        {
            $group: {
                _id: '$products.product',
                profit: { $sum: { $multiply: ['$products.quantity', { $subtract: ['$products.price', '$products.costPrice'] }] } },
                revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
            }
        },
        { $sort: { profit: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'pd' } },
        { $unwind: '$pd' },
        { $project: { name: '$pd.name', category: '$pd.category', profit: 1, revenue: 1 } }
    ]);

    res.json({ totalRevenue, totalProfit, totalCost, margin: parseFloat(margin), topProfitProducts });
};

// @desc   Export CSV
// @route  GET /api/analytics/export/:type
const exportCSV = async (req, res) => {
    const { type } = req.params;
    let csvData = '';

    if (type === 'sales') {
        const sales = await Sale.find({}).populate('products.product', 'name').sort({ createdAt: -1 });
        csvData = 'Invoice ID,Date,Customer,Products,Total Amount,Profit,Payment,Status\n';
        sales.forEach(s => {
            const products = s.products.map(p => `${p.product?.name || 'N/A'} x${p.quantity}`).join('; ');
            csvData += `${s.invoiceId},${format(new Date(s.createdAt), 'yyyy-MM-dd')},${s.customerName || 'Walk-in'},"${products}",${s.totalAmount.toFixed(2)},${(s.profit || 0).toFixed(2)},${s.paymentMethod || 'Cash'},${s.status}\n`;
        });
    } else if (type === 'products') {
        const products = await Product.find({});
        csvData = 'Name,SKU,Category,Quantity,Sell Price,Cost Price,Profit Margin %,Min Stock,Status\n';
        products.forEach(p => {
            const margin = p.costPrice > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(1) : '0';
            const status = p.quantity <= p.minStockLevel ? 'Low Stock' : 'In Stock';
            csvData += `${p.name},${p.sku},${p.category},${p.quantity},${p.price},${p.costPrice || 0},${margin}%,${p.minStockLevel},${status}\n`;
        });
    } else if (type === 'purchases') {
        const purchases = await Purchase.find({}).populate('product', 'name sku').sort({ createdAt: -1 });
        csvData = 'Date,Product,SKU,Quantity,Purchase Price,Total Cost,Supplier\n';
        purchases.forEach(p => {
            csvData += `${format(new Date(p.createdAt), 'yyyy-MM-dd')},${p.product?.name || 'N/A'},${p.product?.sku || 'N/A'},${p.quantity},${p.purchasePrice},${(p.quantity * p.purchasePrice).toFixed(2)},${p.supplierName}\n`;
        });
    } else if (type === 'customers') {
        const customers = await Customer.find({}).sort({ totalSpent: -1 });
        csvData = 'Name,Email,Phone,Total Orders,Total Spent,Last Purchase\n';
        customers.forEach(c => {
            csvData += `${c.name},${c.email || ''},${c.phone || ''},${c.totalOrders},${c.totalSpent.toFixed(2)},${c.lastPurchase ? format(new Date(c.lastPurchase), 'yyyy-MM-dd') : ''}\n`;
        });
    } else {
        return res.status(400).json({ message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    res.send(csvData);
};

export { getDashboardStats, getTopSellingProducts, getSalesForecast, getDeadStock, getMonthlySummary, getCategoryBreakdown, getProfitReport, exportCSV };
