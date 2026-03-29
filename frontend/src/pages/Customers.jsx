import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Search, Phone, Mail, MapPin, ShoppingBag, TrendingUp,
    Trash2, Edit3, X, Save, Eye, Crown, Star, Award, Download,
    RefreshCw, ChevronRight, Calendar, DollarSign, Package, CreditCard,
    FileText, ArrowUpRight, Filter, SortDesc
} from 'lucide-react';
import api from '../utils/api';

// ── Tier logic ────────────────────────────────────────────────────────────────
const getTier = (spent) => {
    if (spent >= 5000) return { label: 'Platinum', color: 'bg-purple-100 text-purple-700', icon: Crown, dot: 'bg-purple-400' };
    if (spent >= 2000) return { label: 'Gold', color: 'bg-amber-100 text-amber-700', icon: Star, dot: 'bg-amber-400' };
    if (spent >= 500) return { label: 'Silver', color: 'bg-slate-100 text-slate-600', icon: Award, dot: 'bg-slate-400' };
    return { label: 'Bronze', color: 'bg-orange-100 text-orange-700', icon: Users, dot: 'bg-orange-300' };
};

const avatarColors = [
    'bg-[#163932] text-white',
    'bg-purple-600 text-white',
    'bg-blue-600 text-white',
    'bg-amber-500 text-white',
    'bg-rose-500 text-white',
    'bg-teal-600 text-white',
];

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, delay }) => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE] hover:shadow-md transition-shadow">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
            <Icon size={18} className={iconColor} />
        </div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-[#051F20] mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </motion.div>
);

// ── Small Invoice Row ─────────────────────────────────────────────────────────
const InvoiceRow = ({ sale }) => {
    const downloadInvoice = () => {
        const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
        fetch(`http://localhost:5000/api/sales/${sale._id}/invoice`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.blob()).then(blob => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `invoice-${sale.invoiceId}.pdf`;
            a.click();
        });
    };

    return (
        <div className="border border-[#DAF1DE] rounded-xl p-4 hover:bg-[#f9fdfb] transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-slate-400">{sale.invoiceId}</span>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#163932] text-sm">${sale.totalAmount?.toFixed(2)}</span>
                    <button onClick={downloadInvoice} title="Download Invoice"
                        className="p-1 hover:bg-[#C8E8CE] rounded-lg text-slate-400 hover:text-[#163932] transition-colors">
                        <FileText size={12} />
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><CreditCard size={9} /> {sale.paymentMethod || 'Cash'}</span>
                    <span className="flex items-center gap-1"><Package size={9} /> {sale.products?.length} item{sale.products?.length !== 1 ? 's' : ''}</span>
                    {sale.profit > 0 && <span className="text-green-600 font-medium">+${sale.profit?.toFixed(2)} profit</span>}
                </div>
                <span className="flex items-center gap-1"><Calendar size={9} /> {new Date(sale.createdAt).toLocaleDateString()}</span>
            </div>
            {sale.products?.length > 0 && (
                <p className="text-xs text-slate-400 mt-1.5 truncate">
                    {sale.products.map(p => `${p.product?.name || 'Item'} ×${p.quantity}`).join(' • ')}
                </p>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('totalSpent');
    const [tierFilter, setTierFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', notes: '' });
    const [saving, setSaving] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/customers');
            setCustomers(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCustomers(); }, []);

    // ── Computed stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total = customers.length;
        const totalRevenue = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
        const avgSpend = total > 0 ? totalRevenue / total : 0;
        const totalOrders = customers.reduce((s, c) => s + (c.totalOrders || 0), 0);
        const platinum = customers.filter(c => c.totalSpent >= 5000).length;
        const gold = customers.filter(c => c.totalSpent >= 2000 && c.totalSpent < 5000).length;
        const topCustomer = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0];
        return { total, totalRevenue, avgSpend, totalOrders, platinum, gold, topCustomer };
    }, [customers]);

    // ── Filter + Sort ────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = customers.filter(c =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
        );
        if (tierFilter !== 'all') {
            list = list.filter(c => getTier(c.totalSpent || 0).label === tierFilter);
        }
        return [...list].sort((a, b) => {
            if (sortBy === 'totalSpent') return (b.totalSpent || 0) - (a.totalSpent || 0);
            if (sortBy === 'totalOrders') return (b.totalOrders || 0) - (a.totalOrders || 0);
            if (sortBy === 'recent') return new Date(b.lastPurchase || 0) - new Date(a.lastPurchase || 0);
            if (sortBy === 'name') return a.name?.localeCompare(b.name);
            return 0;
        });
    }, [customers, search, sortBy, tierFilter]);

    // ── Open profile drawer ────────────────────────────────────────────────────
    const openProfile = async (c) => {
        setProfileData({ customer: c, sales: [] });
        setProfileOpen(true);
        setProfileLoading(true);
        try {
            const { data } = await api.get(`/customers/${c._id}`);
            setProfileData(data);
        } catch (e) { console.error(e); }
        finally { setProfileLoading(false); }
    };

    // ── Modal handlers ─────────────────────────────────────────────────────────
    const openAdd = () => {
        setSelectedCustomer(null);
        setForm({ name: '', email: '', phone: '', address: '', notes: '' });
        setShowModal(true);
    };

    const openEdit = (c) => {
        setSelectedCustomer(c);
        setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '', notes: c.notes || '' });
        setShowModal(true);
        setProfileOpen(false);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer._id}`, form);
            } else {
                await api.post('/customers', form);
            }
            setShowModal(false);
            fetchCustomers();
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this customer and all their records?')) return;
        await api.delete(`/customers/${id}`);
        setProfileOpen(false);
        fetchCustomers();
    };

    const exportCSV = async () => {
        const res = await api.get('/analytics/export/customers', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url; a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    };

    // ── Tier distribution bar ──────────────────────────────────────────────────
    const tierCounts = useMemo(() => ({
        Platinum: customers.filter(c => c.totalSpent >= 5000).length,
        Gold: customers.filter(c => c.totalSpent >= 2000 && c.totalSpent < 5000).length,
        Silver: customers.filter(c => c.totalSpent >= 500 && c.totalSpent < 2000).length,
        Bronze: customers.filter(c => (c.totalSpent || 0) < 500).length,
    }), [customers]);

    const [pwModal, setPwModal] = useState(false);
    const [newPw, setNewPw] = useState('');

    const handleSetPassword = async () => {
        if (!newPw || newPw.length < 6) return alert('Password must be at least 6 characters');
        setSaving(true);
        try {
            await api.post('/portal/set-password', { customerId: curProfile._id, password: newPw });
            alert(`Portal access enabled for ${curProfile.name}`);
            setPwModal(false);
            setNewPw('');
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to set password');
        } finally {
            setSaving(false);
        }
    };

    const curProfile = profileData?.customer;

    return (
        <div className="space-y-6 pb-10">
            {/* ── Header ────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Customers</h1>
                    <p className="text-slate-500 text-sm mt-0.5">CRM · {customers.length} customers · ${stats.totalRevenue.toFixed(0)} lifetime value</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchCustomers} className="p-2 hover:bg-[#DAF1DE] rounded-xl text-slate-400 hover:text-[#163932] transition-colors">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-[#9FD2A7] text-[#163932] rounded-xl text-sm hover:bg-[#DAF1DE] transition-colors">
                        <Download size={14} /> Export CSV
                    </button>
                    <button onClick={openAdd} className="flex items-center gap-2 bg-[#163932] text-white px-4 py-2.5 rounded-xl hover:bg-[#0B2B26] transition-all shadow-md text-sm font-medium">
                        <Plus size={16} /> Add Customer
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Customers" value={stats.total} sub={`${stats.platinum} Platinum • ${stats.gold} Gold`}
                    icon={Users} iconBg="bg-[#C8E8CE]" iconColor="text-[#163932]" delay={0} />
                <StatCard label="Lifetime Revenue" value={`$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    sub="From all purchases" icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" delay={0.05} />
                <StatCard label="Avg. Customer Value" value={`$${stats.avgSpend.toFixed(2)}`}
                    sub="Per customer" icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" delay={0.1} />
                <StatCard label="Total Orders" value={stats.totalOrders}
                    sub={`Top: ${stats.topCustomer?.name?.split(' ')[0] || '—'}`}
                    icon={ShoppingBag} iconBg="bg-purple-50" iconColor="text-purple-600" delay={0.15} />
            </div>

            {/* ── Tier Distribution ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm p-5">
                <h3 className="text-sm font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                    <Crown size={15} className="text-amber-500" /> Customer Tiers
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { t: 'Platinum', count: tierCounts.Platinum, min: '$5,000+', col: 'bg-purple-400', text: 'text-purple-700', bg: 'bg-purple-50' },
                        { t: 'Gold', count: tierCounts.Gold, min: '$2,000+', col: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
                        { t: 'Silver', count: tierCounts.Silver, min: '$500+', col: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50' },
                        { t: 'Bronze', count: tierCounts.Bronze, min: '<$500', col: 'bg-orange-300', text: 'text-orange-700', bg: 'bg-orange-50' },
                    ].map(({ t, count, min, col, text, bg }) => (
                        <button key={t} onClick={() => setTierFilter(tierFilter === t ? 'all' : t)}
                            className={`rounded-xl p-4 border-2 text-left transition-all ${tierFilter === t ? `border-[#163932] ${bg}` : 'border-transparent bg-slate-50 hover:border-[#9FD2A7]'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${col} mb-2`} />
                            <p className={`text-xs font-semibold ${text}`}>{t}</p>
                            <p className="text-2xl font-bold text-[#051F20] mt-0.5">{count}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{min}</p>
                        </button>
                    ))}
                </div>
                {/* Stacked bar */}
                <div className="mt-4 h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
                    {[
                        { count: tierCounts.Platinum, color: 'bg-purple-400' },
                        { count: tierCounts.Gold, color: 'bg-amber-400' },
                        { count: tierCounts.Silver, color: 'bg-slate-400' },
                        { count: tierCounts.Bronze, color: 'bg-orange-300' },
                    ].map(({ count, color }, i) => (
                        <div key={i} className={`${color} transition-all`}
                            style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : '0%' }} />
                    ))}
                </div>
            </div>

            {/* ── Filters Row ───────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[220px]">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, email or phone..."
                        className="w-full pl-9 pr-4 py-2.5 border border-[#DAF1DE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] bg-white" />
                </div>
                <div className="flex items-center gap-2">
                    <SortDesc size={14} className="text-slate-400" />
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                        className="px-3 py-2.5 border border-[#DAF1DE] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]">
                        <option value="totalSpent">Top Spenders</option>
                        <option value="totalOrders">Most Orders</option>
                        <option value="recent">Most Recent</option>
                        <option value="name">A–Z</option>
                    </select>
                </div>
                {tierFilter !== 'all' && (
                    <button onClick={() => setTierFilter('all')} className="flex items-center gap-1.5 px-3 py-2 bg-[#C8E8CE] text-[#163932] rounded-xl text-xs font-medium">
                        <Filter size={11} /> {tierFilter} <X size={10} />
                    </button>
                )}
            </div>

            {/* ── Customer Cards Grid ───────────────────────────────────────── */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl h-40 border border-[#DAF1DE] animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#DAF1DE]">
                    <Users size={40} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-slate-400">No customers found</p>
                    <button onClick={openAdd} className="mt-4 px-4 py-2 bg-[#163932] text-white rounded-xl text-sm">Add First Customer</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c, i) => {
                        const tier = getTier(c.totalSpent || 0);
                        const TierIcon = tier.icon;
                        const avatarBg = avatarColors[i % avatarColors.length];
                        const avgOrder = c.totalOrders > 0 ? (c.totalSpent / c.totalOrders) : 0;
                        const daysSince = c.lastPurchase
                            ? Math.floor((Date.now() - new Date(c.lastPurchase)) / 86400000)
                            : null;

                        return (
                            <motion.div key={c._id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                className="bg-white rounded-2xl border border-[#DAF1DE] shadow-sm hover:shadow-md hover:border-[#9FD2A7] transition-all cursor-pointer group"
                                onClick={() => openProfile(c)}>
                                <div className="p-5">
                                    {/* Top row */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${avatarBg}`}>
                                                {c.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#051F20] text-sm leading-tight">{c.name}</p>
                                                {c.email && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[160px]">{c.email}</p>}
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${tier.color}`}>
                                            <TierIcon size={10} /> {tier.label}
                                        </span>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-[#f0faf2] rounded-xl p-2.5 text-center">
                                            <p className="text-xs text-slate-400">Orders</p>
                                            <p className="font-bold text-[#051F20] text-sm">{c.totalOrders || 0}</p>
                                        </div>
                                        <div className="bg-[#f0faf2] rounded-xl p-2.5 text-center">
                                            <p className="text-xs text-slate-400">Spent</p>
                                            <p className="font-bold text-[#163932] text-sm">${(c.totalSpent || 0).toFixed(0)}</p>
                                        </div>
                                        <div className="bg-[#f0faf2] rounded-xl p-2.5 text-center">
                                            <p className="text-xs text-slate-400">Avg</p>
                                            <p className="font-bold text-[#051F20] text-sm">${avgOrder.toFixed(0)}</p>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                            {c.phone && <span className="flex items-center gap-1"><Phone size={10} />{c.phone}</span>}
                                            {daysSince !== null && (
                                                <span className={`flex items-center gap-1 ${daysSince > 60 ? 'text-red-400' : daysSince > 30 ? 'text-amber-500' : 'text-green-600'}`}>
                                                    <Calendar size={10} /> {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={e => { e.stopPropagation(); openEdit(c); }}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit3 size={13} />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); handleDelete(c._id); }}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                            <ChevronRight size={14} className="text-slate-300 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* ── Profile Drawer (right slide-in) ───────────────────────────── */}
            <AnimatePresence>
                {profileOpen && curProfile && (
                    <>
                        {/* Backdrop */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/25 z-40 backdrop-blur-sm"
                            onClick={() => setProfileOpen(false)} />

                        {/* Drawer */}
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 280, damping: 32 }}
                            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

                            {/* Drawer Header */}
                            <div className="bg-gradient-to-br from-[#051F20] to-[#235347] p-6 shrink-0">
                                <div className="flex items-start justify-between mb-4">
                                    <button onClick={() => setProfileOpen(false)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPwModal(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors">
                                            <Lock size={12} /> Portal Access
                                        </button>
                                        <button onClick={() => openEdit(curProfile)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors">
                                            <Edit3 size={12} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(curProfile._id)}
                                            className="p-1.5 bg-white/10 hover:bg-red-400/30 text-white rounded-xl transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Avatar + Name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white border-2 border-white/30">
                                        {curProfile.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{curProfile.name}</h2>
                                        {curProfile.email && (
                                            <p className="text-[#9FD2A7] text-sm flex items-center gap-1.5 mt-0.5">
                                                <Mail size={12} /> {curProfile.email}
                                            </p>
                                        )}
                                        {curProfile.phone && (
                                            <p className="text-[#9FD2A7] text-sm flex items-center gap-1.5">
                                                <Phone size={12} /> {curProfile.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Tier badge */}
                                {(() => {
                                    const t = getTier(curProfile.totalSpent || 0);
                                    const TI = t.icon;
                                    return (
                                        <div className="mt-4 flex items-center gap-2">
                                            <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white">
                                                <TI size={11} /> {t.label} Customer
                                            </span>
                                            {curProfile.address && (
                                                <span className="flex items-center gap-1 text-xs text-white/60">
                                                    <MapPin size={10} /> {curProfile.address}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Spend Stats */}
                            <div className="grid grid-cols-3 gap-px bg-[#DAF1DE] shrink-0 border-b border-[#DAF1DE]">
                                {[
                                    { label: 'Total Orders', value: curProfile.totalOrders || 0 },
                                    { label: 'Total Spent', value: `$${(curProfile.totalSpent || 0).toFixed(2)}` },
                                    { label: 'Avg. Order', value: curProfile.totalOrders > 0 ? `$${((curProfile.totalSpent || 0) / curProfile.totalOrders).toFixed(2)}` : '$0' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white px-4 py-4 text-center">
                                        <p className="text-xs text-slate-400">{s.label}</p>
                                        <p className="font-bold text-[#051F20] mt-0.5">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Purchase History */}
                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-[#051F20] flex items-center gap-2">
                                        <ShoppingBag size={15} className="text-[#163932]" />
                                        Purchase History
                                        {profileData?.sales && (
                                            <span className="bg-[#DAF1DE] text-[#163932] text-xs px-2 py-0.5 rounded-full font-medium">
                                                {profileData.sales.length}
                                            </span>
                                        )}
                                    </h3>
                                    {curProfile.lastPurchase && (
                                        <span className="text-xs text-slate-400">
                                            Last: {new Date(curProfile.lastPurchase).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {profileLoading ? (
                                    <div className="space-y-3">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : profileData?.sales?.length === 0 ? (
                                    <div className="text-center py-16 text-slate-400">
                                        <ShoppingBag size={32} className="mx-auto mb-2 text-slate-200" />
                                        <p className="text-sm">No purchases yet</p>
                                        <p className="text-xs mt-1 text-slate-300">This customer hasn't made any purchases through the system</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(profileData?.sales || []).map(sale => (
                                            <InvoiceRow key={sale._id} sale={sale} />
                                        ))}
                                    </div>
                                )}

                                {/* Notes */}
                                {curProfile.notes && (
                                    <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                        <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                                        <p className="text-sm text-amber-900">{curProfile.notes}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ── Set Portal Password Modal ────────────────────────────────── */}
            <AnimatePresence>
                {pwModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                            <h2 className="text-lg font-bold text-[#051F20] mb-2 text-center">Enable Portal Access</h2>
                            <p className="text-xs text-slate-500 text-center mb-5">Set a password for <strong>{curProfile.name}</strong> to login to the customer portal.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setPwModal(false)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200">
                                    Cancel
                                </button>
                                <button onClick={handleSetPassword} disabled={saving || !newPw}
                                    className="flex-1 py-2.5 bg-[#163932] text-white rounded-xl text-sm font-medium hover:bg-[#0B2B26] disabled:opacity-50 transition-all">
                                    {saving ? 'Setting...' : 'Enable Access'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Add / Edit Modal ─────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-[#DAF1DE]">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-[#051F20]">
                                    {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-3.5">
                                {[
                                    { label: 'Full Name *', key: 'name', placeholder: 'e.g. Sarah Johnson', type: 'text' },
                                    { label: 'Email Address', key: 'email', placeholder: 'sarah@email.com', type: 'email' },
                                    { label: 'Phone Number', key: 'phone', placeholder: '+1 555-0100', type: 'tel' },
                                    { label: 'Address', key: 'address', placeholder: '123 Main St, City', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                                        <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
                                        placeholder="VIP customer, preferred payment, etc."
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] resize-none" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-5">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving || !form.name.trim()}
                                    className="flex-1 py-2.5 bg-[#163932] text-white rounded-xl text-sm font-medium hover:bg-[#0B2B26] disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                                    <Save size={15} /> {saving ? 'Saving...' : selectedCustomer ? 'Update Customer' : 'Add Customer'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Customers;
