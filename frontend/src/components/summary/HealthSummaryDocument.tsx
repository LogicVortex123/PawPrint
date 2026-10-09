import React from 'react';
import { Pet, Vaccination, WeightRecord, Appointment, MedicalDocument } from '../../types';

type Props = {
  pet: Pet;
  vaccinations: Vaccination[];
  weights: WeightRecord[]; // newest first
  appointments: Appointment[];
  documents: Pick<MedicalDocument, 'id' | 'category' | 'title' | 'date'>[];
  medications: string[]; // display labels, e.g. "Apoquel — 1 tablet, twice a day"
  ownerName?: string;
  generatedLabel: string; // e.g. "Generated 12 March 2026"
};

const th = 'text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 py-1.5 pr-3 border-b border-gray-300';
const td = 'py-1.5 pr-3 border-b border-gray-100 align-top';

// The health summary document itself — always light, so it prints the same in
// dark mode. Used by the owner's printable summary and the shared vet link.
export const HealthSummaryDocument: React.FC<Props> = ({ pet, vaccinations, weights, appointments, documents, medications, ownerName, generatedLabel }) => (
  <article className="max-w-3xl mx-auto bg-white text-gray-900 rounded-2xl shadow-soft-xl p-6 sm:p-10 print:shadow-none print:rounded-none print:p-0 print:max-w-none text-sm">
    <header className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-5 border-b-2 border-[#245C4A]">
      <div className="flex items-center gap-4">
        <img src={pet.photo} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-200"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div>
          <h1 className="text-2xl font-extrabold">{pet.name}</h1>
          <p className="text-gray-600">{[pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : 'Pet', pet.breed, pet.gender].filter(Boolean).join(' · ')}</p>
          <p className="text-gray-600">
            {pet.dob ? `Born ${pet.dob} (${pet.age})` : pet.age}{pet.weight > 0 && ` · ${pet.weight} kg`}
          </p>
        </div>
      </div>
      <div className="sm:text-right text-xs text-gray-500">
        <div className="font-extrabold text-[#245C4A] text-base">🐾 PawPrint</div>
        <div>Health Summary</div>
        <div>{generatedLabel}</div>
        {ownerName && <div>Owner: {ownerName}</div>}
      </div>
    </header>

    <section className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6 py-5 border-b border-gray-200">
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-1">Allergies</h2>
        <p className="font-semibold">{pet.allergies.length ? pet.allergies.join(', ') : 'None recorded'}</p>
      </div>
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#245C4A] mb-1">Current medications</h2>
        {medications.length ? (
          <ul className="font-semibold space-y-0.5">{medications.map((m) => <li key={m}>{m}</li>)}</ul>
        ) : <p className="font-semibold">None recorded</p>}
      </div>
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Microchip ID</h2>
        <p className="font-mono font-semibold">{pet.microchipId || 'Not recorded'}</p>
      </div>
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Emergency contact</h2>
        <p className="font-semibold">
          {pet.emergencyContact.phone
            ? <a href={`tel:${pet.emergencyContact.phone}`} className="underline print:no-underline">{[pet.emergencyContact.name, pet.emergencyContact.phone].filter(Boolean).join(' · ')}</a>
            : pet.emergencyContact.name || 'Not recorded'}
        </p>
      </div>
    </section>

    <section className="py-5 break-inside-avoid">
      <h2 className="text-base font-extrabold mb-2">Vaccinations</h2>
      {vaccinations.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead><tr><th className={th}>Vaccine</th><th className={th}>Given</th><th className={th}>Next due</th><th className={th}>Vet / clinic</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {vaccinations.map((v) => (
                <tr key={v.id}>
                  <td className={`${td} font-semibold`}>{v.name}{v.batchNumber && <div className="text-[11px] text-gray-500">Batch {v.batchNumber}</div>}</td>
                  <td className={td}>{v.administeredDate}</td>
                  <td className={td}>{v.nextDueDate}</td>
                  <td className={td}>{[v.veterinarian, v.clinic].filter((x) => x && x !== 'Not specified').join(' · ') || '—'}</td>
                  <td className={`${td} font-bold capitalize ${v.status === 'overdue' ? 'text-rose-700' : v.status === 'upcoming' ? 'text-amber-700' : 'text-emerald-700'}`}>{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-gray-500">No vaccinations recorded.</p>}
    </section>

    <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6">
      <section className="py-2 break-inside-avoid">
        <h2 className="text-base font-extrabold mb-2">Recent weights</h2>
        {weights.length ? (
          <table className="w-full">
            <thead><tr><th className={th}>Date</th><th className={th}>Weight</th><th className={th}>Change</th></tr></thead>
            <tbody>
              {weights.map((w) => (
                <tr key={w.id}>
                  <td className={td}>{w.date}</td>
                  <td className={`${td} font-semibold`}>{w.weight} kg</td>
                  <td className={td}>{w.trendPercent === null ? '—' : `${w.trendPercent > 0 ? '+' : ''}${w.trendPercent}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-gray-500">No weights recorded.</p>}
      </section>

      <section className="py-2 break-inside-avoid">
        <h2 className="text-base font-extrabold mb-2">Documents on file</h2>
        {documents.length ? (
          <ul className="space-y-1">
            {documents.map((d) => <li key={d.id}><span className="font-semibold">{d.category}:</span> {d.title} <span className="text-gray-500">({d.date})</span></li>)}
          </ul>
        ) : <p className="text-gray-500">No documents uploaded.</p>}
      </section>
    </div>

    <section className="py-5 break-inside-avoid">
      <h2 className="text-base font-extrabold mb-2">Appointments</h2>
      {appointments.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px]">
            <thead><tr><th className={th}>Date</th><th className={th}>Clinic</th><th className={th}>Reason</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className={td}>{a.date}{a.time && <div className="text-[11px] text-gray-500">{a.time}</div>}</td>
                  <td className={td}>{a.clinicName}</td>
                  <td className={td}>{a.reason}{a.notes && <div className="text-[11px] text-gray-500">{a.notes}</div>}</td>
                  <td className={`${td} capitalize`}>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="text-gray-500">No appointments recorded.</p>}
    </section>

    <footer className="pt-4 border-t border-gray-200 text-[11px] text-gray-500">
      Owner-maintained record generated by PawPrint. Not a veterinary certificate — please confirm details with the treating veterinarian.
    </footer>
  </article>
);
