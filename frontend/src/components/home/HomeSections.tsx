import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ChevronDown, PawPrint, ShieldCheck, Share2, Download, Bell, Link2, Check, MessageCircleHeart,
} from 'lucide-react';
import { Reveal, IconTile, CountUpInView } from '../ui';
import { FloatingPaws, parallax, useParallax } from '../common/Motion';
import { useAppStore } from '../../store/useAppStore';

const MARQUEE = ['Vaccination reminders', 'Daily dose checklist', 'Weight trends', 'Vet appointments', 'Expense insights', 'Medical vault', 'Nearby clinics', 'Emergency mode', 'Share with your vet', 'Health timeline'];

export const FeatureMarquee: React.FC = () => (
  <div className="group relative py-5 border-y border-paw-line dark:border-paw-darkborder bg-white/60 dark:bg-paw-darksurface/60 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
    <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
      {[...MARQUEE, ...MARQUEE].map((t, i) => (
        <span key={i} className="flex items-center gap-10 text-sm font-bold text-paw-secondary dark:text-paw-warm-sage whitespace-nowrap">
          {t}<PawPrint className="w-4 h-4 text-paw-sage" />
        </span>
      ))}
    </div>
  </div>
);

// Plain facts about the product, counted up as they scroll into view
const STATS = [
  { value: 10, suffix: '', label: 'care tools in one place' },
  { value: 3, suffix: '', label: 'ways to be reminded — app, email & browser' },
  { value: 1, suffix: ' tap', label: 'to emergency info when it matters' },
  { value: 100, suffix: '%', label: 'free, with your data always exportable' },
];

export const StatsBand: React.FC = () => (
  <section className="pt-20 pb-4">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 90} className="card card-interactive p-6 text-center overflow-hidden">
          <div className="font-display text-5xl font-semibold tracking-tight text-paw-forest dark:text-paw-sage">
            <CountUpInView value={s.value} />{s.suffix}
          </div>
          <p className="mt-2 text-sm text-paw-secondary dark:text-paw-warm-sage">{s.label}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

const PROMISES = [
  { icon: ShieldCheck, tone: 'forest' as const, title: 'Private by default', text: 'Only you see your pets’ records — nothing is shared unless you create a link.' },
  { icon: Bell, tone: 'orange' as const, title: 'Reminded before, not after', text: 'Boosters, doses and visits surface ahead of time in the app, by email or as browser alerts.' },
  { icon: Share2, tone: 'teal' as const, title: 'Vet-ready in seconds', text: 'A read-only link that expires on its own, or a tidy PDF health summary to print.' },
  { icon: Download, tone: 'indigo' as const, title: 'Your data, always yours', text: 'Download everything from Settings, or export expenses as a spreadsheet anytime.' },
];

export const PeaceOfMind: React.FC = () => {
  const visualRef = useParallax<HTMLDivElement>();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute -right-32 top-10 w-[30rem] h-[30rem] bg-emerald-100/60 dark:bg-emerald-500/5 blur-3xl animate-blob" aria-hidden />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
        {/* Photo collage */}
        <Reveal from="left" className="order-2 lg:order-1">
          <div ref={visualRef} className="relative mx-auto max-w-lg aspect-square">
            <div style={parallax(-8)} className="absolute inset-[8%] organic-blob-2 bg-gradient-to-br from-paw-soft-sage via-emerald-100 to-paw-honey-soft dark:from-paw-darkcard dark:via-emerald-900/40 dark:to-amber-900/20 animate-blob" aria-hidden />
            <img style={parallax(5)} src="/images/dog-aussie.webp" alt="An Australian Shepherd sitting happily" loading="lazy"
              className="absolute right-[4%] top-[6%] w-[62%] h-[70%] object-cover rounded-[2.5rem] shadow-soft-2xl rotate-[3deg]" />
            <img style={parallax(12)} src="/images/cat-ginger.webp" alt="A ginger cat relaxing" loading="lazy"
              className="absolute left-[2%] bottom-[4%] w-[46%] h-[50%] object-cover rounded-[2rem] shadow-soft-xl ring-8 ring-paw-cream dark:ring-paw-darkbg rotate-[-5deg]" />

            <div style={parallax(20)} className="absolute left-[4%] top-[14%] glass-card rounded-2xl p-3 pr-4 shadow-soft-xl border border-white/60 dark:border-paw-darkborder flex items-center gap-3 animate-float-slow">
              <IconTile icon={Link2} tone="teal" size="sm" />
              <div>
                <div className="text-xs font-extrabold text-paw-dark dark:text-white">Share link for Dr. Patel</div>
                <div className="text-[11px] font-semibold text-paw-secondary dark:text-paw-warm-sage">Read-only · expires in 7 days</div>
              </div>
            </div>
            <div style={parallax(16)} className="absolute right-0 bottom-[10%] glass-card rounded-2xl p-3 pr-4 shadow-soft-xl border border-white/60 dark:border-paw-darkborder flex items-center gap-3 animate-float-delayed">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check className="w-4 h-4" /></span>
              <div className="text-xs font-extrabold text-paw-dark dark:text-white">All caught up this week</div>
            </div>
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="eyebrow text-paw-forest dark:text-paw-sage">Peace of mind</span>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">
              Less remembering. <span className="font-script text-5xl sm:text-6xl text-paw-coral font-normal">More cuddles.</span>
            </h2>
            <p className="mt-4 text-lg text-paw-secondary dark:text-paw-warm-sage max-w-xl">
              PawPrint quietly keeps track so you don’t have to — and puts you in control of who sees what.
            </p>
          </Reveal>
          <ul className="mt-8 grid sm:grid-cols-2 gap-4">
            {PROMISES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90} className="group card card-interactive p-5 overflow-hidden">
                <IconTile icon={p.icon} tone={p.tone} className="group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300" />
                <h3 className="mt-4 font-extrabold text-paw-dark dark:text-white">{p.title}</h3>
                <p className="mt-1 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{p.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

const FAQ = [
  ['Is PawPrint free?', 'Yes. Every feature — reminders, expenses, the medical vault and sharing — is free to use.'],
  ['Which pets can I add?', 'Dogs and cats get species-specific vaccine suggestions; any other pet works with the same records, reminders and costs.'],
  ['Who can see my pet’s records?', 'Only you. A vet or sitter can view a read-only summary only through a share link you create, and links expire on their own or whenever you revoke them.'],
  ['How do reminders reach me?', 'In the app’s bell and care feed, as a daily email digest if you turn it on, and as browser alerts on devices where you allow them.'],
  ['What is PawPal?', 'PawPrint’s built-in care assistant. Tap “Ask PawPal” on any page to ask what’s due, check today’s doses, or get everyday care tips. It isn’t a vet — for anything urgent it will tell you to call one.'],
  ['Can I take my data with me?', 'Yes — download a copy of all your data from Settings, export expenses as a spreadsheet, or print a PDF health summary.'],
];

export const FaqSection: React.FC = () => (
  <section className="py-24 bg-white/70 dark:bg-paw-darksurface/40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16 items-start">
      <Reveal from="left" className="lg:sticky lg:top-28 text-center lg:text-left">
        <span className="eyebrow text-paw-forest dark:text-paw-sage">Questions</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">Good to know</h2>
        <p className="mt-4 text-paw-secondary dark:text-paw-warm-sage max-w-md mx-auto lg:mx-0">The short answers to what pet parents ask us most.</p>
        <div className="mt-8 hidden lg:flex items-center gap-4 card p-4 max-w-sm">
          <img src="/images/pug-sweater.webp" alt="" loading="lazy" className="w-14 h-14 rounded-2xl object-cover" />
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-paw-dark dark:text-white inline-flex items-center gap-1.5"><MessageCircleHeart className="w-4 h-4 text-paw-coral" /> Still curious?</div>
            <Link to="/about" className="text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline inline-flex items-center gap-1 group">
              Read our story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="space-y-3">
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 70} from="right">
            <details className="group card p-5 open:shadow-card-hover open:border-paw-sage/50 transition-all">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-paw-dark dark:text-white">
                <span className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-sage text-xs font-extrabold flex items-center justify-center flex-shrink-0 group-open:bg-paw-forest group-open:text-white dark:group-open:bg-paw-sage dark:group-open:text-paw-darkbg transition-colors">{i + 1}</span>
                  {q}
                </span>
                <ChevronDown className="w-5 h-5 text-paw-secondary transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
              </summary>
              <p className="details-body mt-3 pl-10 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export const CtaBanner: React.FC = () => {
  const { isAuthenticated } = useAppStore();
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24">
      <Reveal from="zoom" className="group relative max-w-7xl mx-auto overflow-hidden rounded-[2.5rem] shadow-soft-2xl">
        <img src="/images/dogs-running.webp" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms]" />
        <div className="absolute inset-0 bg-gradient-to-r from-paw-deep/95 via-paw-forest/85 to-paw-forest/30" />
        <FloatingPaws className="text-white/60" count={5} />
        <div className="relative px-8 py-16 sm:px-14 sm:py-20 max-w-xl text-white">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Because they’re family.</h2>
          <p className="mt-4 text-lg text-white/85">Give them the organised, on-time care they deserve — starting today.</p>
          <Link to={isAuthenticated ? '/dashboard' : '/signup'} className="btn btn-lg mt-8 bg-white text-paw-forest hover:bg-emerald-50 shadow-soft-lg group/cta">
            {isAuthenticated ? 'Go to your dashboard' : 'Create your free account'} <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
};
