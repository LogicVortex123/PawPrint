import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PawPrint,
  Syringe,
  Scale,
  Calendar,
  MapPin,
  FileText,
  Clock,
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
  Pencil,
  Camera,
  Siren,
  FileDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { PawIcon } from '../components/common/OrganicDeco';
import { inputCls } from '../components/common/Modal';
import { EditVaccinationModal, EditWeightModal, EditAppointmentModal } from '../components/dashboard/RecordEditModals';
import { fileUrl } from '../lib/api';
import { downloadAppointmentIcs } from '../lib/calendar';
import { useDraft } from '../lib/useDraft';
import { StorageKeys, readJson, writeJson, removeKey } from '../lib/storage';
import { DEFAULT_PREFERENCES, HealthTimelineEntry, Vaccination, WeightRecord, Appointment, Reminder } from '../types';
import { NotificationToggle } from '../components/common/NotificationToggle';

export const DASHBOARD_TABS = ['pet-profiles', 'vaccinations', 'weight-tracking', 'vet-appointments', 'nearby-clinics', 'medical-documents', 'health-timeline', 'reminders'] as const;

const TIMELINE_FILTERS: { key: 'all' | HealthTimelineEntry['category']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'vaccination', label: 'Vaccinations' },
  { key: 'weight', label: 'Weight' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'document', label: 'Documents' },
];

export const Features: React.FC = () => {
  const {
    pets,
    petsLoading,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    createPet,
    updatePet,
    uploadPetPhoto,
    deletePet,
    vaccinations,
    weightRecords,
    appointments,
    documents,
    timeline,
    clinics,
    clinicsLoading,
    clinicsError,
    fetchClinics,
    toggleFavoriteClinic,
    addWeightRecord,
    addVaccination,
    bookAppointment,
    uploadDocument,
    deleteDocument,
    updateAppointment,
    user,
    showToast,
    reminders: allReminders,
  } = useAppStore();

  // Active tab and pet live in the URL (?tab=...&pet=...) so sections can be
  // deep-linked and bookmarked, and global search can jump straight to them
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: string = tabParam && (DASHBOARD_TABS as readonly string[]).includes(tabParam) ? tabParam : 'pet-profiles';
  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('tab', tab); return next; }, { replace: true });
  };
  const petParam = searchParams.get('pet');
  useEffect(() => {
    if (petParam && pets.some((p) => p.id === petParam)) setSelectedPetId(petParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petParam, pets.length]);
  const selectPet = (id: string) => {
    setSelectedPetId(id);
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('pet', id); return next; }, { replace: true });
  };

  const [timelineFilter, setTimelineFilter] = useState<'all' | HealthTimelineEntry['category']>('all');
  const [editingVax, setEditingVax] = useState<Vaccination | null>(null);
  const [editingWeight, setEditingWeight] = useState<WeightRecord | null>(null);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [vaxFilter, setVaxFilter] = useState<'all' | 'completed' | 'upcoming' | 'overdue'>('all');
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [weightLoading, setWeightLoading] = useState(false);

  // Create pet form
  // Form fields below are drafts saved to localStorage, so a refresh or an
  // accidentally closed tab doesn't lose what was typed
  const newPetDraft = useDraft('new-pet', { name: '', species: 'dog' as 'dog' | 'cat' | 'other', breed: '' });
  const { name: newPetName, species: newPetSpecies, breed: newPetBreed } = newPetDraft.value;
  const setNewPetName = (name: string) => newPetDraft.update({ name });
  const setNewPetSpecies = (species: 'dog' | 'cat' | 'other') => newPetDraft.update({ species });
  const setNewPetBreed = (breed: string) => newPetDraft.update({ breed });

  // Vaccination and appointment drafts are kept per pet
  const draftPetId = selectedPet()?.id || 'none';
  const [creatingPet, setCreatingPet] = useState(false);

  // Add vaccination form
  const vaxDraft = useDraft(`vaccination-${draftPetId}`, { name: '', adminDate: '', nextDue: '', vet: '', clinic: '', batch: '' });
  const { name: vaxName, adminDate: vaxAdminDate, nextDue: vaxNextDue, vet: vaxVet, clinic: vaxClinic, batch: vaxBatch } = vaxDraft.value;
  const setVaxName = (name: string) => vaxDraft.update({ name });
  const setVaxAdminDate = (adminDate: string) => vaxDraft.update({ adminDate });
  const setVaxNextDue = (nextDue: string) => vaxDraft.update({ nextDue });
  const setVaxVet = (vet: string) => vaxDraft.update({ vet });
  const setVaxClinic = (clinic: string) => vaxDraft.update({ clinic });
  const setVaxBatch = (batch: string) => vaxDraft.update({ batch });
  // Reopen the form if there's an unfinished entry waiting
  const [showVaxForm, setShowVaxForm] = useState(vaxDraft.hasDraft);
  const [savingVax, setSavingVax] = useState(false);

  // Book appointment form
  const aptDraft = useDraft(`appointment-${draftPetId}`, { clinic: '', date: '', reason: '', notes: '' });
  const { clinic: aptClinic, date: aptDate, reason: aptReason, notes: aptNotes } = aptDraft.value;
  const setAptClinic = (clinic: string) => aptDraft.update({ clinic });
  const setAptDate = (date: string) => aptDraft.update({ date });
  const setAptReason = (reason: string) => aptDraft.update({ reason });
  const setAptNotes = (notes: string) => aptDraft.update({ notes });
  const [showAptForm, setShowAptForm] = useState(aptDraft.hasDraft);
  const [savingApt, setSavingApt] = useState(false);

  // Upload document
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docCategory, setDocCategory] = useState('Medical Report');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Edit pet profile modal
  const [showEditPet, setShowEditPet] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
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

  // Save the edit-profile form while it's open so a refresh doesn't lose edits
  useEffect(() => {
    const editingPet = selectedPet();
    if (!showEditPet || !editingPet) return;
    const draft: EditPetDraft = {
      name: editName, species: editSpecies, breed: editBreed, gender: editGender, dob: editDob,
      allergies: editAllergies, medications: editMedications, contactName: editContactName,
      contactPhone: editContactPhone, microchipId: editMicrochipId,
    };
    writeJson(editDraftKey(editingPet.id), draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditPet, editName, editSpecies, editBreed, editGender, editDob, editAllergies, editMedications, editContactName, editContactPhone, editMicrochipId]);

  // Escape closes the edit-profile modal, like the other dialogs
  useEffect(() => {
    if (!showEditPet) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeEditPet(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEditPet]);

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
      newPetDraft.clear();
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
      vaxDraft.clear();
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
      aptDraft.clear();
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (!pet || !file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please choose an image file (JPG, PNG or WebP).'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('⚠️ Photo is too large. Maximum size is 10 MB.'); return; }
    setUploadingPhoto(true);
    try {
      await uploadPetPhoto(pet.id, file);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not upload photo — please try again.'}`);
    } finally { setUploadingPhoto(false); }
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from the vault? The file will be removed permanently.`)) return;
    setDeletingDocId(id);
    try {
      await deleteDocument(id);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not delete document — please try again.'}`);
    } finally { setDeletingDocId(null); }
  };

  const handleAppointmentStatus = async (apt: Appointment, status: 'completed' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm(`Cancel the appointment at ${apt.clinicName} on ${apt.date}?`)) return;
    try {
      await updateAppointment(apt.id, { status });
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update appointment — please try again.'}`);
    }
  };

  type EditPetDraft = {
    name: string; species: 'dog' | 'cat' | 'other'; breed: string; gender: 'male' | 'female'; dob: string;
    allergies: string; medications: string; contactName: string; contactPhone: string; microchipId: string;
  };
  const editDraftKey = (petId: string) => `${StorageKeys.draftPrefix}edit-pet-${petId}`;

  const openEditPet = () => {
    if (!pet) return;
    const draft = readJson<EditPetDraft | null>(editDraftKey(pet.id), null);
    const fields: EditPetDraft = draft ?? {
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      gender: pet.gender === 'Female' ? 'female' : 'male',
      dob: pet.dob || '',
      allergies: pet.allergies.join(', '),
      medications: pet.medications.join(', '),
      contactName: pet.emergencyContact.name,
      contactPhone: pet.emergencyContact.phone,
      microchipId: pet.microchipId,
    };
    setEditName(fields.name);
    setEditSpecies(fields.species);
    setEditBreed(fields.breed);
    setEditGender(fields.gender);
    setEditDob(fields.dob);
    setEditAllergies(fields.allergies);
    setEditMedications(fields.medications);
    setEditContactName(fields.contactName);
    setEditContactPhone(fields.contactPhone);
    setEditMicrochipId(fields.microchipId);
    setShowEditPet(true);
    if (draft) showToast(`📝 Restored your unsaved changes to ${pet.name}'s profile.`);
  };

  // Closing the modal (cancel, save or delete) discards the saved draft
  const closeEditPet = () => {
    if (pet) removeKey(editDraftKey(pet.id));
    setShowEditPet(false);
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    if (!editName.trim()) { showToast('⚠️ Pet name cannot be empty.'); return; }
    setSavingPet(true);
    try {
      await updatePet(pet.id, {
        name: editName.trim(),
        species: editSpecies,
        breed: editBreed.trim(),
        gender: editGender,
        dateOfBirth: editDob || undefined,
        allergies: editAllergies.split(',').map((s) => s.trim()).filter(Boolean),
        medications: editMedications.split(',').map((s) => s.trim()).filter(Boolean),
        microchipId: editMicrochipId.trim(),
        emergencyContacts: editContactName.trim()
          ? [{ name: editContactName.trim(), phone: editContactPhone.trim() }]
          : [],
      });
      closeEditPet();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not update pet profile — please try again.'}`);
    } finally { setSavingPet(false); }
  };

  const handleDeletePet = async () => {
    if (!pet) return;
    if (!window.confirm(`Delete ${pet.name}'s profile? This cannot be undone.`)) return;
    setDeletingPet(true);
    try {
      removeKey(editDraftKey(pet.id));
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
  const filteredTimeline = timelineFilter === 'all' ? petTimeline : petTimeline.filter((t) => t.category === timelineFilter);
  const latestWeight = petWeights[petWeights.length - 1];

  const featureTabs = [
    { id: 'pet-profiles', label: 'Pet Profiles', icon: PawPrint },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'weight-tracking', label: 'Weight Tracking', icon: Scale },
    { id: 'vet-appointments', label: 'Appointments', icon: Calendar },
    { id: 'nearby-clinics', label: 'Nearby Clinics', icon: MapPin },
    { id: 'medical-documents', label: 'Medical Vault', icon: FileText },
    { id: 'health-timeline', label: 'Timeline', icon: Clock },
    { id: 'reminders', label: 'Smart Reminders', icon: Bell },
  ];

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
              <button key={p.id} onClick={() => selectPet(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedPetId === p.id ? 'bg-paw-forest text-white shadow-soft-lg scale-105' : 'bg-white dark:bg-paw-darksurface text-paw-dark dark:text-paw-warm-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40'}`}>
                <img src={p.photo} alt={p.name} className="w-5 h-5 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.name}`; }} />
                <span>{p.name} ({p.species === 'dog' ? '🐶 Dog' : p.species === 'cat' ? '🐱 Cat' : '🐾 Other'})</span>
              </button>
            ))}
          </div>
          {/* Quick actions for the selected pet */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to={`/emergency?pet=${pet.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-soft transition-colors">
              <Siren className="w-4 h-4" /><span>Emergency Mode</span>
            </Link>
            <Link to={`/pets/${pet.id}/summary`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage border border-paw-soft-sage dark:border-paw-darkborder hover:bg-paw-light-sage/40 transition-colors">
              <FileDown className="w-4 h-4" /><span>Export Health Summary (PDF)</span>
            </Link>
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
                  <div className="relative w-36 h-36 mx-auto">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-paw-darkbg shadow-soft-lg">
                      <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${pet.name}`; }} />
                    </div>
                    <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                      title={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'} aria-label={pet.hasCustomPhoto ? 'Change photo' : 'Upload a photo'}
                      className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-paw-forest text-white flex items-center justify-center shadow-soft-lg hover:bg-paw-deep disabled:opacity-60 border-2 border-white dark:border-paw-darkbg">
                      {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                    <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-paw-dark dark:text-white">{pet.name}</h3>
                    <p className="text-sm font-semibold text-paw-forest dark:text-paw-sage">{pet.breed || (pet.species === 'dog' ? 'Dog' : pet.species === 'cat' ? 'Cat' : 'Pet')}</p>
                    <p className="text-xs text-paw-secondary dark:text-paw-warm-sage/70">{pet.age} · {pet.gender}</p>
                  </div>
                  <div className="pt-2 flex justify-center gap-2 flex-wrap">
                    {pet.weight > 0 && (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-paw-soft-sage dark:bg-paw-darksurface text-paw-forest dark:text-paw-light-sage">⚖️ {pet.weight} kg</span>
                    )}
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {pet.microchipId ? '✓ Microchipped' : '○ No microchip'}
                    </span>
                  </div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-5 border border-rose-200/60 dark:border-rose-900/40">
                      <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm mb-2"><AlertCircle className="w-4 h-4" /><span>Known Allergies</span></div>
                      <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
                        {pet.allergies.length === 0 && <li className="opacity-70">No known allergies recorded</li>}
                        {pet.allergies.map((a, i) => (<li key={i} className="flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{a}</li>))}
                      </ul>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2"><Shield className="w-4 h-4" /><span>Active Medications</span></div>
                      <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                        {pet.medications.length === 0 && <li className="opacity-70">No active medications recorded</li>}
                        {pet.medications.map((m, i) => (<li key={i} className="flex items-center gap-1.5 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{m}</li>))}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-paw-light-sage/60 dark:bg-paw-darkcard/50 rounded-2xl p-5 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">Primary Veterinary Contact &amp; Microchip</div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                      <div>
                        <div className="font-bold text-paw-dark dark:text-white">{pet.emergencyContact.name || 'No emergency contact yet — add one via Edit Profile'}</div>
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
                      Universal Microchip ID: <span className="font-mono font-bold text-paw-dark dark:text-white">{pet.microchipId || 'Not recorded'}</span>
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
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-paw-dark dark:text-white mb-1">{vac.name}</h3>
                          <button onClick={() => setEditingVax(vac)} title="Edit or delete" aria-label={`Edit ${vac.name}`}
                            className="p-1.5 rounded-full text-paw-secondary hover:text-paw-forest hover:bg-paw-light-sage dark:hover:bg-paw-darksurface transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                  {latestWeight && latestWeight.trendPercent !== null && (
                    <p className="text-xs pt-1 inline-flex items-center gap-1.5 text-paw-secondary dark:text-paw-warm-sage/80">
                      {latestWeight.trendPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {Math.abs(latestWeight.trendPercent) < 0.5
                        ? 'Stable since the last weigh-in.'
                        : `${latestWeight.trendPercent > 0 ? 'Up' : 'Down'} ${Math.abs(latestWeight.trendPercent)}% since the last weigh-in.`}
                      {Math.abs(latestWeight.trendPercent) >= 10 && ' A change this size is worth mentioning at the next vet visit.'}
                    </p>
                  )}
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
                  {petWeights.length > 0 && <span className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">Click an entry to edit or delete it</span>}
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
                        <button key={w.id} onClick={() => setEditingWeight(w)} title="Edit or delete"
                          className="bg-white dark:bg-paw-darksurface p-3 rounded-2xl text-center border border-paw-soft-sage/40 shadow-sm hover:border-paw-forest hover:shadow-soft transition-all">
                          <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">{w.date}</div>
                          <div className="text-base font-extrabold text-paw-forest dark:text-paw-light-sage">{w.weight} kg</div>
                          {w.trendPercent !== null && (
                            <div className={`text-[10px] font-bold ${w.trendPercent > 0 ? 'text-amber-600' : w.trendPercent < 0 ? 'text-sky-600' : 'text-paw-secondary'}`}>
                              {w.trendPercent > 0 ? '▲' : w.trendPercent < 0 ? '▼' : '•'} {Math.abs(w.trendPercent)}%
                            </div>
                          )}
                        </button>
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
                        <div className="flex items-center gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${apt.status === 'upcoming' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : apt.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{apt.status}</span>
                          <button onClick={() => setEditingApt(apt)} title="Edit or delete" aria-label="Edit appointment"
                            className="p-1.5 rounded-full text-paw-secondary hover:text-paw-forest hover:bg-paw-light-sage dark:hover:bg-paw-darksurface transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h3 className={`text-base font-bold text-paw-dark dark:text-white mb-1 ${apt.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>{apt.reason}</h3>
                      <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{apt.clinicName}</p>
                      {apt.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-paw-darksurface text-[11px] text-paw-secondary dark:text-paw-warm-sage border border-paw-soft-sage/40">
                          <strong>Note:</strong> {apt.notes}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-paw-soft-sage/30 dark:border-paw-darkborder/50 space-y-3 text-xs">
                      {apt.status === 'upcoming' && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAppointmentStatus(apt, 'completed')}
                            className="flex-1 px-3 py-1.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition-colors">✓ Mark done</button>
                          <button onClick={() => handleAppointmentStatus(apt, 'cancelled')}
                            className="flex-1 px-3 py-1.5 rounded-full font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">Cancel</button>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {apt.status === 'upcoming' ? (
                          <button onClick={() => downloadAppointmentIcs(apt, pet.name)} className="text-paw-forest dark:text-paw-warm-sage font-bold hover:underline">Add to Calendar</button>
                        ) : <span />}
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${apt.clinicName} ${apt.clinicAddress}`.trim())}`}
                          target="_blank" rel="noopener noreferrer" className="text-paw-secondary dark:text-paw-warm-sage hover:underline">Directions →</a>
                      </div>
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
                  <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileUpload} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {petDocuments.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">No documents uploaded yet.</p>
                    <p className="text-xs mt-1">Select a category and click “Upload Document” to add a PDF or image (JPG, PNG, WebP — up to 10 MB) to {pet.name}'s secure vault.</p>
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
                    <div className="flex flex-col gap-2">
                      <a href={fileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => { if (!doc.fileUrl) { e.preventDefault(); showToast('⚠️ File not available.'); } }}
                        className="p-2.5 rounded-full bg-white dark:bg-paw-darksurface text-paw-forest dark:text-paw-warm-sage hover:bg-paw-light-sage transition-colors shadow-sm"
                        title="Open document" aria-label={`Open ${doc.title}`}>
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleDeleteDocument(doc.id, doc.title)} disabled={deletingDocId === doc.id}
                        className="p-2.5 rounded-full bg-white dark:bg-paw-darksurface text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-sm disabled:opacity-60"
                        title="Delete document" aria-label={`Delete ${doc.title}`}>
                        {deletingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
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
                <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">Every vaccination, weigh-in, appointment, and document mapped across their life.</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-4">
                  {TIMELINE_FILTERS.map(({ key, label }) => {
                    const count = key === 'all' ? petTimeline.length : petTimeline.filter((t) => t.category === key).length;
                    return (
                      <button key={key} onClick={() => setTimelineFilter(key)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${timelineFilter === key ? 'bg-paw-forest text-white shadow-sm' : 'bg-paw-cream dark:bg-paw-darkcard text-paw-secondary dark:text-paw-warm-sage border border-paw-soft-sage/50 hover:text-paw-dark'}`}>
                        {label} <span className="opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {filteredTimeline.length === 0 ? (
                <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-semibold">{petTimeline.length === 0 ? `No timeline events yet for ${pet.name}.` : 'No events of this type yet.'}</p>
                  <p className="text-xs mt-1">Every vaccination, weigh-in, and appointment you log will appear here as a chronological life story.</p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-paw-soft-sage dark:before:bg-paw-darkborder">
                  {filteredTimeline.map((entry) => (
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

          {/* 8. Smart Reminders — built by the backend (GET /reminders) from this
               pet's real records and the user's reminder settings */}
          {activeTab === 'reminders' && (() => {
            const prefs = user?.preferences ?? DEFAULT_PREFERENCES;
            const leadDays = prefs.reminderLeadDays;
            const reminders = allReminders.filter((r) => r.petId === pet.id);

            const TYPE_ICON: Record<Reminder['type'], React.ReactNode> = {
              vaccination: <Syringe className="w-4 h-4" />,
              appointment: <Calendar className="w-4 h-4" />,
              weight: <Scale className="w-4 h-4" />,
            };
            const whenLabel = (r: Reminder) => {
              if (r.daysUntil === null) return r.type === 'weight' ? 'This week' : '';
              if (r.daysUntil < 0) return r.type === 'vaccination' ? `${Math.abs(r.daysUntil)}d overdue` : `${Math.abs(r.daysUntil)}d ago`;
              if (r.daysUntil === 0) return 'Today';
              if (r.daysUntil === 1) return 'Tomorrow';
              return `in ${r.daysUntil}d`;
            };

            const urgent = reminders.filter((r) => r.urgency === 'urgent');
            const upcoming = reminders.filter((r) => r.urgency === 'upcoming');
            const info = reminders.filter((r) => r.urgency === 'info');

            const urgencyStyles: Record<Reminder['urgency'], string> = {
              urgent: 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300',
              upcoming: 'bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300',
              info: 'bg-sky-50 dark:bg-sky-950/25 border-sky-200 dark:border-sky-900/40 text-sky-800 dark:text-sky-300',
            };

            const ReminderRow = ({ r }: { r: Reminder }) => (
              <div className={`flex items-start gap-3 p-4 rounded-2xl border ${urgencyStyles[r.urgency]}`}>
                <div className="w-8 h-8 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center flex-shrink-0">{TYPE_ICON[r.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-paw-dark dark:text-white truncate">{r.title}</h4>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap">{whenLabel(r)}</span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-90">{r.message}</p>
                </div>
              </div>
            );

            return (
              <div className="space-y-8 animate-fadeIn">
                <div className="pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Bell className="w-4 h-4" /><span>Smart Reminders</span></div>
                  <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">{pet.name}'s Care Feed</h2>
                  <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">
                    What needs doing for {pet.name} in the next {leadDays} days —{' '}
                    <Link to="/settings" className="font-semibold text-paw-forest dark:text-paw-sage hover:underline">change reminder settings</Link>.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Action feed — 2/3 width */}
                  <div className="lg:col-span-2 space-y-6">
                    {reminders.length === 0 ? (
                      <div className="text-center py-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
                        <p className="font-bold text-emerald-800 dark:text-emerald-300">{pet.name} is all caught up!</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Nothing is overdue or coming up in the next {leadDays} days.</p>
                      </div>
                    ) : (
                      <>
                        {urgent.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400"><AlertCircle className="w-3.5 h-3.5" /><span>Needs Attention Now ({urgent.length})</span></div>
                            {urgent.map((r) => <ReminderRow key={r.id} r={r} />)}
                          </div>
                        )}
                        {upcoming.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400"><Clock3 className="w-3.5 h-3.5" /><span>Coming Up ({upcoming.length})</span></div>
                            {upcoming.map((r) => <ReminderRow key={r.id} r={r} />)}
                          </div>
                        )}
                        {info.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400"><Bell className="w-3.5 h-3.5" /><span>Suggestions</span></div>
                            {info.map((r) => <ReminderRow key={r.id} r={r} />)}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Summary + how it works — 1/3 width */}
                  <div className="space-y-6">
                    <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-4">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-paw-forest dark:text-paw-sage">At a Glance</h3>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{urgent.length}</div>
                          <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">Urgent</div>
                        </div>
                        <div>
                          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{upcoming.length}</div>
                          <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">Upcoming</div>
                        </div>
                        <div>
                          <div className="text-2xl font-extrabold text-paw-forest dark:text-paw-sage">{vaccinations.filter(v => v.petId === pet.id && v.status === 'completed').length}</div>
                          <div className="text-[10px] text-paw-secondary dark:text-paw-warm-sage font-semibold">Up to Date</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-paw-light-sage/50 dark:bg-paw-darkcard/50 rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder space-y-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-paw-forest dark:text-paw-sage">How Reminders Reach You</h3>
                      <p className="text-xs text-paw-secondary dark:text-paw-warm-sage leading-relaxed">
                        The bell at the top shows reminders for all your pets. Turn on browser alerts to get a notification when a vaccine or visit is due.
                      </p>
                      <NotificationToggle />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {editingVax && <EditVaccinationModal vaccination={editingVax} onClose={() => setEditingVax(null)} />}
      {editingWeight && <EditWeightModal record={editingWeight} onClose={() => setEditingWeight(null)} />}
      {editingApt && <EditAppointmentModal appointment={editingApt} onClose={() => setEditingApt(null)} />}

      {/* Edit Pet Profile Modal */}
      {showEditPet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={closeEditPet}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAFAF6] dark:bg-paw-darksurface rounded-[28px] p-6 sm:p-8 border border-paw-soft-sage/70 dark:border-paw-darkborder shadow-soft-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-paw-dark dark:text-white">Edit {pet.name}'s Profile</h3>
              <button onClick={closeEditPet} className="text-paw-secondary hover:text-paw-dark dark:hover:text-white">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-1.5">Species</label>
                  <select value={editSpecies} onChange={(e) => setEditSpecies(e.target.value as 'dog' | 'cat' | 'other')} className={inputCls}>
                    <option value="dog">🐶 Dog</option>
                    <option value="cat">🐱 Cat</option>
                    <option value="other">🐾 Other</option>
                  </select>
                </div>
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
