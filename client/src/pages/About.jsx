import { motion } from 'framer-motion';

const TOPICS = [
    'Artificial Intelligence', 'Web Development', 'Systems & Languages', 'Hardware & Silicon',
    'Cybersecurity', 'DevOps & Cloud', 'Research & Papers', 'Developer Tools',
    'Blockchain & Web3', 'Mobile Engineering',
];

const STACK = [
    { label: 'React', color: '#61dafb' },
    { label: 'Tailwind CSS', color: '#38bdf8' },
    { label: 'React Router', color: '#f43f5e' },
    { label: 'Framer Motion', color: '#a78bfa' },
    { label: 'NewsData.io', color: '#fbbf24' },
    { label: 'Vite', color: '#41d1ff' },
];

export default function About() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-[1100px] mx-auto w-full px-[4px] sm:px-6 lg:px-8 pb-28 md:pb-12 pt-8"
        >
            <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-start">

                {/* â”€â”€ LEFT SIDE: HEADER â”€â”€ */}
                <div className="md:w-[280px] shrink-0 sticky top-32">
                    <div className="p-5 sm:p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(to bottom, #7c3aed, transparent)' }} />
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1.5 h-6 rounded-full bg-[#7c3aed]" style={{ boxShadow: '0 0 15px rgba(124,58,237,0.6)' }} />
                            <span className="text-[11px] font-black tracking-[0.2em] uppercase text-[#a855f7]">Platform</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white mb-2 uppercase">About TechPlus</h1>
                        <p className="text-sm text-white/50 leading-relaxed">
                            The intelligence layer for modern technology.
                        </p>
                    </div>
                </div>

                {/* â”€â”€ RIGHT SIDE: CONTENT â”€â”€ */}
                <div className="flex-1 flex flex-col gap-6 w-full text-left">
                    {/* Mission */}
                    <motion.div
                        className="p-5 sm:p-8 cinematic-card cursor-default hover:transform-none"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                            Our Mission
                        </h2>
                        <div className="text-sm leading-relaxed text-white/50 flex flex-col gap-4">
                            <p>
                                Our mission at TechPlus is to make sure developers never miss important opportunities or technological breakthroughs.
                            </p>
                            <p>
                                In today's fast-moving tech ecosystem, valuable information is scattered everywhere â€” across blogs, research platforms, social media, and developer communities. As a result, many developers miss important hackathons, powerful tools, major technology updates, and emerging trends that could help them grow.
                            </p>
                            <p>
                                TechPlus aims to solve this problem by creating a <em className="text-white/80 not-italic font-bold">centralized technology intelligence platform</em> where developers can quickly discover what truly matters.
                            </p>
                            <p>We focus on delivering:</p>
                            <ul className="flex flex-col gap-2 pl-1">
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                                    Important technology news and innovations
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                                    Hackathons and developer opportunities
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                                    Useful developer tools and frameworks
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                                    Research papers and technical breakthroughs
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 shrink-0" />
                                    Emerging trends in software engineering
                                </li>
                            </ul>
                            <p>
                                By organizing this information in a clean and focused environment, TechPlus helps developers stay informed, learn faster, and take advantage of opportunities in the tech ecosystem.
                            </p>
                            <p>
                                Our vision is to build a platform where developers can rely on a <em className="text-white/80 not-italic font-bold">single place</em> to stay updated with the most relevant developments in technology.
                            </p>
                        </div>
                    </motion.div>

                    {/* Coverage */}
                    <motion.div
                        className="p-5 sm:p-8 cinematic-card cursor-default hover:transform-none"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                            What We Cover
                        </h2>
                        <div className="flex flex-wrap gap-2.5">
                            {TOPICS.map(topic => (
                                <div
                                    key={topic}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-default bg-white/5 border border-white/5 text-white/50 hover:bg-[#7c3aed]/10 hover:border-[#7c3aed]/30 hover:text-white"
                                >
                                    {topic}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Built With */}
                    <motion.div
                        className="p-5 sm:p-8 cinematic-card cursor-default hover:transform-none"
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    >
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                            Built With
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {STACK.map(s => (
                                <span
                                    key={s.label}
                                    className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
                                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}40`, color: s.color, boxShadow: `0 0 15px ${s.color}20` }}
                                >
                                    {s.label}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs mt-8 leading-relaxed text-white/30 font-medium">
                            Intentionally lightweight â€” no bloat, no trackers, no unnecessary dependencies. Pure signal.
                        </p>
                    </motion.div>

                    {/* Version */}
                    <p className="text-left text-[10px] font-black uppercase tracking-[0.2em] pt-8 pb-4 text-white/20">
                        TechPlus v2.0 Cinematic Â· {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
