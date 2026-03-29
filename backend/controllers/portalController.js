import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) =>
    jwt.sign({ id, type: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @desc   Customer portal login (by email + password)
// @route  POST /api/portal/login
const portalLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400); throw new Error('Email and password are required');
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
        res.status(401); throw new Error('No account found with this email');
    }
    if (!customer.password) {
        res.status(401); throw new Error('No portal account set up. Contact the store.');
    }

    const match = await customer.matchPassword(password);
    if (!match) {
        res.status(401); throw new Error('Incorrect password');
    }

    res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        totalSpent: customer.totalSpent,
        totalOrders: customer.totalOrders,
        lastPurchase: customer.lastPurchase,
        token: generateToken(customer._id),
    });
};

// @desc   Get customer own profile + orders
// @route  GET /api/portal/me
const getMyProfile = async (req, res) => {
    const customer = await Customer.findById(req.customerId);
    if (!customer) { res.status(404); throw new Error('Account not found'); }

    const sales = await Sale.find({ customerName: customer.name })
        .populate('products.product', 'name price sku')
        .sort({ createdAt: -1 })
        .limit(50);

    // Recalculate totals from real sales if needed
    const realRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
    const realProfit = sales.reduce((s, x) => s + (x.profit || 0), 0);

    res.json({
        customer: {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            notes: customer.notes,
            totalSpent: customer.totalSpent || realRevenue,
            totalOrders: customer.totalOrders || sales.length,
            lastPurchase: customer.lastPurchase,
            createdAt: customer.createdAt,
        },
        sales,
        stats: {
            totalSpent: customer.totalSpent || realRevenue,
            totalOrders: customer.totalOrders || sales.length,
            totalProfit: realProfit,
            avgOrder: sales.length > 0 ? realRevenue / sales.length : 0,
        }
    });
};

// @desc   Update customer own profile
// @route  PUT /api/portal/me
const updateMyProfile = async (req, res) => {
    const customer = await Customer.findById(req.customerId);
    if (!customer) { res.status(404); throw new Error('Account not found'); }

    const { name, phone, address, password } = req.body;
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (password && password.length >= 6) customer.password = password;

    const updated = await customer.save();
    res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
        totalSpent: updated.totalSpent,
        totalOrders: updated.totalOrders,
    });
};

// @desc   Admin: set/reset customer portal password
// @route  POST /api/portal/set-password
const setCustomerPassword = async (req, res) => {
    const { customerId, password } = req.body;
    if (!customerId || !password || password.length < 6) {
        res.status(400); throw new Error('customerId and password (min 6 chars) required');
    }
    const customer = await Customer.findById(customerId);
    if (!customer) { res.status(404); throw new Error('Customer not found'); }

    customer.password = password;
    await customer.save();
    res.json({ message: `Portal access set for ${customer.name}` });
};

export { portalLogin, getMyProfile, updateMyProfile, setCustomerPassword };
