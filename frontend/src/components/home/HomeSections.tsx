import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, PawPrint, NotebookPen, BellRing } from 'lucide-react';
import { Reveal } from '../ui';
import { useAppStore } from '../../store/useAppStore';

const MARQUEE = ['Vaccination reminders', 'Daily dose checklist', 'Weight trends', 'Vet appointments', 'Expense insights', 'Medical vault', 'Nearby clinics', 'Emergency mode', 'Share with your vet', 'Health timeline'];

export const FeatureMarquee: React.FC = () => (
  <div className="relative py-5 border-y border-paw-line dark:border-paw-darkborder bg-white/60 dark:bg-paw-darksurface/60 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
    <div className="flex w-max animate-marquee gap-10">
      {[...MARQUEE, ...MARQUEE].map((t, i) => (
        <span key={i} className="flex items-center gap-10 text-sm font-bold text-paw-secondary dark:text-paw-warm-sage whitespace-nowrap">
          {t}<PawPrint className="w-4 h-4 text-paw-sage" />
        </span>
      ))}
    </div>
  </div>
);

const STEPS = [
  { icon: PawPrint, img: '/images/corgi-puppy.webp', title: 'Add your pet', text: 'Name, species, birthday and a photo. Allergies and your vet’s number if you have them handy.' },
  { icon: NotebookPen, img: '/images/kitten-paw.webp', title: 'Log what happens', text: 'Vaccines, doses, weigh-ins, visits, bills and documents — each takes a few seconds.' },
  { icon: BellRing, img: '/images/dog-beach.webp', title: 'Relax — we’ll remind you', text: 'Boosters, doses and check-ups surface before they’re due, in the app or by email.' },
];

export const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="py-24 bg-white/70 dark:bg-paw-darksurface/40 scroll-mt-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Reveal className="text-center max-w-2xl mx-auto">
        <span className="eyebrow text-paw-forest dark:text-paw-sage">How it works</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">Up and running in three steps</h2>
      </Reveal>
      <div className="mt-14 grid md:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 120} className="group card card-interactive overflow-hidden">
            <div className="relative h-56 overflow-hidden">
              <img src={s.img} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white text-paw-forest font-extrabold flex items-center justify-center shadow-soft">{i + 1}</span>
            </div>
            <div className="p-6">
              <s.icon className="w-6 h-6 text-paw-forest dark:text-paw-sage" />
              <h3 className="mt-3 text-lg font-extrabold text-paw-dark dark:text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-paw-secondary dark:text-paw-warm-sage">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const FAQ = [
  ['Is PawPrint free?', 'Yes. Every feature — reminders, expenses, the medical vault and sharing — is free to use.'],
  ['Which pets can I add?', 'Dogs and cats get species-specific vaccine suggestions; any other pet works with the same records, reminders and costs.'],
  ['Who can see my pet’s records?', 'Only you. A vet or sitter can view a read-only summary only through a share link you create, and links expire on their own or whenever you revoke them.'],
  ['How do reminders reach me?', 'In the app’s bell and care feed, as a daily email digest if you turn it on, and as browser alerts on devices where you allow them.'],
  ['Can I take my data with me?', 'Yes — download a copy of all your data from Settings, export expenses as a spreadsheet, or print a PDF health summary.'],
];

export const FaqSection: React.FC = () => (
  <section className="py-24">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <Reveal className="text-center">
        <span className="eyebrow text-paw-forest dark:text-paw-sage">Questions</span>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-paw-dark dark:text-white">Good to know</h2>
      </Reveal>
      <div className="mt-10 space-y-3">
        {FAQ.map(([q, a], i) => (
          <Reveal key={q} delay={i * 60}>
            <details className="group card p-5 open:shadow-card-hover transition-shadow">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-paw-dark dark:text-white">
                {q}<ChevronDown className="w-5 h-5 text-paw-secondary transition-transform group-open:rotate-180 flex-shrink-0" />
              </summary>
              <p className="mt-3 text-sm text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{a}</p>
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
    <section className="px-4 sm:px-6 lg:px-8 pb-28">
      <Reveal from="zoom" className="relative max-w-7xl mx-auto overflow-hidden rounded-[2.5rem] shadow-soft-2xl">
        <img src="/images/dogs-running.webp" alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-paw-deep/95 via-paw-forest/85 to-paw-forest/30" />
        <div className="relative px-8 py-16 sm:px-14 sm:py-20 max-w-xl text-white">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">Because they’re family.</h2>
          <p className="mt-4 text-lg text-white/85">Give them the organised, on-time care they deserve — starting today.</p>
          <Link to={isAuthenticated ? '/features' : '/signup'} className="btn btn-lg mt-8 bg-white text-paw-forest hover:bg-emerald-50 shadow-soft-lg group">
            {isAuthenticated ? 'Go to your dashboard' : 'Create your free account'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
};
