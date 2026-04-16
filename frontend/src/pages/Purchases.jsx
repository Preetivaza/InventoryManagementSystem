import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, Edit, Package, TrendingUp, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Purchases = () => {
    const [products, setProducts] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        supplierName: '',
        purchasePrice: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, purchasesRes] = await Promise.all([
                api.get('/products?pageNumber=1&keyword=&limit=100'),
                api.get('/purchases')
            ]);
            setProducts(productsRes.data.products || []);
            setPurchases(purchasesRes.data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/purchases', formData);
            setIsModalOpen(false);
            setFormData({ product: '', quantity: '', supplierName: '', purchasePrice: '', notes: '' });
            fetchData();
            alert('Purchase/Restock recorded successfully!');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to record purchase');
        }
    };

    const selectedProduct = products.find(p => p._id === formData.product);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-[#051F20]">Purchase & Restock</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus size={20} /> New Purchase
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-[#163932]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm">Total Purchases</p>
                            <h3 className="text-2xl font-bold text-[#051F20] mt-1">{purchases.length}</h3>
                        </div>
                        <div className="bg-[#C8E8CE] p-3 rounded-lg">
                            <Package className="text-[#163932]" size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-[#235347]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm">This Month</p>
                            <h3 className="text-2xl font-bold text-[#051F20] mt-1">
                                {purchases.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length}
                            </h3>
                        </div>
                        <div className="bg-[#C8E8CE] p-3 rounded-lg">
                            <TrendingUp className="text-[#235347]" size={24} />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 border-l-4 border-[#8EB69B]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm">Total Spend</p>
                            <h3 className="text-2xl font-bold text-[#051F20] mt-1">
                                ₹{purchases.reduce((sum, p) => sum + (p.purchasePrice * p.quantity), 0).toFixed(2)}
                            </h3>
                        </div>
                        <div className="bg-[#C8E8CE] p-3 rounded-lg">
                            <Package className="text-[#8EB69B]" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Purchases Table */}
            <div className="glass-panel p-0 overflow-hidden">
                <div className="p-4 bg-[#DAF1DE] border-b border-[#9FD2A7]">
                    <h3 className="font-bold text-[#051F20]">Recent Purchase Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#C8E8CE] text-[#163932]">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Product</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Supplier</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Unit Price</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DAF1DE]">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading...</td></tr>
                            ) : purchases.length > 0 ? purchases.map((purchase) => (
                                <tr key={purchase._id} className="hover:bg-[#DAF1DE] transition-colors">
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {new Date(purchase.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[#051F20]">
                                        {purchase.product?.name || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{purchase.supplierName}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-[#163932]">{purchase.quantity}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">₹{purchase.purchasePrice}</td>
                                    <td className="px-4 py-3 font-bold text-[#051F20]">
                                        ₹{(purchase.purchasePrice * purchase.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No purchases recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Purchase Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="glass-panel w-full max-w-lg p-6 bg-white border border-[#9FD2A7] shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-[#DAF1DE] pb-4">
                                <h3 className="text-xl font-bold text-[#051F20]">Record Purchase</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#051F20] mb-1">Product</label>
                                    <select
                                        className="glass-input"
                                        value={formData.product}
                                        onChange={e => setFormData({ ...formData, product: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                                        ))}
                                    </select>
                                    {selectedProduct && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Current Stock: {selectedProduct.quantity} units
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#051F20] mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            className="glass-input"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#051F20] mb-1">Unit Price (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="glass-input"
                                            value={formData.purchasePrice}
                                            onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#051F20] mb-1">Supplier Name</label>
                                    <input
                                        type="text"
                                        className="glass-input"
                                        value={formData.supplierName}
                                        onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#051F20] mb-1">Notes (Optional)</label>
                                    <textarea
                                        className="glass-input"
                                        rows="2"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional notes..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-[#DAF1DE]">
                                    <div className="flex justify-between text-lg mb-4">
                                        <span className="text-slate-600">Total Amount:</span>
                                        <span className="font-bold text-[#051F20] text-xl">
                                            ₹{((formData.quantity || 0) * (formData.purchasePrice || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                    <button type="submit" className="btn-primary w-full py-3">
                                        <Package size={20} /> Record Purchase & Update Stock
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Purchases;
