import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        costPrice: { type: Number, default: 0 },  // snapshot of cost at time of sale
    }],
    totalAmount: { type: Number, required: true },
    totalCost: { type: Number, default: 0 },   // total cost for profit calc
    profit: { type: Number, default: 0 },   // totalAmount - totalCost
    customerName: { type: String },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    invoiceId: { type: String, unique: true },
    paymentMethod: { type: String, default: 'Cash', enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'] },
    status: { type: String, default: 'Completed', enum: ['Completed', 'Refunded', 'Partial Refund'] },
    notes: { type: String },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
