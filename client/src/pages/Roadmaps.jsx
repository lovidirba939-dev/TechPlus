import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { userAPI, roadmapAPI } from '../config/api';
import { useToast } from '../context/ToastContext';

const DOMAIN_ICONS = {
    frontend: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    backend: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
            <line x1="6" y1="6" x2="6" y2="6" />
            <line x1="6" y1="18" x2="6" y2="18" />
        </svg>
    ),
    fullstack: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    ),
    mobile: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
    ),
    devops: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    datascience: () => (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
    )
};

export default function Roadmaps() {
    const location = useLocation();
    const { addToast } = useToast();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [expandedStep, setExpandedStep] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [roadmapProgress, setRoadmapProgress] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const loadRoadmaps = async () => {
            try {
                setLoading(true);
                const response = await roadmapAPI.getAll();
                if (response.success && response.roadmaps) {
                    setRoadmaps(response.roadmaps);
                    const params = new URLSearchParams(location.search);
                    const idFromUrl = params.get('id');
                    const initial = idFromUrl ? response.roadmaps.find((r) => r.id === idFromUrl) : response.roadmaps[0];
                    setSelectedDomain(initial || response.roadmaps[0]);
                }
            } catch (error) {
                addToast(error?.message || 'Failed to fetch roadmaps', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadRoadmaps();
    }, [location.search, addToast]);

    useEffect(() => {
        const updateDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', updateDesktop);
        return () => window.removeEventListener('resize', updateDesktop);
    }, []);

    useEffect(() => {
        if (!selectedDomain) return;
        const loadProgress = async () => {
            try {
                const res = await userAPI.getRoadmapProgress(selectedDomain.id);
                if (res.success) setRoadmapProgress(res.progress || []);
            } catch {
                /* ignore */
            }
        };
        loadProgress();
    }, [selectedDomain]);

    const getStepTopics = (detail) => {
        if (!detail || typeof detail !== 'string') return [];
        const parts = detail
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean);
        return parts.length >= 2 ? parts : [detail.trim()];
    };

    const downloadPDF = async () => {
        if (!selectedDomain || isDownloading) return;
        setIsDownloading(true);
        try {
            const response = await fetch(selectedDomain.pdfPath);
            if (!response.ok) {
                throw new Error('Roadmap PDF unavailable');
            }

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const safeTitle = selectedDomain.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `${safeTitle}-roadmap.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);

            await userAPI.recordRoadmapDownload({
                title: selectedDomain.title,
                roadmapId: selectedDomain.id
            });

            addToast(`Downloaded ${selectedDomain.title} roadmap PDF`, 'success');
        } catch (error) {
            addToast(error?.message || 'Failed to download roadmap PDF', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleStepClick = async (idx, step) => {
        const next = expandedStep === idx ? null : idx;
        setExpandedStep(next);
        if (next === null || !selectedDomain) return;

        try {
            await userAPI.updateLastActivity({
                type: 'roadmap',
                title: `${selectedDomain.title}: ${step.title}`,
                path: `/roadmaps?id=${selectedDomain.id}&step=${idx}`,
                timestamp: Date.now()
            });
        } catch {
            /* ignore */
        }
    };

    const toggleStepCompletion = async (idx) => {
        if (!selectedDomain) return;
        const itemId = String(idx);
        const existing = roadmapProgress.find((item) => item.itemId === itemId);
        const completed = !existing?.completed;

        try {
            await userAPI.updateRoadmapProgress({
                roadmapId: selectedDomain.id,
                itemId,
                completed
            });
            setRoadmapProgress((prev) => {
                const other = prev.filter((p) => p.itemId !== itemId);
                return completed ? [...other, { itemId, completed }] : other;
            });
        } catch (error) {
            addToast(error?.message || 'Failed to update roadmap progress', 'error');
        }
    };

    const filteredRoadmaps = useMemo(
        () => roadmaps.filter((roadmap) => roadmap.title.toLowerCase().includes(deferredSearchQuery.toLowerCase())),
        [roadmaps, deferredSearchQuery]
    );
    const visibleDomains = filteredRoadmaps;
    const completedCount = roadmapProgress.filter((item) => item.completed).length;
    const progressPercent = selectedDomain?.steps?.length ? Math.round((completedCount / selectedDomain.steps.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#7c3aed]" />
            </div>
        );
    }

    if (!selectedDomain) {
        return <div className="py-20 text-center text-white/40">Roadmaps are unavailable right now.</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row gap-8 max-w-[1100px] mx-auto min-h-[calc(100vh-140px)] relative z-10 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12 pt-8"
        >
            <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-160px)]">
                <div className="flex flex-col gap-3 p-2 rounded-3xl border border-white/5 relative overflow-hidden lg:overflow-auto" style={{ background: 'var(--bg-surface)' }}>
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden flex items-center justify-between w-full px-5 py-3.5 bg-white/[0.03] rounded-2xl border border-white/5 transition-all text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-[#a855f7]">
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 17l4-8 4 4 4-6 4 6" /><circle cx="3" cy="17" r="1.5" /><circle cx="7" cy="9" r="1.5" /><circle cx="11" cy="13" r="1.5" /><circle cx="15" cy="7" r="1.5" /><circle cx="21" cy="13" r="1.5" /></svg>
                            </span>
                            <span className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{selectedDomain.title}</span>
                        </div>
                        <motion.div
                            animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                            className="text-white/30"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                        </motion.div>
                    </button>

                    <style dangerouslySetInnerHTML={{ __html: `
                        .domain-sidebar::-webkit-scrollbar {
                            width: 4px;
                        }
                        .domain-sidebar::-webkit-scrollbar-track {
                            background: rgba(255, 255, 255, 0.02);
                            border-radius: 10px;
                        }
                        .domain-sidebar::-webkit-scrollbar-thumb {
                            background: rgba(124, 58, 237, 0.3);
                            border-radius: 10px;
                        }
                        .domain-sidebar::-webkit-scrollbar-thumb:hover {
                            background: rgba(124, 58, 237, 0.6);
                        }
                    `}} />

                    <AnimatePresence>
                        {(isMobileMenuOpen || isDesktop) && (
                            <motion.div
                                initial={!isDesktop ? { height: 0, opacity: 0 } : false}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex flex-col gap-1.5 overflow-y-auto domain-sidebar"
                                style={{ maxHeight: 'inherit' }}
                            >
                                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1 mt-2 lg:mt-0">
                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Domains</span>
                                </div>
                                {visibleDomains.map((domain) => {
                                    const Icon = DOMAIN_ICONS[domain.id] || DOMAIN_ICONS.frontend;
                                    const isActive = selectedDomain.id === domain.id;
                                    return (
                                        <motion.button
                                            key={domain.id}
                                            layout
                                            type="button"
                                            onClick={() => {
                                                setSelectedDomain(domain);
                                                setExpandedStep(null);
                                                if (!isDesktop) setIsMobileMenuOpen(false);
                                            }}
                                            className={`group flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 text-left font-bold text-sm relative overflow-hidden ${isActive ? 'text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="roadmap-pill"
                                                    className="absolute inset-0 bg-[#7c3aed] shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10 shrink-0"><Icon /></span>
                                            <span className="relative z-10 truncate">{domain.title}</span>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative w-full order-last lg:order-first lg:mb-2 lg:mt-0 mt-4">
                    <input
                        type="text"
                        placeholder="Search domain..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-white/5 rounded-2xl py-3 pl-11 pr-10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#7c3aed] transition-all"
                    />
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>

                <div className="hidden lg:block p-5 rounded-3xl border border-white/5 bg-white/[0.02]">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Your Progress</h4>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#7c3aed] transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="mt-3 text-[10px] font-black text-white/40 uppercase tracking-widest">{progressPercent}% completed</p>
                </div>
            </div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {deferredSearchQuery ? (
                        <motion.div
                            key="search-results"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-10">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                                    Search Results
                                </h1>
                                <p className="text-white/40 text-sm">Found {filteredRoadmaps.length} domain{filteredRoadmaps.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredRoadmaps.length > 0 ? (
                                    filteredRoadmaps.map((roadmap) => {
                                        const Icon = DOMAIN_ICONS[roadmap.id] || DOMAIN_ICONS.frontend;
                                        return (
                                            <div
                                                key={roadmap.id}
                                                onClick={() => {
                                                    setSelectedDomain(roadmap);
                                                    setSearchQuery('');
                                                }}
                                                className="group cinematic-card flex flex-col justify-between p-6 cursor-pointer border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7c3aed]/30 transition-all rounded-[2rem]"
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center text-[#a855f7] group-hover:scale-110 transition-transform">
                                                        <Icon />
                                                    </div>
                                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Roadmap</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-white group-hover:text-[#a855f7] transition-colors mb-2 uppercase tracking-tight">{roadmap.title}</h3>
                                                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{roadmap.description}</p>
                                                </div>
                                                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{roadmap.steps?.length || 0} Strategic Steps</span>
                                                    <span className="text-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-20 text-center border border-white/5 rounded-[2rem] bg-white/[0.02]">
                                        <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No domains matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedDomain.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <div className="mb-8 lg:mb-12">
                                <div className="flex items-center gap-3 text-[10px] font-black text-[#a855f7] uppercase tracking-[0.3em] mb-4">
                                    <span className="w-8 h-[1px] bg-[#7c3aed]/50" />
                                    Interactive Roadmap
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6 leading-tight">
                                    {selectedDomain.title}
                                </h1>
                                <p className="text-base lg:text-lg text-white/40 leading-relaxed max-w-2xl mb-8">
                                    {selectedDomain.description}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={downloadPDF}
                                        disabled={isDownloading}
                                        className="px-6 py-3 rounded-2xl bg-[#7c3aed] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#6d28d9] transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)] disabled:opacity-50 active:scale-95"
                                    >
                                        {isDownloading ? 'Preparing...' : 'Download Full Plan (PDF)'}
                                    </button>
                                    <div className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/5 bg-white/[0.02] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        {selectedDomain.steps?.length || 0} Strategic Steps
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedDomain.steps.map((step, idx) => {
                                    const isExpanded = expandedStep === idx;
                                    const isCompleted = roadmapProgress.some((p) => p.itemId === String(idx) && p.completed);
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`group rounded-[2rem] border transition-all duration-300 ${isExpanded ? 'bg-[#121217] border-[#7c3aed]/30 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
                                        >
                                            <div
                                                onClick={() => handleStepClick(idx, step)}
                                                className="p-3 sm:p-5 lg:p-8 flex items-center gap-3 sm:gap-5 cursor-pointer"
                                            >
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStepCompletion(idx);
                                                    }}
                                                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shrink-0 ${isCompleted ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-white/5 border-white/10 text-white/20 group-hover:border-[#7c3aed]/30 group-hover:text-[#a855f7]'}`}
                                                >
                                                    {isCompleted ? (
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg>
                                                    ) : (
                                                        <span className="text-sm font-black tracking-tight">{String(idx + 1).padStart(2, '0')}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`text-sm sm:text-base lg:text-xl font-black uppercase tracking-tight leading-snug transition-colors ${isExpanded ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                                                        {step.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">PHASE {idx + 1}</span>
                                                        {isCompleted && <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Verified</span>}
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#7c3aed] text-white rotate-180' : 'text-white/20'}`}>
                                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-4 sm:px-8 pb-4 sm:pb-8 pt-2 border-t border-white/5">
                                                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                                                                <div className="flex items-center gap-2 text-[10px] font-black text-[#a855f7] uppercase tracking-widest mb-4">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                                                                    Technical Focus
                                                                </div>
                                                                <div className="space-y-2.5 mb-3">
                                                                    {getStepTopics(step.detail).map((topic, topicIndex) => (
                                                                        <div key={topicIndex} className="flex items-start gap-2.5">
                                                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#7c3aed] shrink-0" />
                                                                            <p className="text-sm lg:text-base leading-relaxed font-medium" style={{ color: '#E2E8F0' }}>
                                                                                {topic}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {step.links && step.links.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                                                                        {step.links.map((link, linkIndex) => (
                                                                            <a
                                                                                key={linkIndex}
                                                                                href={link.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-xs font-bold text-[#a855f7] hover:bg-[#7c3aed]/20 hover:text-[#d8b4fe] transition-colors"
                                                                            >
                                                                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                                                                {link.title}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
