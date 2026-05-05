import { memo, useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { playlistAPI, userAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';

const RESOURCE_TYPE_FILTERS = [
    'All Types',
    'Paid Course',
    'Free Course With Certificate',
    'YouTube Playlist'
];

function getYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
}

function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

let youtubeApiPromise = null;
function loadYouTubeApi() {
    if (typeof window === 'undefined') return Promise.resolve();
    if (window.YT?.Player) return Promise.resolve();
    if (!youtubeApiPromise) {
        youtubeApiPromise = new Promise((resolve) => {
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prev === 'function') prev();
                resolve();
            };
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = 'https://www.youtube.com/iframe_api';
                document.body.appendChild(tag);
            }
        });
    }
    return youtubeApiPromise;
}

function PlaylistPlayer({
    playlist,
    playlistTitle,
    playlistDesc,
    playlistDuration,
    onBack,
    resumeVideoIndex = 0,
    resumeSeconds = 0
}) {
    const { updateUser } = useAuth();
    const [activeIndex, setActiveIndex] = useState(resumeVideoIndex);
    const [playerReady, setPlayerReady] = useState(false);
    const playerMountId = useMemo(() => `ytp-${Math.random().toString(36).slice(2, 11)}`, []);
    const ytPlayerRef = useRef(null);
    const tickRef = useRef(null);

    const flushProgress = useCallback(async (extra = {}) => {
        const item = playlist[activeIndex];
        if (!item?.videoId) return;

        let seconds = extra.seconds;
        if (seconds === undefined && ytPlayerRef.current?.getCurrentTime) {
            try {
                seconds = Math.floor(ytPlayerRef.current.getCurrentTime() || 0);
            } catch {
                seconds = 0;
            }
        }

        try {
            const res = await userAPI.updateLastActivity({
                type: 'resource',
                title: playlistTitle,
                path: '/resources',
                videoId: item.videoId,
                videoTitle: item.title,
                videoIndex: activeIndex,
                seconds,
                playbackStarted: true,
                timestamp: Date.now()
            });
            if (res?.lastActivity) updateUser?.({ lastActivity: res.lastActivity });
        } catch {
            /* ignore */
        }
    }, [activeIndex, playlist, playlistTitle, updateUser]);

    useEffect(() => {
        let cancelled = false;

        loadYouTubeApi().then(() => {
            if (cancelled || !window.YT?.Player || !playlist[resumeVideoIndex]) return;
            ytPlayerRef.current = new window.YT.Player(playerMountId, {
                width: '100%',
                height: '100%',
                videoId: playlist[resumeVideoIndex].videoId,
                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    modestbranding: 1,
                    start: Math.max(0, Math.floor(resumeSeconds || 0))
                },
                events: {
                    onReady: () => {
                        setPlayerReady(true);
                        tickRef.current = setInterval(() => {
                            flushProgress();
                        }, 8000);
                    },
                    onStateChange: (e) => {
                        if (e.data === window.YT.PlayerState.PLAYING) {
                            flushProgress({ playbackStarted: true });
                        }
                    }
                }
            });
        });

        return () => {
            cancelled = true;
            if (tickRef.current) clearInterval(tickRef.current);
            try {
                ytPlayerRef.current?.destroy?.();
            } catch {
                /* ignore */
            }
        };
    }, [flushProgress, playerMountId, playlist, resumeSeconds, resumeVideoIndex]);

    const selectVideo = (index) => {
        setActiveIndex(index);
        const item = playlist[index];
        ytPlayerRef.current?.loadVideoById?.({ videoId: item.videoId, startSeconds: 0 });
        flushProgress({ seconds: 0 });
    };

    const currentVideo = playlist[activeIndex];

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-[11px] font-black text-white/30 uppercase tracking-widest mb-6 hover:text-white transition-colors group shrink-0"
            >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M5 12l7 7M5 12l7-7" /></svg>
                Back to Playlists
            </button>

            <div className="flex gap-0 overflow-hidden border border-white/5 flex-col xl:flex-row rounded-[32px]" style={{ background: 'linear-gradient(145deg, #121217 0%, #0e0b18 100%)' }}>
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                        <div id={playerMountId} className="absolute inset-0 w-full h-full" />
                    </div>

                    <div className="p-6">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">{currentVideo?.title}</h2>
                        <p className="text-sm text-white/40 leading-relaxed mb-3">{playlistDesc}</p>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#7c3aed' }}>
                                {playlistDuration} Total
                            </span>
                            <span className="text-[10px] font-bold text-white/30">Video {activeIndex + 1} of {playlist.length}</span>
                        </div>
                    </div>
                </div>

                <div className="xl:w-[340px] w-full border-t xl:border-t-0 xl:border-l border-white/5 flex flex-col" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="px-5 py-4 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Up Next</h3>
                            <span className="text-[10px] font-bold text-white/20">{playlist.length} videos</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[500px]">
                        {playlist.map((item, index) => {
                            const isActive = index === activeIndex;
                            return (
                                <button
                                    type="button"
                                    key={`${item.videoId}-${index}`}
                                    disabled={!playerReady}
                                    onClick={() => selectVideo(index)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-200 group disabled:opacity-40 ${isActive ? 'bg-[#7c3aed]/10 border-l-[3px] border-[#7c3aed]' : 'border-l-[3px] border-transparent hover:bg-white/5'}`}
                                >
                                    <span className={`text-[11px] font-black mt-2 shrink-0 w-5 text-right ${isActive ? 'text-[#7c3aed]' : 'text-white/20'}`}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className="w-[100px] h-[56px] rounded-lg overflow-hidden shrink-0 relative border border-white/5">
                                        <img src={getYouTubeThumbnail(item.videoId)} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 pt-0.5">
                                        <span className={`text-[12px] font-bold leading-snug line-clamp-2 transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80'}`}>{item.title}</span>
                                        <span className="text-[10px] text-white/20">{item.duration}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

const ResourceCard = memo(function ResourceCard({ item, isSaved, savingId, onToggleSaved, onOpen }) {
    const playable = item.hasVideos;
    const external = Boolean(item.externalUrl);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(item)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onOpen(item);
            }}
            className="group cinematic-card flex flex-col justify-between h-full p-4 sm:p-6 cursor-pointer transition-all duration-300 ease-in-out"
        >
            <div className="mb-5 sm:mb-8">
                <h3 className="text-lg font-bold text-white/90 group-hover:text-[#7c3aed] transition-colors duration-200 mb-2 leading-snug">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/40">{item.description}</p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#7c3aed' }}>
                        {item.platform || item.domain}
                    </span>
                    {item.resourceType ? (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-xl border border-white/10 text-white/60">
                            {item.resourceType}
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSaved(item._id);
                        }}
                        disabled={savingId === String(item._id)}
                        className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-white/45 hover:text-white'}`}
                    >
                        {savingId === String(item._id) ? '...' : isSaved ? 'Saved' : 'Save'}
                    </button>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', color: '#7c3aed' }}>
                        {playable && !external ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>
                        ) : (
                            '->'
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
});

function mapVideosForPlayer(videos) {
    if (!Array.isArray(videos)) return [];
    return videos
        .map((video) => ({
            title: video.title,
            videoId: getYouTubeId(video.videoUrl) || '',
            duration: video.duration || ''
        }))
        .filter((video) => video.videoId);
}

export default function Resources() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState(null);
    const [activeSection, setActiveSection] = useState('All Domains');
    const [openPlaylist, setOpenPlaylist] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [resourceTypeFilter, setResourceTypeFilter] = useState('All Types');
    const [savingId, setSavingId] = useState(null);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const savedResourceIds = useMemo(
        () => (user?.savedResources || []).map((item) => String(item?._id || item)),
        [user?.savedResources]
    );

    const categories = useMemo(
        () => ['All Domains', ...Array.from(new Set(playlists.map((playlist) => playlist.domain).filter(Boolean))).sort((a, b) => a.localeCompare(b))],
        [playlists]
    );

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await playlistAPI.getAll();
                if (cancelled) return;
                if (res?.success && Array.isArray(res.playlists)) {
                    setPlaylists(res.playlists);
                } else {
                    setCatalogError('Could not load resources.');
                }
            } catch (error) {
                if (!cancelled) setCatalogError(error?.message || 'Could not load resources.');
            } finally {
                if (!cancelled) setCatalogLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const applyPlaylistDetail = useCallback((detail, resumeIdx = 0, resumeSec = 0) => {
        const normalized = mapVideosForPlayer(detail.videos);
        if (!normalized.length) return;
        setOpenPlaylist({
            playlistId: detail._id,
            link: {
                title: detail.title,
                desc: detail.description,
                duration: detail.totalDuration,
                playlist: normalized
            },
            resumeVideoIndex: Math.max(0, Number(resumeIdx) || 0),
            resumeSeconds: Math.max(0, Number(resumeSec) || 0)
        });
    }, []);

    useEffect(() => {
        if (!location.state?.resumeResource || !user?.lastActivity || catalogLoading || playlists.length === 0) return;
        const match = playlists.find((playlist) => playlist.title === user.lastActivity.title && playlist.hasVideos);
        if (!match) {
            navigate(location.pathname, { replace: true, state: {} });
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const detail = await playlistAPI.getById(match._id);
                if (!cancelled && detail?.success) {
                    setActiveSection(detail.domain || 'All Domains');
                    applyPlaylistDetail(detail, user.lastActivity.videoIndex, user.lastActivity.seconds);
                }
            } finally {
                if (!cancelled) navigate(location.pathname, { replace: true, state: {} });
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [applyPlaylistDetail, catalogLoading, location.pathname, location.state, navigate, playlists, user]);

    const handleCardClick = async (item) => {
        if (item.externalUrl) {
            window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
            return;
        }
        if (!item.hasVideos) return;
        try {
            const detail = await playlistAPI.getById(item._id);
            if (detail?.success) applyPlaylistDetail(detail, 0, 0);
        } catch {
            /* ignore */
        }
    };

    const toggleSavedResource = async (playlistId) => {
        try {
            setSavingId(String(playlistId));
            const isSaved = savedResourceIds.includes(String(playlistId));
            if (isSaved) {
                await userAPI.removeSavedResource(playlistId);
                updateUser?.({
                    savedResources: (user?.savedResources || []).filter((item) => String(item?._id || item) !== String(playlistId))
                });
            } else {
                await userAPI.saveResource(playlistId);
                const savedItem = playlists.find((item) => String(item._id) === String(playlistId));
                updateUser?.({
                    savedResources: [...(user?.savedResources || []), savedItem].filter(Boolean)
                });
            }
        } finally {
            setSavingId(null);
        }
    };

    const filtered = useMemo(() => {
        const search = deferredSearchQuery.trim().toLowerCase();

        return playlists.filter((item) => {
            const matchesDomain = activeSection === 'All Domains' || item.domain === activeSection;
            const matchesType = resourceTypeFilter === 'All Types' || item.resourceType === resourceTypeFilter;
            if (!matchesDomain || !matchesType) return false;

            if (!search) return true;

            const haystack = [
                item.title,
                item.description,
                item.platform,
                item.domain,
                ...(item.tags || [])
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(search);
        });
    }, [playlists, activeSection, resourceTypeFilter, deferredSearchQuery]);

    if (catalogLoading && playlists.length === 0) {
        return <div className="flex justify-center items-center min-h-[50vh] max-w-[1200px] mx-auto"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#7c3aed]" /></div>;
    }

    if (catalogError && playlists.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-6 py-16 text-center text-white/50">
                <p className="mb-4">{catalogError}</p>
                <p className="text-xs text-white/30">Check that the API is reachable and restart the backend if needed.</p>
            </div>
        );
    }

    if (openPlaylist) {
        return (
            <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10">
                <AnimatePresence mode="wait">
                    <PlaylistPlayer
                        key={`${openPlaylist.playlistId}-${openPlaylist.resumeVideoIndex}-${openPlaylist.resumeSeconds}`}
                        playlist={openPlaylist.link.playlist}
                        playlistTitle={openPlaylist.link.title}
                        playlistDesc={openPlaylist.link.desc}
                        playlistDuration={openPlaylist.link.duration}
                        resumeVideoIndex={openPlaylist.resumeVideoIndex}
                        resumeSeconds={openPlaylist.resumeSeconds}
                        onBack={() => setOpenPlaylist(null)}
                    />
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="transition-all duration-300 ease-in-out w-full max-w-[1100px] mx-auto min-h-[calc(100vh-140px)] relative z-10 px-[4px] sm:px-6 lg:px-8 pb-28 md:pb-8">
            <div className="flex flex-col lg:flex-row gap-8 transition-all duration-300 ease-in-out">
                <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-160px)]">
                    <div className="lg:hidden mb-4 relative">
                        <button
                            type="button"
                            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                            className="flex items-center justify-between w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/[0.03] rounded-2xl border border-white/10 text-white transition-all text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-white/40 uppercase text-[10px] font-black tracking-widest mr-2">Domain</span>
                                <span className="text-[#a855f7] px-2 py-0.5 bg-[#a855f7]/10 rounded-lg">{activeSection}</span>
                            </div>
                            <motion.div
                                animate={{ rotate: isCategoryMenuOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isCategoryMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2"
                                >
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => {
                                                setActiveSection(category);
                                                setSearchQuery('');
                                                setIsCategoryMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                                activeSection === category
                                                    ? 'bg-[#7c3aed] text-white'
                                                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <nav className="hidden lg:flex flex-col gap-1.5 p-3 rounded-3xl border border-white/5 lg:min-h-[560px] lg:max-h-[calc(100vh-160px)] lg:overflow-auto" style={{ background: 'var(--bg-surface)' }}>
                        {categories.map((category) => {
                            const isActive = activeSection === category;
                            return (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => {
                                        setActiveSection(category);
                                        setSearchQuery('');
                                    }}
                                    className={`group px-5 py-3.5 rounded-2xl transition-all duration-200 text-left font-bold text-sm ${isActive ? 'bg-[#7c3aed] text-white shadow-[0_4px_20px_rgba(124,58,237,0.4)]' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex-1 w-full min-h-[500px] transition-all duration-300 ease-in-out">
                    <motion.div key={activeSection} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                        <div className="mb-6 pb-6 md:mb-10 md:pb-8 border-b border-white/5">
                            <h1 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-3 sm:mb-4">{activeSection}</h1>
                            <p className="text-base text-white/50 leading-relaxed max-w-2xl mb-8">High-quality developer courses, trusted certifications, and curated YouTube learning paths.</p>
                            <div className="relative max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search by title, technology, or platform..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-12 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all duration-300 ease-in-out"
                                />
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="hidden md:flex overflow-x-auto whitespace-nowrap gap-2 pb-2 scrollbar-hide">
                                    {RESOURCE_TYPE_FILTERS.map((type) => {
                                        const active = resourceTypeFilter === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setResourceTypeFilter(type)}
                                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden shrink-0 ${
                                                    active
                                                        ? 'bg-[#7c3aed] text-white shadow-[0_0_16px_rgba(124,58,237,0.35)]'
                                                        : 'bg-white/[0.03] border border-white/5 text-white/45 hover:border-[#7c3aed]/50 hover:text-white'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="md:hidden relative z-40">
                                    <button
                                        type="button"
                                        onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
                                        className="flex items-center justify-between w-full px-4 py-3 sm:px-5 sm:py-3.5 bg-white/[0.03] rounded-2xl border border-white/10 text-white transition-all text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-white/40 uppercase text-[10px] font-black tracking-widest mr-2">Type</span>
                                            <span className="text-[#a855f7] px-2 py-0.5 bg-[#a855f7]/10 rounded-lg">{resourceTypeFilter}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isTypeMenuOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
                                        </motion.div>
                                    </button>

                                    <AnimatePresence>
                                        {isTypeMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-2"
                                            >
                                                {RESOURCE_TYPE_FILTERS.map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => {
                                                            setResourceTypeFilter(type);
                                                            setIsTypeMenuOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                                            resourceTypeFilter === type
                                                                ? 'bg-[#7c3aed] text-white'
                                                                : 'text-white/40 hover:bg-white/5 hover:text-white'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-white/30 border border-white/5 rounded-3xl bg-white/[0.02]">
                                <p className="font-bold uppercase tracking-widest text-sm">No resources found.</p>
                                <p className="text-xs text-white/20 mt-2">Try adjusting your search terms or filters.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
                                {filtered.map((item) => (
                                    <ResourceCard
                                        key={item._id}
                                        item={item}
                                        isSaved={savedResourceIds.includes(String(item._id))}
                                        savingId={savingId}
                                        onToggleSaved={toggleSavedResource}
                                        onOpen={handleCardClick}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
