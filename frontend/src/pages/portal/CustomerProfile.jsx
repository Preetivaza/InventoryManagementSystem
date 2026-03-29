import { useEffect, useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { motion } from 'framer-motion';
import {
    User, Mail, Phone, MapPin, Lock, Save, Edit3, X,
    CheckCircle, Crown, Star, Award, Users, ShoppingBag,
    DollarSign, Calendar, Shield
} from 'lucide-react';

const getTier = (spent) => {
    if (spent >= 5000) return { label: 'Platinum', icon: Crown, color: 'text-purple-600', bg: 'from-purple-600 to-purple-800', light: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (spent >= 2000) return { label: 'Gold', icon: Star, color: 'text-amber-600', bg: 'from-amber-500 to-amber-700', light: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (spent >= 500) return { label: 'Silver', icon: Award, color: 'text-slate-600', bg: 'from-slate-500 to-slate-700', light: 'bg-slate-50 text-slate-700 border-slate-200' };
    return { label: 'Bronze', icon: Users, color: 'text-orange-600', bg: 'from-orange-500 to-orange-700', light: 'bg-orange-50 text-orange-700 border-orange-200' };
};

const CustomerProfile = () => {
    const { customerInfo, portalApi, login } = useCustomerAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changePw, setChangePw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({ name: '', phone: '', address: '' });
    const [pwForm, setPwForm] = useState({ newPassword: '', confirm: '' });

    useEffect(() => {
        portalApi.get('/portal/me')
            .then(r => {
                setData(r.data);
                const c = r.data.customer;
                setForm({ name: c.name || '', phone: c.phone || '', address: c.address || '' });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await portalApi.put('/portal/me', form);
            setSuccess('Profile updated!');
            setEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) {
            alert('Passwords do not match'); return;
        }
        if (pwForm.newPassword.length < 6) {
            alert('Password must be at least 6 characters'); return;
        }
        setSaving(true);
        try {
            await portalApi.put('/portal/me', { password: pwForm.newPassword });
            setSuccess('Password changed successfully!');
            setChangePw(false);
            setPwForm({ newPassword: '', confirm: '' });
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-[#163932] border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const customer = data?.customer || {};
    const stats = data?.stats || {};
    const tier = getTier(stats.totalSpent || 0);
    const TierIcon = tier.icon;

    const memberSince = customer.createdAt
        ? new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        : '—';

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-[#051F20]">My Profile</h1>
                <p className="text-slate-500 text-sm">Manage your account details and preferences</p>
            </div>

            {success && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm">
                    <CheckCircle size={18} /> {success}
                </motion.div>
            )}

            {/* Profile Hero Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#DAF1DE] overflow-hidden">
                <div className={`bg-gradient-to-br ${tier.bg} p-8 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-16" />
                    <div className="relative flex items-center gap-5">
                        <div className="w-20 h-20 bg-white/20 border-4 border-white/30 rounded-2xl flex items-center justify-center text-4xl font-bold text-white">
                            {customer.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                            <p className="text-white/70 text-sm mt-0.5">{customer.email}</p>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border mt-2 text-xs font-bold ${tier.light}`}>
                                <TierIcon size={11} /> {tier.label} Member
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 divide-x divide-[#DAF1DE] border-b border-[#DAF1DE]">
                    {[
                        { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag },
                        { label: 'Total Spent', value: `$${(stats.totalSpent || 0).toFixed(2)}`, icon: DollarSign },
                        { label: 'Member Since', value: memberSince, icon: Calendar },
                    ].map(({ label, value, icon: Icon }, i) => (
                        <div key={i} className="p-4 text-center">
                            <Icon size={14} className="mx-auto text-slate-400 mb-1" />
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="font-bold text-[#051F20] text-sm mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Profile details */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-semibold text-[#051F20]">Account Information</h3>
                        {!editing ? (
                            <button onClick={() => setEditing(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#9FD2A7] text-[#163932] rounded-xl text-xs font-medium hover:bg-[#DAF1DE]">
                                <Edit3 size={12} /> Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(false)}
                                    className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-500 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button onClick={handleSaveProfile} disabled={saving}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#163932] text-white rounded-xl text-xs font-medium hover:bg-[#0B2B26] disabled:opacity-50">
                                    <Save size={12} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-4">
                            {[
                                { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your name' },
                                { label: 'Phone Number', key: 'phone', icon: Phone, placeholder: '+1 555-0100' },
                                { label: 'Address', key: 'address', icon: MapPin, placeholder: '123 Main St, City' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                                        <f.icon size={11} /> {f.label}
                                    </label>
                                    <input value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                                        placeholder={f.placeholder}
                                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {[
                                { label: 'Full Name', value: customer.name, icon: User },
                                { label: 'Email', value: customer.email || '—', icon: Mail },
                                { label: 'Phone', value: customer.phone || '—', icon: Phone },
                                { label: 'Address', value: customer.address || '—', icon: MapPin },
                            ].map(({ label, value, icon: Icon }, i) => (
                                <div key={i} className="flex items-start gap-3 py-3 border-b border-[#DAF1DE] last:border-0">
                                    <div className="w-8 h-8 bg-[#DAF1DE] rounded-lg flex items-center justify-center shrink-0">
                                        <Icon size={14} className="text-[#163932]" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">{label}</p>
                                        <p className="text-sm font-medium text-[#051F20] mt-0.5">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#DAF1DE] p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#051F20] flex items-center gap-2">
                        <Shield size={16} className="text-[#163932]" /> Security
                    </h3>
                    {!changePw && (
                        <button onClick={() => setChangePw(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#9FD2A7] text-[#163932] rounded-xl text-xs font-medium hover:bg-[#DAF1DE]">
                            <Lock size={12} /> Change Password
                        </button>
                    )}
                </div>

                {changePw ? (
                    <div className="space-y-3">
                        {[
                            { label: 'New Password', key: 'newPassword', placeholder: 'At least 6 characters' },
                            { label: 'Confirm Password', key: 'confirm', placeholder: 'Repeat new password' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="password" value={pwForm[f.key]}
                                        onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })}
                                        placeholder={f.placeholder}
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FD2A7]" />
                                </div>
                            </div>
                        ))}
                        <div className="flex gap-3 pt-1">
                            <button onClick={() => setChangePw(false)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50">
                                Cancel
                            </button>
                            <button onClick={handleChangePassword} disabled={saving || !pwForm.newPassword}
                                className="flex-1 py-2.5 bg-[#163932] text-white rounded-xl text-sm font-medium hover:bg-[#0B2B26] disabled:opacity-50 flex items-center justify-center gap-2">
                                <Save size={14} /> {saving ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">Your password is securely stored. Change it anytime.</p>
                )}
            </div>

            {/* Tier Card */}
            <div className={`rounded-3xl p-6 border bg-gradient-to-br ${tier.bg} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-16 translate-x-12" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <TierIcon size={22} className="text-white" />
                        <h3 className="font-bold text-lg">{tier.label} Member</h3>
                    </div>
                    <p className="text-white/70 text-sm mb-4">
                        You have spent <strong className="text-white">${(stats.totalSpent || 0).toFixed(2)}</strong> total.
                        {stats.totalSpent < 5000 && (
                            <> Spend <strong className="text-white">
                                ${(stats.totalSpent >= 2000 ? 5000 - stats.totalSpent : stats.totalSpent >= 500 ? 2000 - stats.totalSpent : 500 - stats.totalSpent).toFixed(2)}
                            </strong> more to reach the next tier.</>
                        )}
                    </p>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full"
                            style={{ width: `${Math.min(tier.progress || (stats.totalSpent / 500 * 100), 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-white/50 mt-1">
                        <span>$0</span>
                        <span>{stats.totalSpent >= 2000 ? '$5,000 Platinum' : stats.totalSpent >= 500 ? '$2,000 Gold' : '$500 Silver'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
