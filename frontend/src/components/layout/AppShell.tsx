import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Menu, X, BarChart3, Settings as SettingsIcon, Siren, Plus, ChevronsUpDown, Check, MoreHorizontal, Home,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Brand, AccountMenu } from '../common/Navbar';
import { ThemeToggle } from '../common/ThemeToggle';
import { ReminderBell } from '../common/ReminderBell';
import { AddPetModal } from '../dashboard/AddPetModal';
import { PetAvatar, speciesEmoji } from '../ui';
import { NAV_GROUPS, SECTIONS, TONES, dashboardHref, isDashboardTab, type DashboardTab } from '../../lib/navigation';

// Which page / tab is showing, from the URL
function useCurrentPage() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: DashboardTab | null = pathname === '/features' ? (isDashboardTab(tabParam) ? tabParam : 'overview') : null;
  const title = tab ? SECTIONS[tab].label : pathname.startsWith('/analytics') ? 'Health Insights' : pathname.startsWith('/settings') ? 'Account Settings' : 'PawPrint';
  return { pathname, tab, title };
}

// Switching pet keeps the dashboard URL (?pet=) in step so it can be bookmarked
function usePetSwitch() {
  const { setSelectedPetId } = useAppStore();
  const { pathname } = useLocation();
  const [, setSearchParams] = useSearchParams();
  return (id: string) => {
    setSelectedPetId(id);
    if (pathname === '/features') {
      setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('pet', id); return next; }, { replace: true });
    }
  };
}

const PetSwitcher: React.FC<{ onAddPet: () => void }> = ({ onAddPet }) => {
  const { pets, selectedPet, selectedPetId } = useAppStore();
  const switchPet = usePetSwitch();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pet = selectedPet();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  if (!pet) {
    return (
      <button onClick={onAddPet} className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-paw-sage/50 text-left hover:border-paw-forest hover:bg-paw-light-sage/50 dark:hover:bg-paw-darkcard transition-colors">
        <span className="w-10 h-10 rounded-full bg-paw-light-sage dark:bg-paw-darkcard flex items-center justify-center text-paw-forest dark:text-paw-sage"><Plus className="w-5 h-5" /></span>
        <span className="text-sm font-bold text-paw-dark dark:text-white">Add your first pet</span>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder hover:border-paw-sage shadow-2xs transition-colors text-left">
        <span className="relative">
          <PetAvatar pet={pet} className="w-11 h-11" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-paw-darkcard" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-extrabold text-paw-dark dark:text-white truncate">{pet.name}</span>
          <span className="block text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{pet.breed || (pet.species === 'other' ? 'Pet' : pet.species === 'cat' ? 'Cat' : 'Dog')} · {pet.age}</span>
        </span>
        <ChevronsUpDown className="w-4 h-4 text-paw-secondary" />
      </button>
      {open && (
        <div role="listbox" className="absolute left-0 right-0 top-full mt-2 card p-1.5 z-30 animate-scaleIn max-h-80 overflow-y-auto">
          <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Your pets</div>
          {pets.map((p) => (
            <button key={p.id} role="option" aria-selected={p.id === selectedPetId}
              onClick={() => { switchPet(p.id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-paw-mist dark:hover:bg-paw-darksurface">
              <PetAvatar pet={p} className="w-8 h-8" />
              <span className="flex-1 min-w-0 text-sm font-semibold text-paw-dark dark:text-white truncate">{p.name} <span className="opacity-70">{speciesEmoji(p.species)}</span></span>
              {p.id === selectedPetId && <Check className="w-4 h-4 text-paw-forest dark:text-paw-sage" />}
            </button>
          ))}
          <button onClick={() => { setOpen(false); onAddPet(); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 mt-1 rounded-xl text-left text-sm font-bold text-paw-forest dark:text-paw-sage hover:bg-paw-light-sage dark:hover:bg-paw-darksurface border-t border-paw-line dark:border-paw-darkborder">
            <span className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center"><Plus className="w-4 h-4" /></span>
            Add another pet
          </button>
        </div>
      )}
    </div>
  );
};

const SidebarContent: React.FC<{ onNavigate?: () => void; onAddPet: () => void }> = ({ onNavigate, onAddPet }) => {
  const { selectedPetId, reminders } = useAppStore();
  const { pathname, tab } = useCurrentPage();
  const actionCount = reminders.filter((r) => r.urgency !== 'info').length;
  const petId = selectedPetId || undefined;

  const linkCls = (active: boolean) =>
    `group flex items-center gap-3 px-2.5 py-1.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${active
      ? 'bg-white dark:bg-paw-darkcard text-paw-dark dark:text-white shadow-card'
      : 'text-paw-secondary dark:text-paw-warm-sage/80 hover:text-paw-dark dark:hover:text-white hover:bg-white/60 dark:hover:bg-paw-darkcard/50'}`;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4"><Brand /></div>

      <div className="px-4 pb-4"><PetSwitcher onAddPet={onAddPet} /></div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3 scrollbar-none" aria-label="Dashboard">
        {NAV_GROUPS.map((group) => (
          <div key={group.title || 'main'}>
            {group.title && <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-paw-secondary/70 dark:text-paw-warm-sage/50">{group.title}</div>}
            <div className="space-y-0.5">
              {group.items.map((id) => {
                const s = SECTIONS[id];
                const Icon = s.icon;
                const active = tab === id;
                return (
                  <Link key={id} to={dashboardHref(id, petId)} onClick={onNavigate} className={linkCls(active)} aria-current={active ? 'page' : undefined}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${active ? TONES[s.tone].tile : 'group-hover:scale-110 transition-transform'}`}>
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="flex-1">{s.label}</span>
                    {id === 'reminders' && actionCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-extrabold flex items-center justify-center">{actionCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-paw-secondary/70 dark:text-paw-warm-sage/50">Account</div>
          <Link to="/analytics" onClick={onNavigate} className={linkCls(pathname.startsWith('/analytics'))}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${pathname.startsWith('/analytics') ? TONES.teal.tile : ''}`}><BarChart3 className="w-[18px] h-[18px]" /></span>
            Health Insights
          </Link>
          <Link to="/settings" onClick={onNavigate} className={linkCls(pathname.startsWith('/settings'))}>
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${pathname.startsWith('/settings') ? TONES.slate.tile : ''}`}><SettingsIcon className="w-[18px] h-[18px]" /></span>
            Settings
          </Link>
        </div>
      </nav>

      <div className="p-3 space-y-2.5 border-t border-paw-line/80 dark:border-paw-darkborder">
        {selectedPetId && (
          <Link to={`/emergency?pet=${selectedPetId}`} onClick={onNavigate}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all">
            <Siren className="w-5 h-5" />
            <span className="flex-1">
              <span className="block text-sm font-extrabold leading-tight">Emergency Mode</span>
              <span className="block text-[11px] text-white/80">Key info in one tap</span>
            </span>
          </Link>
        )}
        <div className="flex items-center justify-between gap-2">
          <AccountMenu align="left" up />
          <div className="flex items-center gap-1">
            <Link to="/" onClick={onNavigate} className="icon-btn" title="Home page" aria-label="Home page"><Home className="w-4 h-4" /></Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

// Bottom tab bar for phones
const MOBILE_TABS: DashboardTab[] = ['overview', 'vaccinations', 'medications', 'reminders'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedPetId, selectedPet, setSearchOpen, reminders } = useAppStore();
  const { tab, title } = useCurrentPage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addingPet, setAddingPet] = useState(false);
  const switchPet = usePetSwitch();
  const navigate = useNavigate();
  const location = useLocation();
  const pet = selectedPet();
  const actionCount = reminders.filter((r) => r.urgency !== 'info').length;

  useEffect(() => { setDrawerOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const section = tab ? SECTIONS[tab] : null;

  return (
    <div className="min-h-screen bg-paw-mist dark:bg-paw-darkbg">
      {/* Desktop sidebar */}
      <aside className="print:hidden hidden lg:flex fixed inset-y-0 left-0 z-40 w-72 flex-col bg-paw-cream/80 dark:bg-paw-darksurface/70 backdrop-blur border-r border-paw-line dark:border-paw-darkborder">
        <SidebarContent onAddPet={() => setAddingPet(true)} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[65]">
          <div className="absolute inset-0 bg-paw-dark/40 backdrop-blur-sm animate-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[19rem] max-w-[86vw] bg-paw-cream dark:bg-paw-darksurface shadow-soft-2xl animate-slide-in-left">
            <button onClick={() => setDrawerOpen(false)} className="icon-btn absolute top-5 right-4" aria-label="Close menu"><X className="w-5 h-5" /></button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} onAddPet={() => { setDrawerOpen(false); setAddingPet(true); }} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="print:hidden sticky top-0 z-30 bg-paw-mist/85 dark:bg-paw-darkbg/85 backdrop-blur-md border-b border-paw-line/70 dark:border-paw-darkborder/70">
          <div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setDrawerOpen(true)} className="icon-btn lg:hidden" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {section && <span className={`hidden sm:inline-flex w-8 h-8 rounded-xl items-center justify-center ${TONES[section.tone].tile}`}><section.icon className="w-4 h-4" /></span>}
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-paw-secondary dark:text-paw-warm-sage truncate">
                  {pet ? <>Caring for <span className="font-bold text-paw-dark dark:text-white">{pet.name}</span></> : 'Welcome to PawPrint'}
                </div>
                <h1 className="text-base sm:text-lg font-extrabold text-paw-dark dark:text-white leading-tight truncate">{title}</h1>
              </div>
            </div>
            <button onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 w-64 px-3.5 py-2 rounded-full bg-white dark:bg-paw-darkcard border border-paw-line dark:border-paw-darkborder text-sm text-paw-secondary dark:text-paw-warm-sage hover:border-paw-sage transition-colors">
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search records…</span>
            </button>
            <button onClick={() => setSearchOpen(true)} className="icon-btn md:hidden" aria-label="Search records"><Search className="w-4 h-4" /></button>
            <ReminderBell />
            <div className="lg:hidden"><ThemeToggle /></div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-28 lg:pb-10">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="print:hidden lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]" aria-label="Quick navigation">
        <div className="glass-card border border-paw-line dark:border-paw-darkborder rounded-3xl shadow-soft-xl flex items-stretch justify-around px-1.5 py-1.5">
          {MOBILE_TABS.map((id) => {
            const s = SECTIONS[id];
            const Icon = s.icon;
            const active = tab === id;
            return (
              <Link key={id} to={dashboardHref(id, selectedPetId || undefined)}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-[10px] font-bold transition-colors ${active ? `${TONES[s.tone].tile}` : 'text-paw-secondary dark:text-paw-warm-sage'}`}>
                <Icon className="w-5 h-5" />
                {s.short}
                {id === 'reminders' && actionCount > 0 && <span className="absolute top-1 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-paw-darkcard" />}
              </Link>
            );
          })}
          <button onClick={() => setDrawerOpen(true)} className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl text-[10px] font-bold text-paw-secondary dark:text-paw-warm-sage">
            <MoreHorizontal className="w-5 h-5" />
            More
          </button>
        </div>
      </nav>

      {addingPet && (
        <AddPetModal
          onClose={() => setAddingPet(false)}
          onCreated={(id) => {
            if (!id) return;
            switchPet(id);
            navigate(dashboardHref('overview', id));
          }}
        />
      )}
    </div>
  );
};
