import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getReturns, createReturn, getReturnStats } from '../controllers/returnController.js';

const router = express.Router();

router.get('/stats', protect, getReturnStats);
router.route('/').get(protect, getReturns).post(protect, createReturn);

export default router;
