import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Search, Settings as SettingsIcon, LayoutDashboard, ChevronDown, ArrowRight, Home } from 'lucide-react';
import { setBrowsingHome } from '../../lib/storage';
import { ThemeToggle } from './ThemeToggle';
import { ReminderBell } from './ReminderBell';
import { useAppStore } from '../../store/useAppStore';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'Guide', to: '/#guide' },
  { label: 'About', to: '/about' },
  { label: 'Roadmap', to: '/roadmap' },
];

// Signed in, the landing page sends you to the dashboard, so link there instead
const NAV_LINKS_SIGNED_IN = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'About', to: '/about' },
  { label: 'Roadmap', to: '/roadmap' },
];

export const Brand: React.FC<{ className?: string; light?: boolean }> = ({ className = '', light = false }) => (
  <Link to="/" className={`flex items-center gap-2.5 group ${className}`}>
    <span className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-paw-forest/15 shadow-2xs group-hover:rotate-[-6deg] transition-transform duration-300">
      <img src="/logo.jpeg" alt="" className="w-full h-full object-cover" />
    </span>
    <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-paw-dark dark:text-white'}`}>
      Paw<span className={light ? 'text-paw-warm-sage' : 'text-paw-forest dark:text-paw-sage'}>Print</span>
    </span>
  </Link>
);

// Leave for the home page and sign out in the same tick. Navigating first stops
// the protected page from bouncing to /login; signing out in the same batch
// stops the home page from sending a still-signed-in user to the dashboard.
export function signOutToHome(navigate: (to: string, opts?: { replace?: boolean }) => void, logout: () => void, showToast: (m: string) => void) {
  navigate('/', { replace: true });
  logout();
  showToast('You\'ve been signed out. See you soon! 👋');
}

// Avatar with a small dropdown for the signed-in user
export const AccountMenu: React.FC<{ align?: 'left' | 'right'; up?: boolean }> = ({ align = 'right', up = false }) => {
  const { user, logout, showToast } = useAppStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!user) return null;
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    signOutToHome(navigate, logout, showToast);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-paw-line dark:border-paw-darkborder bg-white dark:bg-paw-darkcard hover:border-paw-forest dark:hover:border-paw-sage transition-colors">
        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-paw-forest to-emerald-400 text-white text-[11px] font-extrabold flex items-center justify-center">{initials}</span>
        <span className="hidden lg:block text-sm font-semibold text-paw-dark dark:text-white max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-paw-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} ${up ? 'bottom-full mb-2' : 'top-full mt-2'} w-60 card p-2 z-[60] animate-scaleIn`}>
          <div className="px-3 py-2.5 border-b border-paw-line dark:border-paw-darkborder mb-1">
            <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{user.name}</div>
            <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{user.email}</div>
          </div>
          <Link role="menuitem" to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-paw-dark dark:text-white hover:bg-paw-light-sage dark:hover:bg-paw-darksurface">
            <LayoutDashboard className="w-4 h-4 text-paw-forest dark:text-paw-sage" /> Dashboard
          </Link>
          <Link role="menuitem" to="/" onClick={() => { setBrowsingHome(true); setOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-paw-dark dark:text-white hover:bg-paw-light-sage dark:hover:bg-paw-darksurface">
            <Home className="w-4 h-4 text-paw-forest dark:text-paw-sage" /> Home page
          </Link>
          <Link role="menuitem" to="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-paw-dark dark:text-white hover:bg-paw-light-sage dark:hover:bg-paw-darksurface">
            <SettingsIcon className="w-4 h-4 text-paw-forest dark:text-paw-sage" /> Account settings
          </Link>
          <button role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, setSearchOpen, logout, showToast } = useAppStore();
  const links = isAuthenticated ? NAV_LINKS_SIGNED_IN : NAV_LINKS;

  const handleLogout = () => signOutToHome(navigate, logout, showToast);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname, location.hash]);

  const isActive = (to: string) => {
    if (to.includes('#')) return location.pathname === '/' && location.hash === to.slice(1);
    if (to === '/') return location.pathname === '/' && !location.hash;
    return location.pathname.startsWith(to);
  };

  // The active-link pill slides between links instead of jumping
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    // Link widths change once the web font arrives
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [location.pathname, location.hash]);

  return (
    <header className="print:hidden sticky top-0 z-50 px-3 sm:px-6 pt-3">
      <div className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${scrolled
        ? 'glass-card border border-paw-line/80 dark:border-paw-darkborder shadow-soft'
        : 'bg-transparent border border-transparent'}`}>
        <div className="flex items-center justify-between h-16 pl-4 pr-2 sm:pl-5 sm:pr-3">
          <Brand />

          <nav ref={navRef} className="relative hidden md:flex items-center gap-1" aria-label="Main">
            <span aria-hidden
              className={`absolute inset-y-0 rounded-full bg-paw-light-sage dark:bg-paw-darkcard transition-all duration-500 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${pill ? 'opacity-100' : 'opacity-0'}`}
              style={pill ? { left: pill.left, width: pill.width } : undefined} />
            {links.map((link) => (
              <Link key={link.to} to={link.to} data-active={isActive(link.to)} aria-current={isActive(link.to) ? 'page' : undefined}
                className={`group relative px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${isActive(link.to)
                  ? 'text-paw-forest dark:text-white'
                  : 'text-paw-secondary dark:text-paw-warm-sage/80 hover:text-paw-dark dark:hover:text-white'}`}>
                {link.label}
                {!isActive(link.to) && <span className="absolute left-1/2 bottom-1 h-0.5 w-0 -translate-x-1/2 rounded-full bg-paw-sage transition-all duration-300 group-hover:w-4" aria-hidden />}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && (
              <button onClick={() => setSearchOpen(true)} aria-label="Search records" title="Search"className="icon-btn">
                <Search className="w-4 h-4" />
              </button>
            )}
            {isAuthenticated && <ReminderBell />}
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard" className="btn-primary btn-sm">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <AccountMenu />
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Log in</Link>
                <Link to="/signup" className="btn-primary btn-sm group">
                  Get started <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            {isAuthenticated && <ReminderBell />}
            <ThemeToggle />
            <button onClick={() => setMobileMenuOpen((o) => !o)} type="button" className="icon-btn" aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 card p-3 space-y-1 animate-scaleIn stagger">
          {links.map((link) => (
            <Link key={link.to} to={link.to}
              className={`block px-4 py-3 rounded-2xl text-base font-semibold ${isActive(link.to)
                ? 'bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-white'
                : 'text-paw-secondary dark:text-paw-warm-sage hover:bg-paw-mist dark:hover:bg-paw-darksurface'}`}>
              {link.label}
            </Link>
          ))}
          <div className="pt-3 mt-2 border-t border-paw-line dark:border-paw-darkborder grid grid-cols-2 gap-2">
            {isAuthenticated && user ? (
              <>
                <Link to="/dashboard" className="btn-primary col-span-2"><LayoutDashboard className="w-4 h-4" /> Open dashboard</Link>
                <button onClick={() => setSearchOpen(true)} className="btn-secondary"><Search className="w-4 h-4" /> Search</button>
                <Link to="/settings" className="btn-secondary"><SettingsIcon className="w-4 h-4" /> Settings</Link>
                <button onClick={handleLogout} className="btn-danger-outline col-span-2"><LogOut className="w-4 h-4" /> Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">Log in</Link>
                <Link to="/signup" className="btn-primary">Get started</Link>
              </>
            )}          </div>
        </div>
      )}
    </header>
  );
};
