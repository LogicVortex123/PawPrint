import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Shown for any URL that doesn't match a page
export const NotFound: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAppStore();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md text-center space-y-5">
        <div className="text-7xl" aria-hidden>🐾</div>
        <h1 className="text-4xl font-extrabold text-paw-dark dark:text-white">Page not found</h1>
        <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">
          We sniffed everywhere but couldn't find <span className="font-mono font-semibold break-all">{pathname}</span>.
          It may have moved, or the link might be mistyped.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-paw-soft-sage dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest">
            <Home className="w-4 h-4" /> Home
          </Link>
          {isAuthenticated && (
            <Link to="/features" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
              <LayoutDashboard className="w-4 h-4" /> Go to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
