import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ProfileEdit from './ProfileEdit';
import { userAPI } from '../config/api';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%237c3aed' rx='16'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%23ffffff40'/%3E%3Cellipse cx='40' cy='68' rx='24' ry='18' fill='%23ffffff30'/%3E%3C/svg%3E";

// â”€â”€ ICONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const IconProfile = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);
const IconHistory = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
    </svg>
);
const IconSaved = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
    </svg>
);
const IconDownload = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
const IconPlay = () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M5 3l14 9-14 9V3z"/>
    </svg>
);
const IconOpen = () => (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
);
const IconVerified = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
    </svg>
);
const IconShield = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const IconStar = () => (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);
const IconCalendar = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
);
const IconEmail = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
);
const IconEdit = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

// â”€â”€ TAB CONFIG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TABS = [
    { id: 'profile',   label: 'Profile',             Icon: IconProfile  },
    { id: 'history',   label: 'Watch History',        Icon: IconHistory  },
    { id: 'saved',     label: 'Saved',                Icon: IconSaved    },
    { id: 'downloads', label: 'Downloaded Roadmaps',  Icon: IconDownload },
];

// â”€â”€ EMPTY STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EmptyState({ icon, message, sub }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/20">
                {icon}
            </div>
            <p className="text-white/30 text-sm font-bold uppercase tracking-widest">{message}</p>
            {sub && <p className="text-white/15 text-xs max-w-[260px] leading-relaxed">{sub}</p>}
        </div>
    );
}

// â”€â”€ STAT CHIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatChip({ label, value, accent }) {
    return (
        <div className="flex flex-col gap-1 p-3 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all min-w-0">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] text-white/30 leading-tight">{label}</span>
            <span className={`text-lg sm:text-xl font-black ${accent ? 'text-[#a855f7]' : 'text-white'}`}>{value}</span>
        </div>
    );
}

// â”€â”€ PROFILE PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProfilePanel({ user, createdDate, onEdit, savedHackathons = [] }) {
    const name = user?.username || user?.name || user?.email?.split('@')[0] || 'Member';
    const email = user?.email || 'â€”';
    const profileImageSrc = user?.profileImage || user?.avatar || null;
    const watchCount   = user?.watchHistory?.length    || 0;
    const downloadCount= user?.downloadedRoadmaps?.length || 0;
    const hackathonCount = savedHackathons?.length || 0;
    const bookmarkCount = user?.bookmarks?.length || 0;

    return (
        <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="flex flex-col gap-4 sm:gap-6">

            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 bg-gradient-to-br from-[#0f0f12] to-[#0a0a0c] p-4 sm:p-6 md:p-10">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#7c3aed] opacity-[0.07] blur-[90px] -mr-20 -mt-20 rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#a855f7] opacity-[0.04] blur-[70px] -ml-10 -mb-10 rounded-full pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3 sm:gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-[1.25rem] sm:rounded-[1.75rem] overflow-hidden border-2 border-[#7c3aed]/40 shadow-[0_0_30px_rgba(124,58,237,0.2)] bg-[#0d0d0f]">
                            <img
                                src={profileImageSrc || DEFAULT_AVATAR}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
                            />
                        </div>
                        {user?.isVerified && (
                            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500 border-2 border-[#0a0a0c] flex items-center justify-center">
                                <svg width="10" height="10" fill="white" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                        )}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap mb-1">
                            <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-white uppercase tracking-tighter truncate max-w-full">{name}</h1>
                            {user?.role === 'admin' && (
                                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                                    <IconStar /> Admin
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-white/30 text-[10px] sm:text-xs font-bold mb-2 min-w-0">
                            <IconEmail />
                            <span className="truncate">{email}</span>
                        </div>
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-[#a855f7] uppercase tracking-widest">
                                â¬¡ Administrator
                            </div>
                        )}
                    </div>

                    {/* Edit button */}
                    <button
                        onClick={onEdit}
                        className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] transition-all active:scale-95"
                    >
                        <IconEdit /> <span className="hidden sm:inline">Edit</span>
                    </button>
                </div>

                {/* Member badge */}
                <div className="relative z-10 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/5 flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest">
                        <IconCalendar /> <span className="truncate">Since {createdDate}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${user?.isVerified ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                        <IconVerified /> {user?.isVerified ? 'Verified' : 'Unverified'}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatChip label="Videos Watched"   value={watchCount}   accent />
                <StatChip label="Roadmaps" value={downloadCount} accent />
                <StatChip label="Hackathons" value={hackathonCount} />
                <StatChip label="Bookmarks" value={bookmarkCount} accent />
            </div>

            {/* Detail Grid */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* Security & Verification Combined */}
                <div className="md:col-span-2 rounded-[1.25rem] sm:rounded-[1.75rem] border border-white/5 bg-[#0f0f12] p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-5 sm:mb-8">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/20 flex items-center justify-center text-[#a855f7]">
                            <IconShield />
                        </div>
                        <h4 className="text-[10px] font-black text-[#a855f7] uppercase tracking-[0.2em]">Security &amp; Verification</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-0">
                        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-white/[0.04]">
                            <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Account Status</span>
                            <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${user?.isVerified ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-500'}`} />
                                <span className="text-[10px] sm:text-xs font-black text-white uppercase">{user?.isVerified ? 'Verified' : 'Pending'}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-white/[0.04]">
                            <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Access Level</span>
                            <span className="text-[10px] sm:text-xs font-black px-2.5 py-1 bg-[#7c3aed]/15 text-[#a855f7] rounded-xl border border-[#7c3aed]/25 uppercase">{user?.role || 'User'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 sm:py-4 border-b border-white/[0.04]">
                            <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Auth Provider</span>
                            <span className="text-[10px] sm:text-xs font-black text-white/60 uppercase">Email / Password</span>
                        </div>
                        <div className="flex items-center justify-between py-3 sm:py-4">
                            <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-wider">Registered</span>
                            <span className="text-[10px] sm:text-xs font-black text-white uppercase">{createdDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// â”€â”€ WATCH HISTORY PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function HistoryPanel({ watchHistory = [] }) {
    if (watchHistory.length === 0) return (
        <motion.div key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Watch History</h2>
                <p className="text-white/30 text-sm">Your recently watched videos and lessons</p>
            </div>
            <EmptyState icon={<IconHistory />} message="No videos watched yet" sub="Start a roadmap or resource to track your watch history here." />
        </motion.div>
    );

    return (
        <motion.div key="history" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Watch History</h2>
                <p className="text-white/30 text-sm">{watchHistory.length} item{watchHistory.length !== 1 ? 's' : ''} in your history</p>
            </div>
            <div className="flex flex-col gap-3">
                {[...watchHistory].reverse().map((item, idx) => {
                    const progress = typeof item.progress === 'number' ? item.progress : Math.min(90, 20 + idx * 10);
                    const ts = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7c3aed]/25 transition-all"
                        >
                            {/* Thumbnail placeholder */}
                            <div className="w-14 h-10 shrink-0 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/20 flex items-center justify-center text-[#a855f7] group-hover:bg-[#7c3aed]/25 transition-all">
                                <IconPlay />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-[#a855f7] transition-colors line-clamp-1 mb-1.5">
                                    {item.title || item.videoTitle || `Lesson ${idx + 1}`}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-black text-[#a855f7] whitespace-nowrap">{progress}%</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                {ts && <span className="text-[10px] text-white/20 whitespace-nowrap">{ts}</span>}
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/15">{item.type || 'video'}</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// â”€â”€ SAVED PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SavedPanel({ savedHackathons = [], savedResources = [], bookmarks = [] }) {
    const items = [
        ...savedHackathons.map((item) => ({ ...item, itemType: 'Hackathon' })),
        ...savedResources.map((item) => ({ ...item, itemType: 'Resource' })),
        ...bookmarks.map((item) => ({
            ...item,
            itemType: 'Bookmark',
            title: item.articleTitle,
            image: item.articleImage,
            location: item.articleSource,
            prize: null
        }))
    ];

    if (items.length === 0) return (
        <motion.div key="saved" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Saved</h2>
                <p className="text-white/30 text-sm">Your bookmarked hackathons, events and resources</p>
            </div>
            <EmptyState icon={<IconSaved />} message="Nothing saved yet" sub="Bookmark hackathons and events from the Hackathons section to see them here." />
        </motion.div>
    );

    return (
        <motion.div key="saved" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Saved</h2>
                <p className="text-white/30 text-sm">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/5 bg-[#0f0f12] hover:border-[#7c3aed]/30 transition-all"
                    >
                        {/* Image strip */}
                        <div className="relative h-28 overflow-hidden bg-[#0d0d0f]">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                                    onError={e => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#7c3aed]/15 to-transparent flex items-center justify-center text-[#7c3aed]/30">
                                    <IconSaved />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] to-transparent" />
                            {item.mode && (
                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-[9px] font-black text-[#a855f7] uppercase tracking-widest">
                                    {item.mode}
                                </div>
                            )}
                        </div>
                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col gap-2">
                            <p className="text-sm font-bold text-white group-hover:text-[#a855f7] line-clamp-1 transition-colors">{item.title}</p>
                            <p className="text-[10px] text-[#a855f7]/70 font-black uppercase tracking-widest">{item.itemType}</p>
                            {item.location && (
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest line-clamp-1">{item.location}</p>
                            )}
                            {item.prize && (
                                <p className="text-[10px] font-black text-[#a855f7]">{item.prize}</p>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// â”€â”€ DOWNLOADS PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DownloadsPanel({ downloads = [] }) {
    if (downloads.length === 0) return (
        <motion.div key="downloads" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Downloaded Roadmaps</h2>
                <p className="text-white/30 text-sm">Your offline roadmap collection</p>
            </div>
            <EmptyState icon={<IconDownload />} message="No roadmaps downloaded" sub="Open any roadmap and download it as a PDF to access it here." />
        </motion.div>
    );

    return (
        <motion.div key="downloads" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Downloaded Roadmaps</h2>
                <p className="text-white/30 text-sm">{downloads.length} roadmap{downloads.length !== 1 ? 's' : ''} downloaded</p>
            </div>
            <div className="flex flex-col gap-3">
                {[...downloads].reverse().map((item, idx) => {
                    const ts = item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            className="group flex items-center gap-4 p-4 pr-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7c3aed]/25 transition-all"
                        >
                            {/* PDF Icon */}
                            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/20 flex items-center justify-center text-[#a855f7] group-hover:bg-[#7c3aed]/25 transition-all">
                                <IconDownload />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-[#a855f7] transition-colors line-clamp-1 mb-0.5">
                                    {item.title || item.roadmapId}
                                </p>
                                <div className="flex items-center gap-3">
                                    {item.roadmapId && (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]/50">{item.roadmapId}</span>
                                    )}
                                    {ts && <span className="text-[10px] text-white/20">{ts}</span>}
                                </div>
                            </div>
                            <button
                                title="Open roadmap"
                                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-[#7c3aed] hover:text-white hover:border-[#7c3aed] transition-all active:scale-95"
                            >
                                <IconOpen /> Open
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Profile() {
    const { user: authUser, updateUser } = useAuth();
    const { addToast } = useToast();
    const [user, setUser] = useState(null);
    const [savedHackathons, setSavedHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('profile');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await userAPI.getProfile();
                if (response.success) {
                    setUser(response.user);
                    setSavedHackathons(response.savedHackathons || []);
                }
            } catch {
                addToast('Failed to load profile', 'error');
                setUser(authUser);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#7c3aed]" />
                    <div className="absolute inset-0 rounded-full bg-[#7c3aed]/10 blur-xl animate-pulse" />
                </div>
            </div>
        );
    }

    const currentUser   = user || authUser;
    const createdDate   = currentUser?.memberSince || (currentUser?.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recently');
    const profileImageSrc = currentUser?.profileImage || currentUser?.avatar || null;
    const name          = currentUser?.username || currentUser?.name || currentUser?.email?.split('@')[0] || 'Member';
    const email         = currentUser?.email || 'â€”';
    const watchHistory  = currentUser?.watchHistory  || [];
    const downloads     = currentUser?.downloadedRoadmaps || [];
    const savedResources = currentUser?.savedResources || [];
    const bookmarks = currentUser?.bookmarks || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-32 md:pb-16 pt-6"
        >
            {/* Mobile Navigation Icons Row (Above card) */}
            <div className="lg:hidden flex items-center justify-between px-2 mb-6 gap-2">
                {TABS.map(({ id, label, Icon }) => {
                    const isActive = selectedTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setSelectedTab(id)}
                            className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-300 flex-1 ${isActive ? 'bg-[#7c3aed] text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)]' : 'bg-white/[0.03] border border-white/5 text-white/30'}`}
                        >
                            <Icon />
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* â•â• LEFT SIDEBAR â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div className="hidden lg:flex w-full lg:w-[280px] xl:w-[300px] shrink-0 flex-col gap-4 lg:sticky lg:top-24">

                    {/* Profile Mini Card */}
                    <div className="relative overflow-hidden p-5 rounded-[1.75rem] border border-white/5 bg-[#0f0f12]">
                        <div className="absolute top-0 right-0 w-28 h-28 bg-[#7c3aed] opacity-10 blur-[60px] -mr-8 -mt-8 rounded-full pointer-events-none" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#7c3aed]/30 shadow-lg bg-[#0d0d0f] shrink-0">
                                <img
                                    src={profileImageSrc || DEFAULT_AVATAR}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                    onError={e => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-black text-white tracking-tight uppercase truncate">{name}</h2>
                                <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] truncate mt-0.5">{email}</p>
                                {currentUser?.role === 'admin' && (
                                    <div className="mt-1.5 text-[9px] font-black text-[#a855f7] uppercase tracking-widest">
                                        Administrator
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-col gap-1.5 p-3 rounded-[1.75rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
                        {TABS.map(({ id, label, Icon }) => {
                            const isActive = selectedTab === id;
                            return (
                                <button
                                    key={id}
                                    id={`profile-tab-${id}`}
                                    onClick={() => setSelectedTab(id)}
                                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-[1.1rem] transition-all duration-300 text-left font-bold text-sm overflow-hidden ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-white/35 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="profile-tab-pill"
                                            className="absolute inset-0 bg-[#7c3aed] shadow-[0_4px_20px_rgba(124,58,237,0.4)] rounded-[1.1rem]"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                                        />
                                    )}
                                    <span className={`relative z-10 shrink-0 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                                        <Icon />
                                    </span>
                                    <span className="relative z-10 text-[12px] font-black uppercase tracking-[0.06em] truncate">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Badge */}
                    <div className="flex items-center justify-center gap-3 py-5 opacity-20 hover:opacity-60 transition-opacity">
                        <div className="h-[1px] w-6 bg-white/40" />
                        <span className="text-[8px] font-black tracking-[0.4em] uppercase text-white/80">TechPlus</span>
                        <div className="h-[1px] w-6 bg-white/40" />
                    </div>
                </div>

                {/* â•â• RIGHT PANEL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
                <div className="flex-1 w-full min-w-0">
                    <AnimatePresence mode="wait">
                        {selectedTab === 'profile' && (
                            <ProfilePanel
                                key="profile"
                                user={currentUser}
                                createdDate={createdDate}
                                onEdit={() => setIsEditOpen(true)}
                                savedHackathons={savedHackathons}
                            />
                        )}
                        {selectedTab === 'history' && (
                            <HistoryPanel key="history" watchHistory={watchHistory} />
                        )}
                        {selectedTab === 'saved' && (
                            <SavedPanel key="saved" savedHackathons={savedHackathons} savedResources={savedResources} bookmarks={bookmarks} />
                        )}
                        {selectedTab === 'downloads' && (
                            <DownloadsPanel key="downloads" downloads={downloads} />
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Profile Edit Modal */}
            <ProfileEdit
                user={currentUser}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSuccess={(updatedUser) => {
                    setUser(updatedUser);
                    updateUser?.(updatedUser);
                    addToast('Profile Intelligence Synced', 'success');
                }}
            />
        </motion.div>
    );
}
