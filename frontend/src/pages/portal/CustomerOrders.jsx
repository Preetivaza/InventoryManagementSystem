import { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Package, CreditCard, Calendar, Search, Filter, Download, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS = {
    Completed: 'bg-green-50 text-green-700',
    Refunded: 'bg-red-50 text-red-700',
    Partial: 'bg-amber-50 text-amber-700',
};

const CustomerOrders = () => {
    const { portalApi } = useCustomerAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        portalApi.get('/portal/me')
            .then(r => setSales(r.data.sales || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = sales.filter(s =>
        s.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
        s.paymentMethod?.toLowerCase().includes(search.toLowerCase())
    );

    const downloadInvoice = (sale) => {
        const info = JSON.parse(localStorage.getItem('customerInfo') || '{}');
        const baseUrl = `${import.meta.env.VITE_API_URL}/api`;
        fetch(`${baseUrl}/sales/${sale._id}/invoice`, {
            headers: { Authorization: `Bearer ${info.token}` }
        }).then(r => r.blob()).then(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `invoice-${sale.invoiceId}.pdf`;
            a.click();
        });
    };

    const totalSpent = sales.reduce((s, x) => s + x.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#051F20]">My Orders</h1>
                <p className="text-slate-500 text-sm mt-0.5">{sales.length} orders · ₹{totalSpent.toFixed(2)} total spent</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by invoice ID or payment method..."
                    className="w-full pl-10 pr-4 py-3 border border-[#DAF1DE] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl border border-[#DAF1DE] animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DAF1DE] text-slate-300">
                    <Package size={40} className="mx-auto mb-2" />
                    <p>No orders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((sale, i) => (
                        <motion.div key={sale._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.4) }}
                            className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm overflow-hidden">

                            {/* Order header */}
                            <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#f9fdfb]"
                                onClick={() => setExpanded(expanded === sale._id ? null : sale._id)}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#DAF1DE] rounded-xl flex items-center justify-center shrink-0">
                                        <Package size={17} className="text-[#163932]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[#051F20] text-sm">{sale.invoiceId}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[sale.status] || STATUS_COLORS.Completed}`}>
                                                {sale.status || 'Completed'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                            <Calendar size={10} /> {new Date(sale.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            <span>·</span>
                                            <CreditCard size={10} /> {sale.paymentMethod || 'Cash'}
                                            <span>·</span>
                                            {sale.products?.length} item{sale.products?.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-[#051F20]">₹{sale.totalAmount?.toFixed(2)}</p>
                                    <div className="flex items-center gap-1">
                                        <button onClick={e => { e.stopPropagation(); downloadInvoice(sale); }}
                                            className="p-2 hover:bg-[#C8E8CE] rounded-xl text-slate-400 hover:text-[#163932] transition-colors" title="Download PDF">
                                            <Download size={14} />
                                        </button>
                                        {expanded === sale._id
                                            ? <ChevronUp size={16} className="text-slate-400" />
                                            : <ChevronDown size={16} className="text-slate-400" />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded items */}
                            <AnimatePresence>
                                {expanded === sale._id && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                                        className="overflow-hidden border-t border-[#DAF1DE]">
                                        <div className="px-5 pb-5 pt-4">
                                            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Order Items</p>
                                            <div className="space-y-2">
                                                {sale.products?.map((item, j) => (
                                                    <div key={j} className="flex items-center justify-between py-2.5 px-3 bg-[#f0faf2] rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 bg-[#C8E8CE] rounded-lg flex items-center justify-center text-xs font-bold text-[#163932]">
                                                                {item.quantity}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-[#051F20]">{item.product?.name || 'Product'}</p>
                                                                {item.product?.sku && <p className="text-xs text-slate-400">{item.product.sku}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-[#163932]">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                            <p className="text-xs text-slate-400">₹{item.price?.toFixed(2)} each</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#DAF1DE]">
                                                <p className="text-sm font-semibold text-slate-600">Order Total</p>
                                                <p className="text-lg font-bold text-[#051F20]">₹{sale.totalAmount?.toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => downloadInvoice(sale)}
                                                className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border border-[#9FD2A7] text-[#163932] rounded-xl text-sm font-medium hover:bg-[#C8E8CE] transition-colors">
                                                <FileText size={14} /> Download PDF Invoice
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerOrders;
