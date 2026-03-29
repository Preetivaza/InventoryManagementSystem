import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createSale, getSales, getSaleById, generateInvoice } from '../controllers/saleController.js';

const router = express.Router();

router.route('/').get(protect, getSales).post(protect, createSale);
router.get('/:id', protect, getSaleById);
router.get('/:id/invoice', protect, generateInvoice);

export default router;
