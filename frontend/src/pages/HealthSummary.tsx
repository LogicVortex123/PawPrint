import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

// Print-ready health summary for a new vet, sitter or boarding facility.
// "Download PDF" opens the browser print dialog, where "Save as PDF" produces
// the file — no PDF library needed, and the layout below is print-styled.
export const HealthSummary: React.FC = () => {
  const { petId } = useParams();
  const { pets, petsLoading, vaccinations, weightRecords, appointments, documents, user } = useAppStore();
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    return (
      <div className="py-20 px-4 text-center text-paw-secondary dark:text-paw-warm-sage">
        {petsLoading ? 'Loading…' : <>Pet not found. <Link to="/features" className="font-bold text-paw-forest underline">Back to dashboard</Link></>}
      </div>
    );
  }

  const petVax = vaccinations.filter((v) => v.petId === pet.id).sort((a, b) => (a.administeredDate < b.administeredDate ? 1 : -1));
  const petWeights = [...(weightRecords[pet.id] || [])].reverse().slice(0, 10);
  const petApts = appointments.filter((a) => a.petId === pet.id).sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  const petDocs = documents.filter((d) => d.petId === pet.id);
  const generated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const printPdf = () => {
    // Browsers use the page title as the default PDF file name
    const previous = document.title;
    document.title = `${pet.name} - PawPrint Health Summary`;
    window.print();
    document.title = previous;
  };

  const th = 'text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 py-1.5 pr-3 border-b border-gray-300';
  const td = 'py-1.5 pr-3 border-b border-gray-100 align-top';

  return (
    <div className="py-8 px-4 print:p-0">
      {/* Toolbar — not printed */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/features?pet=${pet.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <button onClick={printPdf} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
          <Printer className="w-4 h-4" /> Download PDF / Print
        </button>
      </div>
      <p className="max-w-3xl mx-auto -mt-3 mb-5 text-xs text-paw-secondary dark:text-paw-warm-sage print:hidden">
        Tip: choose “Save as PDF” as the printer to get a file you can email or share.
      </p>

      {/* The document — always light, so it prints the same in dark mode */}
      <article className="max-w-3xl mx-auto bg-white text-gray-900 rounded-2xl shadow-soft-xl p-8 sm:p-10 print:shadow-none print:rounded-none print:p-0 print:max-w-none text-sm">
        <header className="flex items-start justify-between gap-6 pb-5 border-b-2 border-[#245C4A]">
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
          <div className="text-right text-xs text-gray-500">
            <div className="font-extrabold text-[#245C4A] text-base">🐾 PawPrint</div>
            <div>Health Summary</div>
            <div>Generated {generated}</div>
            {user && <div>Owner: {user.name}</div>}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 mb-1">Allergies</h2>
            <p className="font-semibold">{pet.allergies.length ? pet.allergies.join(', ') : 'None recorded'}</p>
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#245C4A] mb-1">Current medications</h2>
            <p className="font-semibold">{pet.medications.length ? pet.medications.join(', ') : 'None recorded'}</p>
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Microchip ID</h2>
            <p className="font-mono font-semibold">{pet.microchipId || 'Not recorded'}</p>
          </div>
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1">Emergency contact</h2>
            <p className="font-semibold">{[pet.emergencyContact.name, pet.emergencyContact.phone].filter(Boolean).join(' · ') || 'Not recorded'}</p>
          </div>
        </section>

        <section className="py-5 break-inside-avoid">
          <h2 className="text-base font-extrabold mb-2">Vaccinations</h2>
          {petVax.length ? (
            <table className="w-full">
              <thead><tr><th className={th}>Vaccine</th><th className={th}>Given</th><th className={th}>Next due</th><th className={th}>Vet / clinic</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {petVax.map((v) => (
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
          ) : <p className="text-gray-500">No vaccinations recorded.</p>}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-6">
          <section className="py-2 break-inside-avoid">
            <h2 className="text-base font-extrabold mb-2">Recent weights</h2>
            {petWeights.length ? (
              <table className="w-full">
                <thead><tr><th className={th}>Date</th><th className={th}>Weight</th><th className={th}>Change</th></tr></thead>
                <tbody>
                  {petWeights.map((w) => (
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
            {petDocs.length ? (
              <ul className="space-y-1">
                {petDocs.map((d) => <li key={d.id}><span className="font-semibold">{d.category}:</span> {d.title} <span className="text-gray-500">({d.date})</span></li>)}
              </ul>
            ) : <p className="text-gray-500">No documents uploaded.</p>}
          </section>
        </div>

        <section className="py-5 break-inside-avoid">
          <h2 className="text-base font-extrabold mb-2">Appointments</h2>
          {petApts.length ? (
            <table className="w-full">
              <thead><tr><th className={th}>Date</th><th className={th}>Clinic</th><th className={th}>Reason</th><th className={th}>Status</th></tr></thead>
              <tbody>
                {petApts.map((a) => (
                  <tr key={a.id}>
                    <td className={td}>{a.date}{a.time && <div className="text-[11px] text-gray-500">{a.time}</div>}</td>
                    <td className={td}>{a.clinicName}</td>
                    <td className={td}>{a.reason}{a.notes && <div className="text-[11px] text-gray-500">{a.notes}</div>}</td>
                    <td className={`${td} capitalize`}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-gray-500">No appointments recorded.</p>}
        </section>

        <footer className="pt-4 border-t border-gray-200 text-[11px] text-gray-500">
          Owner-maintained record generated by PawPrint. Not a veterinary certificate — please confirm details with the treating veterinarian.
        </footer>
      </article>
    </div>
  );
};
