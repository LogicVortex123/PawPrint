import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Pill, Phone, Cpu, Syringe, MapPin, Loader2, Navigation } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Vaccination } from '../types';

// One-screen, minimal-tap view of what a vet or helper needs in an emergency:
// allergies and medications first, then contacts, microchip, vaccines, and the
// nearest 24/7 clinic. Large type and high contrast on purpose.
export const EmergencyMode: React.FC = () => {
  const { pets, petsLoading, vaccinations, clinics, clinicsLoading, fetchClinics } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const pet = pets.find((p) => p.id === searchParams.get('pet')) || pets[0];
  const [locating, setLocating] = useState(false);
  const [clinicsRequested, setClinicsRequested] = useState(false);

  // Latest record per vaccine name, so boosters don't show as duplicates
  const vaccineSummary = useMemo(() => {
    if (!pet) return [];
    const latest = new Map<string, Vaccination>();
    for (const v of vaccinations.filter((v) => v.petId === pet.id)) {
      const key = v.name.trim().toLowerCase();
      const existing = latest.get(key);
      if (!existing || v.administeredDate > existing.administeredDate) latest.set(key, v);
    }
    return [...latest.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [pet, vaccinations]);

  const emergencyClinics = clinics.filter((c) => c.emergency24_7).slice(0, 3);

  const findClinics = () => {
    setClinicsRequested(true);
    if (!navigator.geolocation) { fetchClinics(); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocating(false); fetchClinics(pos.coords.latitude, pos.coords.longitude); },
      () => { setLocating(false); fetchClinics(); },
      { timeout: 8000 }
    );
  };

  // Look for emergency clinics straight away — no extra tap needed
  useEffect(() => {
    if (!clinicsRequested) findClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pet) {
    return (
      <div className="py-20 px-4 text-center text-paw-secondary dark:text-paw-warm-sage">
        {petsLoading ? 'Loading…' : <>No pets yet. <Link to="/features" className="font-bold text-paw-forest underline">Add a pet</Link> to use Emergency Mode.</>}
      </div>
    );
  }

  const contacts = pet.emergencyContact.name || pet.emergencyContact.phone ? [pet.emergencyContact] : [];

  return (
    <div className="min-h-[80vh] bg-rose-50 dark:bg-[#1c0f12] py-6 sm:py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link to={`/features?pet=${pet.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-800 dark:text-rose-300 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-extrabold uppercase tracking-wider">🚨 Emergency Mode</span>
        </div>

        {pets.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {pets.map((p) => (
              <button key={p.id} onClick={() => setSearchParams({ pet: p.id }, { replace: true })}
                className={`px-4 py-2 rounded-full text-sm font-bold ${p.id === pet.id ? 'bg-rose-700 text-white' : 'bg-white dark:bg-black/30 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900'}`}>
                {p.name}
              </button>
            ))}
          </div>
        )}

        {/* Identity */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900">
          <img src={pet.photo} alt={pet.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-rose-100 dark:border-rose-950"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${pet.name}`; }} />
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white truncate">{pet.name}</h1>
            <p className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
              {[pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : 'Pet', pet.breed, pet.gender, pet.age].filter(Boolean).join(' · ')}
            </p>
            {pet.weight > 0 && <p className="text-base font-bold text-gray-800 dark:text-gray-200">Weight: {pet.weight} kg</p>}
          </div>
        </div>

        {/* Allergies & medications — the two things a vet asks first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="bg-rose-600 text-white rounded-3xl p-5">
            <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide"><AlertTriangle className="w-5 h-5" /> Allergies</h2>
            {pet.allergies.length ? (
              <ul className="mt-2 space-y-1 text-lg font-bold">{pet.allergies.map((a) => <li key={a}>• {a}</li>)}</ul>
            ) : <p className="mt-2 text-base font-semibold opacity-90">None recorded</p>}
          </section>
          <section className="bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900">
            <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide text-gray-900 dark:text-white"><Pill className="w-5 h-5" /> Medications</h2>
            {pet.medications.length ? (
              <ul className="mt-2 space-y-1 text-lg font-bold text-gray-900 dark:text-white">{pet.medications.map((m) => <li key={m}>• {m}</li>)}</ul>
            ) : <p className="mt-2 text-base font-semibold text-gray-600 dark:text-gray-400">None recorded</p>}
          </section>
        </div>

        {/* Contacts — tap to call */}
        <section className="bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900 space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide text-gray-900 dark:text-white"><Phone className="w-5 h-5" /> Emergency contact</h2>
          {contacts.length ? contacts.map((c) => (
            <div key={c.name + c.phone} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{c.name || 'Contact'}</span>
              {c.phone && (
                <a href={`tel:${c.phone}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-600 text-white text-lg font-extrabold hover:bg-emerald-700">
                  <Phone className="w-5 h-5" /> Call {c.phone}
                </a>
              )}
            </div>
          )) : (
            <p className="text-base text-gray-600 dark:text-gray-400">No emergency contact saved. <Link to={`/features?pet=${pet.id}`} className="font-bold text-rose-700 underline">Add one</Link> so it's here when you need it.</p>
          )}
        </section>

        {/* Nearest 24/7 clinics */}
        <section className="bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide text-gray-900 dark:text-white"><MapPin className="w-5 h-5" /> 24/7 emergency clinics</h2>
            <button onClick={findClinics} disabled={locating || clinicsLoading} className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-700 dark:text-rose-300 disabled:opacity-60">
              {locating || clinicsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />} Refresh
            </button>
          </div>
          {locating || clinicsLoading ? (
            <p className="text-base text-gray-600 dark:text-gray-400">Finding the nearest emergency clinics…</p>
          ) : emergencyClinics.length ? emergencyClinics.map((c) => (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-t border-rose-100 dark:border-rose-950 first:border-0">
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{c.distance !== 'Distance unknown' && `${c.distance} · `}{c.address}</div>
              </div>
              <div className="flex gap-2">
                {c.phone && <a href={`tel:${c.phone}`} className="px-4 py-2.5 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-700">Call</a>}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.name} ${c.address}`)}`} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-full border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold">Directions</a>
              </div>
            </div>
          )) : (
            <p className="text-base text-gray-600 dark:text-gray-400">No 24/7 clinics found in PawPrint's list. Call your regular vet or search maps for "emergency vet near me".</p>
          )}
        </section>

        {/* Microchip + vaccination summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <section className="bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white"><Cpu className="w-4 h-4" /> Microchip</h2>
            <p className="mt-2 font-mono text-lg font-bold text-gray-900 dark:text-white break-all">{pet.microchipId || 'Not recorded'}</p>
          </section>
          <section className="sm:col-span-2 bg-white dark:bg-black/30 rounded-3xl p-5 border border-rose-200 dark:border-rose-900">
            <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-gray-900 dark:text-white"><Syringe className="w-4 h-4" /> Vaccinations</h2>
            {vaccineSummary.length ? (
              <ul className="mt-2 space-y-1.5">
                {vaccineSummary.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-2 text-base">
                    <span className="font-bold text-gray-900 dark:text-white">{v.name}</span>
                    <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded-full ${v.status === 'overdue' ? 'bg-rose-100 text-rose-800' : v.status === 'upcoming' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {v.status === 'overdue' ? `Overdue since ${v.nextDueDate}` : `Valid until ${v.nextDueDate}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-base text-gray-600 dark:text-gray-400">No vaccinations recorded.</p>}
          </section>
        </div>
      </div>
    </div>
  );
};
