import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Sparkles, FileWarning, Clock3, Scale, CheckCircle2, ArrowRight } from 'lucide-react';
import { Reveal, IconTile } from '../components/ui';

const PROBLEMS = [
  { icon: FileWarning, text: 'Vaccination certificates lost in drawers or buried in old email threads.' },
  { icon: Clock3, text: 'Boosters and check-ups that quietly slip past their due date.' },
  { icon: Scale, text: 'Slow weight changes that go unnoticed until they become a problem.' },
];

const PROMISES = [
  'Every record for every pet in one place — vaccines, doses, weight, visits, costs and documents.',
  'Reminders that arrive before something is due, not after.',
  'Vet-ready summaries and share links when someone else needs the details.',
  'One tap to the essentials in an emergency.',
];

const VALUES = [
  { icon: Heart, tone: 'rose' as const, title: 'Made with care', text: 'Calm, friendly screens that make looking after them feel lighter, not like admin.' },
  { icon: ShieldCheck, tone: 'forest' as const, title: 'Private by default', text: 'Only you see your pets’ records. Sharing is always a link you create and can revoke.' },
  { icon: Sparkles, tone: 'amber' as const, title: 'Genuinely useful', text: 'Every feature exists because pet parents asked “how do I keep track of…?”.' },
];

export const About: React.FC = () => (
  <div className="relative overflow-hidden">
    <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-emerald-100/70 dark:bg-emerald-500/5 rounded-full blur-3xl animate-blob" aria-hidden />

    {/* Hero */}
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
      <div className="stagger">
        <span className="eyebrow text-paw-forest dark:text-paw-sage">Our story</span>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl font-semibold tracking-tight text-paw-dark dark:text-white leading-[1.05]">
          Built from the heart, <span className="text-gradient">because they’re family.</span>
        </h1>
        <p className="mt-6 text-lg text-paw-secondary dark:text-paw-warm-sage leading-relaxed max-w-xl">
          PawPrint started with a simple thought: our pets give us unconditional love every day. Looking after their health should feel just as loving, organised and reliable.
        </p>
        <Link to="/signup" className="btn-primary btn-lg mt-8 group">Join PawPrint <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
      </div>
      <div className="relative h-[26rem] sm:h-[30rem]">
        <img src="/images/dog-samoyed.webp" alt="A smiling Samoyed" className="absolute right-0 top-0 w-[58%] h-[78%] object-cover rounded-[2.5rem] shadow-soft-2xl rotate-[3deg] animate-float-slow" />
        <img src="/images/cat-ginger.webp" alt="A ginger cat resting" className="absolute left-0 bottom-0 w-[50%] h-[62%] object-cover rounded-[2.5rem] shadow-soft-2xl ring-8 ring-paw-cream dark:ring-paw-darkbg rotate-[-4deg] animate-float-reverse" />
        <div className="absolute left-[30%] top-[8%] glass-card rounded-2xl px-4 py-3 shadow-soft-xl border border-white/60 dark:border-paw-darkborder animate-float-delayed">
          <div className="text-xs font-extrabold text-paw-dark dark:text-white">Luna · Chief Joy Officer</div>
          <div className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">All vaccines up to date ✓</div>
        </div>
      </div>
    </section>

    {/* Problem vs promise */}
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 grid md:grid-cols-2 gap-6">
      <Reveal className="card p-8">
        <h2 className="text-2xl font-extrabold text-paw-dark dark:text-white">What pet parents deal with</h2>
        <ul className="mt-6 space-y-4">
          {PROBLEMS.map(({ icon, text }) => (
            <li key={text} className="flex gap-3"><IconTile icon={icon} tone="rose" size="sm" /><span className="text-sm text-paw-secondary dark:text-paw-warm-sage pt-1.5">{text}</span></li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={100} className="rounded-3xl p-8 bg-gradient-to-br from-paw-forest to-paw-deep text-white shadow-soft-xl">
        <h2 className="text-2xl font-extrabold">What PawPrint does instead</h2>
        <ul className="mt-6 space-y-4">
          {PROMISES.map((t) => (
            <li key={t} className="flex gap-3 text-sm text-emerald-50/90"><CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-300" />{t}</li>
          ))}
        </ul>
      </Reveal>
    </section>

    {/* Values */}
    <section className="bg-white/70 dark:bg-paw-darksurface/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="eyebrow text-paw-forest dark:text-paw-sage">What we believe</span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-paw-dark dark:text-white">Small things, done with love</h2>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 100} className="card card-interactive p-7">
              <IconTile icon={v.icon} tone={v.tone} size="lg" />
              <h3 className="mt-5 text-lg font-extrabold text-paw-dark dark:text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{v.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Photo strip */}
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['/images/pug-sweater.webp', '/images/frenchie.webp', '/images/kitten-paw.webp', '/images/dog-aussie.webp'].map((src, i) => (
          <Reveal key={src} delay={i * 80} from="zoom" className="aspect-square rounded-3xl overflow-hidden shadow-soft-lg group">
            <img src={src} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </Reveal>
        ))}
      </div>
    </section>
  </div>
);
