import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2, Lock, Printer, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';
import {
  mapBackendPet,
  mapBackendVaccination,
  mapBackendWeightRecord,
  mapBackendAppointment,
  mapBackendDocument,
  medicationLabel,
} from '../lib/adapters';
import { HealthSummaryDocument } from '../components/summary/HealthSummaryDocument';

/* eslint-disable @typescript-eslint/no-explicit-any */
type PublicShare = {
  sharedBy: string;
  expiresAt: string;
  pet: any;
  currentMedications: { name: string; dosage: string; frequencyLabel: string; instructions: string }[];
  vaccinations: any[];
  weights: any[];
  appointments: any[];
  documents: any[];
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// Public, read-only view of a pet's health summary, opened from a link or QR
// code the owner shared. No login — the token in the URL is the access.
export const SharedRecord: React.FC = () => {
  const { token } = useParams();
  const [data, setData] = useState<PublicShare | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<PublicShare>(`/shares/public/${encodeURIComponent(token || '')}`)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'This link could not be opened.'));
  }, [token]);

  useEffect(() => {
    if (!data) return;
    const previous = document.title;
    document.title = `${data.pet.name} — Health Record · PawPrint`;
    return () => { document.title = previous; };
  }, [data]);

  if (error) {
    return (
      <div className="py-24 px-4 flex justify-center">
        <div className="max-w-md text-center space-y-4 bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-paw-light-sage dark:bg-paw-darkcard flex items-center justify-center"><Lock className="w-6 h-6 text-paw-forest dark:text-paw-warm-sage" /></div>
          <h1 className="text-2xl font-extrabold text-paw-dark dark:text-white">Link not available</h1>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">{error} Ask the pet's owner to send you a new link.</p>
          <Link to="/" className="inline-block text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">About PawPrint →</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-32 text-center text-paw-secondary dark:text-paw-warm-sage">
        <Loader2 className="w-8 h-8 mx-auto animate-spin mb-3" /> Opening health record…
      </div>
    );
  }

  const pet = mapBackendPet(data.pet);
  const weightsAsc = data.weights.map(mapBackendWeightRecord);
  if (weightsAsc.length) pet.weight = weightsAsc[weightsAsc.length - 1].weight;
  const trackedNames = new Set(data.currentMedications.map((m) => m.name.trim().toLowerCase()));
  const medications = [
    ...data.currentMedications.map((m) => medicationLabel(m) + (m.instructions ? ` (${m.instructions})` : '')),
    ...pet.medications.filter((m) => !trackedNames.has(m.trim().toLowerCase())),
  ];
  const expires = new Date(data.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="py-8 px-4 print:p-0">
      <div className="max-w-3xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="inline-flex items-center gap-2 text-sm text-paw-secondary dark:text-paw-warm-sage">
          <ShieldCheck className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
          <span>Shared by <strong className="text-paw-dark dark:text-white">{data.sharedBy}</strong> · read-only · link expires {expires}</span>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <HealthSummaryDocument
        pet={pet}
        vaccinations={data.vaccinations.map(mapBackendVaccination)}
        weights={[...weightsAsc].reverse()}
        appointments={data.appointments.map(mapBackendAppointment)}
        documents={data.documents.map(mapBackendDocument)}
        medications={medications}
        ownerName={data.sharedBy}
        generatedLabel={`Viewed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
      />
    </div>
  );
};
