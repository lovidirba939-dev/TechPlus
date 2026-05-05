import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { roadmapAPI } from '../config/api';

export default function RoadmapDetail() {
    const { id } = useParams();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openStep, setOpenStep] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadRoadmap = async () => {
            try {
                setLoading(true);
                const response = await roadmapAPI.getById(id);
                if (!cancelled) setRoadmap(response?.roadmap || null);
            } catch {
                if (!cancelled) setRoadmap(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadRoadmap();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return <div className="text-center py-24 text-white/40">Loading roadmap...</div>;
    }

    if (!roadmap) {
        return (
            <div className="text-center py-24">
                <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Roadmap Not Found</p>
                <p className="mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Roadmap not found.</p>
                <Link to="/roadmaps" className="text-purple-400 text-sm font-semibold hover:underline">Back to Roadmaps</Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-[4px] sm:px-0 pb-28 md:pb-12">
            <Link
                to="/roadmaps"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.3)' }}
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
                All Roadmaps
            </Link>

            <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#a855f7' }}>
                        {roadmap.badge}
                    </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white mb-3">{roadmap.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>{roadmap.description}</p>
            </div>

            <div className="relative">
                <div className="absolute left-3 top-3 bottom-3 w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

                <div className="flex flex-col gap-1 pl-10">
                    {roadmap.steps.map((step, idx) => {
                        const isOpen = openStep === idx;
                        return (
                            <motion.div
                                key={`${roadmap.id}-${idx}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="relative"
                            >
                                <div
                                    className="absolute -left-[29px] top-3.5 w-3 h-3 rounded-full border-2 transition-all duration-300"
                                    style={{
                                        background: isOpen ? '#7c3aed' : '#111111',
                                        borderColor: isOpen ? '#7c3aed' : 'rgba(255,255,255,0.15)'
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setOpenStep(isOpen ? null : idx)}
                                    className="w-full text-left py-4 flex items-center gap-4 group"
                                >
                                    <span className="text-[11px] font-black uppercase shrink-0" style={{ color: isOpen ? '#a855f7' : 'rgba(255,255,255,0.2)' }}>
                                        {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="text-sm sm:text-base font-semibold transition-colors duration-200 leading-snug" style={{ color: isOpen ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)' }}>
                                        {step.title}
                                    </span>
                                    <span className={`ml-auto text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.2)' }}>v</span>
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4">
                                                <div className="p-5 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{step.detail}</p>
                                                    {step.videoUrl ? (
                                                        <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                src={`${step.videoUrl}?rel=0&modestbranding=1`}
                                                                title={step.title}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
