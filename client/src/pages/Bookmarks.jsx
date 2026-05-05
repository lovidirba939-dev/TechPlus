import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../config/api';
import { useToast } from '../context/ToastContext';

const IMG_FALLBACK =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=60';

const CATEGORIES = ['All', 'AI', 'ML', 'React', 'Web Development', 'Cybersecurity', 'Data Science', 'Cloud', 'General'];

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden animate-pulse">
      <div className="h-40 w-full bg-white/[0.06]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 bg-white/[0.06] rounded w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded w-1/2" />
        <div className="h-3 bg-white/[0.04] rounded w-full" />
        <div className="h-3 bg-white/[0.04] rounded w-2/3" />
      </div>
    </div>
  );
}

function EmptyState({ filter }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-28 gap-5 text-center"
    >
      <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-white/20">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      </div>
      <div>
        <p className="text-white/40 text-sm font-black uppercase tracking-widest">No bookmarks</p>
        {filter !== 'All' && (
          <p className="text-white/20 text-xs mt-1">No bookmarks in the "{filter}" category yet.</p>
        )}
        {filter === 'All' && (
          <p className="text-white/20 text-xs mt-1">Bookmark articles from the Dashboard to see them here.</p>
        )}
      </div>
    </motion.div>
  );
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const { addToast } = useToast();

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getBookmarks();
      setBookmarks(response?.bookmarks || []);
    } catch {
      addToast('Failed to fetch bookmarks', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleDelete = async (bookmarkId) => {
    setDeletingId(bookmarkId);
    try {
      await userAPI.deleteBookmark(bookmarkId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      addToast('Bookmark removed', 'success');
    } catch {
      addToast('Failed to delete bookmark', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBookmarks =
    filter === 'All' ? bookmarks : bookmarks.filter((b) => b.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-[1100px] mx-auto px-[4px] sm:px-6 lg:px-8 pb-32 md:pb-16 pt-8"
    >
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="tag">Bookmarks</span>
          <span className="text-white/20 text-xs font-bold">{bookmarks.length} saved</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase">
          My Bookmarks
        </h1>
        <p className="text-white/40 text-sm mt-2 leading-relaxed max-w-lg">
          All your saved articles in one place, organized, searchable, and accessible anytime.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${
              filter === cat
                ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)]'
                : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredBookmarks.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <AnimatePresence>
            {filteredBookmarks.map((bookmark, i) => (
              <motion.div
                key={bookmark._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="cinematic-card group flex flex-col overflow-hidden rounded-3xl"
              >
                {/* Thumbnail */}
                <div className="relative h-40 sm:h-44 overflow-hidden bg-black/30 shrink-0">
                  <img
                    src={bookmark.articleImage || IMG_FALLBACK}
                    alt={bookmark.articleTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {bookmark.category && (
                    <span className="absolute top-3 left-3 tag">{bookmark.category}</span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1">
                    {bookmark.articleTitle}
                  </h3>
                  {bookmark.articleSource && (
                    <p className="text-[11px] text-white/30 font-semibold uppercase tracking-widest">
                      {bookmark.articleSource}
                    </p>
                  )}
                  {bookmark.description && (
                    <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2">
                      {bookmark.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 mt-auto">
                    <a
                      href={bookmark.articleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-[#d8b4fe] hover:bg-[#7c3aed]/25 transition-all"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Read
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(bookmark._id)}
                      disabled={deletingId === bookmark._id}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                      aria-label="Delete bookmark"
                    >
                      {deletingId === bookmark._id ? (
                        <svg className="animate-spin" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
