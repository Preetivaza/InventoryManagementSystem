import Return from '../models/Return.js';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

// @desc  Get all returns
// @route GET /api/returns
const getReturns = async (req, res) => {
    const returns = await Return.find({})
        .populate('sale', 'invoiceId customerName totalAmount')
        .populate('product', 'name sku')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 });
    res.json(returns);
};

// @desc  Create a return/refund
// @route POST /api/returns
const createReturn = async (req, res) => {
    const { saleId, productId, quantity, reason, notes } = req.body;

    const sale = await Sale.findById(saleId).populate('products.product');
    if (!sale) { res.status(404); throw new Error('Sale not found'); }

    const saleItem = sale.products.find(p => p.product?._id?.toString() === productId);
    if (!saleItem) { res.status(400); throw new Error('Product not found in this sale'); }
    if (quantity > saleItem.quantity) { res.status(400); throw new Error('Return quantity exceeds sold quantity'); }

    const refundAmount = parseFloat((saleItem.price * quantity).toFixed(2));

    // Create return record
    const returnRecord = await Return.create({
        sale: saleId,
        product: productId,
        quantity,
        refundAmount,
        reason,
        notes,
        status: 'Completed',
        processedBy: req.user._id,
    });

    // Add stock back
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: quantity } });

    // Update sale status
    sale.status = quantity >= saleItem.quantity ? 'Refunded' : 'Partial Refund';
    await sale.save();

    const populated = await Return.findById(returnRecord._id)
        .populate('sale', 'invoiceId customerName')
        .populate('product', 'name sku');

    res.status(201).json(populated);
};

// @desc  Get return stats
// @route GET /api/returns/stats
const getReturnStats = async (req, res) => {
    const returns = await Return.find({});
    const totalRefunds = returns.reduce((sum, r) => sum + r.refundAmount, 0);
    const byReason = returns.reduce((acc, r) => {
        acc[r.reason] = (acc[r.reason] || 0) + 1;
        return acc;
    }, {});

    res.json({
        totalReturns: returns.length,
        totalRefundAmount: totalRefunds,
        byReason
    });
};

export { getReturns, createReturn, getReturnStats };
