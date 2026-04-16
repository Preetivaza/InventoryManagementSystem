import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart2, TrendingUp, TrendingDown, DollarSign, Download,
    Calendar, Package, ShoppingCart, RefreshCw, AlertCircle,
    PieChart, Info
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } },
};

const Reports = () => {
    const [monthly, setMonthly] = useState([]);
    const [categories, setCategories] = useState([]);
    const [profit, setProfit] = useState(null);
    const [topSelling, setTopSelling] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState('');
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [m, c, p, t] = await Promise.all([
                api.get('/analytics/monthly').catch(() => ({ data: [] })),
                api.get('/analytics/categories').catch(() => ({ data: [] })),
                api.get('/analytics/profit').catch(() => ({ data: null })),
                api.get('/analytics/top-selling').catch(() => ({ data: [] })),
            ]);
            setMonthly(m.data || []);
            setCategories(c.data || []);
            setProfit(p.data);
            setTopSelling(t.data || []);
        } catch (e) {
            console.error(e);
            setError("Unable to load report data. Please check your backend connection.");
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const res = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { console.error(e); }
        finally { setExporting(''); }
    };

    const monthlyChart = {
        labels: monthly.map(m => m.month),
        datasets: [
            {
                label: 'Revenue',
                data: monthly.map(m => m.revenue),
                backgroundColor: 'rgba(22,57,50,0.75)',
                borderRadius: 4,
            },
            {
                label: 'Profit',
                data: monthly.map(m => m.profit),
                backgroundColor: 'rgba(158,210,167,0.85)',
                borderRadius: 4,
            },
            {
                label: 'Purchase Cost',
                data: monthly.map(m => m.cost),
                backgroundColor: 'rgba(250,180,100,0.7)',
                borderRadius: 4,
            }
        ]
    };

    const categoryChart = {
        labels: categories.map(c => c._id || 'Uncategorized'),
        datasets: [{
            data: categories.map(c => c.revenue || 0),
            backgroundColor: ['#163932', '#235347', '#8EB69B', '#9FD2A7', '#C8E8CE', '#DAF1DE', '#f0faf2'],
            borderWidth: 0,
        }]
    };

    const green = ['#163932', '#235347', '#8EB69B', '#9FD2A7', '#C8E8CE'];

    if (error) return (
        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl p-10 border border-red-100 shadow-sm">
            <AlertCircle size={48} className="text-red-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Oops! Something went wrong</h2>
            <p className="text-slate-500 text-center max-w-md mt-2 mb-6">{error}</p>
            <button onClick={fetchAll} className="flex items-center gap-2 px-6 py-2.5 bg-[#163932] text-white rounded-xl hover:bg-[#051F20] transition-colors">
                <RefreshCw size={16} /> Try Again
            </button>
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#051F20]">Financial Reports</h1>
                    <p className="text-slate-500 text-sm mt-1">Detailed breakdown of revenue, costs, and profitability</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchAll} className="flex items-center gap-2 text-slate-500 hover:text-[#163932] text-sm px-3 py-2 rounded-xl hover:bg-[#DAF1DE] transition-colors">
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Profit KPIs */}
            {profit ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Revenue', value: `₹${(profit.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'bg-teal-50 text-teal-700' },
                        { label: 'Total Profit', value: `₹${(profit.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
                        { label: 'Total Costs', value: `₹${(profit.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingDown, color: 'bg-orange-50 text-orange-700' },
                        { label: 'Profit Margin', value: `${profit.margin || 0}%`, icon: BarChart2, color: 'bg-blue-50 text-blue-700' },
                    ].map((kpi, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE]">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
                                <kpi.icon size={18} />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{kpi.label}</p>
                            <p className="text-xl font-bold text-[#051F20] mt-0.5 tracking-tight">{kpi.value}</p>
                        </motion.div>
                    ))}
                </div>
            ) : !loading && (
                <div className="bg-white rounded-2xl p-6 border border-dashed border-[#8EB69B] text-center">
                    <Info size={24} className="mx-auto text-[#8EB69B] mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Insufficient sales data to calculate financial KPIs</p>
                </div>
            )}

            {/* CSV Exports */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#DAF1DE]">
                <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2"><Download size={16} className="text-[#163932]" /> Export Documents</h3>
                <div className="flex flex-wrap gap-3">
                    {[
                        { type: 'sales', label: 'Sales History', icon: ShoppingCart },
                        { type: 'products', label: 'Full Inventory', icon: Package },
                        { type: 'purchases', label: 'Purchase Logs', icon: TrendingUp },
                        { type: 'customers', label: 'Customer List', icon: BarChart2 },
                    ].map(({ type, label, icon: Icon }) => (
                        <button key={type} onClick={() => handleExport(type)} disabled={!!exporting}
                            className="flex items-center gap-2 px-4 py-2 border border-[#9FD2A7] text-[#163932] rounded-xl text-xs font-semibold hover:bg-[#DAF1DE] transition-all disabled:opacity-50">
                            {exporting === type ? <RefreshCw size={13} className="animate-spin" /> : <Icon size={13} />}
                            {exporting === type ? 'Preparing...' : label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Monthly Revenue & Profit Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2"><Calendar size={16} className="text-[#163932]" /> Sales & Profit Performance</h3>
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <RefreshCw size={24} className="animate-spin text-[#8EB69B]" />
                        <span className="text-xs">Generating report...</span>
                    </div>
                ) : monthly.length > 0 ? (
                    <div className="h-64">
                        <Bar data={monthlyChart} options={{
                            ...chartDefaults, scales: {
                                x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                                y: { grid: { color: '#f0faf2' }, ticks: { font: { size: 10 }, callback: v => `₹${v}` } }
                            }
                        }} />
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center border border-dashed border-slate-100 rounded-xl text-slate-400 text-sm italic">
                        No monthly data available
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Revenue Donut */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <PieChart size={16} className="text-[#163932]" /> Category Revenue
                    </h3>
                    {loading ? <div className="h-52 flex items-center justify-center text-slate-400">Loading...</div> : categories.length > 0 ? (
                        <div className="h-52">
                            <Doughnut data={categoryChart} options={{ ...chartDefaults, cutout: '65%' }} />
                        </div>
                    ) : (
                        <div className="h-52 flex items-center justify-center text-slate-400 text-sm italic">No category data</div>
                    )}
                </div>

                {/* Top profitable products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#163932]" /> Top Products by Profit
                    </h3>
                    {loading ? <div className="h-52 flex items-center justify-center text-slate-400">Loading...</div> : (profit?.topProfitProducts || []).length > 0 ? (
                        <div className="space-y-4 overflow-y-auto max-h-52 pr-2">
                            {(profit.topProfitProducts || []).slice(0, 6).map((p, i) => {
                                const maxProfit = profit.topProfitProducts[0].profit || 1;
                                const pct = Math.round((p.profit / maxProfit) * 100);
                                return (
                                    <div key={p._id || i}>
                                        <div className="flex items-center justify-between text-xs mb-1.5">
                                            <span className="font-semibold text-[#051F20] truncate max-w-[70%]">{p.name}</span>
                                            <span className="text-green-600 font-bold">₹{(p.profit || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="h-1.5 bg-[#DAF1DE] rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full rounded-full" style={{ backgroundColor: green[i % green.length] }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-52 flex items-center justify-center text-slate-400 text-sm italic">No product data available</div>
                    )}
                </div>
            </div>

            {/* Monthly table summary */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-[#DAF1DE] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#DAF1DE] bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-semibold text-[#051F20] text-sm">Monthly Performance Summary</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Auto-Generated List</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#DAF1DE] text-[#051F20] text-[10px] font-bold uppercase tracking-wider">
                                {['Month', 'Orders', 'Revenue', 'Purchase Cost', 'Refunds', 'Net Profit'].map(h => (
                                    <th key={h} className="text-left px-6 py-3.5 tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {monthly.length > 0 ? monthly.map((m, i) => (
                                <tr key={i} className="hover:bg-[#f0faf2cc] transition-colors group">
                                    <td className="px-6 py-4 text-xs font-bold text-[#051F20]">{m.month}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{m.orders} items</td>
                                    <td className="px-6 py-4 text-xs font-bold text-[#163932]">₹{(m.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-orange-600">₹{(m.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4 text-xs font-medium text-red-400">-₹{(m.refunds || 0).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-xs font-black text-green-600">₹{(m.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400 text-xs italic">No data records found in historical logs</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Reports;
