import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Loader2, Syringe, Pill, Bell, Wallet } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { isDashboardTab, type DashboardTab } from '../lib/navigation';
import { AddPetModal } from '../components/dashboard/AddPetModal';
import { EditPetModal } from '../components/dashboard/EditPetModal';
import { ShareDialog } from '../components/dashboard/ShareDialog';
import { MedicationsTab } from '../components/dashboard/MedicationsTab';
import { ExpensesTab } from '../components/dashboard/ExpensesTab';
import { OverviewTab } from '../components/dashboard/tabs/OverviewTab';
import { ProfileTab } from '../components/dashboard/tabs/ProfileTab';
import { VaccinationsTab } from '../components/dashboard/tabs/VaccinationsTab';
import { WeightTab } from '../components/dashboard/tabs/WeightTab';
import { AppointmentsTab } from '../components/dashboard/tabs/AppointmentsTab';
import { ClinicsTab } from '../components/dashboard/tabs/ClinicsTab';
import { DocumentsTab } from '../components/dashboard/tabs/DocumentsTab';
import { TimelineTab } from '../components/dashboard/tabs/TimelineTab';
import { RemindersTab } from '../components/dashboard/tabs/RemindersTab';
import type { TabProps } from '../components/dashboard/tabs/types';
import { IconTile, PetAvatar } from '../components/ui';

export { DASHBOARD_TABS } from '../lib/navigation';

const TABS: Record<DashboardTab, React.FC<TabProps>> = {
  overview: OverviewTab,
  'pet-profiles': ProfileTab,
  vaccinations: VaccinationsTab,
  medications: ({ pet }) => <MedicationsTab pet={pet} />,
  'weight-tracking': WeightTab,
  'vet-appointments': AppointmentsTab,
  expenses: ({ pet }) => <ExpensesTab pet={pet} />,
  'nearby-clinics': ClinicsTab,
  'medical-documents': DocumentsTab,
  'health-timeline': TimelineTab,
  reminders: RemindersTab,
};

// First-run screen when the account has no pets yet
const Welcome: React.FC<{ loading: boolean; onAdd: () => void; name?: string }> = ({ loading, onAdd, name }) => (
  <div className="relative overflow-hidden card p-8 sm:p-12 animate-fadeIn">
    <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-emerald-100/70 dark:bg-emerald-500/10 blur-3xl animate-blob" aria-hidden />
    <div className="relative grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="eyebrow text-paw-forest dark:text-paw-sage">Welcome{name ? `, ${name.split(' ')[0]}` : ''} 🐾</span>
        <h2 className="mt-3 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-paw-dark dark:text-white">
          {loading ? 'Fetching your pets…' : 'Let’s meet your best friend.'}
        </h2>
        <p className="mt-4 text-paw-secondary dark:text-paw-warm-sage max-w-md">
          {loading ? 'Just a moment.' : 'Add a pet to unlock their health dashboard — vaccines, daily doses, weight, vet visits, costs and reminders, all in one calm place.'}
        </p>
        {loading ? (
          <Loader2 className="mt-8 w-7 h-7 animate-spin text-paw-forest" />
        ) : (
          <>
            <button onClick={onAdd} className="btn-primary btn-lg mt-8"><Plus className="w-5 h-5" /> Add your first pet</button>
            <ul className="mt-8 grid grid-cols-2 gap-3 max-w-md">
              {([[Syringe, 'sky', 'Booster reminders'], [Pill, 'violet', 'Daily dose checklist'], [Wallet, 'rose', 'Spending insights'], [Bell, 'orange', 'Smart care feed']] as const).map(([Icon, tone, text]) => (
                <li key={text} className="flex items-center gap-2.5 text-sm font-semibold text-paw-dark dark:text-white"><IconTile icon={Icon} tone={tone} size="sm" />{text}</li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="relative h-72 sm:h-96 hidden sm:block">
        <img src="/images/dog-portrait.webp" alt="" className="absolute left-0 top-6 w-1/2 h-60 object-cover rounded-[2rem] shadow-soft-xl rotate-[-4deg] animate-float-slow" />
        <img src="/images/kitten-paw.webp" alt="" className="absolute right-4 top-0 w-[42%] h-72 object-cover rounded-[2rem] shadow-soft-xl rotate-[5deg] animate-float-reverse" />
        <img src="/images/corgi-puppy.webp" alt="" className="absolute left-[30%] bottom-0 w-[38%] h-44 object-cover rounded-[2rem] shadow-soft-xl ring-8 ring-white dark:ring-paw-darkcard animate-float-delayed" />
      </div>
    </div>
  </div>
);

export const Features: React.FC = () => {
  const { pets, petsLoading, selectedPet, setSelectedPetId, user } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [addingPet, setAddingPet] = useState(false);
  const [editingPet, setEditingPet] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Active tab and pet live in the URL (?tab=…&pet=…) so sections can be
  // deep-linked and bookmarked, and search/notifications can jump straight to them
  const tabParam = searchParams.get('tab');
  const activeTab: DashboardTab = isDashboardTab(tabParam) ? tabParam : 'overview';
  const petParam = searchParams.get('pet');

  useEffect(() => {
    if (petParam && pets.some((p) => p.id === petParam)) setSelectedPetId(petParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petParam, pets.length]);

  // Pet and tab change in a single URL update — two separate setSearchParams
  // calls in one handler would each start from the same params and the first is lost
  const goTo = (tab: DashboardTab, petId?: string, extra?: Record<string, string>) => {
    if (petId) setSelectedPetId(petId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      if (petId) next.set('pet', petId);
      Object.entries(extra ?? {}).forEach(([k, v]) => next.set(k, v));
      return next;
    }, { replace: tab === activeTab });
    if (tab !== activeTab) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pet = selectedPet();

  if (!pet) {
    return (
      <>
        <Welcome loading={petsLoading} onAdd={() => setAddingPet(true)} name={user?.name} />
        {addingPet && <AddPetModal onClose={() => setAddingPet(false)} onCreated={(id) => goTo('overview', id)} />}
      </>
    );
  }

  const Tab = TABS[activeTab];

  return (
    <div className="space-y-6">
      {/* Quick pet switcher on phones and tablets (the sidebar has it on desktop) */}
      {pets.length > 1 && (
        <div className="lg:hidden -mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-none">
          {pets.map((p) => (
            <button key={p.id} onClick={() => goTo(activeTab, p.id)}
              className={`flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${p.id === pet.id
                ? 'bg-paw-forest text-white border-paw-forest shadow-soft'
                : 'bg-white dark:bg-paw-darkcard text-paw-dark dark:text-white border-paw-line dark:border-paw-darkborder'}`}>
              <PetAvatar pet={p} className="w-7 h-7" />{p.name}
            </button>
          ))}
          <button onClick={() => setAddingPet(true)} className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border-2 border-dashed border-paw-sage/60 text-paw-forest dark:text-paw-sage">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      {/* key remounts the tab so per-pet state (filters, open forms) resets on switch */}
      <div key={`${activeTab}-${pet.id}`}>
        <Tab pet={pet} goTo={goTo} onEditPet={() => setEditingPet(true)} onAddPet={() => setAddingPet(true)} onShare={() => setSharing(true)} />
      </div>

      {addingPet && <AddPetModal onClose={() => setAddingPet(false)} onCreated={(id) => goTo('overview', id)} />}
      {editingPet && <EditPetModal pet={pet} onClose={() => setEditingPet(false)} onDeleted={() => goTo('overview', useAppStore.getState().selectedPetId || undefined)} />}
      {sharing && <ShareDialog pet={pet} onClose={() => setSharing(false)} />}
    </div>
  );
};
