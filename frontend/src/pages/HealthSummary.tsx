import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HealthSummaryDocument } from '../components/summary/HealthSummaryDocument';
import { ShareDialog } from '../components/dashboard/ShareDialog';
import { currentMedicationLabels } from '../lib/adapters';

// Print-ready health summary for a new vet, sitter or boarding facility.
// "Download PDF" opens the browser print dialog, where "Save as PDF" produces
// the file — no PDF library needed, and the document is print-styled.
export const HealthSummary: React.FC = () => {
  const { petId } = useParams();
  const { pets, petsLoading, vaccinations, weightRecords, appointments, documents, medications, user } = useAppStore();
  const [sharing, setSharing] = useState(false);
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

  return (
    <div className="py-8 px-4 print:p-0">
      {/* Toolbar — not printed */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link to={`/features?pet=${pet.id}`} className="inline-flex items-center gap-1.5 text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSharing(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40">
            <Share2 className="w-4 h-4" /> Share with vet
          </button>
          <button onClick={printPdf} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
            <Printer className="w-4 h-4" /> Download PDF / Print
          </button>
        </div>
      </div>
      <p className="max-w-3xl mx-auto -mt-3 mb-5 text-xs text-paw-secondary dark:text-paw-warm-sage print:hidden">
        Tip: choose “Save as PDF” as the printer to get a file you can email — or use “Share with vet” to send a live link instead.
      </p>

      <HealthSummaryDocument
        pet={pet}
        vaccinations={petVax}
        weights={petWeights}
        appointments={petApts}
        documents={petDocs}
        medications={currentMedicationLabels(pet, medications)}
        ownerName={user?.name}
        generatedLabel={`Generated ${generated}`}
      />

      {sharing && <ShareDialog pet={pet} onClose={() => setSharing(false)} />}
    </div>
  );
};
