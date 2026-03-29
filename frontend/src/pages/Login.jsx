import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const res = await login(email, password);
        if (!res.success) {
            setError(res.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#DAF1DE]">
            {/* Background blobs for depth */}
            <div className="absolute top-10 left-10 w-96 h-96 bg-[#163932]/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#051F20]/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 w-full max-w-md relative z-10 bg-white border border-[#9FD2A7] shadow-xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#051F20] mb-2">InventoTrack</h1>
                    <p className="text-slate-500">Welcome back! Please login.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[#051F20] text-sm font-medium mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="glass-input pl-10 bg-white border-[#9FD2A7] text-slate-800 focus:border-[#163932] focus:ring-[#163932]/20"
                                placeholder="Manager@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#051F20] text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="glass-input pl-10 bg-white border-[#9FD2A7] text-slate-800 focus:border-[#163932] focus:ring-[#163932]/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary shadow-lg shadow-[#163932]/30"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>Demo Credentials:</p>
                    <p>Admin: admin@example.com / 123456</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

