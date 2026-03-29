import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, searchCustomers } from '../controllers/customerController.js';

const router = express.Router();

router.get('/search', protect, searchCustomers);
router.route('/').get(protect, getCustomers).post(protect, createCustomer);
router.route('/:id').get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, deleteCustomer);

export default router;
