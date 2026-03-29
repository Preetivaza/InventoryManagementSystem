import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
    sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    refundAmount: { type: Number, required: true },
    reason: { type: String, required: true, enum: ['Defective', 'Wrong Item', 'Customer Changed Mind', 'Damaged in Transit', 'Other'] },
    notes: { type: String },
    status: { type: String, default: 'Completed', enum: ['Pending', 'Completed', 'Rejected'] },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Return = mongoose.model('Return', returnSchema);
export default Return;
