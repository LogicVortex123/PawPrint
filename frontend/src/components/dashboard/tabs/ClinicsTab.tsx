import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2, Phone, Clock, Siren, ExternalLink, CalendarPlus, Globe, Star, Radar, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { StorageKeys, readJson, writeJson } from '../../../lib/storage';
import { EmptyState, SectionHeader, Segmented } from '../../ui';
import { PawLoader, PawTrail } from '../../common/Motion';
import type { Clinic, ClinicFilter } from '../../../types';
import type { TabProps } from './types';

const SYNC_POLL_MS = 6000;
const SYNC_POLL_MAX = 20; // ~2 minutes

// Directions by exact position when known (many listings have no street address)
const directionsUrl = (c: Clinic) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  c.latitude !== null && c.longitude !== null ? `${c.latitude},${c.longitude}` : `${c.name} ${c.address}`,
)}`;

export const ClinicsTab: React.FC<TabProps> = ({ pet, goTo }) => {
  const {
    clinics, clinicsLoading, clinicsLoadingMore, clinicsError, clinicsHasMore, clinicsTotal, clinicsCounts, clinicsSyncing,
    fetchClinics, loadMoreClinics, refreshClinics, toggleFavoriteClinic,
  } = useAppStore();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filter, setFilter] = useState<ClinicFilter>('all');
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The next batch loads only once the person scrolls to the end, not on arrival
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (scrolled) return;
    const onScroll = () => { if (window.scrollY > 40) setScrolled(true); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrolled]);

  const requestClinics = (nextFilter: ClinicFilter = filter) => {
    if (!navigator.geolocation) { setLocationDenied(true); fetchClinics(undefined, undefined, nextFilter); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const here = { lat: position.coords.latitude, lng: position.coords.longitude };
        setLocating(false); setCoords(here); setLocationDenied(false);
        fetchClinics(here.lat, here.lng, nextFilter);
      },
      // Permission denied — browse the full list instead
      () => { setLocating(false); setLocationDenied(true); fetchClinics(undefined, undefined, nextFilter); },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  };

  // Ask for location the first time the tab opens
  useEffect(() => {
    requestClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeFilter = (next: ClinicFilter) => {
    setFilter(next);
    fetchClinics(coords?.lat, coords?.lng, next);
  };

  // Pagination on scroll: when the end of the list comes into view, load the next 6
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !scrolled || !clinicsHasMore || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMoreClinics(); }, { rootMargin: '0px 0px 80px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [scrolled, clinicsHasMore, clinics.length, loadMoreClinics]);

  // While the server is still finding real clinics for this area, check back now and then
  useEffect(() => {
    if (!clinicsSyncing) return;
    let polls = 0;
    const timer = setInterval(() => {
      polls += 1;
      if (polls > SYNC_POLL_MAX) clearInterval(timer);
      else refreshClinics();
    }, SYNC_POLL_MS);
    return () => clearInterval(timer);
  }, [clinicsSyncing, refreshClinics]);

  const busy = locating || clinicsLoading;

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={MapPin} tone="lime" eyebrow="Nearby clinics" title="Find care near you"
        description={coords ? 'Real vets ranked by distance from where you are now. Star the ones you trust.' : 'Allow location to rank vets by distance — or browse the full list.'}
        actions={<button onClick={() => requestClinics()} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />} {locating ? 'Locating…' : clinicsLoading ? 'Loading…' : 'Use my location'}
        </button>} />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented<ClinicFilter> label="Filter clinics" value={filter} onChange={changeFilter} options={[
          { value: 'all', label: `All (${clinicsCounts.all})` },
          { value: 'favorites', label: `★ Saved (${clinicsCounts.favorites})` },
          { value: 'emergency', label: `24/7 (${clinicsCounts.emergency})` },
        ]} />
        {locationDenied && <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 normal-case text-[11px]">Location unavailable — showing all clinics</span>}
      </div>

      {clinicsSyncing && (
        <div className="relative overflow-hidden flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-lime-50 via-emerald-50 to-teal-50 dark:from-lime-500/10 dark:via-emerald-500/10 dark:to-teal-500/10 border border-lime-200/70 dark:border-lime-500/20 animate-slideUp" role="status">
          <span className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
            <span className="absolute inset-0 rounded-full bg-lime-400/30 animate-ping" aria-hidden />
            <span className="absolute inset-1.5 rounded-full bg-lime-400/30 animate-ping [animation-delay:0.6s]" aria-hidden />
            <span className="relative w-9 h-9 rounded-full bg-lime-500 text-white flex items-center justify-center"><Radar className="w-5 h-5 animate-[spin_2.4s_linear_infinite]" /></span>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-paw-dark dark:text-white">Finding more vets near you…</p>
            <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">The first search in a new area can take up to a minute. They'll appear here by distance on their own.</p>
          </div>
        </div>
      )}

      {clinicsError ? (
        <EmptyState icon={MapPin} tone="rose" title="Couldn't load clinics" text={clinicsError} action={<button onClick={() => requestClinics()} className="btn-secondary">Try again</button>} />
      ) : busy && clinics.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-44 rounded-3xl animate-shimmer" />)}
        </div>
      ) : clinics.length === 0 ? (
        <EmptyState icon={MapPin} tone="lime" title={filter === 'favorites' ? 'No saved clinics yet' : filter === 'emergency' ? 'No 24/7 clinics found nearby' : 'No clinics found'}
          text={filter === 'favorites' ? 'Tap the star on a clinic to keep it here for quick access.' : clinicsSyncing ? 'Still looking — this can take a minute.' : 'Try refreshing your location.'} />
      ) : (
        <>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${clinicsLoading ? 'opacity-50' : ''}`}>
            {clinics.map((clinic, i) => (
              <ClinicCard key={clinic.id} clinic={clinic} rank={coords && filter === 'all' ? i + 1 : null} delay={(i % 6) * 70}
                onToggleFavorite={() => toggleFavoriteClinic(clinic.id)} petId={pet.id} goTo={goTo} />
            ))}
            {clinicsLoadingMore && [0, 1, 2, 3].map((i) => <div key={`more-${i}`} className="h-44 rounded-3xl animate-shimmer" aria-hidden />)}
          </div>

          {/* The end of the list: load more as it comes near, or say we're done */}
          <div ref={sentinelRef} className="flex flex-col items-center gap-3 pt-2 pb-6 text-center">
            {clinicsLoadingMore ? (
              <PawLoader label={`Loading the next ${Math.min(6, clinicsTotal - clinics.length)} clinics…`} />
            ) : clinicsHasMore ? (
              <>
                <p className="text-xs font-semibold text-paw-secondary dark:text-paw-warm-sage">Showing {clinics.length} of {clinicsTotal} · scroll for more</p>
                <button onClick={loadMoreClinics} className="btn-secondary group">
                  Show more clinics <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </>
            ) : clinics.length > 4 ? (
              <div className="w-full max-w-sm animate-fadeIn">
                <PawTrail steps={7} className="text-lime-500/70 dark:text-lime-300/40" />
                <p className="mt-3 text-sm font-bold text-paw-dark dark:text-white">That's every clinic{coords && filter === 'all' ? ' within about 60 km' : ''} — {clinicsTotal} in all.</p>
                <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">Star your favourites so they're always one tap away.</p>
              </div>
            ) : null}
            <p className="text-[11px] text-paw-secondary/80 dark:text-paw-warm-sage/60">
              Clinic listings © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline hover:text-paw-forest">OpenStreetMap</a> contributors. Always call ahead to check opening hours.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

const ClinicCard: React.FC<{ clinic: Clinic; rank: number | null; delay: number; onToggleFavorite: () => void; petId: string; goTo: TabProps['goTo'] }> = ({ clinic, rank, delay, onToggleFavorite, petId, goTo }) => (
  <article className="card card-interactive p-5 flex flex-col animate-slideUp" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-start gap-3">
      <span className="w-11 h-11 rounded-2xl bg-lime-50 dark:bg-lime-500/15 text-lime-700 dark:text-lime-300 flex items-center justify-center font-extrabold flex-shrink-0">{rank ?? <MapPin className="w-5 h-5" />}</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-extrabold text-paw-dark dark:text-white">{clinic.name}</h3>
        <p className={`text-xs ${clinic.address ? 'text-paw-secondary dark:text-paw-warm-sage' : 'italic text-paw-secondary/70 dark:text-paw-warm-sage/60'}`}>{clinic.address || 'Street address not listed — use Directions'}</p>
      </div>
      <button onClick={onToggleFavorite} aria-pressed={clinic.isFavorite}
        aria-label={clinic.isFavorite ? `Remove ${clinic.name} from saved` : `Save ${clinic.name}`}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${clinic.isFavorite ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 scale-110' : 'text-paw-secondary hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}>
        <Star className={`w-4 h-4 ${clinic.isFavorite ? 'fill-current animate-pop' : ''}`} />
      </button>
    </div>

    <div className="mt-3 flex flex-wrap gap-1.5">
      {clinic.distance !== 'Distance unknown' && <span className="badge bg-paw-light-sage text-paw-forest dark:bg-paw-darksurface dark:text-paw-sage normal-case text-[11px]"><Navigation className="w-3 h-3" />{clinic.distance}</span>}
      {clinic.rating > 0 && <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 normal-case text-[11px]">★ {clinic.rating}{clinic.reviewsCount > 0 && ` (${clinic.reviewsCount})`}</span>}
      {clinic.emergency24_7 && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 normal-case text-[11px]"><Siren className="w-3 h-3" />24/7 emergency</span>}
      {clinic.hours && <span className="badge bg-paw-mist text-paw-secondary dark:bg-paw-darksurface dark:text-paw-warm-sage normal-case text-[11px] max-w-full"><Clock className="w-3 h-3 flex-shrink-0" /><span className="truncate">{clinic.hours}</span></span>}
    </div>

    <div className="mt-auto pt-4 flex flex-wrap gap-2">
      {clinic.phone && <a href={`tel:${clinic.phone.replace(/[^\d+]/g, '')}`} className="btn btn-sm bg-paw-forest text-white hover:bg-paw-deep"><Phone className="w-3.5 h-3.5" /> Call</a>}
      <a href={directionsUrl(clinic)} target="_blank" rel="noopener noreferrer"
        className="btn btn-sm border border-paw-line dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest"><ExternalLink className="w-3.5 h-3.5" /> Directions</a>
      {/^https?:\/\//i.test(clinic.website) && (
        <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="btn btn-sm text-paw-secondary dark:text-paw-warm-sage hover:text-paw-forest hover:bg-paw-light-sage dark:hover:bg-paw-darksurface"><Globe className="w-3.5 h-3.5" /> Website</a>
      )}
      <BookHere clinicName={clinic.name} petId={petId} goTo={goTo} />
    </div>
  </article>
);

// Pre-fills the booking form with this clinic and opens it on the Appointments tab
const BookHere: React.FC<{ clinicName: string; petId: string; goTo: TabProps['goTo'] }> = ({ clinicName, petId, goTo }) => {
  const book = () => {
    const key = `${StorageKeys.draftPrefix}appointment-${petId}`;
    writeJson(key, { ...readJson<Record<string, string>>(key, {}), clinic: clinicName });
    goTo('vet-appointments', petId, { book: '1' });
  };
  return (
    <button onClick={book} className="btn btn-sm text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-500/10"><CalendarPlus className="w-3.5 h-3.5" /> Book here</button>
  );
};
