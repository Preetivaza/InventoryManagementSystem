import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Package, ShoppingCart, BarChart2,
    TrendingUp, LogOut, Menu, X, User, Users,
    RotateCcw, FileText, ChevronDown, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';

const Layout = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [analyticsOpen, setAnalyticsOpen] = useState(false);

    const mainNav = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Inventory', path: '/products', icon: Package },
        { name: 'Purchases', path: '/purchases', icon: TrendingUp },
        { name: 'Sales & Billing', path: '/sales', icon: ShoppingCart },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Returns', path: '/returns', icon: RotateCcw },
    ];

    const analyticsNav = [
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    const navLinkClass = (isActive) =>
        `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isActive
            ? 'bg-[#C8E8CE] text-[#163932]'
            : 'text-slate-500 hover:bg-[#DAF1DE] hover:text-[#051F20]'
        }`;

    return (
        <div className="flex min-h-screen bg-[#f8fdfA]">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? '260px' : '72px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                className="bg-white border-r border-[#DAF1DE] fixed h-full z-20 hidden md:flex flex-col shadow-sm overflow-hidden"
            >
                {/* Logo */}
                <div className="p-5 flex items-center justify-between border-b border-[#DAF1DE] h-[68px] shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-[#163932] w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                            <span className="font-bold text-xs">IT</span>
                        </div>
                        {isSidebarOpen && (
                            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-bold text-[#051F20] tracking-tight whitespace-nowrap">
                                InventoTrack
                            </motion.h1>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
                    {isSidebarOpen && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main</p>}

                    {mainNav.map((item) => (
                        <NavLink key={item.path} to={item.path} end={item.path === '/'}>
                            {({ isActive }) => (
                                <div className={navLinkClass(isActive)}>
                                    <item.icon size={18} className={isActive ? 'text-[#163932]' : 'text-slate-400'} />
                                    {isSidebarOpen && <span>{item.name}</span>}
                                </div>
                            )}
                        </NavLink>
                    ))}

                    {/* Analytics group */}
                    {isSidebarOpen && (
                        <>
                            <div className="pt-3">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Insights</p>
                            </div>
                            <button onClick={() => setAnalyticsOpen(!analyticsOpen)}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-[#DAF1DE] hover:text-[#051F20] text-sm font-medium transition-colors">
                                <BarChart2 size={18} className="text-slate-400" />
                                <span className="flex-1 text-left">Analytics & Reports</span>
                                {analyticsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <AnimatePresence>
                                {analyticsOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="ml-4 pl-3 border-l border-[#DAF1DE] space-y-0.5 overflow-hidden">
                                        {analyticsNav.map(item => (
                                            <NavLink key={item.path} to={item.path}>
                                                {({ isActive }) => (
                                                    <div className={navLinkClass(isActive)}>
                                                        <item.icon size={16} className={isActive ? 'text-[#163932]' : 'text-slate-400'} />
                                                        <span>{item.name}</span>
                                                    </div>
                                                )}
                                            </NavLink>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {!isSidebarOpen && analyticsNav.map(item => (
                        <NavLink key={item.path} to={item.path}>
                            {({ isActive }) => (
                                <div className={`flex items-center justify-center px-3 py-3 rounded-xl transition-colors ${isActive ? 'bg-[#C8E8CE] text-[#163932]' : 'text-slate-400 hover:bg-[#DAF1DE]'}`} title={item.name}>
                                    <item.icon size={18} />
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-[#DAF1DE] shrink-0">
                    <div className={`flex items-center gap-3 ${isSidebarOpen ? 'px-2' : 'justify-center'}`}>
                        <div className="w-9 h-9 rounded-full bg-[#C8E8CE] flex items-center justify-center text-[#163932] font-bold shrink-0 text-sm border border-[#9FD2A7]">
                            {user?.name?.charAt(0) || <User size={14} />}
                        </div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[#051F20] text-sm font-medium truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role || 'Staff'}</p>
                            </div>
                        )}
                        <button onClick={logout} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-[68px] -right-3 bg-white border border-[#9FD2A7] rounded-full p-1 shadow text-slate-400 hover:text-[#051F20] transition-colors hidden md:flex"
                >
                    {isSidebarOpen ? <X size={12} /> : <Menu size={12} />}
                </button>
            </motion.aside>

            {/* Main */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-[260px]' : 'md:ml-[72px]'} ml-0 p-6 lg:p-8`}>
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>

            <AIAssistant />
        </div>
    );
};

export default Layout;
