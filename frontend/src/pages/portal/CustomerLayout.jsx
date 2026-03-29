import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { LayoutDashboard, User, ShoppingBag, LogOut, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
    { to: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/portal/orders', icon: ShoppingBag, label: 'My Orders' },
    { to: '/portal/profile', icon: User, label: 'My Profile' },
];

const CustomerLayout = () => {
    const { customerInfo, logout } = useCustomerAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/portal/login');
    };

    // Get tier
    const spent = customerInfo?.totalSpent || 0;
    const tier = spent >= 5000 ? { label: 'Platinum', color: 'text-purple-400' }
        : spent >= 2000 ? { label: 'Gold', color: 'text-amber-400' }
            : spent >= 500 ? { label: 'Silver', color: 'text-slate-400' }
                : { label: 'Bronze', color: 'text-orange-400' };

    return (
        <div className="min-h-screen flex" style={{ background: '#f0faf4' }}>
            {/* Sidebar */}
            <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="w-64 shrink-0 bg-gradient-to-b from-[#051F20] to-[#163932] flex flex-col shadow-xl">

                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#8EB69B] rounded-xl flex items-center justify-center">
                            <Package size={18} className="text-[#051F20]" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-none">InventoTrack</p>
                            <p className="text-[#9FD2A7] text-xs mt-0.5">Customer Portal</p>
                        </div>
                    </div>
                </div>

                {/* Customer info */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#9FD2A7] rounded-xl flex items-center justify-center text-[#051F20] font-bold text-base shrink-0">
                            {customerInfo?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{customerInfo?.name}</p>
                            <p className={`text-xs font-medium ${tier.color}`}>{tier.label} Member</p>
                        </div>
                    </div>
                    {customerInfo?.email && (
                        <p className="text-white/40 text-xs mt-2 truncate">{customerInfo.email}</p>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                                }`
                            }>
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-white/10">
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all">
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </motion.aside>

            {/* Main area */}
            <div className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="bg-white border-b border-[#DAF1DE] px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="text-sm text-slate-500">
                        Welcome back, <span className="font-semibold text-[#051F20]">{customerInfo?.name?.split(' ')[0]}</span> 👋
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Live account
                    </div>
                </div>

                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default CustomerLayout;
