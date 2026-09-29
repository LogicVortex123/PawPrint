import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, PawPrint, Syringe, Calendar, FileText, History, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StorageKeys, readJson, writeJson, removeKey } from '../../lib/storage';

type Result = {
  id: string;
  kind: 'pet' | 'vaccination' | 'appointment' | 'document';
  title: string;
  subtitle: string;
  petId: string;
  tab: string;
};

const KIND_META: Record<Result['kind'], { label: string; icon: React.ReactNode }> = {
  pet: { label: 'Pets', icon: <PawPrint className="w-4 h-4" /> },
  vaccination: { label: 'Vaccinations', icon: <Syringe className="w-4 h-4" /> },
  appointment: { label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
  document: { label: 'Documents', icon: <FileText className="w-4 h-4" /> },
};

const MAX_PER_KIND = 5;
const MAX_RECENT = 5;

// Most recent first, no duplicates (case-insensitive)
function rememberSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  const recent = readJson<string[]>(StorageKeys.recentSearches, []);
  const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
  writeJson(StorageKeys.recentSearches, next);
}

// Searches every pet's records at once. Opening a result jumps to the right
// pet and dashboard tab. Rendered into <body> so the backdrop covers the whole
// page — inside the blurred navbar a fixed overlay would only cover the navbar.
export const GlobalSearch: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { pets, vaccinations, appointments, documents } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setQuery(''); setActive(0);
      setRecent(readJson<string[]>(StorageKeys.recentSearches, []));
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const petName = (id: string) => pets.find((p) => p.id === id)?.name || '';
    const matches = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));

    const petResults: Result[] = pets
      .filter((p) => matches(p.name, p.breed, p.species, p.microchipId, ...p.allergies, ...p.medications))
      .map((p) => ({ id: `pet-${p.id}`, kind: 'pet', title: p.name, subtitle: [p.breed || p.species, p.age].filter(Boolean).join(' · '), petId: p.id, tab: 'pet-profiles' }));

    const vaxResults: Result[] = vaccinations
      .filter((v) => matches(v.name, v.veterinarian, v.clinic, v.batchNumber, v.status))
      .map((v) => ({ id: `vax-${v.id}`, kind: 'vaccination', title: v.name, subtitle: `${petName(v.petId)} · ${v.status} · due ${v.nextDueDate}`, petId: v.petId, tab: 'vaccinations' }));

    const aptResults: Result[] = appointments
      .filter((a) => matches(a.reason, a.clinicName, a.clinicAddress, a.notes, a.status))
      .map((a) => ({ id: `apt-${a.id}`, kind: 'appointment', title: a.reason, subtitle: `${petName(a.petId)} · ${a.clinicName} · ${a.date}`, petId: a.petId, tab: 'vet-appointments' }));

    const docResults: Result[] = documents
      .filter((d) => matches(d.title, d.category))
      .map((d) => ({ id: `doc-${d.id}`, kind: 'document', title: d.title, subtitle: `${petName(d.petId)} · ${d.category} · ${d.date}`, petId: d.petId, tab: 'medical-documents' }));

    return [petResults, vaxResults, aptResults, docResults].flatMap((group) => group.slice(0, MAX_PER_KIND));
  }, [query, pets, vaccinations, appointments, documents]);

  useEffect(() => { setActive(0); }, [query]);

  // Escape closes it even when focus has left the input
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const openResult = (r: Result) => {
    rememberSearch(query);
    onClose();
    navigate(`/features?pet=${r.petId}&tab=${r.tab}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) openResult(results[active]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search"
        className="w-full max-w-xl bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-paw-soft-sage/50 dark:border-paw-darkborder">
          <Search className="w-5 h-5 text-paw-secondary" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Search pets, vaccines, appointments, documents…"
            className="flex-1 bg-transparent text-paw-dark dark:text-white placeholder:text-paw-secondary/70 focus:outline-none text-base" />
          <button onClick={onClose} aria-label="Close search"
            className="p-1.5 rounded-full text-paw-secondary hover:text-paw-forest hover:bg-paw-light-sage dark:text-paw-warm-sage dark:hover:bg-paw-darkcard">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!query.trim() ? (
            recent.length > 0 ? (
              <div>
                <div className="flex items-center justify-between px-3 pt-3 pb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage/70">Recent searches</span>
                  <button onClick={() => { removeKey(StorageKeys.recentSearches); setRecent([]); }}
                    className="text-[11px] font-semibold text-paw-secondary hover:text-paw-forest dark:text-paw-warm-sage">Clear</button>
                </div>
                {recent.map((r) => (
                  <div key={r} className="group flex items-center rounded-xl hover:bg-paw-light-sage dark:hover:bg-paw-darkcard">
                    <button onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                      className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left text-sm text-paw-dark dark:text-white">
                      <History className="w-4 h-4 text-paw-secondary" />{r}
                    </button>
                    <button aria-label={`Remove ${r} from recent searches`}
                      onClick={() => { const next = recent.filter((x) => x !== r); writeJson(StorageKeys.recentSearches, next); setRecent(next); }}
                      className="p-2 mr-1 rounded-lg text-paw-secondary opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-rose-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center text-paw-secondary dark:text-paw-warm-sage">No matches for “{query}”.</p>
          ) : results.map((r, i) => {
            const showHeader = i === 0 || results[i - 1].kind !== r.kind;
            return (
              <React.Fragment key={r.id}>
                {showHeader && <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage/70">{KIND_META[r.kind].label}</div>}
                <button onClick={() => openResult(r)} onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${i === active ? 'bg-paw-light-sage dark:bg-paw-darkcard' : ''}`}>
                  <span className="w-8 h-8 rounded-lg bg-white dark:bg-paw-darkbg text-paw-forest dark:text-paw-sage flex items-center justify-center flex-shrink-0">{KIND_META[r.kind].icon}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-paw-dark dark:text-white truncate">{r.title}</span>
                    <span className="block text-xs text-paw-secondary dark:text-paw-warm-sage truncate">{r.subtitle}</span>
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
