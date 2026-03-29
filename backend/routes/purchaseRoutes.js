import express from 'express';
import Purchase from '../models/Purchase.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/purchases
// @desc    Get all purchases
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate('product', 'name sku')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/purchases
// @desc    Create a new purchase and update product stock
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { product, quantity, supplierName, purchasePrice, notes } = req.body;

        if (!product || !quantity || !supplierName || !purchasePrice) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if product exists
        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Create purchase record
        const purchase = await Purchase.create({
            product,
            quantity: parseInt(quantity),
            supplierName,
            purchasePrice: parseFloat(purchasePrice),
            notes,
            user: req.user._id
        });

        // Update product stock
        productDoc.quantity += parseInt(quantity);
        await productDoc.save();

        const populatedPurchase = await Purchase.findById(purchase._id)
            .populate('product', 'name sku')
            .populate('user', 'name email');

        res.status(201).json(populatedPurchase);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/purchases/stats
// @desc    Get purchase statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const purchases = await Purchase.find();

        const totalPurchases = purchases.length;
        const totalSpend = purchases.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0);

        const thisMonth = purchases.filter(p => {
            const purchaseDate = new Date(p.createdAt);
            const now = new Date();
            return purchaseDate.getMonth() === now.getMonth() &&
                purchaseDate.getFullYear() === now.getFullYear();
        });

        res.json({
            totalPurchases,
            totalSpend,
            monthlyPurchases: thisMonth.length,
            monthlySpend: thisMonth.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
