// SplashScreen — shows ONLY during initial auth check
// Images are centered in a panel matching the Login page's image side width
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsAPI, hackathonAPI } from '../config/api';

const TILE_URLS_1 = [
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&q=70',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&q=70',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&q=70',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&q=70',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&q=70',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&q=70',
];
const TILE_URLS_2 = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&q=70',
  'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=300&q=70',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=70',
  'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=300&q=70',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&q=70',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300&q=70',
];
const TILE_URLS_3 = [
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&q=70',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=70',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=70',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=300&q=70',
  'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&q=70',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&q=70',
];

const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%230b0b0f'/%3E%3C/svg%3E";

export default function SplashScreen() {
  // Prefetch news + hackathons while the splash is visible
  useEffect(() => {
    const prefetch = async () => {
      try {
        await Promise.allSettled([
          newsAPI.getAllNews(1, null, false),
          hackathonAPI.getAll({}),
        ]);
      } catch {
        // non-fatal — just warming the cache
      }
    };
    prefetch();
  }, []);

  const imgProps = (url, i, col) => ({
    key: `${col}-${i}`,
    src: url,
    alt: '',
    onError: (e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; },
    className: 'w-full object-cover rounded-lg',
    style: { aspectRatio: '3/4' },
    loading: 'eager',
  });

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[999] overflow-hidden">

      {/* ── Centered image panel (same proportions as Login page's left side) ── */}
      <div className="relative w-full max-w-[480px] h-full overflow-hidden">

        {/* Scrolling columns */}
        <div className="absolute top-0 left-0 w-full h-[200vh] grid grid-cols-3 gap-2 p-2">
          <div className="flex flex-col gap-2 splash-scroll-up">
            {[...TILE_URLS_1, ...TILE_URLS_1].map((url, i) => <img {...imgProps(url, i, 'c1')} />)}
          </div>
          <div className="flex flex-col gap-2 splash-scroll-down">
            {[...TILE_URLS_2, ...TILE_URLS_2].map((url, i) => <img {...imgProps(url, i, 'c2')} />)}
          </div>
          <div className="flex flex-col gap-2 splash-scroll-up" style={{ animationDelay: '-12s' }}>
            {[...TILE_URLS_3, ...TILE_URLS_3].map((url, i) => <img {...imgProps(url, i, 'c3')} />)}
          </div>
        </div>

        {/* Edge fades — match Login page style */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10" />

        {/* Center: logo + spinner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-5">
          <div className="relative flex items-center justify-center">
            {/* Pulse rings */}
            <motion.div
              className="absolute w-24 h-24 rounded-full border border-[#7c3aed]/30"
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border border-[#a855f7]/40"
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            {/* Spinning arc */}
            <svg className="absolute w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <motion.circle
                cx="40" cy="40" r="34"
                fill="none" stroke="#7c3aed" strokeWidth="2.5"
                strokeLinecap="round" strokeDasharray="40 173"
                animate={{ strokeDashoffset: [0, -213] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
              />
            </svg>
            {/* Logo */}
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-black text-lg bg-white shadow-[0_0_30px_rgba(255,255,255,0.25)] relative z-10"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              T+
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="text-2xl font-black tracking-tighter text-white uppercase">TECHPLUS</span>
            <motion.span
              className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading...
            </motion.span>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes splash-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes splash-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .splash-scroll-up  { animation: splash-up   25s linear infinite; }
        .splash-scroll-down { animation: splash-down 25s linear infinite; }
      `}</style>
    </div>
  );
}
