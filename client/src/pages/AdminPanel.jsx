import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, ShieldCheck, UserCheck, Activity, Search } from 'lucide-react';

export default function AdminPanel() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Placeholder: In production, use adminAPI.getUsers()
            // Simulating API delay
            await new Promise(r => setTimeout(r, 800));
            
            // Mock data for demonstration
            setUsers([
                { _id: '1', username: 'alex_dev', email: 'alex@techplus.com', role: 'admin', isVerified: true, createdAt: '2024-01-15' },
                { _id: '2', username: 'sarah_code', email: 'sarah@gmail.com', role: 'user', isVerified: true, createdAt: '2024-02-10' },
                { _id: '3', username: 'mike_stack', email: 'mike@outlook.com', role: 'user', isVerified: false, createdAt: '2024-03-05' },
                { _id: '4', username: 'emma_logic', email: 'emma@techplus.com', role: 'user', isVerified: true, createdAt: '2024-03-12' },
            ]);
        } catch (error) {
            addToast('Failed to fetch users', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        if (user?.role !== 'admin') {
            addToast('Access denied. Admin panel is only for administrators.', 'error');
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user, navigate, addToast, fetchUsers]);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setUsers(users.filter(u => u._id !== userId));
                addToast('User deleted successfully', 'success');
            } catch (error) {
                addToast('Failed to delete user', 'error');
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { label: 'Total Members', value: users.length, icon: Users, color: 'text-blue-400' },
        { label: 'Verified', value: users.filter(u => u.isVerified).length, icon: UserCheck, color: 'text-green-400' },
        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'text-purple-400' },
    ];

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#7c3aed]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glows */}
            <div className="glow-purple w-[500px] h-[500px] -top-48 -left-48" />
            <div className="glow-indigo w-[400px] h-[400px] bottom-0 -right-20" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 text-[10px] font-black text-[#a855f7] uppercase tracking-[0.3em] mb-4"
                    >
                        <ShieldCheck size={14} />
                        System Administration
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4"
                    >
                        Admin Control Center
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 max-w-xl"
                    >
                        Monitor user activity, manage permissions, and oversee the TechPlus ecosystem from a unified command interface.
                    </motion.p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            className="glass p-6 group hover:border-[#7c3aed]/30 transition-all duration-500"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <Activity size={16} className="text-white/10" />
                            </div>
                            <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Management Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="glass overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            User Directory
                            <span className="text-[10px] font-black bg-white/5 px-2 py-0.5 rounded text-white/40">{users.length}</span>
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#7c3aed]/50 transition-all w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-8 py-5">User Identity</th>
                                    <th className="px-8 py-5">Role</th>
                                    <th className="px-8 py-5">Verification</th>
                                    <th className="px-8 py-5">Joined</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {filteredUsers.map((u, idx) => (
                                        <motion.tr 
                                            key={u._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-[#a855f7] transition-colors">{u.username}</span>
                                                    <span className="text-[11px] text-white/30">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-white/5 text-white/40'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'}`} />
                                                    <span className="text-[11px] font-medium text-white/60">{u.isVerified ? 'Verified' : 'Pending'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[11px] font-mono text-white/30 uppercase">{u.createdAt}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                                                    title="Remove User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-white/20 font-bold uppercase tracking-widest text-sm">No personnel matching your query</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
