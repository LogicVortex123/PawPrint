import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  Scale,
  Activity,
  BarChart3,
  Award,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { PawIcon } from '../components/common/OrganicDeco';
import { PetAvatar, SectionHeader } from '../components/ui';
import { formatMoney } from '../lib/money';
import { todayKey } from '../lib/dates';

export const Analytics: React.FC = () => {
  const {
    pets,
    petsLoading,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    vaccinations,
    weightRecords,
    appointments,
    timeline,
    expenses,
    user,
  } = useAppStore();

  const [activeRange, setActiveRange] = useState<'6m' | '1y' | 'all'>('6m');
  const pet = selectedPet();

  if (!pet) {
    return (
      <div className="py-20 px-4 flex items-center justify-center text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-extrabold text-paw-dark dark:text-white">
            {petsLoading ? 'Loading your pets…' : 'No pets yet'}
          </h2>
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">
            {petsLoading ? 'Just a moment.' : 'Add a pet profile first to see health analytics here.'}
          </p>
          {!petsLoading && (
            <Link to="/features" className="inline-block px-6 py-3 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft transition-all">
              Add Your First Pet
            </Link>
          )}
        </div>
      </div>
    );
  }

  const petWeights = weightRecords[pet.id] || [];

  // ── Computed metrics from real data ──────────────────────────────────────
  const totalPets = pets.length;

  const petVaccinations = vaccinations.filter((v) => v.petId === pet.id);
  const completedVaxCount = petVaccinations.filter((v) => v.status === 'completed').length;
  const upcomingVaxCount = petVaccinations.filter((v) => v.status === 'upcoming').length;
  const overdueVaxCount  = petVaccinations.filter((v) => v.status === 'overdue').length;
  const totalVaxCount    = petVaccinations.length;

  const petAppointments     = appointments.filter((a) => a.petId === pet.id);
  const upcomingAppointments = petAppointments.filter((a) => a.status === 'upcoming');
  const nextAppointment      = upcomingAppointments[upcomingAppointments.length - 1] || upcomingAppointments[0];

  // Average weight across all pets (using latest recorded weight)
  const petsWithWeight = pets.filter((p) => {
    const recs = weightRecords[p.id];
    return recs && recs.length > 0;
  });
  const avgPetWeight =
    petsWithWeight.length > 0
      ? (petsWithWeight.reduce((acc, p) => {
          const recs = weightRecords[p.id];
          return acc + (recs?.[recs.length - 1]?.weight ?? p.weight);
        }, 0) / petsWithWeight.length).toFixed(1)
      : pet.weight > 0
        ? pet.weight.toFixed(1)
        : null;

  // Care score: simple heuristic (penalise overdue vaxes, reward records)
  // Clamped to 0–100 (the weigh-in bonus used to push it to 105)
  const careScore = Math.min(100, Math.max(
    0,
    95 - overdueVaxCount * 15 + (petWeights.length > 0 ? 5 : 0)
  ));
  const careLabel = careScore >= 90 ? 'Excellent wellness status' : careScore >= 70 ? 'Good — a few items need attention' : 'Needs care — please check overdue items';

  // Boarding eligibility: all vaccines up to date
  const boardingReady = overdueVaxCount === 0 && totalVaxCount > 0;

  return (
    <div className="relative animate-fadeIn">
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#DCEBE2]/40 dark:bg-paw-darkcard/20 organic-blob-1 blur-2xl -z-10 pointer-events-none" />

      <div className="space-y-10">

        {/* Header & Pet Switcher */}
        <SectionHeader icon={BarChart3} tone="teal" eyebrow="Health insights" title="Wellness at a glance"
          description="Trends across your pets — immunisations, weight, visits and spending — in one view."
          actions={pets.length > 1 ? (
            <div className="segmented">
              {pets.map((p) => (
                <button key={p.id} onClick={() => setSelectedPetId(p.id)} aria-pressed={selectedPetId === p.id}
                  className={`segmented-item inline-flex items-center gap-2 ${selectedPetId === p.id ? 'segmented-item-active' : ''}`}>
                  <PetAvatar pet={p} className="w-5 h-5" />{p.name}
                </button>
              ))}
            </div>
          ) : undefined} />

        {/* Stat strip — one unified bar with divided segments, not four
           separate boxed cards, so it reads differently from the card-based
           sections below it rather than repeating the same shape again. */}
        <div className="card p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:divide-x divide-paw-soft-sage/50 dark:divide-paw-darkborder">

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#E2EDE6] dark:bg-paw-darkcard text-paw-forest dark:text-paw-warm-sage flex items-center justify-center flex-shrink-0">
                <PawIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Registered Pets</span>
                <div className="text-xl sm:text-2xl font-extrabold text-paw-dark dark:text-white leading-tight">{totalPets} {totalPets === 1 ? 'Pet' : 'Pets'}</div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {avgPetWeight ? `Avg weight: ${avgPetWeight} kg` : 'Log weights to see avg'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:pl-8">
              <div className="w-11 h-11 rounded-full bg-[#DEF7EC] dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Vaccines Up to Date</span>
                <div className="text-xl sm:text-2xl font-extrabold text-paw-dark dark:text-white leading-tight">{completedVaxCount} Completed</div>
                <span className={`text-[11px] font-semibold ${upcomingVaxCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-paw-forest dark:text-paw-sage'}`}>
                  {upcomingVaxCount > 0 ? `${upcomingVaxCount} upcoming soon` : overdueVaxCount > 0 ? `${overdueVaxCount} overdue!` : totalVaxCount === 0 ? 'No vaccinations logged' : 'All up to date ✓'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:pl-8">
              <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Upcoming Visits</span>
                <div className="text-xl sm:text-2xl font-extrabold text-paw-dark dark:text-white leading-tight">{upcomingAppointments.length} Scheduled</div>
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  {nextAppointment ? `Next: ${nextAppointment.date}` : 'No upcoming visits'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 lg:pl-8">
              <div className="w-11 h-11 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">Care Score</span>
                <div className="text-xl sm:text-2xl font-extrabold text-paw-dark dark:text-white leading-tight">{careScore} / 100</div>
                <span className={`text-[11px] font-semibold ${careScore >= 90 ? 'text-emerald-700 dark:text-emerald-400' : careScore >= 70 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>{careLabel}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Weight Chart + Vaccination Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
                    <h3 className="text-xl font-bold text-paw-dark dark:text-white">Weight History: {pet.name}</h3>
                  </div>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-0.5">
                    {petWeights.length} records · {pet.weight > 0 ? `Current: ${pet.weight} kg` : 'Log a weigh-in to see trends'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-paw-darkcard p-1 rounded-full text-xs font-bold border border-paw-soft-sage/50">
                  {(['6m', '1y', 'all'] as const).map((r) => (
                    <button key={r} onClick={() => setActiveRange(r)}
                      className={`px-3 py-1 rounded-full transition-colors ${activeRange === r ? 'bg-paw-forest text-white' : 'text-paw-secondary hover:text-paw-dark'}`}>
                      {r === '6m' ? '6 Months' : r === '1y' ? '1 Year' : 'All-Time'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="py-6">
                {petWeights.length >= 2 ? (
                  <svg viewBox="0 0 500 160" className="w-full h-48 overflow-visible">
                    <defs>
                      <linearGradient id="analyticsWeightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#245C4A" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#245C4A" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#EEF6F0" strokeWidth="1" />
                    <line x1="0" y1="70" x2="500" y2="70" stroke="#EEF6F0" strokeWidth="1" />
                    <line x1="0" y1="110" x2="500" y2="110" stroke="#EEF6F0" strokeWidth="1" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#EEF6F0" strokeWidth="1" />
                    <rect x="0" y="40" width="500" height="70" fill="#EEF6F0" fillOpacity="0.5" rx="8" />
                    <text x="8" y="36" fill="#6F9F89" fontSize="9" fontWeight="bold">Weight Trend</text>
                    {(() => {
                      const weights = petWeights.map(w => w.weight);
                      const min = Math.min(...weights) - 0.5;
                      const max = Math.max(...weights) + 0.5;
                      const range = max - min || 1;
                      const pts = petWeights.map((w, i) => {
                        const x = 20 + (i / Math.max(petWeights.length - 1, 1)) * 460;
                        const y = 140 - ((w.weight - min) / range) * 110;
                        return { x, y, w };
                      });
                      const areaD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + ` L ${pts[pts.length - 1].x} 150 L ${pts[0].x} 150 Z`;
                      const lineD = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
                      return (
                        <>
                          <path d={areaD} fill="url(#analyticsWeightGrad)" />
                          <path d={lineD} fill="none" stroke="#245C4A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                          {pts.map(({ x, y, w }, i) => (
                            <circle key={w.id} cx={x} cy={y} r={i === pts.length - 1 ? 6 : 5} fill="#245C4A" stroke={i === pts.length - 1 ? '#FFFFFF' : 'none'} strokeWidth="2.5" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                ) : (
                  <div className="h-48 flex items-center justify-center text-paw-secondary dark:text-paw-warm-sage/60 text-sm">
                    <div className="text-center">
                      <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Log at least 2 weigh-ins to see the trend chart.</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-paw-secondary dark:text-paw-warm-sage font-medium pt-2">
                  {petWeights.slice(0, 6).map((w, i) => (
                    <span key={w.id} className={i === petWeights.length - 1 ? 'font-bold text-paw-forest dark:text-paw-sage' : ''}>
                      {w.date} ({w.weight}kg)
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                {petWeights.length >= 2
                  ? `${((petWeights[petWeights.length - 1].weight - petWeights[0].weight) >= 0 ? '+' : '')}${(petWeights[petWeights.length - 1].weight - petWeights[0].weight).toFixed(1)} kg over ${petWeights.length} entries`
                  : 'Add weight records to see trend'}
              </span>
            </div>
          </div>

          {/* Vaccination Matrix */}
          <div className="lg:col-span-4 bg-white dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
                <h3 className="text-xl font-bold text-paw-dark dark:text-white">Vaccination status</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <span>🟢 Valid &amp; Complete</span>
                    <span>{completedVaxCount} vaccine{completedVaxCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    {petVaccinations.filter(v => v.status === 'completed').map(v => v.name).join(', ') || 'None recorded'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span>🟡 Upcoming (30 Days)</span>
                    <span>{upcomingVaxCount} booster{upcomingVaxCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    {petVaccinations.filter(v => v.status === 'upcoming').map(v => v.name).join(', ') || 'None due soon'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300">
                    <span>🔴 Needs Attention</span>
                    <span>{overdueVaxCount} vaccine{overdueVaxCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                    {petVaccinations.filter(v => v.status === 'overdue').map(v => v.name).join(', ') || 'None overdue ✓'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 text-center">
              <span className={`text-xs font-bold ${boardingReady ? 'text-paw-forest dark:text-paw-warm-sage' : 'text-rose-600 dark:text-rose-400'}`}>
                {totalVaxCount === 0
                  ? 'Add vaccinations to check eligibility'
                  : boardingReady
                    ? 'Boarding Eligibility: Ready for Daycare ✓'
                    : `Boarding Eligibility: ${overdueVaxCount} overdue vaccine${overdueVaxCount !== 1 ? 's' : ''} ✗`}
              </span>
            </div>
          </div>

        </div>

        {/* Spending — from the expense tracker */}
        {(() => {
          const year = todayKey().slice(0, 4);
          const month = todayKey().slice(0, 7);
          const petExpenses = expenses.filter((e) => e.petId === pet.id);
          const yearTotal = petExpenses.filter((e) => e.date.startsWith(year)).reduce((s, e) => s + e.amount, 0);
          const monthTotal = petExpenses.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);
          const currency = user?.preferences?.currency;
          return (
            <div className="bg-white dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
                <div>
                  <h3 className="text-xl font-bold text-paw-dark dark:text-white">Spending on {pet.name}</h3>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{petExpenses.length ? 'From the expense tracker' : 'Log vet bills, food and grooming to see what care costs.'}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">This month</div>
                  <div className="text-2xl font-extrabold text-paw-dark dark:text-white">{formatMoney(monthTotal, currency)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">{year} so far</div>
                  <div className="text-2xl font-extrabold text-paw-dark dark:text-white">{formatMoney(yearTotal, currency)}</div>
                </div>
                <Link to={`/features?pet=${pet.id}&tab=expenses`} className="text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline whitespace-nowrap">View expenses →</Link>
              </div>
            </div>
          );
        })()}

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
              <h3 className="text-xl font-bold text-paw-dark dark:text-white">Recent Health Log Activity</h3>
            </div>
            <span className="text-xs text-paw-secondary dark:text-paw-warm-sage font-semibold">Latest records</span>
          </div>

          {timeline.filter(t => t.petId === pet.id).length === 0 ? (
            <p className="text-center text-paw-secondary dark:text-paw-warm-sage/60 text-sm py-6">
              No activity recorded yet. Add vaccinations, log weights, or book appointments to see them here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {timeline.filter(t => t.petId === pet.id).slice(0, 3).map((item) => (
                <div key={item.id} className="bg-paw-cream dark:bg-paw-darkcard p-5 rounded-2xl border border-paw-soft-sage/50 dark:border-paw-darkborder space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-paw-forest dark:text-paw-sage">{item.date}</span>
                    <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-paw-darksurface text-paw-dark dark:text-white">{item.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-paw-dark dark:text-white">{item.title}</h4>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
