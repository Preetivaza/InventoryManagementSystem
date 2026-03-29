import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    supplierName: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
