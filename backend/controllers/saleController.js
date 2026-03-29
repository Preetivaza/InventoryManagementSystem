import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

// @desc  Create new sale
// @route POST /api/sales
const createSale = async (req, res) => {
    const { products, customerName, customerId, paymentMethod, notes } = req.body;

    if (!products || products.length === 0) {
        res.status(400); throw new Error('No items in sale');
    }

    let totalAmount = 0;
    let totalCost = 0;
    const saleItems = [];

    for (const item of products) {
        const product = await Product.findById(item.product);
        if (!product) { res.status(404); throw new Error(`Product not found: ${item.product}`); }
        if (product.quantity < item.quantity) { res.status(400); throw new Error(`Insufficient stock for: ${product.name}`); }

        const lineTotal = item.quantity * product.price;
        const lineCost = item.quantity * (product.costPrice || 0);
        totalAmount += lineTotal;
        totalCost += lineCost;

        saleItems.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price,
            costPrice: product.costPrice || 0,
        });

        product.quantity -= item.quantity;
        product.lastSoldDate = new Date();
        await product.save();
    }

    const profit = parseFloat((totalAmount - totalCost).toFixed(2));

    const sale = await Sale.create({
        products: saleItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        profit,
        customerName,
        customer: customerId || undefined,
        invoiceId: `INV-${Date.now()}`,
        paymentMethod: paymentMethod || 'Cash',
        notes,
        processedBy: req.user._id,
    });

    // Update customer stats if linked
    if (customerId) {
        await Customer.findByIdAndUpdate(customerId, {
            $inc: { totalSpent: totalAmount, totalOrders: 1 },
            lastPurchase: new Date()
        });
    }

    const populated = await Sale.findById(sale._id).populate('products.product', 'name sku');
    res.status(201).json(populated);
};

// @desc  Get all sales
// @route GET /api/sales
const getSales = async (req, res) => {
    const { page = 1, limit = 50, search = '' } = req.query;
    const query = search
        ? { $or: [{ customerName: { $regex: search, $options: 'i' } }, { invoiceId: { $regex: search, $options: 'i' } }] }
        : {};

    const sales = await Sale.find(query)
        .populate('products.product', 'name price sku')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

    const total = await Sale.countDocuments(query);
    res.json({ sales, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @desc  Get sale by ID
// @route GET /api/sales/:id
const getSaleById = async (req, res) => {
    const sale = await Sale.findById(req.params.id)
        .populate('products.product', 'name price sku category')
        .populate('processedBy', 'name')
        .populate('customer');
    if (!sale) { res.status(404); throw new Error('Sale not found'); }
    res.json(sale);
};

// @desc  Generate PDF Invoice
// @route GET /api/sales/:id/invoice
const generateInvoice = async (req, res) => {
    const sale = await Sale.findById(req.params.id)
        .populate('products.product', 'name sku')
        .populate('processedBy', 'name')
        .populate('customer');
    if (!sale) { res.status(404); throw new Error('Sale not found'); }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceId}.pdf`);
    doc.pipe(res);

    // ── Header ──────────────────────────────────────────────────────────────
    doc.rect(0, 0, 612, 80).fill('#163932');
    doc.fillColor('white').fontSize(24).font('Helvetica-Bold').text('INVENTOTRACK', 50, 25);
    doc.fontSize(10).font('Helvetica').text('Smart Inventory Management', 50, 52);
    doc.fillColor('white').fontSize(10).text('INVOICE', 480, 35, { align: 'right' });

    // ── Invoice Info ─────────────────────────────────────────────────────────
    doc.fillColor('#333').fontSize(10).font('Helvetica');
    let y = 100;
    doc.text(`Invoice No: `, 50, y).font('Helvetica-Bold').text(sale.invoiceId, 130, y);
    doc.font('Helvetica').text(`Date: `, 350, y).font('Helvetica-Bold').text(format(new Date(sale.createdAt), 'dd MMM yyyy'), 385, y);
    y += 18;
    doc.font('Helvetica').text(`Customer: `, 50, y).font('Helvetica-Bold').text(sale.customerName || 'Walk-in Customer', 115, y);
    doc.font('Helvetica').text(`Payment: `, 350, y).font('Helvetica-Bold').text(sale.paymentMethod || 'Cash', 400, y);
    y += 18;
    doc.font('Helvetica').text(`Status: `, 50, y).font('Helvetica-Bold').fillColor(sale.status === 'Completed' ? '#163932' : '#e53e3e').text(sale.status, 100, y);
    doc.fillColor('#333').font('Helvetica').text(`Cashier: `, 350, y).font('Helvetica-Bold').text(sale.processedBy?.name || 'Admin', 400, y);

    // ── Divider ──────────────────────────────────────────────────────────────
    y += 30;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#9FD2A7').lineWidth(1).stroke();
    y += 10;

    // ── Table Header ─────────────────────────────────────────────────────────
    doc.rect(50, y, 512, 22).fill('#C8E8CE');
    doc.fillColor('#163932').font('Helvetica-Bold').fontSize(9);
    doc.text('#', 55, y + 6);
    doc.text('Product', 80, y + 6);
    doc.text('SKU', 300, y + 6);
    doc.text('Qty', 370, y + 6);
    doc.text('Unit Price', 400, y + 6);
    doc.text('Total', 490, y + 6);
    y += 28;

    // ── Table Rows ───────────────────────────────────────────────────────────
    doc.fillColor('#333').font('Helvetica').fontSize(9);
    sale.products.forEach((item, idx) => {
        if (idx % 2 === 1) doc.rect(50, y - 4, 512, 20).fill('#f9fafb').fillColor('#333');
        doc.text(String(idx + 1), 55, y);
        doc.text(item.product?.name || 'N/A', 80, y, { width: 210 });
        doc.text(item.product?.sku || '-', 300, y);
        doc.text(String(item.quantity), 375, y);
        doc.text(`$${item.price.toFixed(2)}`, 400, y);
        doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 490, y);
        y += 20;
    });

    // ── Total ────────────────────────────────────────────────────────────────
    y += 10;
    doc.moveTo(50, y).lineTo(562, y).strokeColor('#9FD2A7').stroke();
    y += 12;
    doc.rect(380, y, 182, 28).fill('#163932');
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12);
    doc.text(`TOTAL:  $${sale.totalAmount.toFixed(2)}`, 385, y + 8);

    // ── Footer ───────────────────────────────────────────────────────────────
    doc.fillColor('#888').font('Helvetica').fontSize(8)
        .text('Thank you for your business! • InventoTrack', 50, 730, { align: 'center', width: 512 });

    doc.end();
};

export { createSale, getSales, getSaleById, generateInvoice };
