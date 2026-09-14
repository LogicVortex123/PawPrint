import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Calendar,
  Scale,
  Activity,
  BarChart3,
  Award,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PawIcon } from '../components/common/OrganicDeco';

export const Analytics: React.FC = () => {
  const { pets, selectedPetId, setSelectedPetId, selectedPet, vaccinations, weightRecords, appointments, timeline } = useAppStore();

  const [activeRange, setActiveRange] = useState<'6m' | '1y' | 'all'>('6m');
  const pet = selectedPet();
  const petWeights = weightRecords[pet.id] || [];

  // Metrics
  const totalPets = pets.length;
  const completedVaxCount = vaccinations.filter((v) => v.status === 'completed').length;
  const upcomingAptCount = appointments.filter((a) => a.status === 'upcoming').length;
  const avgPetWeight = (pets.reduce((acc, p) => acc + p.weight, 0) / pets.length).toFixed(1);

  return (
    <div className="py-12 lg:py-24 transition-colors duration-200 relative overflow-hidden">
      {/* Background organic blobs & watermarks */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#DCEBE2]/40 dark:bg-paw-darkcard/20 organic-blob-1 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Analytics Header & Pet Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-paw-soft-sage/40 dark:border-paw-darkborder/50">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2EDE6] dark:bg-paw-darksurface border border-[#D0E2D5] dark:border-paw-darkborder text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-warm-sage">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Pet Health Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-paw-dark dark:text-white tracking-tight font-sans">
              Wellness Dashboard
            </h1>
            <p className="text-sm sm:text-base text-paw-secondary dark:text-paw-warm-sage/80 font-normal">
              Aggregated insights across your family’s pets, immunization timelines, and body condition scores.
            </p>
          </div>

          {/* Quick Pet Switcher */}
          <div className="flex items-center gap-2 bg-[#FAFAF6] dark:bg-paw-darksurface p-1.5 rounded-full border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft">
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPetId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPetId === p.id
                    ? 'bg-paw-forest text-white shadow-soft'
                    : 'text-paw-secondary dark:text-paw-warm-sage hover:text-paw-forest'
                }`}
              >
                <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Summary Cards with Circular Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-6 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#E2EDE6] dark:bg-paw-darkcard text-paw-forest dark:text-paw-warm-sage flex items-center justify-center flex-shrink-0 shadow-2xs">
              <PawIcon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">
                Registered Pets
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-paw-dark dark:text-white mt-0.5">
                {totalPets} Family Pets
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Avg weight: {avgPetWeight} kg (Optimal)
              </span>
            </div>
          </div>

          <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-3xl p-6 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#DEF7EC] dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">
                Vaccines Up to Date
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-paw-dark dark:text-white mt-0.5">
                {completedVaxCount} Completed
              </div>
              <span className="text-[11px] font-semibold text-paw-forest dark:text-paw-sage">
                1 upcoming this month
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-paw-darksurface rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">
                Upcoming Visits
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-paw-dark dark:text-white mt-0.5">
                {upcomingAptCount} Scheduled
              </div>
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                Next: Sep 24 (Dental)
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-paw-darksurface rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">
                Care Score
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-paw-dark dark:text-white mt-0.5">
                98 / 100
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Excellent wellness status
              </span>
            </div>
          </div>

        </div>

        {/* Middle Section: Weight Trend Line Chart + Vaccination Health Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Weight Trend Chart for Selected Pet */}
          <div className="lg:col-span-8 bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
                    <h3 className="text-xl font-bold text-paw-dark dark:text-white">
                      Weight History: {pet.name}
                    </h3>
                  </div>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-0.5">
                    Target range: {pet.targetWeightRange[0]} – {pet.targetWeightRange[1]} kg · Optimal body index
                  </p>
                </div>

                {/* Range pills */}
                <div className="flex items-center gap-1 bg-white dark:bg-paw-darkcard p-1 rounded-full text-xs font-bold border border-paw-soft-sage/50">
                  <button
                    onClick={() => setActiveRange('6m')}
                    className={`px-3 py-1 rounded-full transition-colors ${activeRange === '6m' ? 'bg-paw-forest text-white' : 'text-paw-secondary hover:text-paw-dark'}`}
                  >
                    6 Months
                  </button>
                  <button
                    onClick={() => setActiveRange('1y')}
                    className={`px-3 py-1 rounded-full transition-colors ${activeRange === '1y' ? 'bg-paw-forest text-white' : 'text-paw-secondary hover:text-paw-dark'}`}
                  >
                    1 Year
                  </button>
                  <button
                    onClick={() => setActiveRange('all')}
                    className={`px-3 py-1 rounded-full transition-colors ${activeRange === 'all' ? 'bg-paw-forest text-white' : 'text-paw-secondary hover:text-paw-dark'}`}
                  >
                    All-Time
                  </button>
                </div>
              </div>

              {/* Dynamic SVG line graph */}
              <div className="py-6">
                <svg viewBox="0 0 500 160" className="w-full h-48 overflow-visible">
                  <defs>
                    <linearGradient id="analyticsWeightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#245C4A" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#245C4A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#EEF6F0" strokeWidth="1" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#EEF6F0" strokeWidth="1" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#EEF6F0" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#EEF6F0" strokeWidth="1" />

                  {/* Healthy band */}
                  <rect x="0" y="40" width="500" height="70" fill="#EEF6F0" fillOpacity="0.5" rx="8" />
                  <text x="8" y="36" fill="#6F9F89" fontSize="9" fontWeight="bold">Ideal Target Band</text>

                  {/* Area fill */}
                  <path
                    d="M 20 110 Q 120 100, 200 85 T 380 60 T 480 55 L 480 150 L 20 150 Z"
                    fill="url(#analyticsWeightGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M 20 110 Q 120 100, 200 85 T 380 60 T 480 55"
                    fill="none"
                    stroke="#245C4A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Points */}
                  <circle cx="20" cy="110" r="5" fill="#245C4A" />
                  <circle cx="120" cy="100" r="5" fill="#245C4A" />
                  <circle cx="200" cy="85" r="5" fill="#245C4A" />
                  <circle cx="380" cy="60" r="5" fill="#245C4A" />
                  <circle cx="480" cy="55" r="6" fill="#245C4A" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>

                <div className="flex justify-between text-[11px] text-paw-secondary dark:text-paw-warm-sage font-medium pt-2">
                  <span>Apr ({petWeights[0]?.weight || 27.8}kg)</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span className="font-bold text-paw-forest dark:text-paw-sage">Current ({pet.weight}kg)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Stable growth pattern (+0.6 kg over 6 months)
              </span>
              <span className="text-paw-secondary dark:text-paw-warm-sage">
                Recorded monthly via home scale
              </span>
            </div>
          </div>

          {/* Vaccination Health Matrix */}
          <div className="lg:col-span-4 bg-white dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
                <h3 className="text-xl font-bold text-paw-dark dark:text-white">
                  Immunization Matrix
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <span>🟢 Valid & Complete</span>
                    <span>4 vaccines</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                    Rabies (3-Yr), DHPP Core, FeLV, FVRCP
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                    <span>🟡 Upcoming (30 Days)</span>
                    <span>1 booster</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    Bordetella Oral / Nasal booster due soon
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300">
                    <span>🔴 Needs Attention</span>
                    <span>1 vaccine</span>
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                    Leptospirosis annual booster overdue
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 text-center">
              <span className="text-xs text-paw-forest dark:text-paw-warm-sage font-bold">
                Boarding Eligibility: Ready for Daycare ✓
              </span>
            </div>
          </div>

        </div>

        {/* Recent Activity Timeline Feed */}
        <div className="bg-white dark:bg-paw-darksurface rounded-[32px] p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-paw-forest dark:text-paw-sage" />
              <h3 className="text-xl font-bold text-paw-dark dark:text-white">
                Recent Health Log Activity
              </h3>
            </div>
            <span className="text-xs text-paw-secondary dark:text-paw-warm-sage font-semibold">
              Live sync active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timeline.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-paw-cream dark:bg-paw-darkcard p-5 rounded-2xl border border-paw-soft-sage/50 dark:border-paw-darkborder space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-paw-forest dark:text-paw-sage">{item.date}</span>
                  <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-paw-darksurface text-paw-dark dark:text-white">
                    {item.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-paw-dark dark:text-white">{item.title}</h4>
                <p className="text-xs text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
