import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen relative" style={{ background: 'var(--bg-base)' }}>

            {/* ──────── CINEMATIC ATMOSPHERE ──────── */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[600px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }}
            />
            {/* ──────────────────────────────────── */}

            <Navbar />

            <main className="pt-[64px] relative z-10">
                {/* Single top offset below fixed navbar (~20–32px); avoid stacking with page-level pt-* */}
                <div className="max-w-[1400px] mx-auto pt-4 pb-10 md:pt-6 md:pb-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
