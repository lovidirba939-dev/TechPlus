import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsAPI } from '../config/api';
import { useToast } from '../context/ToastContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=70';

function normalizeSource(source, apiSource) {
  if (typeof source === 'string') return source;
  return source?.name || apiSource || 'TechPlus Intelligence';
}

export default function NewsDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { addToast } = useToast();
  const [article, setArticle] = useState(state?.article || null);
  const [loading, setLoading] = useState(!state?.article);

  const storageKey = useMemo(() => `techplus-news-${id}`, [id]);

  useEffect(() => {
    if (state?.article) {
      sessionStorage.setItem(storageKey, JSON.stringify(state.article));
      return;
    }

    const cached = sessionStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed) {
          setArticle(parsed);
          setLoading(false);
          return;
        }
      } catch {
        /* continue to API */
      }
    }

    const load = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getById(id);
        if (response?.success && response.article) {
          setArticle(response.article);
          sessionStorage.setItem(storageKey, JSON.stringify(response.article));
        }
      } catch (error) {
        addToast(error?.message || 'Failed to load article', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, state?.article, addToast, storageKey]);

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] h-72" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-white/40">Article not found.</p>
        <Link to="/" className="text-[#a855f7] text-sm font-bold uppercase tracking-widest mt-4 inline-block">
          Back to News
        </Link>
      </div>
    );
  }

  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const sourceName = normalizeSource(article.source, article.apiSource);
  const descriptionText = (article.description || '').trim();
  const contentText = (article.content || '').trim();
  const bodyText = contentText.startsWith(descriptionText) && descriptionText
    ? contentText.slice(descriptionText.length).trim()
    : contentText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-16"
    >
      <div className="mb-6 pt-4">
        <Link
          to="/"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
        >
          Back to Intelligence
        </Link>
      </div>

      <article className="rounded-[32px] border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="aspect-[21/9] w-full bg-black/30">
          <img
            src={article.image || FALLBACK_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[10px] font-black uppercase tracking-widest text-[#d8b4fe]">
              {article.category || 'Technology'}
            </span>
            {publishedAt && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                {publishedAt}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              {sourceName}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-tight mb-5">
            {article.title}
          </h1>

          {article.description && (
            <p className="text-base text-white/70 leading-relaxed mb-6">{article.description}</p>
          )}

          <div className="space-y-4 text-sm md:text-[15px] text-white/65 leading-relaxed">
            {(bodyText || descriptionText || '')
              .split(/\n+/)
              .filter(Boolean)
              .map((para, idx) => (
                <p key={`${id}-p-${idx}`}>{para}</p>
              ))}
          </div>

          {article.url && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#6d28d9] transition-colors"
              >
                Read original article
              </a>
            </div>
          )}
        </div>
      </article>
    </motion.div>
  );
}
