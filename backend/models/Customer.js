import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String },
    address: { type: String },
    notes: { type: String },
    password: { type: String },               // hashed — set when portal account activated
    totalSpent: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    lastPurchase: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Hash password before save
customerSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

customerSchema.methods.matchPassword = async function (entered) {
    if (!this.password) return false;
    return await bcrypt.compare(entered, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
