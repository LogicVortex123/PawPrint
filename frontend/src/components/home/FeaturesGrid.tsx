import React from 'react';
import { Link } from 'react-router-dom';
import {
  Syringe, Pill, Scale, Calendar, Wallet, FileText, MapPin, Clock, Bell, Siren, Share2, ArrowUpRight, Check,
} from 'lucide-react';
import { Reveal, IconTile } from '../ui';
import { TONES, type Tone } from '../../lib/navigation';

const Tile: React.FC<{
  icon: typeof Syringe; tone: Tone; title: string; text: string; className?: string; delay?: number; children?: React.ReactNode;
}> = ({ icon, tone, title, text, className = '', delay = 0, children }) => (
  <Reveal delay={delay} className={`group card card-interactive p-6 flex flex-col overflow-hidden relative ${className}`}>
    <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${TONES[tone].soft} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden />
    <div className="relative flex items-start justify-between">
      <IconTile icon={icon} tone={tone} className="group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300" />
      <ArrowUpRight className="w-5 h-5 text-paw-secondary/40 group-hover:text-paw-forest dark:group-hover:text-paw-sage group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </div>
    <h3 className="relative mt-5 text-lg font-extrabold text-paw-dark dark:text-white">{title}</h3>
    <p className="relative mt-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{text}</p>
    {children && <div className="relative mt-5 flex-1 flex items-end">{children}</div>}
  </Reveal>
);

export const FeaturesGrid: React.FC = () => (
  <section id="features" className="relative py-24 scroll-mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="eyebrow text-paw-forest dark:text-paw-sage">Everything in one place</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">Ten tools. One happy, healthy pet.</h2>
        <p className="mt-4 text-lg text-paw-secondary dark:text-paw-warm-sage">From the first puppy shots to senior-year check-ups — every record, reminder and receipt lives together.</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-[minmax(0,auto)]">
        {/* Large: vaccinations with photo */}
        <Reveal className="group card card-interactive overflow-hidden sm:col-span-2 lg:row-span-2 flex flex-col">
          <div className="relative h-56 lg:h-72 overflow-hidden">
            <img src="/images/vet-care.webp" alt="A vet gently checking a cat" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0" />
            <div className="absolute left-4 bottom-4 right-4 flex flex-wrap gap-2">
              {[['Rabies', 'Up to date', 'bg-emerald-500'], ['DHPP', 'Due in 12 days', 'bg-amber-500'], ['Lepto', '6 days overdue', 'bg-rose-500']].map(([n, s, c]) => (
                <span key={n} className="glass-card rounded-full pl-2 pr-3 py-1 text-[11px] font-bold text-paw-dark dark:text-white inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${c}`} />{n} · {s}</span>
              ))}
            </div>
          </div>
          <div className="p-6">
            <IconTile icon={Syringe} tone="sky" />
            <h3 className="mt-4 text-xl font-extrabold text-paw-dark dark:text-white">Vaccinations that never slip</h3>
            <p className="mt-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">
              Pick a vaccine and PawPrint fills in the usual booster interval for dogs or cats. You'll see what's up to date, due soon or overdue at a glance — and get reminded ahead of time.
            </p>
          </div>
        </Reveal>

        <Tile icon={Pill} tone="violet" title="Daily medications" text="A tick-box for every dose, streaks, and on-time rates for the last 7 and 30 days." delay={60}>
          <div className="w-full flex gap-2">
            {['Morning', 'Evening'].map((l, i) => (
              <span key={l} className={`flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-full text-xs font-bold ${i === 0 ? 'bg-emerald-600 text-white' : 'border border-paw-line dark:border-paw-darkborder text-paw-dark dark:text-white'}`}>
                {i === 0 ? <Check className="w-3.5 h-3.5" /> : <span className="w-3 h-3 rounded-full border-2 border-current opacity-50" />}{l}
              </span>
            ))}
          </div>
        </Tile>

        <Tile icon={Scale} tone="amber" title="Weight trends" text="A chart with your vet's healthy range, so gradual changes don't sneak up on you." delay={120}>
          <svg viewBox="0 0 200 50" className="w-full h-12" aria-hidden>
            <rect x="0" y="12" width="200" height="22" rx="6" className="fill-emerald-500/10" />
            <path d="M4 40 C 30 36, 50 30, 70 31 S 110 22, 130 23 S 170 15, 196 13" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </Tile>

        <Tile icon={Wallet} tone="rose" title="Expense insights" text="Vet bills, food and grooming by month and category. Export to a spreadsheet anytime." delay={60}>
          <div className="w-full flex items-end gap-1.5 h-12">
            {[30, 55, 40, 70, 45, 85, 60].map((h, i) => (
              <span key={i} className={`flex-1 rounded-t-md ${i === 5 ? 'bg-rose-500' : 'bg-rose-200 dark:bg-rose-500/30'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </Tile>

        <Tile icon={Bell} tone="orange" title="Smart reminders" text="Boosters, visits to confirm, doses still due and weigh-in nudges — in the app, by email or as browser alerts." delay={120} />

        <Tile icon={Calendar} tone="teal" title="Vet appointments" text="Book visits, add them to your calendar, then log what each one cost." delay={0} />
        <Tile icon={FileText} tone="indigo" title="Medical vault" text="Lab reports, prescriptions and insurance — PDFs or photos, always on hand." delay={60} />
        <Tile icon={MapPin} tone="lime" title="Nearby clinics" text="Vets ranked by distance, 24/7 emergency care flagged. Save the ones you trust." delay={120} />
        <Tile icon={Clock} tone="slate" title="Health timeline" text="Their whole story in order: every shot, weigh-in, visit and document." delay={180} />

        <Reveal className="sm:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-rose-600 to-red-500 text-white shadow-soft-lg group">
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-white/10" aria-hidden />
          <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><Siren className="w-5 h-5 group-hover:animate-wiggle" /></span>
          <h3 className="mt-4 text-xl font-extrabold">Emergency Mode</h3>
          <p className="mt-1.5 text-sm text-white/85 max-w-md">One tap shows allergies, medications, microchip and who to call — big and readable when your hands are shaking.</p>
        </Reveal>
        <Reveal delay={80} className="sm:col-span-2 relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-paw-forest to-paw-deep text-white shadow-soft-lg">
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-white/10" aria-hidden />
          <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><Share2 className="w-5 h-5" /></span>
          <h3 className="mt-4 text-xl font-extrabold">Share with your vet or sitter</h3>
          <p className="mt-1.5 text-sm text-white/85 max-w-md">Create a read-only link that expires on its own, or print a tidy PDF health summary before the visit.</p>
        </Reveal>
      </div>

      <Reveal className="mt-10 text-center">
        <Link to="/signup" className="btn-secondary btn-lg">Try every feature free <ArrowUpRight className="w-4 h-4" /></Link>
      </Reveal>
    </div>
  </section>
);
