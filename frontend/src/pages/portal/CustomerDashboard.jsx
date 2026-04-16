import { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { motion } from 'framer-motion';
import {
    ShoppingBag, DollarSign, TrendingUp, Calendar, FileText,
    Package, CreditCard, Crown, Star, Award, Users, ArrowUpRight, Clock
} from 'lucide-react';

const getTier = (spent) => {
    if (spent >= 5000) return { label: 'Platinum', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', progress: 100 };
    if (spent >= 2000) return { label: 'Gold', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', progress: (spent / 5000) * 100 };
    if (spent >= 500) return { label: 'Silver', icon: Award, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', progress: (spent / 2000) * 100 };
    return { label: 'Bronze', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', progress: (spent / 500) * 100 };
};

const nextTierInfo = (spent) => {
    if (spent >= 5000) return null;
    if (spent >= 2000) return { next: 'Platinum', need: 5000 - spent };
    if (spent >= 500) return { next: 'Gold', need: 2000 - spent };
    return { next: 'Silver', need: 500 - spent };
};

const KPICard = ({ label, value, sub, icon: Icon, iconBg, iconColor, delay }) => (
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

const CustomerDashboard = () => {
    const { portalApi, customerInfo } = useCustomerAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        portalApi.get('/portal/me')
            .then(r => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#163932] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const { customer, sales = [], stats = {} } = data || {};
    const tier = getTier(stats.totalSpent || 0);
    const TierIcon = tier.icon;
    const nextTier = nextTierInfo(stats.totalSpent || 0);
    const recentSales = sales.slice(0, 5);

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

    return (
        <div className="space-y-6">
            {/* Welcome header */}
            <div className="bg-gradient-to-br from-[#051F20] to-[#235347] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-20" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-8" />
                <div className="relative">
                    <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
                        <div>
                            <p className="text-[#9FD2A7] text-sm font-medium mb-1">Good evening 👋</p>
                            <h1 className="text-3xl font-bold">{customer?.name?.split(' ')[0]}</h1>
                            <p className="text-white/60 text-sm mt-1">{customer?.email}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${tier.bg} ${tier.border}`}>
                            <TierIcon size={16} className={tier.color} />
                            <span className={`text-sm font-bold ${tier.color}`}>{tier.label} Member</span>
                        </div>
                    </div>

                    {/* Tier progress */}
                    {nextTier && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                                <span>{tier.label} Tier</span>
                                <span>₹{nextTier.need.toFixed(2)} more to <strong className="text-white">{nextTier.next}</strong></span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(tier.progress, 100)}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-gradient-to-r from-[#8EB69B] to-[#9FD2A7] rounded-full" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Orders" value={stats.totalOrders || 0}
                    sub="All time" icon={ShoppingBag} iconBg="bg-[#C8E8CE]" iconColor="text-[#163932]" delay={0} />
                <KPICard label="Total Spent" value={`₹${(stats.totalSpent || 0).toFixed(2)}`}
                    sub="Lifetime value" icon={DollarSign} iconBg="bg-green-50" iconColor="text-green-600" delay={0.05} />
                <KPICard label="Avg. Order" value={`₹${(stats.avgOrder || 0).toFixed(2)}`}
                    sub="Per purchase" icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600" delay={0.1} />
                <KPICard label="Last Purchase"
                    value={customer?.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
                    sub={customer?.lastPurchase ? new Date(customer.lastPurchase).getFullYear() : '—'}
                    icon={Calendar} iconBg="bg-purple-50" iconColor="text-purple-600" delay={0.15} />
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#DAF1DE] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#DAF1DE] flex items-center justify-between">
                    <h2 className="font-semibold text-[#051F20] flex items-center gap-2">
                        <Clock size={16} className="text-[#163932]" /> Recent Orders
                    </h2>
                    <a href="/portal/orders" className="text-xs text-[#163932] font-medium hover:underline flex items-center gap-1">
                        View all <ArrowUpRight size={12} />
                    </a>
                </div>

                {recentSales.length === 0 ? (
                    <div className="text-center py-16 text-slate-300">
                        <ShoppingBag size={36} className="mx-auto mb-2" />
                        <p className="text-sm">No orders yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#DAF1DE]">
                        {recentSales.map((sale, i) => (
                            <motion.div key={sale._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-6 py-4 flex items-center justify-between hover:bg-[#f9fdfb] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#DAF1DE] rounded-xl flex items-center justify-center">
                                        <Package size={16} className="text-[#163932]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#051F20] text-sm">{sale.invoiceId}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                            <CreditCard size={10} /> {sale.paymentMethod || 'Cash'}
                                            <span>•</span>
                                            {sale.products?.length} item{sale.products?.length !== 1 ? 's' : ''}
                                            <span>•</span>
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold text-[#051F20]">₹{sale.totalAmount?.toFixed(2)}</p>
                                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                            {sale.status || 'Completed'}
                                        </span>
                                    </div>
                                    <button onClick={() => downloadInvoice(sale)} title="Download Invoice"
                                        className="p-2 hover:bg-[#C8E8CE] rounded-xl text-slate-400 hover:text-[#163932] transition-colors">
                                        <FileText size={15} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* What's in orders summary */}
            {sales.length > 0 && (() => {
                const productMap = {};
                sales.forEach(s => s.products?.forEach(p => {
                    const name = p.product?.name || 'Unknown';
                    productMap[name] = (productMap[name] || 0) + p.quantity;
                }));
                const top = Object.entries(productMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
                return (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#DAF1DE] p-6">
                        <h2 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#163932]" /> Your Most Purchased
                        </h2>
                        <div className="space-y-3">
                            {top.map(([name, qty], i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-[#DAF1DE] rounded-lg flex items-center justify-center text-xs font-bold text-[#163932]">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-[#051F20] truncate">{name}</p>
                                            <span className="text-xs text-slate-500 shrink-0 ml-2">{qty} units</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-[#163932] to-[#8EB69B] rounded-full"
                                                style={{ width: `${(qty / top[0][1]) * 100}%` }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default CustomerDashboard;
