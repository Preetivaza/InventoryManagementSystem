import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Plus, Search, AlertCircle, CheckCircle, XCircle, Package } from 'lucide-react';
import api from '../utils/api';

const REASONS = ['Defective', 'Wrong Item', 'Customer Changed Mind', 'Damaged in Transit', 'Other'];

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({ totalReturns: 0, totalRefundAmount: 0, byReason: {} });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ saleId: '', productId: '', quantity: 1, reason: REASONS[0], notes: '' });
    const [saleSearch, setSaleSearch] = useState('');
    const [foundSale, setFoundSale] = useState(null);
    const [saleError, setSaleError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const [{ data: r }, { data: s }] = await Promise.all([api.get('/returns'), api.get('/returns/stats')]);
            setReturns(r);
            setStats(s);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReturns(); }, []);

    const lookupSale = async () => {
        setSaleError('');
        setFoundSale(null);
        try {
            const { data } = await api.get(`/sales?search=${saleSearch}&limit=5`);
            if (data.sales?.length > 0) {
                setFoundSale(data.sales[0]);
                setForm(f => ({ ...f, saleId: data.sales[0]._id, productId: '' }));
            } else {
                setSaleError('No sale found with that Invoice ID');
            }
        } catch (e) { setSaleError('Error searching for sale'); }
    };

    const handleSubmit = async () => {
        if (!form.saleId || !form.productId) return;
        setSaving(true);
        try {
            await api.post('/returns', form);
            setShowModal(false);
            setFoundSale(null);
            setSaleSearch('');
            setForm({ saleId: '', productId: '', quantity: 1, reason: REASONS[0], notes: '' });
            fetchReturns();
        } catch (e) { alert(e.response?.data?.message || 'Error processing return'); }
        finally { setSaving(false); }
    };

    const filtered = returns.filter(r =>
        r.sale?.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.reason?.toLowerCase().includes(search.toLowerCase())
    );

    const statusIcon = (status) => {
        if (status === 'Completed') return <CheckCircle size={14} className="text-green-500" />;
        if (status === 'Rejected') return <XCircle size={14} className="text-red-500" />;
        return <AlertCircle size={14} className="text-yellow-500" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Returns & Refunds</h1>
                    <p className="text-slate-500 text-sm mt-1">Track returned items and process refunds</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#163932] text-white px-4 py-2.5 rounded-xl hover:bg-[#0B2B26] transition-all shadow-md text-sm font-medium">
                    <Plus size={16} /> New Return
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Returns', value: stats.totalReturns, icon: RotateCcw, color: 'bg-orange-50 text-orange-600' },
                    { label: 'Total Refunded', value: `$${(stats.totalRefundAmount || 0).toFixed(2)}`, icon: Package, color: 'bg-red-50 text-red-600' },
                    { label: 'Top Reason', value: Object.entries(stats.byReason || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A', icon: AlertCircle, color: 'bg-yellow-50 text-yellow-600' },
                    { label: 'Return Rate', value: `${stats.totalReturns}`, icon: RotateCcw, color: 'bg-blue-50 text-blue-600' },
                ].map((kpi, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE]">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                            <kpi.icon size={18} />
                        </div>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                        <p className="text-xl font-bold text-[#051F20] mt-0.5">{kpi.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Reason breakdown */}
            {Object.keys(stats.byReason || {}).length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] text-sm mb-3">Returns by Reason</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.byReason).map(([reason, count]) => (
                            <span key={reason} className="px-3 py-1.5 bg-[#C8E8CE] text-[#163932] rounded-lg text-xs font-medium">
                                {reason}: <strong>{count}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Search + Table */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by invoice, product, or reason..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DAF1DE] focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] bg-white text-sm" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#DAF1DE] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#C8E8CE] text-[#051F20] text-xs font-semibold uppercase tracking-wide">
                                {['Date', 'Invoice', 'Product', 'Qty', 'Refund Amount', 'Reason', 'Status'].map(h => (
                                    <th key={h} className="text-left px-5 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16">
                                    <RotateCcw size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-400 text-sm">No returns found</p>
                                </td></tr>
                            ) : filtered.map((r, i) => (
                                <tr key={r._id} className={`border-t border-[#DAF1DE] hover:bg-[#f0faf2] transition-colors ${i % 2 === 1 ? 'bg-[#fafffe]' : ''}`}>
                                    <td className="px-5 py-4 text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{r.sale?.invoiceId || '-'}</td>
                                    <td className="px-5 py-4 text-sm font-medium text-[#051F20]">{r.product?.name || '-'}</td>
                                    <td className="px-5 py-4 text-sm text-center">{r.quantity}</td>
                                    <td className="px-5 py-4 text-sm font-bold text-red-600">-${r.refundAmount?.toFixed(2)}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs">{r.reason}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {statusIcon(r.status)}
                                            <span className="text-xs">{r.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Return Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-[#051F20]">Process Return</h2>
                            <button onClick={() => { setShowModal(false); setFoundSale(null); }} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>

                        {/* Invoice lookup */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Search Invoice ID</label>
                            <div className="flex gap-2">
                                <input value={saleSearch} onChange={e => setSaleSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookupSale()}
                                    placeholder="e.g. INV-1001" className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                <button onClick={lookupSale} className="px-4 py-2.5 bg-[#163932] text-white rounded-xl text-sm">Search</button>
                            </div>
                            {saleError && <p className="text-red-500 text-xs mt-1">{saleError}</p>}
                        </div>

                        {foundSale && (
                            <div className="bg-[#f0faf2] rounded-xl p-4 mb-4">
                                <p className="text-xs font-semibold text-[#163932] mb-2">✅ Found: {foundSale.invoiceId} — {foundSale.customerName}</p>
                                <div className="space-y-2">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Select Product</label>
                                        <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]">
                                            <option value="">Choose product...</option>
                                            {foundSale.products?.map(p => (
                                                <option key={p.product?._id || p._id} value={p.product?._id || p._id}>
                                                    {p.product?.name} (Qty: {p.quantity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Return Qty</label>
                                            <input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
                                            <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]">
                                                {REASONS.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
                                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] resize-none" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setShowModal(false); setFoundSale(null); }} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleSubmit} disabled={saving || !form.saleId || !form.productId}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                                {saving ? 'Processing...' : 'Process Refund'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Returns;
