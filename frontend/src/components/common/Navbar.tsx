import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '../../store/useAppStore';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, showToast } = useAppStore();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Analytics', path: '/analytics' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    showToast("You've been logged out. See you next time! 🐾");
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-paw-cream/95 dark:bg-paw-darkbg/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-paw-forest/20 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.jpeg" alt="PawPrint Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-paw-dark dark:text-white font-sans">
              PawPrint
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-sm font-medium transition-colors duration-200 py-1 ${
                    active
                      ? 'text-paw-forest dark:text-paw-light-sage font-semibold'
                      : 'text-paw-secondary hover:text-paw-forest dark:text-paw-warm-sage/80 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-paw-forest dark:bg-paw-sage rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop right area */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {isAuthenticated && user ? (
              // Logged-in state: show user name + logout
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-paw-light-sage/60 dark:bg-paw-darksurface border border-paw-soft-sage/70 dark:border-paw-darkborder">
                  <User className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
                  <span className="text-sm font-semibold text-paw-dark dark:text-white max-w-[120px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-paw-dark dark:text-white bg-white dark:bg-paw-darksurface border border-paw-soft-sage/80 dark:border-paw-darkborder rounded-full hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:border-rose-900 dark:hover:text-rose-300 transition-colors shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              // Logged-out state: show Login + Sign Up
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-paw-dark dark:text-white bg-white dark:bg-paw-darksurface border border-paw-soft-sage/80 dark:border-paw-darkborder rounded-full hover:bg-paw-light-sage/40 transition-colors shadow-2xs"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-paw-forest hover:bg-paw-deep rounded-full shadow-soft hover:shadow-soft-lg transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-paw-dark dark:text-paw-light-sage hover:bg-paw-soft-sage/40 dark:hover:bg-paw-darksurface"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-paw-soft-sage/40 dark:border-paw-darkborder/40 bg-paw-cream dark:bg-paw-darkbg px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium ${
                  active
                    ? 'bg-paw-soft-sage/60 dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage font-semibold'
                    : 'text-paw-secondary dark:text-paw-warm-sage hover:bg-paw-soft-sage/30'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/40 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-paw-light-sage/60 dark:bg-paw-darksurface border border-paw-soft-sage/50 dark:border-paw-darkborder">
                  <User className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
                  <span className="text-sm font-semibold text-paw-dark dark:text-white">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-medium text-paw-forest dark:text-paw-light-sage border border-paw-soft-sage dark:border-paw-darkborder bg-white dark:bg-paw-darksurface"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-paw-forest hover:bg-paw-deep shadow-soft"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
