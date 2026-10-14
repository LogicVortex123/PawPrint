import type { Pet } from '../../../types';
import type { DashboardTab } from '../../../lib/navigation';

// What every dashboard tab receives from the page
export interface TabProps {
  pet: Pet;
  // Jump to another tab, optionally for another pet, in one URL update.
  // `extra` adds one-off query params (e.g. { book: '1' } opens the booking form)
  goTo: (tab: DashboardTab, petId?: string, extra?: Record<string, string>) => void;
  onEditPet: () => void;
  onAddPet: () => void;
  onShare: () => void;
}
