import React, { useState } from 'react';
import {
  PawPrint,
  Syringe,
  Scale,
  Calendar,
  MapPin,
  FileText,
  Clock,
  WifiOff,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Star,
  Plus,
  Shield,
  Download,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PawIcon } from '../components/common/OrganicDeco';

export const Features: React.FC = () => {
  const {
    pets,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    vaccinations,
    weightRecords,
    appointments,
    documents,
    timeline,
    isOnline,
    toggleNetworkSimulation,
    favoriteClinicIds,
    toggleFavoriteClinic,
    addWeightRecord,
    showToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>('pet-profiles');
  const [vaxFilter, setVaxFilter] = useState<'all' | 'completed' | 'upcoming' | 'overdue'>('all');
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [newWeightNote, setNewWeightNote] = useState<string>('');

  const pet = selectedPet();
  const petWeights = weightRecords[pet.id] || [];

  const filteredVax = vaccinations
    .filter((v) => v.petId === pet.id || pet.id === 'pet-1')
    .filter((v) => vaxFilter === 'all' || v.status === vaxFilter);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newWeightInput);
    if (!isNaN(parsed) && parsed > 0) {
      addWeightRecord(pet.id, parsed, newWeightNote || 'Manual entry');
      setNewWeightInput('');
      setNewWeightNote('');
    } else {
      showToast('Please enter a valid weight in kg');
    }
  };

  const featureTabs = [
    { id: 'pet-profiles', label: 'Pet Profiles', icon: PawPrint },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'weight-tracking', label: 'Weight Tracking', icon: Scale },
    { id: 'vet-appointments', label: 'Appointments', icon: Calendar },
    { id: 'nearby-clinics', label: 'Nearby Clinics', icon: MapPin },
    { id: 'medical-documents', label: 'Medical Vault', icon: FileText },
    { id: 'health-timeline', label: 'Timeline', icon: Clock },
    { id: 'offline-first', label: 'Offline Sync', icon: WifiOff },
    { id: 'reminders', label: 'Smart Reminders', icon: Bell },
  ];

  return (
    <div className="py-12 lg:py-20 transition-colors duration-200 relative overflow-hidden">
      {/* Background organic curves */}
      <div className="absolute top-10 right-5 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#DCEBE2]/50 dark:bg-paw-darkcard/20 organic-blob-2 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-paw-light-sage dark:bg-paw-darksurface border border-paw-soft-sage dark:border-paw-darkborder text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-warm-sage">
            <PawIcon className="w-3.5 h-3.5" />
            <span>Complete Feature Suite</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-paw-dark dark:text-white tracking-tight">
            Everything your pet needs,<br />
            <span className="font-script text-5xl sm:text-6xl lg:text-7xl text-paw-forest dark:text-paw-warm-sage">
              in one place.
            </span>
          </h1>

          <p className="text-lg text-paw-secondary dark:text-paw-warm-sage/80 pt-2 leading-relaxed">
            Explore PawPrint’s rich toolkit built specifically for pet parents. Try the interactive interactive controls below to experience how each feature behaves.
          </p>

          {/* Interactive Pet Selector Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-paw-secondary dark:text-paw-warm-sage uppercase tracking-wider">
              Viewing as:
            </span>
            {pets.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPetId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedPetId === p.id
                    ? 'bg-paw-forest text-white shadow-soft-lg scale-105'
                    : 'bg-white dark:bg-paw-darksurface text-paw-dark dark:text-paw-warm-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40'
                }`}
              >
                <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                <span>{p.name} ({p.species === 'dog' ? '🐶 Dog' : '🐱 Cat'})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Navigation Pills */}
        <div className="flex items-center justify-start lg:justify-center overflow-x-auto pb-4 mb-10 gap-2 scrollbar-none">
          {featureTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  active
                    ? 'bg-paw-forest text-white shadow-soft-lg'
                    : 'bg-paw-light-sage/70 dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage hover:bg-paw-soft-sage dark:hover:bg-paw-darkcard'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Feature Showcase Cards */}
        <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[36px] p-6 sm:p-10 lg:p-12 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">
          
          {/* 1. Pet Profiles */}
          {activeTab === 'pet-profiles' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <PawPrint className="w-4 h-4" />
                    <span>Feature 01 · Multi-Pet Profiles</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Complete Medical & Identity Card
                  </h2>
                  <p className="text-paw-secondary dark:text-paw-warm-sage/80 max-w-2xl text-sm sm:text-base">
                    Store breed standards, microchip registries, dietary allergies, and emergency vet contacts in one unified profile.
                  </p>
                </div>

                <button
                  onClick={() => showToast('Pet Profile edit dialog is ready')}
                  className="px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft"
                >
                  Edit {pet.name}’s Profile
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Pet Photo and Quick Stats */}
                <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/50 dark:border-paw-darkborder text-center space-y-4">
                  <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-paw-darkbg shadow-soft-lg">
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-paw-dark dark:text-white">{pet.name}</h3>
                    <p className="text-sm font-semibold text-paw-forest dark:text-paw-sage">{pet.breed}</p>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage/70">{pet.age} · {pet.gender}</p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-paw-soft-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage">
                      ⚖️ {pet.weight} kg
                    </span>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      ✓ Microchipped
                    </span>
                  </div>
                </div>

                {/* Medical & Allergy Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/40">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Known Allergies</span>
                      </div>
                      <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
                        {pet.allergies.map((a, i) => (
                          <li key={i} className="flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2">
                        <Shield className="w-4 h-4" />
                        <span>Active Medications</span>
                      </div>
                      <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                        {pet.medications.map((m, i) => (
                          <li key={i} className="flex items-center gap-1.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Emergency Contact & Microchip */}
                  <div className="bg-paw-light-sage/60 dark:bg-paw-darkcard/50 rounded-2xl p-5 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                      Primary Veterinary Contact & Microchip
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div>
                        <div className="font-bold text-paw-dark dark:text-white">{pet.emergencyContact.name}</div>
                        <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">{pet.emergencyContact.relation}</div>
                      </div>
                      <a
                        href={`tel:${pet.emergencyContact.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep transition-colors w-fit"
                      >
                        📞 Call {pet.emergencyContact.phone}
                      </a>
                    </div>
                    <div className="text-[11px] text-paw-secondary dark:text-paw-warm-sage pt-1">
                      Universal Microchip ID: <span className="font-mono font-bold text-paw-dark dark:text-white">{pet.microchipId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Vaccinations */}
          {activeTab === 'vaccinations' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <Syringe className="w-4 h-4" />
                    <span>Feature 02 · Vaccination Tracking</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Immunization Status & Schedule
                  </h2>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-paw-cream dark:bg-paw-darkcard p-1 rounded-2xl border border-paw-soft-sage/50">
                  {(['all', 'completed', 'upcoming', 'overdue'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setVaxFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                        vaxFilter === filterKey
                          ? 'bg-paw-forest text-white shadow-sm'
                          : 'text-paw-secondary dark:text-paw-warm-sage hover:text-paw-dark'
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vaccination Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVax.map((vac) => {
                  const isCompleted = vac.status === 'completed';
                  const isUpcoming = vac.status === 'upcoming';
                  const isOverdue = vac.status === 'overdue';

                  return (
                    <div
                      key={vac.id}
                      className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage/70">
                            Batch: {vac.batchNumber || 'Standard'}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isUpcoming
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            {isUpcoming && <Clock3 className="w-3 h-3" />}
                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                            {vac.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-paw-dark dark:text-white mb-1">
                          {vac.name}
                        </h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">
                          {vac.clinic} · {vac.veterinarian}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-paw-secondary dark:text-paw-warm-sage">Administered:</span>
                          <span className="font-semibold text-paw-dark dark:text-white">{vac.administeredDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-paw-secondary dark:text-paw-warm-sage">Next Due:</span>
                          <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-paw-forest dark:text-paw-warm-sage'}`}>
                            {vac.nextDueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Weight Tracking */}
          {activeTab === 'weight-tracking' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <Scale className="w-4 h-4" />
                    <span>Feature 03 · Weight Tracking</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Historical Growth & Body Condition
                  </h2>
                  <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">
                    Target range for {pet.name}: <span className="font-bold text-paw-forest dark:text-paw-sage">{pet.targetWeightRange[0]} – {pet.targetWeightRange[1]} kg</span>
                  </p>
                </div>

                {/* Form to log new weight interactively */}
                <form onSubmit={handleAddWeight} className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={newWeightInput}
                    onChange={(e) => setNewWeightInput(e.target.value)}
                    className="px-4 py-2.5 rounded-full text-xs font-medium border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white w-32 focus:outline-none focus:ring-2 focus:ring-paw-forest"
                  />
                  <input
                    type="text"
                    placeholder="Note (optional)"
                    value={newWeightNote}
                    onChange={(e) => setNewWeightNote(e.target.value)}
                    className="px-4 py-2.5 rounded-full text-xs font-medium border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white w-40 focus:outline-none focus:ring-2 focus:ring-paw-forest"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep transition-all shadow-soft"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Weight</span>
                  </button>
                </form>
              </div>

              {/* Visual Interactive Chart */}
              <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-paw-dark dark:text-white">Historical Weigh-ins ({petWeights.length} records)</span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                    Stable Body Condition Score (5/9)
                  </span>
                </div>

                <div className="py-4">
                  <svg viewBox="0 0 600 160" className="w-full h-44 overflow-visible">
                    <defs>
                      <linearGradient id="featuresWeightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#245C4A" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#245C4A" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Safe band */}
                    <rect x="0" y="30" width="600" height="90" fill="#DCEBE2" fillOpacity="0.4" rx="12" />
                    <text x="12" y="24" fill="#6F9F89" fontSize="10" fontWeight="bold">Ideal Target Safe Zone</text>
                    
                    {/* Trend Line */}
                    <path
                      d="M 40 110 Q 140 100, 240 85 T 440 60 T 560 55"
                      fill="none"
                      stroke="#245C4A"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Points */}
                    <circle cx="40" cy="110" r="5" fill="#245C4A" />
                    <circle cx="160" cy="98" r="5" fill="#245C4A" />
                    <circle cx="280" cy="80" r="5" fill="#245C4A" />
                    <circle cx="420" cy="65" r="5" fill="#245C4A" />
                    <circle cx="560" cy="55" r="6.5" fill="#245C4A" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>
                </div>

                {/* Weight entries pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 border-t border-paw-soft-sage/40 dark:border-paw-darkborder/50">
                  {petWeights.map((w) => (
                    <div key={w.id} className="bg-white dark:bg-paw-darksurface p-3 rounded-2xl text-center border border-paw-soft-sage/40 shadow-sm">
                      <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">{w.date}</div>
                      <div className="text-base font-extrabold text-paw-forest dark:text-paw-light-sage">{w.weight} kg</div>
                      <div className="text-[9px] text-paw-secondary/80 truncate">{w.note || 'Recorded'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Vet Appointments */}
          {activeTab === 'vet-appointments' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <Calendar className="w-4 h-4" />
                    <span>Feature 04 · Vet Appointments</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Scheduled Visits & Reminders
                  </h2>
                </div>

                <button
                  onClick={() => showToast('Mock booking dialog: Choose clinic, date, and procedure')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft"
                >
                  + Book Appointment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold text-paw-forest dark:text-paw-sage">
                          {apt.date} · {apt.time}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          apt.status === 'upcoming'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-paw-dark dark:text-white mb-1">
                        {apt.reason}
                      </h3>
                      <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">
                        {apt.clinicName} · {apt.veterinarian}
                      </p>
                      {apt.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-paw-darksurface text-[11px] text-paw-secondary dark:text-paw-warm-sage border border-paw-soft-sage/40">
                          <strong>Note:</strong> {apt.notes}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex items-center justify-between text-xs">
                      <button
                        onClick={() => showToast(`Added appointment to calendar`)}
                        className="text-paw-forest dark:text-paw-warm-sage font-bold hover:underline"
                      >
                        Add to Calendar
                      </button>
                      <button
                        onClick={() => showToast(`Opening directions to ${apt.clinicName}`)}
                        className="text-paw-secondary dark:text-paw-warm-sage hover:underline"
                      >
                        Directions →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Nearby Clinics */}
          {activeTab === 'nearby-clinics' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <MapPin className="w-4 h-4" />
                    <span>Feature 05 · Nearby Clinic Discovery</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Verified Veterinary Hospitals
                  </h2>
                </div>
                <div className="text-xs text-paw-secondary dark:text-paw-warm-sage font-semibold">
                  Sorted by proximity to current location
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    id: 'c-1',
                    name: 'Meadowview Animal Hospital',
                    dist: '0.8 miles',
                    addr: '412 Evergreen Way, Suite B',
                    rating: 4.9,
                    phone: '(555) 438-9201',
                    hours: 'Mon-Sat: 8AM – 7PM',
                    emergency: true,
                  },
                  {
                    id: 'c-2',
                    name: 'Green Valley Veterinary Care',
                    dist: '1.4 miles',
                    addr: '890 Oak Ridge Boulevard',
                    rating: 4.8,
                    phone: '(555) 201-9481',
                    hours: 'Mon-Fri: 8:30AM – 6PM',
                    emergency: false,
                  },
                  {
                    id: 'c-3',
                    name: 'Willow Bark 24/7 Pet Emergency',
                    dist: '2.6 miles',
                    addr: '1540 Riverview Pkwy',
                    rating: 4.7,
                    phone: '(555) 911-7387',
                    hours: 'Open 24/7 / 365 Days',
                    emergency: true,
                  },
                  {
                    id: 'c-4',
                    name: 'Compassionate Paws Wellness',
                    dist: '3.1 miles',
                    addr: '772 Cedar Lane',
                    rating: 4.9,
                    phone: '(555) 332-9012',
                    hours: 'Tue-Sat: 9AM – 5:30PM',
                    emergency: false,
                  },
                ].map((clinic) => {
                  const isFav = favoriteClinicIds.includes(clinic.id);
                  return (
                    <div
                      key={clinic.id}
                      className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[11px] font-bold text-paw-forest dark:text-paw-sage">
                              📍 {clinic.dist} away
                            </span>
                            <h3 className="text-lg font-bold text-paw-dark dark:text-white">
                              {clinic.name}
                            </h3>
                          </div>
                          <button
                            onClick={() => toggleFavoriteClinic(clinic.id)}
                            className={`p-2 rounded-full transition-colors ${
                              isFav
                                ? 'text-amber-500 bg-amber-100 dark:bg-amber-950'
                                : 'text-paw-secondary hover:text-amber-500 bg-white dark:bg-paw-darksurface'
                            }`}
                            title={isFav ? 'Remove from favorites' : 'Save as favorite'}
                          >
                            <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mb-3">
                          {clinic.addr} · {clinic.hours}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            ★ {clinic.rating} / 5.0
                          </span>
                          {clinic.emergency && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                              🚨 24/7 Emergency Care
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex items-center justify-between text-xs">
                        <a href={`tel:${clinic.phone}`} className="text-paw-forest dark:text-paw-warm-sage font-bold hover:underline">
                          📞 {clinic.phone}
                        </a>
                        <button
                          onClick={() => showToast(`Directions requested for ${clinic.name}`)}
                          className="text-paw-secondary dark:text-paw-warm-sage hover:underline"
                        >
                          Directions →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Medical Documents */}
          {activeTab === 'medical-documents' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <FileText className="w-4 h-4" />
                    <span>Feature 06 · Document Vault</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Secure Medical Records & Policies
                  </h2>
                </div>

                <button
                  onClick={() => showToast('Select document from camera or file browser')}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft"
                >
                  + Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage flex items-center justify-center flex-shrink-0 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                          {doc.category}
                        </span>
                        <h3 className="text-base font-bold text-paw-dark dark:text-white mt-0.5">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-1">
                          {doc.date} · {doc.fileSize}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                          ✓ Available Offline
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast(`Downloading: ${doc.title}`)}
                      className="p-2.5 rounded-full bg-white dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage hover:bg-paw-light-sage transition-colors shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Health Timeline */}
          {activeTab === 'health-timeline' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                  <Clock className="w-4 h-4" />
                  <span>Feature 07 · Health Timeline</span>
                </div>
                <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                  Chronological Life Journey
                </h2>
                <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">
                  Every vaccination, physical checkup, weigh-in, and prescription mapped seamlessly across their life.
                </p>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-paw-soft-sage dark:before:bg-paw-darkborder">
                {timeline.map((entry) => (
                  <div key={entry.id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-white dark:bg-paw-darkbg border-4 border-paw-forest dark:border-paw-sage" />
                    
                    <div className="bg-paw-cream dark:bg-paw-darkcard rounded-2xl p-5 border border-paw-soft-sage/50 dark:border-paw-darkborder shadow-soft group-hover:scale-[1.01] transition-transform">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-paw-forest dark:text-paw-sage">
                          {entry.date}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage">
                          {entry.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-paw-dark dark:text-white">
                        {entry.title}
                      </h3>
                      <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-1">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Offline Sync */}
          {activeTab === 'offline-first' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <WifiOff className="w-4 h-4" />
                    <span>Feature 08 · Offline-First Engine</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                    Zero Reception? Zero Problem.
                  </h2>
                </div>

                <button
                  onClick={toggleNetworkSimulation}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors shadow-soft ${
                    isOnline
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  Simulate {isOnline ? 'Network Disconnect' : 'Network Reconnect'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                    isOnline
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    <span className="w-3 h-3 rounded-full bg-current animate-ping" />
                    <span>Current Simulator Status: {isOnline ? '🟢 Connected to Cloud Backend' : '🟠 Offline Mode Active (Local SQLite Queue)'}</span>
                  </div>

                  <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80 leading-relaxed">
                    Most pet apps fail when you need them most: in a remote park, a clinic’s shielded basement, or during road trips. PawPrint operates local-first on mobile:
                  </p>

                  <ul className="space-y-2 text-xs font-medium text-paw-dark dark:text-white">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
                      <span>Instant UI updates with zero loading spinner delay</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
                      <span>Automatic conflict-free reconciliation when network returns</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-paw-forest dark:text-paw-sage" />
                      <span>Companion web app updates seamlessly on next browser session</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-paw-cream dark:bg-paw-darkcard p-6 rounded-3xl border border-paw-soft-sage/60 dark:border-paw-darkborder text-center space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    Architecture Workflow
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-paw-dark dark:text-white">
                    <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-paw-darksurface shadow-sm">Client Record</span>
                    <span>→</span>
                    <span className="px-3 py-1.5 rounded-xl bg-paw-light-sage dark:bg-paw-darksurface shadow-sm">SQLite Local</span>
                    <span>→</span>
                    <span className="px-3 py-1.5 rounded-xl bg-paw-forest text-white shadow-sm">Auto-Sync</span>
                  </div>
                  <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">
                    No data lost. No sync conflicts. Full peace of mind.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 9. Reminders */}
          {activeTab === 'reminders' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                  <Bell className="w-4 h-4" />
                  <span>Feature 09 · Smart Reminders</span>
                </div>
                <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">
                  Never Miss a Vital Care Step
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Vaccine Expiry Alerts',
                    timing: '30, 7, and 1 day prior',
                    desc: 'Proactive warnings before boosters lapse to maintain boarding and travel eligibility.',
                  },
                  {
                    title: 'Appointment Confirmations',
                    timing: '24 hours prior',
                    desc: 'Clinic address, doctor name, and fasting/dietary prep instructions sent directly to phone.',
                  },
                  {
                    title: 'Monthly Preventatives',
                    timing: 'First of each month',
                    desc: 'Heartworm, flea, and tick chewable reminders customized for each pet’s prescription cycle.',
                  },
                ].map((rem, i) => (
                  <div key={i} className="bg-paw-cream dark:bg-paw-darkcard p-6 rounded-3xl border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-paw-dark dark:text-white">{rem.title}</h3>
                    <div className="text-[11px] font-semibold text-paw-forest dark:text-paw-sage">{rem.timing}</div>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{rem.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
