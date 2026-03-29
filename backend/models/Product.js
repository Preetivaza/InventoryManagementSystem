import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },          // Selling price
    costPrice: { type: Number, default: 0 },              // Purchase/cost price (for profit)
    supplier: { type: String },
    description: { type: String },
    image: { type: String },
    barcode: { type: String },
    tags: [{ type: String }],
    minStockLevel: { type: Number, default: 10 },
    lastSoldDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Virtual: profit margin %
productSchema.virtual('profitMargin').get(function () {
    if (!this.costPrice || this.costPrice === 0) return 0;
    return parseFloat((((this.price - this.costPrice) / this.price) * 100).toFixed(1));
});

productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
