import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Syringe, Pill, Check, Sparkles, ShieldCheck, LayoutDashboard, Bell } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ProgressRing } from '../ui';

const PET_FACES = ['/images/dog-portrait.webp', '/images/cat-peek.webp', '/images/corgi-puppy.webp', '/images/kitten-paw.webp'];

export const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAppStore();

  return (
    <section className="relative overflow-hidden -mt-[76px] pt-[76px]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-paw-light-sage via-paw-cream to-paw-cream dark:from-paw-darksurface dark:via-paw-darkbg dark:to-paw-darkbg" aria-hidden />
      <div className="absolute inset-0 bg-paw-pattern [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" aria-hidden />
      <div className="absolute -top-20 -left-24 w-[28rem] h-[28rem] bg-emerald-200/50 dark:bg-emerald-500/10 blur-3xl animate-blob" aria-hidden />
      <div className="absolute top-40 -right-24 w-[26rem] h-[26rem] bg-amber-100/70 dark:bg-amber-500/5 blur-3xl animate-blob" style={{ animationDelay: '-7s' }} aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-20 lg:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left stagger">
          <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-semibold tracking-tight text-paw-dark dark:text-white">
            Every wag, purr &amp; checkup —{' '}
            <span className="relative inline-block">
              <span className="text-gradient">beautifully organised.</span>
              <svg className="absolute left-0 -bottom-2 w-full h-3 text-emerald-300 dark:text-emerald-600" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9 C 80 2, 200 2, 298 8" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" pathLength={1000} strokeDasharray="1000" style={{ animation: 'draw 1.4s 0.5s ease-out both' }} />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-lg text-paw-secondary dark:text-paw-warm-sage/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            PawPrint keeps your dog's and cat's vaccines, daily doses, weight, vet visits, costs and documents in one calm place —
            and nudges you before anything is due.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            {isAuthenticated ? (
              <Link to="/features" className="btn-primary btn-lg group w-full sm:w-auto">
                <LayoutDashboard className="w-5 h-5" /> Open your dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary btn-lg group w-full sm:w-auto">
                Start free — it takes a minute <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link to="/#features" className="btn-secondary btn-lg w-full sm:w-auto">Explore features</Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <div className="flex -space-x-3">
              {PET_FACES.map((src, i) => (
                <img key={src} src={src} alt="" className="w-11 h-11 rounded-full object-cover ring-4 ring-paw-cream dark:ring-paw-darkbg shadow-soft" style={{ zIndex: 10 - i }} />
              ))}
            </div>
            <div className="text-sm text-paw-secondary dark:text-paw-warm-sage text-center sm:text-left">
              <div className="font-bold text-paw-dark dark:text-white">Made for dogs, cats &amp; every pet in between</div>
              <div className="flex items-center gap-3 justify-center sm:justify-start text-xs mt-0.5">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-paw-forest dark:text-paw-sage" /> Private by default</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Free to use</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-[34rem] aspect-[1/1.02]">
          <div className="absolute inset-[6%] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-gradient-to-br from-emerald-300 via-emerald-200 to-amber-100 dark:from-emerald-700 dark:via-emerald-800 dark:to-amber-900/40 animate-blob opacity-90" aria-hidden />
          <div className="absolute inset-[10%] rounded-[3rem] overflow-hidden shadow-soft-2xl rotate-[2deg] animate-scaleIn">
            <img src="/images/hero-beagle.webp" alt="A happy beagle looking at the camera" className="w-full h-full object-cover scale-110" />
          </div>
          <div className="absolute -left-2 sm:left-0 bottom-[6%] w-[36%] aspect-square rounded-[2rem] overflow-hidden ring-8 ring-paw-cream dark:ring-paw-darkbg shadow-soft-xl rotate-[-6deg] animate-float-reverse">
            <img src="/images/cat-tabby-blue.webp" alt="A curious tabby cat" className="w-full h-full object-cover" />
          </div>

          {/* Floating cards */}
          <div className="absolute -left-3 sm:-left-8 top-[12%] glass-card rounded-2xl p-3 pr-4 shadow-soft-xl border border-white/60 dark:border-paw-darkborder flex items-center gap-3 animate-float-slow">
            <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 flex items-center justify-center"><Syringe className="w-5 h-5" /></span>
            <div>
              <div className="text-xs font-extrabold text-paw-dark dark:text-white">Rabies booster</div>
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Due in 5 days</div>
            </div>
          </div>

          <div className="absolute -right-2 sm:-right-6 top-[30%] glass-card rounded-2xl p-3.5 shadow-soft-xl border border-white/60 dark:border-paw-darkborder w-40 animate-float-delayed">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Weight</div>
            <div className="text-xl font-extrabold text-paw-dark dark:text-white">12.4 <span className="text-xs font-semibold">kg</span></div>
            <svg viewBox="0 0 100 28" className="w-full h-7 mt-1" aria-hidden>
              <path d="M2 24 C 18 22, 26 16, 40 17 S 62 9, 74 10 S 90 5, 98 4" fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" pathLength={1000} strokeDasharray="1000" style={{ animation: 'draw 1.8s 0.8s ease-out both' }} />
            </svg>
            <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">✓ In healthy range</div>
          </div>

          <div className="absolute right-[4%] bottom-[2%] glass-card rounded-2xl p-3 pr-4 shadow-soft-xl border border-white/60 dark:border-paw-darkborder flex items-center gap-3 animate-float-slow" style={{ animationDelay: '-2s' }}>
            <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center"><Pill className="w-5 h-5" /></span>
            <div>
              <div className="text-xs font-extrabold text-paw-dark dark:text-white">Apoquel · 8:00 AM</div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"><Check className="w-3 h-3" /> Given · 6-day streak</div>
            </div>
          </div>

          <div className="hidden sm:flex absolute left-[30%] -top-2 glass-card rounded-full pl-2 pr-4 py-2 shadow-soft-lg border border-white/60 dark:border-paw-darkborder items-center gap-2 animate-float-reverse">
            <ProgressRing value={92} size={30} stroke={4} className="stroke-emerald-500" />
            <span className="text-xs font-extrabold text-paw-dark dark:text-white">Care score 92</span>
            <Bell className="w-3.5 h-3.5 text-orange-500 animate-wiggle" />
          </div>
        </div>
      </div>
    </section>
  );
};
