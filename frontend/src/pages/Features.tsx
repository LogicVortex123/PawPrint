import React, { useState, useRef, useEffect } from 'react';
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
  Upload,
  X,
  Trash2,
  Loader2,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PawIcon } from '../components/common/OrganicDeco';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Features: React.FC = () => {
  const {
    pets,
    petsLoading,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    createPet,
    updatePet,
    deletePet,
    vaccinations,
    weightRecords,
    appointments,
    documents,
    timeline,
    isOnline,
    toggleNetworkSimulation,
    clinics,
    clinicsLoading,
    clinicsError,
    fetchClinics,
    toggleFavoriteClinic,
    addWeightRecord,
    addVaccination,
    bookAppointment,
    uploadDocument,
    showToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<string>('pet-profiles');
  const [vaxFilter, setVaxFilter] = useState<'all' | 'completed' | 'upcoming' | 'overdue'>('all');
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [weightLoading, setWeightLoading] = useState(false);

  // Create pet form
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [creatingPet, setCreatingPet] = useState(false);

  // Add vaccination form
  const [showVaxForm, setShowVaxForm] = useState(false);
  const [vaxName, setVaxName] = useState('');
  const [vaxAdminDate, setVaxAdminDate] = useState('');
  const [vaxNextDue, setVaxNextDue] = useState('');
  const [vaxVet, setVaxVet] = useState('');
  const [vaxClinic, setVaxClinic] = useState('');
  const [vaxBatch, setVaxBatch] = useState('');
  const [savingVax, setSavingVax] = useState(false);

  // Book appointment form
  const [showAptForm, setShowAptForm] = useState(false);
  const [aptClinic, setAptClinic] = useState('');
  const [aptDate, setAptDate] = useState('');
  const [aptReason, setAptReason] = useState('');
  const [aptNotes, setAptNotes] = useState('');
  const [savingApt, setSavingApt] = useState(false);

  // Upload document
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docCategory, setDocCategory] = useState('Medical Report');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Edit pet profile modal
  const [showEditPet, setShowEditPet] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female'>('male');
  const [editDob, setEditDob] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editMicrochipId, setEditMicrochipId] = useState('');
  const [savingPet, setSavingPet] = useState(false);
  const [deletingPet, setDeletingPet] = useState(false);

  // Nearby clinics — request device location once when this tab is first opened
  const [clinicsRequested, setClinicsRequested] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);

  const requestClinics = () => {
    setClinicsRequested(true);
    if (!navigator.geolocation) {
      setLocationDenied(true);
      fetchClinics();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => fetchClinics(position.coords.latitude, position.coords.longitude),
      () => {
        // TR-011: permission denied — fall back to the unranked full list
        setLocationDenied(true);
        fetchClinics();
      },
      { timeout: 8000 }
    );
  };

  // Auto-request clinics the first time that tab is opened — kept above any
  // early return so hook order stays stable across renders (Rules of Hooks).
  useEffect(() => {
    if (activeTab === 'nearby-clinics' && !clinicsRequested) {
      requestClinics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) { showToast('⚠️ Please enter a name for your pet first.'); return; }
    setCreatingPet(true);
    try {
      await createPet({ name: newPetName.trim(), species: newPetSpecies, breed: newPetBreed.trim() || undefined });
      setNewPetName(''); setNewPetBreed('');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not create pet profile — please try again.'}`);
    } finally { setCreatingPet(false); }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(newWeightInput);
    if (isNaN(parsed) || parsed <= 0) { showToast('⚠️ Please enter a valid weight in kilograms.'); return; }
    if (parsed > 200) { showToast('⚠️ That weight seems too high — please double-check the value.'); return; }
    if (!pet) return;
    setWeightLoading(true);
    try {
      await addWeightRecord(pet.id, parsed);
      setNewWeightInput('');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save weight — please try again.'}`);
    } finally { setWeightLoading(false); }
  };

  const handleAddVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!vaxName.trim()) { showToast('⚠️ Please enter the vaccine name.'); return; }
    if (!vaxAdminDate) { showToast('⚠️ Please select the date this vaccine was given.'); return; }
    if (!vaxNextDue) { showToast('⚠️ Please set the next due date so we can send you a reminder.'); return; }
    setSavingVax(true);
    try {
      await addVaccination(pet.id, {
        vaccineName: vaxName.trim(),
        administrationDate: vaxAdminDate,
        nextDueDate: vaxNextDue,
        veterinarian: vaxVet || undefined,
        clinic: vaxClinic || undefined,
        batchNumber: vaxBatch || undefined,
      });
      setVaxName(''); setVaxAdminDate(''); setVaxNextDue(''); setVaxVet(''); setVaxClinic(''); setVaxBatch('');
      setShowVaxForm(false);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save vaccination — please try again.'}`);
    } finally { setSavingVax(false); }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!aptClinic.trim()) { showToast('⚠️ Please enter the clinic or hospital name.'); return; }
    if (!aptDate) { showToast('⚠️ Please pick a date and time for the appointment.'); return; }
    setSavingApt(true);
    try {
      await bookAppointment({ pet: pet.id, clinicName: aptClinic.trim(), date: aptDate, reason: aptReason || undefined, notes: aptNotes || undefined });
      setAptClinic(''); setAptDate(''); setAptReason(''); setAptNotes('');
      setShowAptForm(false);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not book appointment — please try again.'}`);
    } finally { setSavingApt(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!pet || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const maxMb = 10;
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`⚠️ File is too large. Maximum size is ${maxMb} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setUploadingDoc(true);
    try {
      await uploadDocument(pet.id, file, docCategory);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Upload failed — please try a smaller file or different format.'}`);
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openEditPet = () => {
    if (!pet) return;
    setEditName(pet.name);
    setEditBreed(pet.breed || '');
    setEditGender(pet.gender === 'Female' ? 'female' : 'male');
    setEditDob(pet.dob || '');
    setEditAllergies(pet.allergies.filter((a) => a !== 'No known allergies recorded').join(', '));
    setEditMedications(pet.medications.filter((m) => m !== 'No active medications recorded').join(', '));
    setEditContactName(pet.emergencyContact.name === 'Not set' ? '' : pet.emergencyContact.name);
    setEditContactPhone(pet.emergencyContact.phone);
    setEditMicrochipId(pet.microchipId === 'Not recorded' ? '' : pet.microchipId);
    setShowEditPet(true);
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!editName.trim()) { showToast('⚠️ Pet name cannot be empty.'); return; }
    setSavingPet(true);
    try {
      await updatePet(pet.id, {
        name: editName.trim(),
        breed: editBreed.trim() || undefined,
        gender: editGender,
        dateOfBirth: editDob || undefined,
        allergies: editAllergies.split(',').map((s) => s.trim()).filter(Boolean),
        medications: editMedications.split(',').map((s) => s.trim()).filter(Boolean),
        microchipId: editMicrochipId.trim() || undefined,
        emergencyContacts: editContactName.trim()
          ? [{ name: editContactName.trim(), phone: editContactPhone.trim() }]
          : [],
      });
      setShowEditPet(false);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update pet profile — please try again.'}`);
    } finally { setSavingPet(false); }
  };

  const handleDeletePet = async () => {
    if (!pet) return;
    if (!window.confirm(`Delete ${pet.name}'s profile? This cannot be undone.`)) return;
    setDeletingPet(true);
    try {
      await deletePet(pet.id);
      setShowEditPet(false);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not delete pet profile — please try again.'}`);
    } finally { setDeletingPet(false); }
  };

  const pet = selectedPet();

  if (!pet) {
    return (
      <div className="py-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[32px] p-8 sm:p-10 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-paw-light-sage dark:bg-paw-darkcard flex items-center justify-center">
            <PawPrint className="w-8 h-8 text-paw-forest dark:text-paw-warm-sage" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-paw-dark dark:text-white">
              {petsLoading ? 'Loading your pets…' : 'Add your first pet'}
            </h2>
            <p className="text-sm text-paw-secondary dark:text-paw-warm-sage/80">
              {petsLoading
                ? 'Just a moment.'
                : "You haven't added a pet yet — create a profile to see vaccinations, weight, appointments and more."}
            </p>
          </div>
          {!petsLoading && (
            <form onSubmit={handleCreatePet} className="space-y-3 text-left">
              <input type="text" required value={newPetName} onChange={(e) => setNewPetName(e.target.value)} placeholder="Pet's name"
                className="w-full px-4 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newPetSpecies} onChange={(e) => setNewPetSpecies(e.target.value as 'dog' | 'cat' | 'other')}
                  className="w-full px-3 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest">
                  <option value="dog">🐶 Dog</option>
                  <option value="cat">🐱 Cat</option>
                  <option value="other">🐾 Other</option>
                </select>
                <input type="text" value={newPetBreed} onChange={(e) => setNewPetBreed(e.target.value)} placeholder="Breed (optional)"
                  className="w-full px-3 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest" />
              </div>
              <button type="submit" disabled={creatingPet}
                className="w-full py-3 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft transition-all disabled:opacity-60">
                {creatingPet ? 'Creating profile…' : 'Add Pet to PawPrint 🐾'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const petWeights = weightRecords[pet.id] || [];
  const filteredVax = vaccinations.filter((v) => v.petId === pet.id).filter((v) => vaxFilter === 'all' || v.status === vaxFilter);
  const petAppointments = appointments.filter((a) => a.petId === pet.id);
  const petDocuments = documents.filter((d) => d.petId === pet.id);
  const petTimeline = timeline.filter((t) => t.petId === pet.id);

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

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-paw-forest";

  return (
    <div className="py-12 lg:py-20 transition-colors duration-200 relative overflow-hidden">
      <div className="absolute top-10 right-5 w-96 h-96 bg-[#E5EFE8] dark:bg-paw-darksurface/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#DCEBE2]/50 dark:bg-paw-darkcard/20 organic-blob-2 blur-2xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-paw-light-sage dark:bg-paw-darksurface border border-paw-soft-sage dark:border-paw-darkborder text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-warm-sage">
            <PawIcon className="w-3.5 h-3.5" />
            <span>Complete Feature Suite</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-paw-dark dark:text-white tracking-tight">
            Everything your pet needs,<br />
            <span className="font-script text-5xl sm:text-6xl lg:text-7xl text-paw-forest dark:text-paw-warm-sage">in one place.</span>
          </h1>
          <p className="text-lg text-paw-secondary dark:text-paw-warm-sage/80 pt-2 leading-relaxed">
            Explore PawPrint's rich toolkit built specifically for pet parents. Try the interactive controls below to experience how each feature behaves.
          </p>
          {/* Pet Selector */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-paw-secondary dark:text-paw-warm-sage uppercase tracking-wider">Viewing as:</span>
            {pets.map((p) => (
              <button key={p.id} onClick={() => setSelectedPetId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedPetId === p.id ? 'bg-paw-forest text-white shadow-soft-lg scale-105' : 'bg-white dark:bg-paw-darksurface text-paw-dark dark:text-paw-warm-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40'}`}>
                <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.name}`; }} />
                <span>{p.name} ({p.species === 'dog' ? '🐶 Dog' : p.species === 'cat' ? '🐱 Cat' : '🐾 Other'})</span>
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${active ? 'bg-paw-forest text-white shadow-soft-lg' : 'bg-paw-light-sage/70 dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage hover:bg-paw-soft-sage dark:hover:bg-paw-darkcard'}`}>
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[36px] p-6 sm:p-10 lg:p-12 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl">

          {/* 1. Pet Profiles */}
          {activeTab === 'pet-profiles' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">
                    <PawPrint className="w-4 h-4" /><span>Feature 01 · Multi-Pet Profiles</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Complete Medical &amp; Identity Card</h2>
                  <p className="text-paw-secondary dark:text-paw-warm-sage/80 max-w-2xl text-sm sm:text-base">
                    Store breed standards, microchip registries, dietary allergies, and emergency vet contacts in one unified profile.
                  </p>
                </div>
                <button onClick={openEditPet}
                  className="px-5 py-2.5 rounded-full text-sm font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
                  Edit {pet.name}'s Profile
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/50 dark:border-paw-darkborder text-center space-y-4">
                  <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-paw-darkbg shadow-soft-lg">
                    <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${pet.name}`; }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-paw-dark dark:text-white">{pet.name}</h3>
                    <p className="text-sm font-semibold text-paw-forest dark:text-paw-sage">{pet.breed}</p>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage/70">{pet.age} · {pet.gender}</p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2 flex-wrap">
                    {pet.weight > 0 && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-paw-soft-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage">⚖️ {pet.weight} kg</span>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {pet.microchipId !== 'Not recorded' ? '✓ Microchipped' : '○ No microchip'}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/40">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm mb-2"><AlertCircle className="w-4 h-4" /><span>Known Allergies</span></div>
                      <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
                        {pet.allergies.map((a, i) => (<li key={i} className="flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{a}</li>))}
                      </ul>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2"><Shield className="w-4 h-4" /><span>Active Medications</span></div>
                      <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                        {pet.medications.map((m, i) => (<li key={i} className="flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{m}</li>))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-paw-light-sage/60 dark:bg-paw-darkcard/50 rounded-2xl p-5 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">Primary Veterinary Contact &amp; Microchip</div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div>
                        <div className="font-bold text-paw-dark dark:text-white">{pet.emergencyContact.name}</div>
                        <div className="text-xs text-paw-secondary dark:text-paw-warm-sage">{pet.emergencyContact.relation}</div>
                      </div>
                      {pet.emergencyContact.phone && (
                        <a href={`tel:${pet.emergencyContact.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep transition-colors w-fit">
                          📞 Call {pet.emergencyContact.phone}
                        </a>
                      )}
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
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Syringe className="w-4 h-4" /><span>Feature 02 · Vaccination Tracking</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Immunization Status &amp; Schedule</h2>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="flex items-center gap-1.5 bg-paw-cream dark:bg-paw-darkcard p-1 rounded-2xl border border-paw-soft-sage/50">
                    {(['all', 'completed', 'upcoming', 'overdue'] as const).map((filterKey) => (
                      <button key={filterKey} onClick={() => setVaxFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${vaxFilter === filterKey ? 'bg-paw-forest text-white shadow-sm' : 'text-paw-secondary dark:text-paw-warm-sage hover:text-paw-dark'}`}>
                        {filterKey}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowVaxForm(!showVaxForm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft transition-all">
                    <Plus className="w-3.5 h-3.5" /><span>Add Vaccination</span>
                  </button>
                </div>
              </div>

              {/* Add Vaccination Form */}
              {showVaxForm && (
                <div className="bg-paw-light-sage/40 dark:bg-paw-darkcard/60 rounded-2xl p-6 border border-paw-soft-sage dark:border-paw-darkborder">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-paw-dark dark:text-white text-sm">New Vaccination Record</h3>
                    <button onClick={() => setShowVaxForm(false)} className="text-paw-secondary hover:text-paw-dark"><X className="w-4 h-4" /></button>
                  </div>
                  <form onSubmit={handleAddVaccination} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input required value={vaxName} onChange={(e) => setVaxName(e.target.value)} placeholder="Vaccine name *" className={inputCls} />
                    <input required type="date" value={vaxAdminDate} onChange={(e) => setVaxAdminDate(e.target.value)} placeholder="Administered date *" className={inputCls} />
                    <input required type="date" value={vaxNextDue} onChange={(e) => setVaxNextDue(e.target.value)} placeholder="Next due date *" className={inputCls} />
                    <input value={vaxVet} onChange={(e) => setVaxVet(e.target.value)} placeholder="Veterinarian (optional)" className={inputCls} />
                    <input value={vaxClinic} onChange={(e) => setVaxClinic(e.target.value)} placeholder="Clinic (optional)" className={inputCls} />
                    <input value={vaxBatch} onChange={(e) => setVaxBatch(e.target.value)} placeholder="Batch number (optional)" className={inputCls} />
                    <div className="sm:col-span-2 lg:col-span-3">
                      <button type="submit" disabled={savingVax}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft disabled:opacity-60 transition-all">
                        {savingVax ? 'Saving…' : 'Save Vaccination'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVax.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                    <Syringe className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No vaccinations recorded yet.</p>
                    <p className="text-xs mt-1">Hit “Add Vaccination” to log {pet.name}'s first immunization — we'll track the due dates for you.</p>
                  </div>
                ) : filteredVax.map((vac) => {
                  const isCompleted = vac.status === 'completed';
                  const isUpcoming = vac.status === 'upcoming';
                  const isOverdue = vac.status === 'overdue';
                  return (
                    <div key={vac.id} className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage/70">Batch: {vac.batchNumber || 'Standard'}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : isUpcoming ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                            {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                            {isUpcoming && <Clock3 className="w-3 h-3" />}
                            {isOverdue && <AlertCircle className="w-3 h-3" />}
                            {vac.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-paw-dark dark:text-white mb-1">{vac.name}</h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{vac.clinic} · {vac.veterinarian}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 text-xs space-y-1.5">
                        <div className="flex justify-between"><span className="text-paw-secondary dark:text-paw-warm-sage">Administered:</span><span className="font-semibold text-paw-dark dark:text-white">{vac.administeredDate}</span></div>
                        <div className="flex justify-between"><span className="text-paw-secondary dark:text-paw-warm-sage">Next Due:</span><span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-paw-forest dark:text-paw-warm-sage'}`}>{vac.nextDueDate}</span></div>
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
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Scale className="w-4 h-4" /><span>Feature 03 · Weight Tracking</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Historical Growth &amp; Body Condition</h2>
                  {pet.weight > 0 && <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">Current weight: <span className="font-bold text-paw-forest dark:text-paw-sage">{pet.weight} kg</span></p>}
                </div>
                <form onSubmit={handleAddWeight} className="flex flex-wrap items-center gap-3">
                  <input type="number" step="0.1" placeholder="Weight (kg)" value={newWeightInput} onChange={(e) => setNewWeightInput(e.target.value)}
                    className="px-4 py-2.5 rounded-full text-xs font-medium border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white w-32 focus:outline-none focus:ring-2 focus:ring-paw-forest" />
                  <button type="submit" disabled={weightLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep transition-all shadow-soft disabled:opacity-60">
                    <Plus className="w-3.5 h-3.5" /><span>{weightLoading ? 'Saving…' : 'Log Weight'}</span>
                  </button>
                </form>
              </div>
              <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 sm:p-8 border border-paw-soft-sage/60 dark:border-paw-darkborder">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-paw-dark dark:text-white">Historical Weigh-ins ({petWeights.length} records)</span>
                </div>
                {petWeights.length > 0 ? (
                  <>
                    <div className="py-4">
                      <svg viewBox="0 0 600 160" className="w-full h-44 overflow-visible">
                        <defs>
                          <linearGradient id="featuresWeightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#245C4A" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#245C4A" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <rect x="0" y="30" width="600" height="90" fill="#DCEBE2" fillOpacity="0.4" rx="12" />
                        <text x="12" y="24" fill="#6F9F89" fontSize="10" fontWeight="bold">Weight History</text>
                        {petWeights.length >= 2 && (() => {
                          const weights = petWeights.map(w => w.weight);
                          const min = Math.min(...weights) - 1;
                          const max = Math.max(...weights) + 1;
                          const range = max - min || 1;
                          const pts = petWeights.map((w, i) => {
                            const x = 40 + (i / Math.max(petWeights.length - 1, 1)) * 520;
                            const y = 130 - ((w.weight - min) / range) * 100;
                            return `${x},${y}`;
                          });
                          const d = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ');
                          return (
                            <>
                              <path d={d} fill="none" stroke="#245C4A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                              {petWeights.map((w, i) => {
                                const x = 40 + (i / Math.max(petWeights.length - 1, 1)) * 520;
                                const y = 130 - ((w.weight - min) / range) * 100;
                                return <circle key={w.id} cx={x} cy={y} r={i === petWeights.length - 1 ? 6.5 : 5} fill="#245C4A" stroke={i === petWeights.length - 1 ? '#FFFFFF' : 'none'} strokeWidth="2.5" />;
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 border-t border-paw-soft-sage/40 dark:border-paw-darkborder/50">
                      {petWeights.map((w) => (
                        <div key={w.id} className="bg-white dark:bg-paw-darksurface p-3 rounded-2xl text-center border border-paw-soft-sage/40 shadow-sm">
                          <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">{w.date}</div>
                          <div className="text-base font-extrabold text-paw-forest dark:text-paw-light-sage">{w.weight} kg</div>
                          {w.note && <div className="text-[9px] text-paw-secondary/80 truncate">{w.note}</div>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                    <Scale className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No weight logs yet for {pet.name}.</p>
                    <p className="text-xs mt-1">Enter a weight in kilograms above and hit “Log Weight” to start tracking {pet.name}'s body condition over time.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Vet Appointments */}
          {activeTab === 'vet-appointments' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Calendar className="w-4 h-4" /><span>Feature 04 · Vet Appointments</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Scheduled Visits &amp; Reminders</h2>
                </div>
                <button onClick={() => setShowAptForm(!showAptForm)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
                  <Plus className="w-3.5 h-3.5" /><span>Book Appointment</span>
                </button>
              </div>

              {showAptForm && (
                <div className="bg-paw-light-sage/40 dark:bg-paw-darkcard/60 rounded-2xl p-6 border border-paw-soft-sage dark:border-paw-darkborder">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-paw-dark dark:text-white text-sm">Book a New Appointment</h3>
                    <button onClick={() => setShowAptForm(false)} className="text-paw-secondary hover:text-paw-dark"><X className="w-4 h-4" /></button>
                  </div>
                  <form onSubmit={handleBookAppointment} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input required value={aptClinic} onChange={(e) => setAptClinic(e.target.value)} placeholder="Clinic name *" className={inputCls} />
                    <input required type="datetime-local" value={aptDate} onChange={(e) => setAptDate(e.target.value)} className={inputCls} />
                    <input value={aptReason} onChange={(e) => setAptReason(e.target.value)} placeholder="Reason for visit (optional)" className={inputCls} />
                    <input value={aptNotes} onChange={(e) => setAptNotes(e.target.value)} placeholder="Notes (optional)" className={inputCls} />
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={savingApt}
                        className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft disabled:opacity-60">
                        {savingApt ? 'Booking…' : 'Confirm Appointment'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {petAppointments.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No appointments yet.</p>
                    <p className="text-xs mt-1">Tap “Book Appointment” to schedule {pet.name}'s next checkup — we'll keep you reminded.</p>
                  </div>
                ) : petAppointments.map((apt) => (
                  <div key={apt.id} className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold text-paw-forest dark:text-paw-sage">{apt.date} {apt.time && `· ${apt.time}`}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${apt.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{apt.status}</span>
                      </div>
                      <h3 className="text-base font-bold text-paw-dark dark:text-white mb-1">{apt.reason}</h3>
                      <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{apt.clinicName}</p>
                      {apt.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-paw-darksurface text-[11px] text-paw-secondary dark:text-paw-warm-sage border border-paw-soft-sage/40">
                          <strong>Note:</strong> {apt.notes}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex items-center justify-between text-xs">
                      <button onClick={() => showToast('ℹ️ Calendar export coming in the next update!')} className="text-paw-forest dark:text-paw-warm-sage font-bold hover:underline">Add to Calendar</button>
                      <button onClick={() => showToast(`ℹ️ Directions for ${apt.clinicName} will open in Maps.`)} className="text-paw-secondary dark:text-paw-warm-sage hover:underline">Directions →</button>
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
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><MapPin className="w-4 h-4" /><span>Feature 05 · Nearby Clinic Discovery</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Verified Veterinary Hospitals</h2>
                </div>
                <div className="flex items-center gap-2">
                  {locationDenied && (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">
                      Location unavailable — showing all clinics
                    </span>
                  )}
                  <button onClick={requestClinics} disabled={clinicsLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft disabled:opacity-60">
                    {clinicsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                    <span>{clinicsLoading ? 'Locating…' : 'Refresh Nearby'}</span>
                  </button>
                </div>
              </div>

              {clinicsError ? (
                <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                  <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">Couldn't load nearby clinics.</p>
                  <p className="text-xs mt-1">{clinicsError}</p>
                </div>
              ) : clinicsLoading ? (
                <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                  <p className="font-semibold">Finding clinics near you…</p>
                </div>
              ) : clinics.length === 0 ? (
                <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                  <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">No clinics found yet.</p>
                  <p className="text-xs mt-1">Hit "Refresh Nearby" to search again.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {clinics.map((clinic) => (
                    <div key={clinic.id} className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            {clinic.distance !== 'Distance unknown' && (
                              <span className="text-[11px] font-bold text-paw-forest dark:text-paw-sage">📍 {clinic.distance} away</span>
                            )}
                            <h3 className="text-lg font-bold text-paw-dark dark:text-white">{clinic.name}</h3>
                          </div>
                          <button onClick={() => toggleFavoriteClinic(clinic.id)}
                            className={`p-2 rounded-full transition-colors ${clinic.isFavorite ? 'text-amber-500 bg-amber-100 dark:bg-amber-950' : 'text-paw-secondary hover:text-amber-500 bg-white dark:bg-paw-darksurface'}`}
                            title={clinic.isFavorite ? 'Remove from favorites' : 'Save as favorite'}>
                            <Star className={`w-4 h-4 ${clinic.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mb-3">{clinic.address}{clinic.hours && ` · ${clinic.hours}`}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {clinic.rating > 0 && <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">★ {clinic.rating} / 5.0{clinic.reviewsCount > 0 && ` (${clinic.reviewsCount})`}</span>}
                          {clinic.emergency24_7 && <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">🚨 24/7 Emergency Care</span>}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 flex items-center justify-between text-xs">
                        {clinic.phone ? (
                          <a href={`tel:${clinic.phone}`} className="text-paw-forest dark:text-paw-warm-sage font-bold hover:underline">📞 {clinic.phone}</a>
                        ) : <span />}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-paw-secondary dark:text-paw-warm-sage hover:underline">
                          Directions →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Medical Documents */}
          {activeTab === 'medical-documents' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><FileText className="w-4 h-4" /><span>Feature 06 · Document Vault</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Secure Medical Records &amp; Policies</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={docCategory} onChange={(e) => setDocCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-paw-forest">
                    <option>Medical Report</option>
                    <option>Prescription</option>
                    <option>Insurance</option>
                    <option>Adoption</option>
                  </select>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploadingDoc}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft disabled:opacity-60">
                    <Upload className="w-3.5 h-3.5" /><span>{uploadingDoc ? 'Uploading…' : 'Upload Document'}</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {petDocuments.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No documents uploaded yet.</p>
                    <p className="text-xs mt-1">Select a category and click “Upload Document” to add a PDF, image, or prescription to {pet.name}'s secure vault.</p>
                  </div>
                ) : petDocuments.map((doc) => (
                  <div key={doc.id} className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage flex items-center justify-center flex-shrink-0 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-paw-forest dark:text-paw-sage">{doc.category}</span>
                        <h3 className="text-base font-bold text-paw-dark dark:text-white mt-0.5">{doc.title}</h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-1">{doc.date}</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">✓ Stored in Vault</div>
                      </div>
                    </div>
                    <a href={doc.fileUrl ? `${API_BASE}${doc.fileUrl}` : undefined} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => { if (!doc.fileUrl) { e.preventDefault(); showToast('⚠️ File not available.'); } }}
                      className="p-2.5 rounded-full bg-white dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage hover:bg-paw-light-sage transition-colors shadow-sm"
                      title="Open document">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Health Timeline */}
          {activeTab === 'health-timeline' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Clock className="w-4 h-4" /><span>Feature 07 · Health Timeline</span></div>
                <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Chronological Life Journey</h2>
                <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">Every vaccination, checkup, weigh-in, and appointment mapped across their life.</p>
              </div>
              {petTimeline.length === 0 ? (
                <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">No timeline events yet for {pet.name}.</p>
                  <p className="text-xs mt-1">Every vaccination, weigh-in, and appointment you log will appear here as a chronological life story.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-paw-soft-sage dark:before:bg-paw-darkborder">
                  {petTimeline.map((entry) => (
                    <div key={entry.id} className="relative group">
                      <div className="absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full bg-white dark:bg-paw-darkbg border-4 border-paw-forest dark:border-paw-sage" />
                      <div className="bg-paw-cream dark:bg-paw-darkcard rounded-2xl p-5 border border-paw-soft-sage/50 dark:border-paw-darkborder shadow-soft group-hover:scale-[1.01] transition-transform">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-paw-forest dark:text-paw-sage">{entry.date}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage">{entry.category}</span>
                        </div>
                        <h3 className="text-base font-bold text-paw-dark dark:text-white">{entry.title}</h3>
                        <p className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-1">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. Offline Sync */}
          {activeTab === 'offline-first' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><WifiOff className="w-4 h-4" /><span>Feature 08 · Offline-First Engine</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Zero Reception? Zero Problem.</h2>
                </div>
                <button onClick={toggleNetworkSimulation}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-colors shadow-soft ${isOnline ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}>
                  Simulate {isOnline ? 'Network Disconnect' : 'Network Reconnect'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${isOnline ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'}`}>
                    <span className="w-3 h-3 rounded-full bg-current animate-ping" />
                    <span>Current Status: {isOnline ? '🟢 Connected to Cloud Backend' : '🟠 Offline Mode Active (Local SQLite Queue)'}</span>
                  </div>
                  <ul className="space-y-2 text-xs font-medium text-paw-dark dark:text-white">
                    {['Instant UI updates with zero loading spinner delay', 'Automatic conflict-free reconciliation when network returns', 'Companion web app updates seamlessly on next browser session'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-paw-forest dark:text-paw-sage" /><span>{item}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-paw-cream dark:bg-paw-darkcard p-6 rounded-3xl border border-paw-soft-sage/60 dark:border-paw-darkborder text-center space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">Architecture Workflow</div>
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-paw-dark dark:text-white">
                    <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-paw-darksurface shadow-sm">Client Record</span>
                    <span>→</span>
                    <span className="px-3 py-1.5 rounded-xl bg-paw-light-sage dark:bg-paw-darksurface shadow-sm">SQLite Local</span>
                    <span>→</span>
                    <span className="px-3 py-1.5 rounded-xl bg-paw-forest text-white shadow-sm">Auto-Sync</span>
                  </div>
                  <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">No data lost. No sync conflicts. Full peace of mind.</p>
                </div>
              </div>
            </div>
          )}

          {/* 9. Reminders */}
          {activeTab === 'reminders' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Bell className="w-4 h-4" /><span>Feature 09 · Smart Reminders</span></div>
                <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">Never Miss a Vital Care Step</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Vaccine Expiry Alerts', timing: '30, 7, and 1 day prior', desc: 'Proactive warnings before boosters lapse to maintain boarding and travel eligibility.' },
                  { title: 'Appointment Confirmations', timing: '24 hours prior', desc: 'Clinic address, doctor name, and fasting/dietary prep instructions sent directly to phone.' },
                  { title: 'Monthly Preventatives', timing: 'First of each month', desc: 'Heartworm, flea, and tick chewable reminders customized for each pet\'s prescription cycle.' },
                ].map((rem, i) => (
                  <div key={i} className="bg-paw-cream dark:bg-paw-darkcard p-6 rounded-3xl border border-paw-soft-sage/60 dark:border-paw-darkborder shadow-soft space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-paw-light-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage flex items-center justify-center"><Bell className="w-5 h-5" /></div>
                    <h3 className="text-base font-bold text-paw-dark dark:text-white">{rem.title}</h3>
                    <div className="text-[11px] font-semibold text-paw-forest dark:text-paw-sage">{rem.timing}</div>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage leading-relaxed">{rem.desc}</p>
                  </div>
                ))}
              </div>
              {/* Overdue vaccination reminder */}
              {vaccinations.filter(v => v.petId === pet.id && v.status === 'overdue').length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-rose-800 dark:text-rose-300">Action Required: Overdue Vaccinations</div>
                    <div className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                      {vaccinations.filter(v => v.petId === pet.id && v.status === 'overdue').map(v => v.name).join(', ')} — please schedule a vet visit soon.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Edit Pet Profile Modal */}
      {showEditPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowEditPet(false)}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[28px] p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-paw-dark dark:text-white">Edit {pet.name}'s Profile</h3>
              <button onClick={() => setShowEditPet(false)} className="text-paw-secondary hover:text-paw-dark dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Name</label>
                <input required value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Breed</label>
                  <input value={editBreed} onChange={(e) => setEditBreed(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Gender</label>
                  <select value={editGender} onChange={(e) => setEditGender(e.target.value as 'male' | 'female')} className={inputCls}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Date of Birth</label>
                <input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Allergies (comma-separated)</label>
                <input value={editAllergies} onChange={(e) => setEditAllergies(e.target.value)} placeholder="e.g. Chicken meal, Dust mites" className={inputCls} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Medications (comma-separated)</label>
                <input value={editMedications} onChange={(e) => setEditMedications(e.target.value)} placeholder="e.g. Heartgard Plus (Monthly)" className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Emergency Contact</label>
                  <input value={editContactName} onChange={(e) => setEditContactName(e.target.value)} placeholder="Vet or clinic name" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Contact Phone</label>
                  <input value={editContactPhone} onChange={(e) => setEditContactPhone(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Microchip ID</label>
                <input value={editMicrochipId} onChange={(e) => setEditMicrochipId(e.target.value)} className={inputCls} />
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  type="button"
                  onClick={handleDeletePet}
                  disabled={deletingPet}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingPet ? 'Deleting…' : 'Delete Pet'}</span>
                </button>
                <button
                  type="submit"
                  disabled={savingPet}
                  className="flex-1 py-3 rounded-full text-sm font-bold text-white bg-paw-forest hover:bg-paw-deep shadow-soft transition-all disabled:opacity-60"
                >
                  {savingPet ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
