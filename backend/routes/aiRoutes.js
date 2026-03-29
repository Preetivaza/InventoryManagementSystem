import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// @route   POST /api/ai/forecast
// @desc    Generate AI-powered sales forecast
// @access  Private
router.post('/forecast', protect, async (req, res) => {
    try {
        // Get recent sales history
        const sales = await Sale.find()
            .sort({ createdAt: -1 })
            .limit(30)
            .select('totalAmount createdAt');

        const forecast = await aiService.generateAIForecast(sales);

        res.json({
            success: true,
            forecast,
            basedOn: `${sales.length} recent sales`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating forecast',
            error: error.message
        });
    }
});

// @route   GET /api/ai/reorder-recommendations
// @desc    Get AI-powered reorder recommendations
// @access  Private
router.get('/reorder-recommendations', protect, async (req, res) => {
    try {
        const products = await Product.find();
        const salesHistory = await Sale.find()
            .populate('products.product')
            .sort({ createdAt: -1 })
            .limit(50);

        const recommendations = await aiService.generateReorderRecommendations(
            products,
            salesHistory
        );

        res.json({
            success: true,
            recommendations,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating recommendations',
            error: error.message
        });
    }
});

// @route   POST /api/ai/ask
// @desc    Ask AI assistant about inventory
// @access  Private
router.post('/ask', protect, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a question'
            });
        }

        // Gather context for AI
        const products = await Product.find().limit(20);
        const sales = await Sale.find()
            .populate('products.product')
            .sort({ createdAt: -1 })
            .limit(10);
        const lowStock = await Product.find({
            $expr: { $lt: ['$quantity', '$minStockLevel'] }
        });

        const context = { products, sales, lowStock };
        const response = await aiService.askInventoryAssistant(question, context);

        res.json({
            success: true,
            question,
            ...response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing question',
            error: error.message
        });
    }
});

// @route   GET /api/ai/anomalies
// @desc    Detect anomalies in sales data
// @access  Private
router.get('/anomalies', protect, async (req, res) => {
    try {
        const salesData = await Sale.find()
            .populate('products.product')
            .sort({ createdAt: -1 })
            .limit(100);

        const anomalies = await aiService.detectAnomalies(salesData);

        res.json({
            success: true,
            ...anomalies,
            analyzedRecords: salesData.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error detecting anomalies',
            error: error.message
        });
    }
});

// @route   GET /api/ai/insights
// @desc    Get comprehensive AI insights
// @access  Private
router.get('/insights', protect, async (req, res) => {
    try {
        const products = await Product.find();
        const sales = await Sale.find()
            .populate('products.product')
            .sort({ createdAt: -1 })
            .limit(50);

        // Run all AI analyses in parallel
        const [forecast, recommendations, anomalies] = await Promise.all([
            aiService.generateAIForecast(sales.slice(0, 30)),
            aiService.generateReorderRecommendations(products, sales),
            aiService.detectAnomalies(sales)
        ]);

        res.json({
            success: true,
            insights: {
                forecast,
                recommendations,
                anomalies: anomalies.anomalies || [],
                generatedAt: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating insights',
            error: error.message
        });
    }
});

export default router;
