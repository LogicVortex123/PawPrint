import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { PawIcon } from './OrganicDeco';

/**
 * Small, decorative motion pieces shared across pages. All of them are
 * visual-only and fall back to a still state under prefers-reduced-motion
 * (handled globally in index.css).
 */

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ── Thin reading-progress bar pinned to the top of the page ─────────────────

export const ScrollProgress: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div className="print:hidden fixed top-0 inset-x-0 h-[3px] z-[80] pointer-events-none" aria-hidden>
      <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-paw-forest via-emerald-400 to-paw-honey" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
};

// ── Floating "back to top" paw button ───────────────────────────────────────

export const BackToTop: React.FC<{ className?: string }> = ({ className = 'bottom-6 left-6' }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={show ? 0 : -1}
      className={`print:hidden group fixed ${className} z-[60] w-12 h-12 rounded-full bg-paw-forest text-white shadow-soft-xl flex items-center justify-center transition-all duration-500 hover:bg-paw-deep hover:-translate-y-1 ${show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-75 pointer-events-none'}`}
    >
      <PawIcon className="w-5 h-5 absolute transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-3" />
      <ArrowUp className="w-5 h-5 absolute opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
    </button>
  );
};

// ── Paw prints that drift slowly upward behind a section ───────────────────

// Fixed positions so the layout is the same on every render
const DRIFT = [
  { left: '6%', top: '72%', size: 'w-6 h-6', delay: 0, dur: 11, rot: -20, o: 0.45 },
  { left: '18%', top: '30%', size: 'w-4 h-4', delay: 3.5, dur: 13, rot: 15, o: 0.35 },
  { left: '34%', top: '85%', size: 'w-5 h-5', delay: 6, dur: 12, rot: -8, o: 0.4 },
  { left: '52%', top: '60%', size: 'w-3.5 h-3.5', delay: 1.8, dur: 10, rot: 25, o: 0.3 },
  { left: '68%', top: '88%', size: 'w-6 h-6', delay: 4.6, dur: 14, rot: -30, o: 0.4 },
  { left: '82%', top: '40%', size: 'w-4 h-4', delay: 8, dur: 12, rot: 10, o: 0.35 },
  { left: '92%', top: '75%', size: 'w-5 h-5', delay: 2.4, dur: 11, rot: -12, o: 0.4 },
];

export const FloatingPaws: React.FC<{ className?: string; count?: number }> = ({ className = 'text-paw-sage dark:text-paw-warm-sage/60', count = DRIFT.length }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
    {DRIFT.slice(0, count).map((p, i) => (
      <PawIcon
        key={i}
        className={`absolute ${p.size}`}
        // inline custom properties drive the shared driftUp keyframes
        style={{
          left: p.left, top: p.top, opacity: 0,
          animation: `driftUp ${p.dur}s ease-in-out ${p.delay}s infinite`,
          '--rot': `${p.rot}deg`, '--o': p.o,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

// ── A little trail of paw prints that "walks" across, then loops ────────────

export const PawTrail: React.FC<{ steps?: number; className?: string; duration?: number }> = ({ steps = 9, className = 'text-paw-sage/70 dark:text-paw-warm-sage/40', duration = 4.5 }) => (
  <div className={`flex items-center justify-between ${className}`} aria-hidden>
    {Array.from({ length: steps }, (_, i) => (
      <span
        key={i}
        className="inline-block"
        style={{
          // alternate left / right foot
          marginTop: i % 2 ? '14px' : '-14px',
          opacity: 0,
          animation: `pawStep ${duration}s ease-out ${(i / steps) * (duration * 0.6)}s infinite`,
          '--rot': '90deg',
        } as React.CSSProperties}
      >
        <PawIcon className="w-5 h-5" />
      </span>
    ))}
  </div>
);

// ── Organic wave edge between two sections ──────────────────────────────────

export const WaveDivider: React.FC<{ className?: string; flip?: boolean }> = ({ className = 'fill-paw-cream dark:fill-paw-darkbg', flip = false }) => (
  <svg viewBox="0 0 1440 64" preserveAspectRatio="none" className={`block w-full h-10 sm:h-16 ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden>
    <path d="M0 0h1440v22c-120 22-260 38-430 30C850 44 760 14 600 14S330 50 180 52C100 53 40 44 0 36z" />
  </svg>
);

// ── Loading indicator: three paws bouncing in turn ─────────────────────────

export const PawLoader: React.FC<{ label?: string; className?: string }> = ({ label = 'Fetching treats…', className = '' }) => (
  <div className={`flex flex-col items-center gap-3 text-paw-secondary dark:text-paw-warm-sage ${className}`} role="status" aria-label="Loading">
    <div className="flex items-end gap-2 text-paw-forest dark:text-paw-sage">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`inline-block ${i === 1 ? '-rotate-12' : 'rotate-12'}`}>
          <PawIcon className="w-6 h-6 animate-paw-bounce" style={{ animationDelay: `${i * 0.18}s` }} />
        </span>
      ))}
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </div>
);

// ── One document-level listener feeds the cursor position to .spotlight cards ─

export function useSpotlightTracker() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia?.('(pointer: fine)').matches) return;
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.('.spotlight, .card-interactive') as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, []);
}

// ── Pointer parallax: sets --px / --py (-1…1) on the element ────────────────

export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia?.('(pointer: fine)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    const onLeave = () => { el.style.setProperty('--px', '0'); el.style.setProperty('--py', '0'); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return ref;
}

// Style for a parallax layer; `depth` is how many pixels it travels at the edge.
// Uses the standalone `translate` property so it stacks with float animations.
export const parallax = (depth: number): React.CSSProperties => ({
  translate: `calc(var(--px, 0) * ${depth}px) calc(var(--py, 0) * ${depth}px)`,
  transition: 'translate 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
});
