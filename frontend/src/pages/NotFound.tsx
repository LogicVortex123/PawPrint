import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { FloatingPaws, PawTrail } from '../components/common/Motion';

// Shown for any URL that doesn't match a page
export const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppStore();

  return (
    <div className="relative overflow-hidden min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-100/60 dark:bg-emerald-500/5 blur-3xl animate-blob" aria-hidden />
      <FloatingPaws />
      <div className="relative max-w-md text-center space-y-5 stagger">
        <div className="relative mx-auto w-40 h-40">
          <div className="absolute inset-0 organic-blob-1 bg-gradient-to-br from-paw-soft-sage to-paw-honey-soft dark:from-paw-darkcard dark:to-amber-900/20 animate-blob" aria-hidden />
          <img src="/images/cat-peek.webp" alt="" className="relative w-full h-full object-cover rounded-full ring-8 ring-paw-cream dark:ring-paw-darkbg shadow-soft-xl animate-float-slow" />
          <span className="absolute -right-2 -top-1 font-display text-4xl font-semibold text-paw-forest dark:text-paw-sage rotate-12" aria-hidden>?</span>
        </div>
        <div className="font-display text-7xl font-semibold tracking-tight text-gradient-flow" aria-hidden>404</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-paw-dark dark:text-white">Page not found</h1>
        <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">
          We sniffed everywhere but couldn't find <span className="font-mono font-semibold break-all">{pathname}</span>.
          It may have moved, or the link might be mistyped.
        </p>
        <PawTrail className="mx-auto w-56 text-paw-sage/70 dark:text-paw-warm-sage/40" steps={7} />
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/" className="btn-secondary">
            <Home className="w-4 h-4" /> Home
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="btn-primary">
              <LayoutDashboard className="w-4 h-4" /> Go to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
