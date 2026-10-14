import {
  LayoutDashboard, PawPrint, Syringe, Pill, Scale, Calendar, Wallet, MapPin, FileText, Clock, Bell,
  type LucideIcon,
} from 'lucide-react';

// One colour per feature, used for icon tiles, accents and charts so each
// section is recognisable at a glance across the app and the landing page
export type Tone = 'forest' | 'sky' | 'violet' | 'amber' | 'teal' | 'rose' | 'lime' | 'indigo' | 'slate' | 'orange' | 'red';

export const TONES: Record<Tone, { tile: string; text: string; soft: string; solid: string; ring: string; bar: string }> = {
  forest: { tile: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300', soft: 'bg-emerald-50 dark:bg-emerald-500/10', solid: 'bg-emerald-600', ring: 'ring-emerald-200 dark:ring-emerald-500/30', bar: 'bg-emerald-500' },
  sky: { tile: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300', text: 'text-sky-700 dark:text-sky-300', soft: 'bg-sky-50 dark:bg-sky-500/10', solid: 'bg-sky-600', ring: 'ring-sky-200 dark:ring-sky-500/30', bar: 'bg-sky-500' },
  violet: { tile: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300', text: 'text-violet-700 dark:text-violet-300', soft: 'bg-violet-50 dark:bg-violet-500/10', solid: 'bg-violet-600', ring: 'ring-violet-200 dark:ring-violet-500/30', bar: 'bg-violet-500' },
  amber: { tile: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300', soft: 'bg-amber-50 dark:bg-amber-500/10', solid: 'bg-amber-500', ring: 'ring-amber-200 dark:ring-amber-500/30', bar: 'bg-amber-500' },
  teal: { tile: 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300', text: 'text-teal-700 dark:text-teal-300', soft: 'bg-teal-50 dark:bg-teal-500/10', solid: 'bg-teal-600', ring: 'ring-teal-200 dark:ring-teal-500/30', bar: 'bg-teal-500' },
  rose: { tile: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', text: 'text-rose-700 dark:text-rose-300', soft: 'bg-rose-50 dark:bg-rose-500/10', solid: 'bg-rose-600', ring: 'ring-rose-200 dark:ring-rose-500/30', bar: 'bg-rose-500' },
  lime: { tile: 'bg-lime-50 text-lime-700 dark:bg-lime-500/15 dark:text-lime-300', text: 'text-lime-700 dark:text-lime-300', soft: 'bg-lime-50 dark:bg-lime-500/10', solid: 'bg-lime-600', ring: 'ring-lime-200 dark:ring-lime-500/30', bar: 'bg-lime-500' },
  indigo: { tile: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300', text: 'text-indigo-700 dark:text-indigo-300', soft: 'bg-indigo-50 dark:bg-indigo-500/10', solid: 'bg-indigo-600', ring: 'ring-indigo-200 dark:ring-indigo-500/30', bar: 'bg-indigo-500' },
  slate: { tile: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300', text: 'text-slate-700 dark:text-slate-300', soft: 'bg-slate-50 dark:bg-slate-500/10', solid: 'bg-slate-600', ring: 'ring-slate-200 dark:ring-slate-500/30', bar: 'bg-slate-500' },
  orange: { tile: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300', text: 'text-orange-700 dark:text-orange-300', soft: 'bg-orange-50 dark:bg-orange-500/10', solid: 'bg-orange-500', ring: 'ring-orange-200 dark:ring-orange-500/30', bar: 'bg-orange-500' },
  red: { tile: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300', text: 'text-red-700 dark:text-red-300', soft: 'bg-red-50 dark:bg-red-500/10', solid: 'bg-red-600', ring: 'ring-red-200 dark:ring-red-500/30', bar: 'bg-red-500' },
};

export const DASHBOARD_TABS = [
  'overview', 'pet-profiles', 'vaccinations', 'medications', 'weight-tracking', 'vet-appointments',
  'expenses', 'nearby-clinics', 'medical-documents', 'health-timeline', 'reminders',
] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

export interface DashboardSection {
  id: DashboardTab;
  label: string;
  short: string;
  icon: LucideIcon;
  tone: Tone;
  blurb: string;
}

export const SECTIONS: Record<DashboardTab, DashboardSection> = {
  overview: { id: 'overview', label: 'Overview', short: 'Home', icon: LayoutDashboard, tone: 'forest', blurb: 'Today at a glance' },
  'pet-profiles': { id: 'pet-profiles', label: 'Profile & ID', short: 'Profile', icon: PawPrint, tone: 'forest', blurb: 'Identity, allergies and emergency contacts' },
  vaccinations: { id: 'vaccinations', label: 'Vaccinations', short: 'Vaccines', icon: Syringe, tone: 'sky', blurb: 'Immunisations and boosters due' },
  medications: { id: 'medications', label: 'Medications', short: 'Meds', icon: Pill, tone: 'violet', blurb: 'Daily doses, streaks and adherence' },
  'weight-tracking': { id: 'weight-tracking', label: 'Weight', short: 'Weight', icon: Scale, tone: 'amber', blurb: 'Weigh-ins and healthy range' },
  'vet-appointments': { id: 'vet-appointments', label: 'Appointments', short: 'Visits', icon: Calendar, tone: 'teal', blurb: 'Vet visits and calendar invites' },
  expenses: { id: 'expenses', label: 'Expenses', short: 'Spend', icon: Wallet, tone: 'rose', blurb: 'Spending by month and category' },
  'nearby-clinics': { id: 'nearby-clinics', label: 'Nearby Clinics', short: 'Clinics', icon: MapPin, tone: 'lime', blurb: 'Vets ranked by distance' },
  'medical-documents': { id: 'medical-documents', label: 'Medical Vault', short: 'Vault', icon: FileText, tone: 'indigo', blurb: 'Reports, prescriptions and policies' },
  'health-timeline': { id: 'health-timeline', label: 'Timeline', short: 'Timeline', icon: Clock, tone: 'slate', blurb: 'Their whole health story' },
  reminders: { id: 'reminders', label: 'Smart Reminders', short: 'Reminders', icon: Bell, tone: 'orange', blurb: 'What needs doing next' },
};

// Sidebar grouping
export const NAV_GROUPS: { title: string; items: DashboardTab[] }[] = [
  { title: '', items: ['overview', 'reminders'] },
  { title: 'Health', items: ['vaccinations', 'medications', 'weight-tracking', 'vet-appointments', 'nearby-clinics'] },
  { title: 'Records', items: ['pet-profiles', 'medical-documents', 'health-timeline', 'expenses'] },
];

export const isDashboardTab = (value: string | null): value is DashboardTab =>
  !!value && (DASHBOARD_TABS as readonly string[]).includes(value);

export const dashboardHref = (tab: DashboardTab, petId?: string) =>
  `/features?tab=${tab}${petId ? `&pet=${petId}` : ''}`;
