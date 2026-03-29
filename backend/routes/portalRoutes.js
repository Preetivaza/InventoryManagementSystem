import express from 'express';
import jwt from 'jsonwebtoken';
import { portalLogin, getMyProfile, updateMyProfile, setCustomerPassword } from '../controllers/portalController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware: verify customer JWT token
const portalProtect = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        res.status(401); throw new Error('Not authorized, no token');
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.type !== 'customer') {
            res.status(401); throw new Error('Not a customer token');
        }
        req.customerId = decoded.id;
        next();
    } catch {
        res.status(401); throw new Error('Token invalid or expired');
    }
};

// Public
router.post('/login', portalLogin);

// Customer-protected
router.get('/me', portalProtect, getMyProfile);
router.put('/me', portalProtect, updateMyProfile);

// Admin-only: set portal password for a customer
router.post('/set-password', protect, setCustomerPassword);

export default router;
