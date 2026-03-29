import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
    Plus, Trash2, Edit, Search, X, Download, AlertTriangle,
    TrendingUp, Package, Tag, DollarSign, Scan, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Electronics', 'Furniture', 'Stationery', 'Sports', 'Home', 'Clothing', 'Other'];

// Profit margin badge
const MarginBadge = ({ sell, cost }) => {
    if (!cost || cost === 0) return <span className="text-xs text-slate-400">—</span>;
    const margin = (((sell - cost) / sell) * 100).toFixed(1);
    const color = margin >= 40 ? 'bg-green-50 text-green-700' : margin >= 20 ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700';
    return <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${color}`}>{margin}%</span>;
};

const Products = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStock, setFilterStock] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [barcodeMode, setBarcodeMode] = useState(false);
    const barcodeRef = useRef('');
    const barcodeTimeout = useRef(null);

    const emptyForm = { name: '', price: '', costPrice: '', category: '', quantity: '', description: '', sku: '', minStockLevel: 10, barcode: '' };
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => { fetchProducts(); }, [page, keyword]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/products?pageNumber=${page}&keyword=${keyword}&limit=20`);
            setProducts(data.products || []);
            setPages(data.pages || 1);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // ── Barcode scanner (keyboard wedge mode) ────────────────────────────────
    useEffect(() => {
        if (!barcodeMode) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                const code = barcodeRef.current.trim();
                if (code) {
                    const found = products.find(p => p.barcode === code || p.sku === code);
                    if (found) {
                        handleOpenModal(found);
                    } else {
                        setFormData(f => ({ ...f, barcode: code, sku: code }));
                        setEditProduct(null);
                        setIsModalOpen(true);
                    }
                }
                barcodeRef.current = '';
            } else if (e.key.length === 1) {
                barcodeRef.current += e.key;
                clearTimeout(barcodeTimeout.current);
                barcodeTimeout.current = setTimeout(() => { barcodeRef.current = ''; }, 200);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [barcodeMode, products]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        await api.delete(`/products/${id}`);
        fetchProducts();
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditProduct(product);
            setFormData({
                name: product.name, price: product.price, costPrice: product.costPrice || '',
                category: product.category, quantity: product.quantity, description: product.description || '',
                sku: product.sku, minStockLevel: product.minStockLevel || 10, barcode: product.barcode || ''
            });
        } else {
            setEditProduct(null);
            setFormData(emptyForm);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editProduct) {
                await api.put(`/products/${editProduct._id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (e) { alert(e.response?.data?.message || 'Error saving product'); }
    };

    const handleExport = async () => {
        const res = await api.get('/analytics/export/products', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url; a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`; a.click();
        window.URL.revokeObjectURL(url);
    };

    // Client-side filter
    const displayed = products.filter(p => {
        if (filterCategory && p.category !== filterCategory) return false;
        if (filterStock === 'low' && p.quantity > p.minStockLevel) return false;
        if (filterStock === 'ok' && p.quantity <= p.minStockLevel) return false;
        return true;
    });

    const lowCount = products.filter(p => p.quantity <= p.minStockLevel).length;

    return (
        <div className="space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Inventory</h1>
                    <p className="text-slate-500 text-sm">{products.length} products • {lowCount > 0 && <span className="text-amber-600 font-medium">{lowCount} low stock</span>}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setBarcodeMode(!barcodeMode)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${barcodeMode ? 'bg-[#163932] text-white border-[#163932]' : 'border-[#9FD2A7] text-[#163932] hover:bg-[#DAF1DE]'}`}>
                        <Scan size={14} /> {barcodeMode ? 'Scanning Active' : 'Barcode Scan'}
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border border-[#9FD2A7] text-[#163932] rounded-xl text-sm hover:bg-[#DAF1DE] transition-colors">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-[#163932] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0B2B26] transition-all shadow-md">
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            {/* Barcode mode tip */}
            {barcodeMode && (
                <div className="bg-[#C8E8CE] border border-[#9FD2A7] rounded-xl px-4 py-3 text-sm text-[#163932] flex items-center gap-2">
                    <Scan size={16} /> <strong>Scanner active</strong> — scan a barcode to auto-fill product details
                </div>
            )}

            {/* Low Stock Alert */}
            {lowCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800">
                        <strong>{lowCount} products</strong> are at or below minimum stock: {' '}
                        {products.filter(p => p.quantity <= p.minStockLevel).slice(0, 4).map(p => (
                            <span key={p._id} className="font-medium">{p.name} ({p.quantity})</span>
                        )).reduce((prev, curr, i) => [prev, i > 0 ? ', ' : '', curr])}
                    </p>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search by name or SKU..."
                        className="w-full pl-9 pr-4 py-2.5 border border-[#DAF1DE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] bg-white"
                        value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }} />
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2.5 border border-[#DAF1DE] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={filterStock} onChange={e => setFilterStock(e.target.value)}
                    className="px-3 py-2.5 border border-[#DAF1DE] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]">
                    <option value="all">All Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="ok">In Stock</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#DAF1DE] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#C8E8CE] text-[#051F20] text-xs font-semibold uppercase tracking-wide">
                                {['Product', 'SKU', 'Category', 'Sell Price', 'Cost Price', 'Margin', 'Stock', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="text-left px-4 py-3.5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="text-center py-12 text-slate-400">Loading...</td></tr>
                            ) : displayed.length === 0 ? (
                                <tr><td colSpan={9} className="text-center py-16">
                                    <Package size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-400 text-sm">No products found</p>
                                </td></tr>
                            ) : displayed.map((p, i) => {
                                const isLow = p.quantity <= p.minStockLevel;
                                return (
                                    <tr key={p._id} className={`border-t border-[#DAF1DE] hover:bg-[#f0faf2] transition-colors ${i % 2 === 1 ? 'bg-[#fafffe]' : ''} ${isLow ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-[#DAF1DE] flex items-center justify-center text-[#163932] text-xs font-bold shrink-0">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-[#051F20] text-sm">{p.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{p.sku}</td>
                                        <td className="px-4 py-3.5">
                                            <span className="px-2 py-0.5 bg-[#DAF1DE] text-[#163932] rounded-lg text-xs font-medium">{p.category}</span>
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-[#163932] text-sm">${p.price?.toFixed(2)}</td>
                                        <td className="px-4 py-3.5 text-sm text-slate-500">${(p.costPrice || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3.5"><MarginBadge sell={p.price} cost={p.costPrice} /></td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
                                                    <div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`}
                                                        style={{ width: `${Math.min(100, (p.quantity / (p.minStockLevel * 3)) * 100)}%` }} />
                                                </div>
                                                <span className="text-sm font-medium text-[#051F20]">{p.quantity}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {isLow ? (
                                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                                    <AlertTriangle size={11} /> Low Stock
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                                    <CheckCircle size={11} /> In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={() => handleOpenModal(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex justify-center gap-2">
                    {[...Array(pages).keys()].map(x => (
                        <button key={x + 1} onClick={() => setPage(x + 1)}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${page === x + 1 ? 'bg-[#163932] text-white' : 'bg-white text-slate-600 hover:bg-[#DAF1DE] border border-[#9FD2A7]'}`}>
                            {x + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DAF1DE]">
                            <div className="flex justify-between items-center mb-5 border-b border-[#DAF1DE] pb-4">
                                <h3 className="text-lg font-bold text-[#051F20]">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                                    <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">SKU *</label>
                                        <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Barcode</label>
                                        <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} placeholder="Scan or type" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
                                    <select className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                        value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                        <option value="">Select category...</option>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                            <DollarSign size={11} /> Sell Price ($) *
                                        </label>
                                        <input type="number" step="0.01" min="0"
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                                            <TrendingUp size={11} /> Cost Price ($)
                                        </label>
                                        <input type="number" step="0.01" min="0"
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.costPrice} onChange={e => setFormData({ ...formData, costPrice: e.target.value })} placeholder="0.00" />
                                    </div>
                                </div>
                                {formData.price && formData.costPrice && parseFloat(formData.costPrice) > 0 && (
                                    <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                                        <TrendingUp size={12} />
                                        Profit margin: <strong>{(((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1)}%</strong>
                                        &nbsp;(${(formData.price - formData.costPrice).toFixed(2)} per unit)
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity *</label>
                                        <input type="number" min="0"
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Min Stock Level</label>
                                        <input type="number" min="0"
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                            value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                                    <textarea rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] resize-none"
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 bg-[#163932] text-white rounded-xl text-sm font-medium hover:bg-[#0B2B26] transition-all">
                                        {editProduct ? 'Update Product' : 'Add Product'}
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

export default Products;
