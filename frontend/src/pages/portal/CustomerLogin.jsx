import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';

const CustomerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useCustomerAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/portal/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #051F20 0%, #163932 50%, #235347 100%)' }}>
            {/* Left panel – branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-14">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8EB69B] rounded-xl flex items-center justify-center">
                        <ShoppingBag size={20} className="text-[#051F20]" />
                    </div>
                    <span className="text-white font-bold text-xl">InventoTrack</span>
                </div>

                <div>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles size={16} className="text-[#9FD2A7]" />
                            <span className="text-[#9FD2A7] text-sm font-medium">Customer Portal</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
                            Your orders,<br />
                            <span className="text-[#8EB69B]">at a glance.</span>
                        </h1>
                        <p className="text-white/60 text-lg leading-relaxed max-w-md">
                            View your complete purchase history, download invoices, track your spending, and manage your profile — all in one place.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-12 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Order History', icon: '📦' },
                            { label: 'Download Invoices', icon: '🧾' },
                            { label: 'Spending Insights', icon: '📊' },
                        ].map((f, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                                <div className="text-2xl mb-2">{f.icon}</div>
                                <p className="text-white/80 text-sm font-medium">{f.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <p className="text-white/30 text-sm">© 2026 InventoTrack · Customer Portal</p>
            </div>

            {/* Right panel – form */}
            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-8 h-8 bg-[#163932] rounded-lg flex items-center justify-center">
                            <ShoppingBag size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-[#051F20]">InventoTrack</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#051F20]">Welcome back</h2>
                        <p className="text-slate-500 mt-1 text-sm">Sign in to your customer account</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                            <span className="text-base">⚠️</span> {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] focus:border-transparent" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                    placeholder="Your password"
                                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7] focus:border-transparent" />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3.5 bg-[#163932] text-white rounded-xl font-semibold text-sm hover:bg-[#0B2B26] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#163932]/20 mt-2">
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            Don't have access? Contact the store to set up your portal account.
                        </p>
                        <a href="/login" className="text-xs text-[#163932] font-medium hover:underline mt-2 block">
                            ← Back to Admin Login
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CustomerLogin;
