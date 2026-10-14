import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, ArrowRight, Heart } from 'lucide-react';
import { PawIcon } from './OrganicDeco';
import { useAppStore } from '../../store/useAppStore';

const GITHUB_URL = 'https://github.com/LogicVortex123/PawPrint';

const COLUMNS = [
  { title: 'Product', links: [['Features', '/#features'], ['How it works', '/#how-it-works'], ['Roadmap', '/roadmap'], ['About', '/about']] },
  { title: 'Care tools', links: [['Vaccinations', '/features?tab=vaccinations'], ['Medications', '/features?tab=medications'], ['Expenses', '/features?tab=expenses'], ['Nearby clinics', '/features?tab=nearby-clinics']] },
  { title: 'Account', links: [['Log in', '/login'], ['Create account', '/signup'], ['Dashboard', '/features'], ['Settings', '/settings']] },
];

export const Footer: React.FC = () => {
  const { isAuthenticated } = useAppStore();
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  return (
    <footer className="print:hidden relative overflow-hidden bg-paw-deep text-white">
      <div className="absolute inset-0 bg-paw-pattern opacity-[0.07]" aria-hidden />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />
      <PawIcon className="absolute bottom-10 right-[8%] w-24 h-24 text-white/[0.04] rotate-12" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA strip (the home page ends with its own banner) */}
        {pathname !== '/' && <div className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Ready when they need you.</h2>
            <p className="mt-2 text-emerald-100/75">Every vaccine, dose and visit — remembered for you.</p>
          </div>
          <Link to={isAuthenticated ? '/features' : '/signup'} className="btn btn-lg bg-white text-paw-forest hover:bg-emerald-50 shadow-soft-lg group w-fit">
            {isAuthenticated ? 'Open dashboard' : 'Get started free'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>}

        <div className="py-12 grid grid-cols-2 md:grid-cols-12 gap-10">
          <div className="col-span-2 md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/20"><img src="/logo.jpeg" alt="" className="w-full h-full object-cover" /></span>
              <span className="text-xl font-extrabold tracking-tight">Paw<span className="text-paw-warm-sage">Print</span></span>
            </Link>
            <p className="text-sm text-emerald-100/70 max-w-xs leading-relaxed">The calm, complete health record for your dogs, cats and every pet in between.</p>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
              <Github className="w-4 h-4" /> View on GitHub
            </a>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="md:col-span-2 md:col-start-auto">
              <h3 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-paw-warm-sage">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-sm text-emerald-50/80 hover:text-white hover:translate-x-0.5 inline-block transition-all">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 md:col-span-2 flex md:justify-end items-start">
            <img src="/images/cat-dog-cuddle.webp" alt="" loading="lazy" className="w-28 h-28 rounded-full object-cover ring-4 ring-white/10 shadow-soft-xl" />
          </div>
        </div>

        <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-100/60">
          <span>© {year} PawPrint. Built for pet parents everywhere.</span>
          <span className="font-script text-lg text-white/80 inline-flex items-center gap-1.5">Because they're family <Heart className="w-4 h-4 fill-rose-400 text-rose-400" /></span>
        </div>
      </div>
    </footer>
  );
};
