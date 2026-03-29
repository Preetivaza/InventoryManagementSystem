import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboardStats, getTopSellingProducts, getSalesForecast, getDeadStock, getMonthlySummary, getCategoryBreakdown, getProfitReport, exportCSV } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/top-selling', protect, getTopSellingProducts);
router.get('/forecast', protect, getSalesForecast);
router.get('/dead-stock', protect, getDeadStock);
router.get('/monthly', protect, getMonthlySummary);
router.get('/categories', protect, getCategoryBreakdown);
router.get('/profit', protect, getProfitReport);
router.get('/export/:type', protect, exportCSV);

export default router;
