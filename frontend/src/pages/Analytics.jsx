import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    AlertCircle, PieChart, TrendingUp, Package, Brain,
    BarChart2, DollarSign, Download, RefreshCw, AlertTriangle, Zap
} from 'lucide-react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Filler);

const PALETTE = ['#051F20', '#163932', '#235347', '#8EB69B', '#9FD2A7', '#C8E8CE', '#DAF1DE'];

const Analytics = () => {
    const [deadStock, setDeadStock] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [aiInsights, setAiInsights] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [exporting, setExporting] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => { fetchAll(); fetchAI(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [ds, cat, top, fc] = await Promise.all([
                api.get('/analytics/dead-stock').catch(() => ({ data: [] })),
                api.get('/analytics/categories').catch(() => ({ data: [] })),
                api.get('/analytics/top-selling').catch(() => ({ data: [] })),
                api.get('/analytics/forecast').catch(() => ({ data: null })),
            ]);
            setDeadStock(ds.data || []);
            setCategories(cat.data || []);
            setTopSelling(top.data || []);
            setForecast(fc.data);
        } catch (e) {
            console.error(e);
            setError("Could not connect to the analytics server. Please ensure the backend is running and MongoDB is connected.");
        }
        finally { setLoading(false); }
    };

    const fetchAI = async () => {
        setAiLoading(true);
        try {
            const [insights, anomaly] = await Promise.all([
                api.get('/ai/reorder-recommendations').catch(() => ({ data: null })),
                api.get('/ai/anomalies').catch(() => ({ data: { anomalies: [] } })),
            ]);
            setAiInsights(insights?.data);
            setAnomalies(anomaly?.data?.anomalies || []);
        } catch (e) { console.error(e); }
        finally { setAiLoading(false); }
    };

    const handleExport = async (type) => {
        setExporting(type);
        try {
            const res = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`; a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) { console.error(e); }
        finally { setExporting(''); }
    };

    // ── Chart Data ───────────────────────────────────────────────────────────
    const categoryDonut = {
        labels: categories.map(c => c._id || 'Other'),
        datasets: [{ data: categories.map(c => parseFloat((c.revenue || 0).toFixed(2))), backgroundColor: PALETTE, borderWidth: 0 }]
    };

    const topBar = {
        labels: topSelling.map(p => p.name?.length > 14 ? p.name.substring(0, 14) + '…' : p.name),
        datasets: [
            { label: 'Revenue (₹)', data: topSelling.map(p => parseFloat((p.revenue || 0).toFixed(2))), backgroundColor: '#163932', borderRadius: 5 },
            { label: 'Profit (₹)', data: topSelling.map(p => parseFloat((p.profit || 0).toFixed(2))), backgroundColor: '#8EB69B', borderRadius: 5 }
        ]
    };

    const forecastLine = {
        labels: forecast?.forecast?.map(f => f.day) || [],
        datasets: [{
            label: 'Predicted Revenue (₹)',
            data: forecast?.forecast?.map(f => f.predictedSales) || [],
            borderColor: '#163932', backgroundColor: 'rgba(22,57,50,0.08)',
            tension: 0.4, fill: true, pointRadius: 4,
        }]
    };

    const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#163932] border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Loading analytics...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-red-100 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
                <p className="text-slate-500 max-w-sm mt-1">{error}</p>
            </div>
            <button onClick={fetchAll} className="px-6 py-2 bg-[#163932] text-white rounded-xl hover:bg-[#051F20] transition-colors flex items-center gap-2">
                <RefreshCw size={16} /> Try Again
            </button>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-2xl font-bold text-[#051F20]">Inventory Intelligence</h1>
                    <p className="text-slate-500 text-sm">AI-powered insights and performance analytics</p>
                </motion.div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { fetchAll(); fetchAI(); }} className="p-2 hover:bg-[#DAF1DE] rounded-xl text-slate-400 hover:text-[#163932] transition-colors">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Export Strip */}
            <div className="bg-white rounded-2xl border border-[#DAF1DE] p-4 flex items-center gap-3 flex-wrap shadow-sm">
                <Download size={15} className="text-slate-400" />
                <span className="text-sm text-slate-600 font-medium">Quick Export:</span>
                {['sales', 'products', 'purchases', 'customers'].map(t => (
                    <button key={t} onClick={() => handleExport(t)} disabled={!!exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#9FD2A7] text-[#163932] rounded-lg text-xs font-medium hover:bg-[#DAF1DE] transition-all disabled:opacity-50 capitalize">
                        {exporting === t ? <RefreshCw size={11} className="animate-spin" /> : <Download size={11} />}
                        {t} CSV
                    </button>
                ))}
            </div>

            {/* Empty State Banner */}
            {categories.length === 0 && topSelling.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                    <Package size={40} className="text-amber-400" />
                    <div>
                        <h3 className="font-bold text-amber-900">No Data Available</h3>
                        <p className="text-sm text-amber-700 max-w-md">Reports and analytics require sales and product data. Try seeding the database or making some sales first.</p>
                    </div>
                    <a href={`${import.meta.env.VITE_API_URL}/setup.html`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                        Initialize Sample Data
                    </a>
                </motion.div>
            )}

            {/* Row 1: Category Revenue + Top Products (Revenue vs Profit) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <PieChart size={16} className="text-[#163932]" /> Revenue by Category
                    </h3>
                    <div className="h-56">
                        {categories.length > 0 ? (
                            <Doughnut data={categoryDonut} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 12, font: { size: 10 } } } } }} />
                        ) : <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No category data</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <BarChart2 size={16} className="text-[#163932]" /> Top Products — Revenue vs Profit
                    </h3>
                    {topSelling.length > 0 && (
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-[#163932] rounded inline-block" />Revenue</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-[#8EB69B] rounded inline-block" />Profit</span>
                        </div>
                    )}
                    <div className="h-44">
                        {topSelling.length > 0 ? (
                            <Bar data={topBar} options={{
                                ...chartOpts, scales: {
                                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                                    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `₹${v}` } }
                                }
                            }} />
                        ) : <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">No sales data</div>}
                    </div>
                </div>
            </div>

            {/* Row 2: Forecast + Dead Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#051F20] flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#163932]" /> 7-Day Sales Forecast
                        </h3>
                        {forecast && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 ${forecast.trend === 'Up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {forecast.trend === 'Up' ? '↑' : '↓'} {forecast.trend}ward Trend
                            </span>
                        )}
                    </div>
                    <div className="h-52">
                        {forecastLine.labels.length > 0 ? (
                            <Line data={forecastLine} options={{
                                ...chartOpts, plugins: { legend: { display: false } }, scales: {
                                    x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                                    y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 10 }, callback: v => `₹${v}` } }
                                }
                            }} />
                        ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">Insufficient data for forecast</div>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-red-500" />
                        <h3 className="font-semibold text-[#051F20]">Dead Stock Risk ({deadStock.length})</h3>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Items with no sales in the past 30 days</p>
                    <div className="space-y-2.5 overflow-y-auto max-h-48">
                        {deadStock.length > 0 ? deadStock.map(p => {
                            const deadValue = (p.price * p.quantity).toFixed(2);
                            return (
                                <div key={p._id} className="flex items-center justify-between px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">
                                    <div>
                                        <p className="text-sm font-medium text-[#051F20]">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.sku} • Qty: {p.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-red-600">₹{deadValue}</p>
                                        <p className="text-xs text-slate-400">tied up</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Package size={28} className="mb-2 text-green-300" />
                                <p className="text-sm">No dead stock detected 🎉</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Reorder Recommendations */}
            <div className="bg-gradient-to-br from-[#051F20] to-[#235347] rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Brain size={20} className="text-[#8EB69B]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider text-sm">AI Reorder Intelligence</h3>
                        <p className="text-xs text-[#8EB69B]">Smart restocking suggestions based on sales velocity</p>
                    </div>
                    {aiLoading && <div className="ml-auto w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </div>
                {aiInsights ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                        {(aiInsights.recommendations || []).slice(0, 4).map((rec, i) => (
                            <div key={i} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                    <p className="font-semibold text-white text-sm">{rec.product || rec.productName}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rec.urgency?.toLowerCase() === 'high' ? 'bg-red-400/30 text-red-200' : 'bg-amber-400/20 text-amber-200'}`}>
                                        {rec.urgency || 'Medium'}
                                    </span>
                                </div>
                                <p className="text-xs text-[#9FD2A7]">Reorder qty: <strong className="text-white">{rec.recommendedOrderQty || rec.recommendedOrder}</strong></p>
                                {rec.reason && <p className="text-xs text-white/60 mt-2 line-clamp-1">{rec.reason}</p>}
                            </div>
                        ))}
                        {(!aiInsights.recommendations || aiInsights.recommendations.length === 0) && (
                            <div className="col-span-2 text-center py-6 text-white/60">
                                <Zap size={20} className="mx-auto mb-2 text-[#8EB69B]" />
                                <p className="text-sm">All stock levels are currently healthy</p>
                            </div>
                        )}
                    </div>
                ) : !aiLoading ? (
                    <p className="text-white/50 text-sm italic">AI insights unavailable. Try again later.</p>
                ) : null}
            </div>

            {/* Anomaly Detection */}
            {anomalies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-[#DAF1DE]">
                    <h3 className="font-semibold text-[#051F20] mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-500" /> Sales Anomalies Detected ({anomalies.length})
                    </h3>
                    <div className="space-y-2">
                        {anomalies.map((a, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-[#051F20]">{a.product}</p>
                                    {a.description && <p className="text-xs text-slate-500">{a.description}</p>}
                                </div>
                                {a.impact && (
                                    <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${a.impact === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                        {a.impact} impact
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default Analytics;
