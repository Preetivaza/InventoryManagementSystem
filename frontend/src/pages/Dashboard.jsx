import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import {
    DollarSign, Package, AlertTriangle, TrendingUp, TrendingDown,
    Users, ShoppingCart, ArrowUpRight, ArrowDownRight, Bell, X, Download, RefreshCw
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// ─── Low Stock Alert Banner ───────────────────────────────────────────────────
const LowStockBanner = ({ count, items, onDismiss }) => {
    if (count === 0) return null;
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-pulse-once">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">
                    ⚠️ {count} product{count !== 1 ? 's' : ''} below minimum stock level
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                    {items?.slice(0, 3).map(p => `${p.name} (${p.quantity} left)`).join(' • ')}
                    {items?.length > 3 && ` • +${items.length - 3} more`}
                </p>
            </div>
            <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600 p-1">
                <X size={14} />
            </button>
        </div>
    );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, icon: Icon, iconBg, iconColor, change, changeLabel, delay }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE] hover:shadow-md transition-shadow"
        style={{ animation: `fadeInUp 0.4s ease ${delay || 0}s both` }}>
        <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon size={20} className={iconColor} />
            </div>
            {change !== undefined && change !== null && (
                <span className={`text-xs font-semibold flex items-center gap-0.5 px-2 py-1 rounded-lg ${change >= 0 ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(change)}%
                </span>
            )}
        </div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#051F20] mt-0.5 tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [topSelling, setTopSelling] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [showAlert, setShowAlert] = useState(true);
    const [dbStatus, setDbStatus] = useState('checking');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            const res = await api.get('/health');
            setDbStatus(res.data.database);
        } catch (e) {
            setDbStatus('error');
        }
    };

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [s, f, t, ls] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/analytics/forecast'),
                api.get('/analytics/top-selling'),
                api.get('/analytics/dead-stock'),
            ]);
            setStats(s.data);
            setForecast(f.data);
            setTopSelling(t.data.slice(0, 5));
            // low stock = items where qty <= minStockLevel
            const lsItems = await api.get('/products?pageNumber=1&limit=100');
            const low = (lsItems.data.products || []).filter(p => p.quantity <= p.minStockLevel);
            setLowStockItems(low);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleExport = async (type) => {
        try {
            const res = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { console.error(e); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#163932] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading dashboard...</p>
            </div>
        </div>
    );

    // ── Chart data ──────────────────────────────────────────────────────────────
    const dailyLabels = (stats?.dailyRevenue || []).map(d => {
        const dt = new Date(d._id);
        return dt.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    });

    const revenueLineData = {
        labels: dailyLabels,
        datasets: [
            {
                label: 'Revenue',
                data: (stats?.dailyRevenue || []).map(d => d.revenue),
                borderColor: '#163932',
                backgroundColor: 'rgba(22,57,50,0.08)',
                tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 5,
            },
            {
                label: 'Profit',
                data: (stats?.dailyRevenue || []).map(d => d.profit || 0),
                borderColor: '#8EB69B',
                backgroundColor: 'rgba(142,182,155,0.08)',
                tension: 0.4, fill: true, pointRadius: 2, borderDash: [4, 3],
            }
        ]
    };

    const forecastData = {
        labels: forecast?.forecast?.map(f => f.day) || [],
        datasets: [{
            label: 'Predicted Sales ($)',
            data: forecast?.forecast?.map(f => f.predictedSales) || [],
            borderColor: '#235347',
            backgroundColor: 'rgba(35,83,71,0.1)',
            tension: 0.4, fill: true,
        }]
    };

    const topSellingChart = {
        labels: topSelling.map(p => p.name.length > 15 ? p.name.substring(0, 15) + '…' : p.name),
        datasets: [{
            label: 'Revenue ($)',
            data: topSelling.map(p => parseFloat((p.revenue || 0).toFixed(2))),
            backgroundColor: ['#051F20', '#163932', '#235347', '#8EB69B', '#C8E8CE'],
            borderWidth: 0, borderRadius: 6,
        }]
    };

    const commonOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `$${v}` } }
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${dbStatus === 'connected' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100 animate-pulse'}`}>
                        <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        DB: {dbStatus}
                    </div>
                    <button onClick={() => { fetchAll(); checkHealth(); }} className="p-2 hover:bg-[#DAF1DE] rounded-xl text-slate-400 hover:text-[#163932] transition-colors" title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={() => handleExport('sales')} className="flex items-center gap-2 px-3 py-2 border border-[#9FD2A7] text-[#163932] rounded-xl text-sm hover:bg-[#DAF1DE] transition-colors">
                        <Download size={14} /> Export Sales
                    </button>
                </div>
            </div>

            {/* Low Stock Alert */}
            {showAlert && <LowStockBanner count={lowStockItems.length} items={lowStockItems} onDismiss={() => setShowAlert(false)} />}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard label="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    sub={`$${(stats?.revenue30 || 0).toFixed(0)} last 30 days`}
                    icon={DollarSign} iconBg="bg-[#C8E8CE]" iconColor="text-[#163932]"
                    change={stats?.revenueGrowth} delay={0} />
                <KPICard label="30-Day Profit" value={`$${(stats?.profit30 || 0).toFixed(2)}`}
                    sub="From completed sales"
                    icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600"
                    delay={0.05} />
                <KPICard label="Products" value={stats?.totalProducts || 0}
                    sub={`${stats?.lowStockCount || 0} low stock`}
                    icon={Package} iconBg="bg-blue-50" iconColor="text-blue-600"
                    delay={0.1} />
                <KPICard label="Customers" value={stats?.totalCustomers || 0}
                    sub={`${stats?.sales30Count || 0} sales this month`}
                    icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600"
                    delay={0.15} />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sales', value: stats?.totalSales || 0, icon: ShoppingCart, color: 'text-teal-600', bg: 'bg-teal-50' },
                    { label: 'Low Stock Alerts', value: stats?.lowStockCount || 0, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Total Refunds', value: `$${(stats?.totalRefunds30 || 0).toFixed(2)}`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Purchase Spent', value: `$${(stats?.totalPurchaseCost30 || 0).toFixed(2)}`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                ].map((k, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#DAF1DE] flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${k.bg}`}>
                            <k.icon size={16} className={k.color} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">{k.label}</p>
                            <p className="text-lg font-bold text-[#051F20]">{k.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1: Revenue line (14 days) + Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#051F20]">Revenue & Profit — Last 14 Days</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#163932] inline-block rounded" />Revenue</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#8EB69B] inline-block rounded border-dashed" />Profit</span>
                        </div>
                    </div>
                    <div className="h-52">
                        <Line data={revenueLineData} options={{ ...commonOpts, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#051F20]">7-Day Forecast</h3>
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${forecast?.trend === 'Up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {forecast?.trend === 'Up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {forecast?.trend}
                        </span>
                    </div>
                    <div className="h-52">
                        {(forecastData.labels.length > 0)
                            ? <Line data={forecastData} options={{ ...commonOpts, plugins: { legend: { display: false } } }} />
                            : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Insufficient data</div>}
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Top Products + Low Stock list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4">Top 5 Products by Revenue</h3>
                    <div className="h-48">
                        <Bar data={topSellingChart} options={{
                            ...commonOpts, indexAxis: 'y', scales: {
                                x: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `$${v}` } },
                                y: { grid: { display: false }, ticks: { color: '#334155', font: { size: 10 } } }
                            }
                        }} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" /> Low Stock Alerts ({lowStockItems.length})
                    </h3>
                    {lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Package size={32} className="mb-2 text-green-400" />
                            <p className="text-sm">All products are well stocked!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 overflow-y-auto max-h-48">
                            {lowStockItems.map(p => (
                                <div key={p._id} className="flex items-center justify-between px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                    <div>
                                        <p className="text-sm font-medium text-[#051F20]">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.sku} • {p.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-red-600">{p.quantity} left</p>
                                        <p className="text-xs text-slate-400">Min: {p.minStockLevel}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
