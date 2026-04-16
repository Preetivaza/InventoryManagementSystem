import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import {
    Plus, Trash2, ShoppingCart, History, FileText, Search,
    CheckCircle, Scan, Download, CreditCard, User, X, AlertTriangle,
    TrendingUp, Package, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [recentSales, setRecentSales] = useState([]);
    const [salesTotal, setSalesTotal] = useState({ count: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [lastSale, setLastSale] = useState(null);
    const [barcodeMode, setBarcodeMode] = useState(false);
    const barcodeRef = useRef('');
    const barcodeTimer = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => { fetchProducts(); fetchSales(); }, []);

    // ── Barcode scanner (keyboard wedge) ──────────────────────────────────────
    useEffect(() => {
        if (!barcodeMode) return;
        const handler = (e) => {
            if (e.target.tagName === 'INPUT' && e.target !== document.body) return;
            if (e.key === 'Enter') {
                const code = barcodeRef.current.trim();
                if (code) {
                    const found = products.find(p => p.barcode === code || p.sku === code);
                    if (found) {
                        handleSelectProduct(found);
                    } else {
                        setSearchQuery(code);
                        setIsDropdownOpen(true);
                    }
                }
                barcodeRef.current = '';
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                barcodeRef.current += e.key;
                clearTimeout(barcodeTimer.current);
                barcodeTimer.current = setTimeout(() => { barcodeRef.current = ''; }, 200);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [barcodeMode, products]);

    const fetchProducts = async () => {
        const { data } = await api.get('/products?pageNumber=1&limit=200');
        setProducts(data.products || []);
    };

    const fetchSales = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/sales?limit=30');
            const list = data.sales || data || [];
            setRecentSales(Array.isArray(list) ? list : []);
            const r = Array.isArray(list) ? list.reduce((s, x) => s + x.totalAmount, 0) : 0;
            setSalesTotal({ count: Array.isArray(list) ? list.length : 0, revenue: r });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectProduct = (product) => {
        if (product.quantity <= 0) return;
        setSelectedProduct(product);
        setSearchQuery(product.name);
        setIsDropdownOpen(false);
        setQuantity(1);
    };

    const addToCart = () => {
        if (!selectedProduct) return;
        if (quantity > selectedProduct.quantity) {
            alert(`Only ${selectedProduct.quantity} in stock`); return;
        }
        const idx = cart.findIndex(i => i.product === selectedProduct._id);
        const curQty = idx >= 0 ? cart[idx].quantity : 0;
        if (curQty + parseInt(quantity) > selectedProduct.quantity) {
            alert(`Cannot add more — stock limit ${selectedProduct.quantity}`); return;
        }
        if (idx >= 0) {
            const c = [...cart];
            c[idx].quantity = curQty + parseInt(quantity);
            setCart(c);
        } else {
            setCart([...cart, {
                product: selectedProduct._id,
                name: selectedProduct.name, sku: selectedProduct.sku,
                price: selectedProduct.price, costPrice: selectedProduct.costPrice || 0,
                quantity: parseInt(quantity)
            }]);
        }
        setSelectedProduct(null); setSearchQuery(''); setQuantity(1);
    };

    const removeFromCart = (id) => setCart(cart.filter(i => i.product !== id));

    const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const cartProfit = cart.reduce((s, i) => s + (i.price - i.costPrice) * i.quantity, 0);
    const cartMargin = cartTotal > 0 ? ((cartProfit / cartTotal) * 100).toFixed(1) : 0;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCheckingOut(true);
        try {
            const { data } = await api.post('/sales', {
                products: cart, customerName, paymentMethod
            });
            setLastSale(data);
            setCart([]); setCustomerName(''); setPaymentMethod('Cash');
            fetchSales(); fetchProducts();
        } catch (e) { alert(e.response?.data?.message || 'Checkout failed'); }
        finally { setCheckingOut(false); }
    };

    const downloadInvoice = (saleId, invoiceId) => {
        const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
        const baseUrl = `${import.meta.env.VITE_API_URL}/api`;
        const url = `${baseUrl}/sales/${saleId}/invoice`;
        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.blob())
            .then(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `invoice-${invoiceId}.pdf`;
                a.click();
            });
    };

    const exportSales = async () => {
        const res = await api.get('/analytics/export/sales', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a'); a.href = url;
        a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Sales & Billing</h1>
                    <p className="text-slate-500 text-sm">{salesTotal.count} transactions • ₹{salesTotal.revenue.toFixed(2)} total</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setBarcodeMode(!barcodeMode)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${barcodeMode ? 'bg-[#163932] text-white border-[#163932]' : 'border-[#9FD2A7] text-[#163932] hover:bg-[#DAF1DE]'}`}>
                        <Scan size={14} /> {barcodeMode ? 'Scanner ON' : 'Barcode'}
                    </button>
                    <button onClick={exportSales} className="flex items-center gap-2 px-3 py-2 border border-[#9FD2A7] text-[#163932] rounded-xl text-sm hover:bg-[#DAF1DE]">
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Success banner */}
            <AnimatePresence>
                {lastSale && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-500 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-800">Sale completed! {lastSale.invoiceId}</p>
                                <p className="text-xs text-green-600">Total: ₹{lastSale.totalAmount?.toFixed(2)} • Profit: ₹{lastSale.profit?.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => downloadInvoice(lastSale._id, lastSale.invoiceId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-lg text-xs font-medium hover:bg-green-50">
                                <FileText size={13} /> Download Invoice
                            </button>
                            <button onClick={() => setLastSale(null)} className="p-1 text-green-400 hover:text-green-600"><X size={14} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── POS Panel ──────────────────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#DAF1DE]">
                            <div className="bg-[#C8E8CE] p-2 rounded-xl"><ShoppingCart size={20} className="text-[#163932]" /></div>
                            <div>
                                <h2 className="font-bold text-[#051F20]">New Sale</h2>
                                {barcodeMode && <p className="text-xs text-[#163932]">🔵 Barcode scanner active</p>}
                            </div>
                        </div>

                        <div className="space-y-3.5">
                            {/* Customer */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><User size={11} /> Customer Name</label>
                                <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                    placeholder="Customer name or 'Walk-in'" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>

                            {/* Payment method */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><CreditCard size={11} /> Payment Method</label>
                                <div className="flex gap-2 flex-wrap">
                                    {PAYMENT_METHODS.map(m => (
                                        <button key={m} onClick={() => setPaymentMethod(m)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${paymentMethod === m ? 'bg-[#163932] text-white border-[#163932]' : 'border-slate-200 text-slate-600 hover:bg-[#DAF1DE] hover:border-[#9FD2A7]'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Product search */}
                            <div className="relative">
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1"><Package size={11} /> Find Product</label>
                                <div className="relative">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input ref={searchRef}
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                        placeholder="Search name, SKU, or scan barcode..."
                                        value={searchQuery}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onChange={e => { setSearchQuery(e.target.value); setIsDropdownOpen(true); if (!e.target.value) setSelectedProduct(null); }} />
                                </div>
                                <AnimatePresence>
                                    {isDropdownOpen && searchQuery && (
                                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="absolute z-20 w-full mt-1 bg-white border border-[#9FD2A7] rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                            {filteredProducts.length > 0 ? filteredProducts.slice(0, 8).map(p => (
                                                <div key={p._id} onClick={() => handleSelectProduct(p)}
                                                    className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${p.quantity > 0 ? 'hover:bg-[#f0faf2]' : 'opacity-40 cursor-not-allowed'}`}>
                                                    <div>
                                                        <p className="font-medium text-[#051F20] text-sm">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.sku} • Margin: {p.costPrice ? (((p.price - p.costPrice) / p.price) * 100).toFixed(0) : '?'}%</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-[#163932] text-sm">₹{p.price.toFixed(2)}</p>
                                                        <p className={`text-xs ${p.quantity < p.minStockLevel ? 'text-red-500' : 'text-slate-400'}`}>
                                                            {p.quantity < p.minStockLevel && '⚠️ '}Stock: {p.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                            )) : <div className="p-4 text-center text-slate-400 text-sm">No products found</div>}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Qty + Add */}
                            <div className="flex gap-3 items-end">
                                <div className="w-24">
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Qty</label>
                                    <input type="number" min="1"
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]"
                                        value={quantity} onChange={e => setQuantity(e.target.value)} />
                                </div>
                                <button onClick={addToCart} disabled={!selectedProduct}
                                    className="flex-1 py-2.5 bg-[#163932] text-white rounded-xl text-sm font-medium hover:bg-[#0B2B26] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                                    <Plus size={16} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 bg-[#DAF1DE] flex items-center justify-between border-b border-[#9FD2A7]">
                            <h3 className="font-semibold text-[#051F20] text-sm">Current Cart</h3>
                            <span className="text-xs text-slate-500">{cart.length} items</span>
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-white text-xs text-slate-500 border-b border-[#DAF1DE]">
                                    <tr>
                                        <th className="text-left px-4 py-2.5">Product</th>
                                        <th className="text-center px-4 py-2.5">Qty</th>
                                        <th className="text-right px-4 py-2.5">Total</th>
                                        <th className="text-right px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#DAF1DE]">
                                    {cart.map((item, i) => (
                                        <tr key={i} className="hover:bg-[#f0faf2]">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-[#051F20]">{item.name}</p>
                                                <p className="text-xs text-slate-400">₹{item.price.toFixed(2)} each</p>
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-[#163932]">₹{(item.price * item.quantity).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removeFromCart(item.product)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-slate-300 text-sm">Cart is empty</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals + Checkout */}
                        <div className="px-5 pt-4 pb-5 border-t border-[#DAF1DE] space-y-3">
                            {cart.length > 0 && (
                                <div className="flex justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <TrendingUp size={12} />
                                        Est. Profit: <strong>₹{cartProfit.toFixed(2)}</strong> ({cartMargin}% margin)
                                    </div>
                                    <span>{paymentMethod}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-600 font-medium">Total</span>
                                <span className="text-2xl font-bold text-[#051F20]">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} disabled={cart.length === 0 || checkingOut}
                                className="w-full py-3 bg-[#163932] text-white rounded-xl font-semibold hover:bg-[#0B2B26] disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#163932]/20">
                                {checkingOut ? <><RefreshCw size={16} className="animate-spin" /> Processing...</> : <><CheckCircle size={16} /> Complete Sale</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Recent Sales ────────────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm flex flex-col max-h-[820px]">
                    <div className="px-6 py-4 border-b border-[#DAF1DE] flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <History size={18} className="text-[#235347]" />
                            <h2 className="font-bold text-[#051F20]">Recent Transactions</h2>
                        </div>
                        <button onClick={fetchSales} className="p-1.5 hover:bg-[#DAF1DE] rounded-lg text-slate-400 hover:text-[#163932]">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {loading ? (
                            <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
                        ) : recentSales.length === 0 ? (
                            <div className="text-center py-16 text-slate-300">
                                <History size={36} className="mx-auto mb-2" />
                                <p className="text-sm">No sales yet</p>
                            </div>
                        ) : recentSales.map(sale => (
                            <div key={sale._id} className="p-4 rounded-xl border border-[#DAF1DE] hover:border-[#9FD2A7] hover:bg-[#f9fdfb] transition-all group">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-semibold text-slate-500">{sale.invoiceId}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sale.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {sale.status || 'Completed'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5">{new Date(sale.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#051F20]">₹{sale.totalAmount?.toFixed(2)}</p>
                                        {sale.profit > 0 && <p className="text-xs text-green-600">+₹{sale.profit?.toFixed(2)} profit</p>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                                    <span className="flex items-center gap-1"><User size={10} /> {sale.customerName || 'Walk-in'}</span>
                                    <span className="flex items-center gap-1">
                                        <CreditCard size={10} /> {sale.paymentMethod || 'Cash'}
                                        &nbsp;•&nbsp; {sale.products?.length} item{sale.products?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <button onClick={() => downloadInvoice(sale._id, sale.invoiceId)}
                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-[#9FD2A7] text-[#235347] hover:bg-[#C8E8CE] hover:border-[#163932] text-xs transition-all">
                                    <FileText size={12} /> Download PDF Invoice
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;
