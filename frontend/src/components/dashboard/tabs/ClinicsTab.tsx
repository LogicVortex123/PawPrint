import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Loader2, Star, Phone, Clock, Siren, ExternalLink, CalendarPlus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { StorageKeys, readJson, writeJson } from '../../../lib/storage';
import { EmptyState, SectionHeader, Segmented } from '../../ui';
import type { TabProps } from './types';

type Filter = 'all' | 'favorites' | 'emergency';

export const ClinicsTab: React.FC<TabProps> = ({ pet, goTo }) => {
  const { clinics, clinicsLoading, clinicsError, fetchClinics, toggleFavoriteClinic } = useAppStore();
  const [locationDenied, setLocationDenied] = useState(false);
  const [located, setLocated] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  const requestClinics = () => {
    if (!navigator.geolocation) { setLocationDenied(true); fetchClinics(); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocated(true); setLocationDenied(false); fetchClinics(position.coords.latitude, position.coords.longitude); },
      () => { setLocationDenied(true); fetchClinics(); }, // permission denied — show the full list instead
      { timeout: 8000 },
    );
  };

  // Ask for location the first time the tab opens
  useEffect(() => {
    requestClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = clinics.filter((c) => filter === 'all' || (filter === 'favorites' ? c.isFavorite : c.emergency24_7));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={MapPin} tone="lime" eyebrow="Nearby clinics" title="Find care near you"
        description={located ? 'Ranked by distance from where you are now. Star the ones you trust.' : 'Allow location to rank vets by distance — or browse the full list.'}
        actions={<button onClick={requestClinics} disabled={clinicsLoading} className="btn-primary">
          {clinicsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />} {clinicsLoading ? 'Locating…' : 'Use my location'}
        </button>} />

      <div className="flex flex-wrap items-center gap-3">
        <Segmented<Filter> label="Filter clinics" value={filter} onChange={setFilter} options={[
          { value: 'all', label: `All (${clinics.length})` },
          { value: 'favorites', label: `★ Saved (${clinics.filter((c) => c.isFavorite).length})` },
          { value: 'emergency', label: '24/7 emergency' },
        ]} />
        {locationDenied && <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 normal-case text-[11px]">Location unavailable — showing all clinics</span>}
      </div>

      {clinicsError ? (
        <EmptyState icon={MapPin} tone="rose" title="Couldn't load clinics" text={clinicsError} action={<button onClick={requestClinics} className="btn-secondary">Try again</button>} />
      ) : clinicsLoading && clinics.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-44 rounded-3xl animate-shimmer" />)}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState icon={MapPin} tone="lime" title={filter === 'favorites' ? 'No saved clinics yet' : 'No clinics found'}
          text={filter === 'favorites' ? 'Tap the star on a clinic to keep it here for quick access.' : 'Try refreshing your location.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {shown.map((clinic, i) => (
            <article key={clinic.id} className="card card-interactive p-5 flex flex-col">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-2xl bg-lime-50 dark:bg-lime-500/15 text-lime-700 dark:text-lime-300 flex items-center justify-center font-extrabold flex-shrink-0">{located ? i + 1 : <MapPin className="w-5 h-5" />}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-extrabold text-paw-dark dark:text-white">{clinic.name}</h3>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{clinic.address}</p>
                </div>
                <button onClick={() => toggleFavoriteClinic(clinic.id)} aria-pressed={clinic.isFavorite}
                  aria-label={clinic.isFavorite ? `Remove ${clinic.name} from saved` : `Save ${clinic.name}`}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${clinic.isFavorite ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 scale-110' : 'text-paw-secondary hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}>
                  <Star className={`w-4 h-4 ${clinic.isFavorite ? 'fill-current animate-pop' : ''}`} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {clinic.distance !== 'Distance unknown' && <span className="badge bg-paw-light-sage text-paw-forest dark:bg-paw-darksurface dark:text-paw-sage normal-case text-[11px]"><Navigation className="w-3 h-3" />{clinic.distance}</span>}
                {clinic.rating > 0 && <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 normal-case text-[11px]">★ {clinic.rating}{clinic.reviewsCount > 0 && ` (${clinic.reviewsCount})`}</span>}
                {clinic.emergency24_7 && <span className="badge bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 normal-case text-[11px]"><Siren className="w-3 h-3" />24/7 emergency</span>}
                {clinic.hours && <span className="badge bg-paw-mist text-paw-secondary dark:bg-paw-darksurface dark:text-paw-warm-sage normal-case text-[11px]"><Clock className="w-3 h-3" />{clinic.hours}</span>}
              </div>

              <div className="mt-auto pt-4 flex flex-wrap gap-2">
                {clinic.phone && <a href={`tel:${clinic.phone}`} className="btn btn-sm bg-paw-forest text-white hover:bg-paw-deep"><Phone className="w-3.5 h-3.5" /> Call</a>}
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.name} ${clinic.address}`)}`} target="_blank" rel="noopener noreferrer"
                  className="btn btn-sm border border-paw-line dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest"><ExternalLink className="w-3.5 h-3.5" /> Directions</a>
                <BookHere clinicName={clinic.name} petId={pet.id} goTo={goTo} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

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
