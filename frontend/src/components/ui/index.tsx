import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { TONES, type Tone } from '../../lib/navigation';
import type { Pet } from '../../types';

// ── Reveal: fades content in the first time it scrolls into view ─────────────

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: 'up' | 'left' | 'right' | 'zoom';
  as?: 'div' | 'section' | 'li' | 'article';
};

export const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0, from = 'up', as: Tag = 'div' }) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  // Once the entrance has played, drop the reveal classes so hover effects work normally
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setDone(true), 750 + delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No IntersectionObserver (old browsers, tests) — just show it
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const fromCls = from === 'left' ? 'reveal-left' : from === 'right' ? 'reveal-right' : from === 'zoom' ? 'reveal-zoom' : '';
  return React.createElement(
    Tag,
    {
      ref: ref as React.Ref<HTMLElement>,
      className: done ? className : `reveal ${fromCls} ${visible ? 'is-visible' : ''} ${className}`,
      style: { '--reveal-delay': `${delay}ms` } as React.CSSProperties,
    },
    children,
  );
};

// ── Count-up number for stat tiles ──────────────────────────────────────────

export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const from = useRef(0);
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !Number.isFinite(target)) { setValue(target); return; }
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(begin + (target - begin) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export const CountUp: React.FC<{ value: number; decimals?: number; format?: (n: number) => string }> = ({ value, decimals = 0, format }) => {
  const n = useCountUp(value);
  const rounded = Number(n.toFixed(decimals));
  return <>{format ? format(rounded) : rounded.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
};

// ── Icon tile in a feature colour ────────────────────────────────────────────

export const IconTile: React.FC<{ icon: LucideIcon; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ icon: Icon, tone = 'forest', size = 'md', className = '' }) => {
  const dims = size === 'sm' ? 'w-8 h-8 rounded-xl' : size === 'lg' ? 'w-14 h-14 rounded-2xl' : 'w-11 h-11 rounded-2xl';
  const icon = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  return (
    <span className={`${dims} ${TONES[tone].tile} inline-flex items-center justify-center flex-shrink-0 ${className}`}>
      <Icon className={icon} />
    </span>
  );
};

// ── Section header used at the top of every dashboard tab ────────────────────

export const SectionHeader: React.FC<{
  icon: LucideIcon;
  tone?: Tone;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ icon, tone = 'forest', eyebrow, title, description, actions }) => (
  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
    <div className="flex items-start gap-4 min-w-0">
      <IconTile icon={icon} tone={tone} size="lg" className="hidden sm:inline-flex shadow-2xs" />
      <div className="min-w-0">
        <div className={`eyebrow ${TONES[tone].text}`}>{eyebrow}</div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-paw-dark dark:text-white">{title}</h2>
        {description && <p className="mt-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage/80 max-w-2xl">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

// ── Stat tile ───────────────────────────────────────────────────────────────

export const StatTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  onClick?: () => void;
  className?: string;
}> = ({ label, value, hint, icon, tone = 'forest', onClick, className = '' }) => {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">{label}</span>
        {icon && <IconTile icon={icon} tone={tone} size="sm" />}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-paw-dark dark:text-white truncate">{value}</div>
      {hint && <div className="mt-1 text-xs text-paw-secondary dark:text-paw-warm-sage inline-flex items-center gap-1 max-w-full truncate">{hint}</div>}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={`card card-interactive p-5 text-left w-full ${className}`}>{body}</button>
  ) : (
    <div className={`card p-5 ${className}`}>{body}</div>
  );
};

// ── Empty state ─────────────────────────────────────────────────────────────

export const EmptyState: React.FC<{
  icon: LucideIcon;
  tone?: Tone;
  title: string;
  text?: React.ReactNode;
  action?: React.ReactNode;
  image?: string;
  className?: string;
}> = ({ icon, tone = 'forest', title, text, action, image, className = '' }) => (
  <div className={`card-muted border-dashed px-6 py-12 text-center flex flex-col items-center ${className}`}>
    {image ? (
      <img src={image} alt="" className="w-24 h-24 rounded-full object-cover shadow-soft mb-4 ring-4 ring-white dark:ring-paw-darkcard" />
    ) : (
      <IconTile icon={icon} tone={tone} size="lg" className="mb-4 animate-float-slow" />
    )}
    <p className="font-bold text-paw-dark dark:text-white">{title}</p>
    {text && <p className="mt-1 text-sm text-paw-secondary dark:text-paw-warm-sage max-w-md">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ── Segmented control ───────────────────────────────────────────────────────

export function Segmented<T extends string>({ options, value, onChange, label }: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={`segmented-item ${value === o.value ? 'segmented-item-active' : ''}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Progress ring ───────────────────────────────────────────────────────────

export const ProgressRing: React.FC<{ value: number; size?: number; stroke?: number; className?: string; trackClassName?: string; children?: React.ReactNode }> = ({
  value, size = 64, stroke = 7, className = 'stroke-emerald-500', trackClassName = 'stroke-paw-soft-sage dark:stroke-paw-darkborder', children,
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClassName} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className={`${className} transition-[stroke-dashoffset] duration-700 ease-out`} />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
};

// ── Pet avatar with a local fallback (no third-party avatar service) ─────────

export const petFallbackPhoto = (species?: string) =>
  species === 'cat' ? '/images/cat-peek.webp' : species === 'dog' ? '/images/dog-portrait.webp' : '/images/cat-dog-cuddle.webp';

export const PetAvatar: React.FC<{ pet: Pick<Pet, 'name' | 'photo' | 'species'>; className?: string; ring?: boolean }> = ({ pet, className = 'w-10 h-10', ring = false }) => (
  <img
    src={pet.photo || petFallbackPhoto(pet.species)}
    alt={pet.name}
    loading="lazy"
    className={`${className} rounded-full object-cover flex-shrink-0 bg-paw-light-sage ${ring ? 'ring-2 ring-white dark:ring-paw-darkcard' : ''}`}
    onError={(e) => {
      const img = e.currentTarget;
      const fallback = petFallbackPhoto(pet.species);
      if (!img.src.endsWith(fallback)) img.src = fallback;
    }}
  />
);

export const speciesEmoji = (species?: string) => (species === 'dog' ? '🐶' : species === 'cat' ? '🐱' : '🐾');
