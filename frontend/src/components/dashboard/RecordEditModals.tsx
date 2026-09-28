import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, inputCls, labelCls, primaryBtnCls, dangerBtnCls } from '../common/Modal';
import { useAppStore } from '../../store/useAppStore';
import { Vaccination, WeightRecord, Appointment } from '../../types';

// ISO timestamp → value for <input type="date"> / <input type="datetime-local"> in local time
const pad = (n: number) => String(n).padStart(2, '0');
export function toDateInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function toDateTimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${toDateInput(iso)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const errMsg = (err: unknown, fallback: string) => `❌ ${err instanceof Error ? err.message : fallback}`;

// Shared footer: delete on the left, save on the right
const ModalActions: React.FC<{ saving: boolean; deleting: boolean; onDelete: () => void; saveLabel?: string }> = ({ saving, deleting, onDelete, saveLabel = 'Save Changes' }) => (
  <div className="flex items-center justify-between pt-2 gap-3">
    <button type="button" onClick={onDelete} disabled={deleting} className={dangerBtnCls}>
      <Trash2 className="w-3.5 h-3.5" /><span>{deleting ? 'Deleting…' : 'Delete'}</span>
    </button>
    <button type="submit" disabled={saving} className={`flex-1 ${primaryBtnCls}`}>
      {saving ? 'Saving…' : saveLabel}
    </button>
  </div>
);

// ── Vaccination ──────────────────────────────────────────────────────────────

export const EditVaccinationModal: React.FC<{ vaccination: Vaccination; onClose: () => void }> = ({ vaccination, onClose }) => {
  const { updateVaccination, deleteVaccination, showToast } = useAppStore();
  const notSet = (v: string) => (v === 'Not specified' ? '' : v);
  const [name, setName] = useState(vaccination.name);
  const [adminDate, setAdminDate] = useState(vaccination.administeredDate || '');
  const [nextDue, setNextDue] = useState(vaccination.nextDueDate || '');
  const [vet, setVet] = useState(notSet(vaccination.veterinarian));
  const [clinic, setClinic] = useState(notSet(vaccination.clinic));
  const [batch, setBatch] = useState(vaccination.batchNumber || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('⚠️ Please enter the vaccine name.'); return; }
    if (nextDue < adminDate) { showToast('⚠️ Next due date must be on or after the date it was given.'); return; }
    setSaving(true);
    try {
      await updateVaccination(vaccination.id, {
        vaccineName: name.trim(),
        administrationDate: adminDate,
        nextDueDate: nextDue,
        veterinarian: vet.trim(),
        clinic: clinic.trim(),
        batchNumber: batch.trim(),
      });
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not update vaccination — please try again.'));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the "${vaccination.name}" record? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteVaccination(vaccination.id);
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not delete vaccination — please try again.'));
      setDeleting(false);
    }
  };

  return (
    <Modal title="Edit Vaccination" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div><label className={labelCls}>Vaccine name</label><input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Given on</label><input required type="date" value={adminDate} onChange={(e) => setAdminDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Next due</label><input required type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} className={inputCls} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Veterinarian</label><input value={vet} onChange={(e) => setVet(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Clinic</label><input value={clinic} onChange={(e) => setClinic(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Batch number</label><input value={batch} onChange={(e) => setBatch(e.target.value)} className={inputCls} /></div>
        <ModalActions saving={saving} deleting={deleting} onDelete={handleDelete} />
      </form>
    </Modal>
  );
};

// ── Weight ───────────────────────────────────────────────────────────────────

export const EditWeightModal: React.FC<{ record: WeightRecord; onClose: () => void }> = ({ record, onClose }) => {
  const { updateWeightRecord, deleteWeightRecord, showToast } = useAppStore();
  const [weight, setWeight] = useState(String(record.weight));
  const [date, setDate] = useState(toDateInput(record.recordedAt));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weight);
    if (isNaN(parsed) || parsed <= 0 || parsed > 200) { showToast('⚠️ Please enter a valid weight between 0 and 200 kg.'); return; }
    if (!date) { showToast('⚠️ Please pick the date of this weigh-in.'); return; }
    setSaving(true);
    try {
      // Keep the original time of day so same-day entries stay in order
      const original = new Date(record.recordedAt);
      const [y, m, d] = date.split('-').map(Number);
      const recordedAt = new Date(y, m - 1, d, original.getHours(), original.getMinutes()).toISOString();
      await updateWeightRecord(record.petId, record.id, { weightKg: parsed, recordedAt });
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not update weigh-in — please try again.'));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the ${record.weight} kg weigh-in from ${record.date}?`)) return;
    setDeleting(true);
    try {
      await deleteWeightRecord(record.petId, record.id);
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not delete weigh-in — please try again.'));
      setDeleting(false);
    }
  };

  return (
    <Modal title="Edit Weigh-in" onClose={onClose} maxWidth="max-w-sm">
      <form onSubmit={handleSave} className="space-y-4">
        <div><label className={labelCls}>Weight (kg)</label><input required type="number" step="0.1" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Date</label><input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
        <ModalActions saving={saving} deleting={deleting} onDelete={handleDelete} />
      </form>
    </Modal>
  );
};

// ── Appointment ──────────────────────────────────────────────────────────────

export const EditAppointmentModal: React.FC<{ appointment: Appointment; onClose: () => void }> = ({ appointment, onClose }) => {
  const { updateAppointment, deleteAppointment, showToast } = useAppStore();
  const [clinic, setClinic] = useState(appointment.clinicName);
  const [address, setAddress] = useState(appointment.clinicAddress);
  const [date, setDate] = useState(toDateTimeInput(appointment.dateISO));
  const [reason, setReason] = useState(appointment.reason);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinic.trim()) { showToast('⚠️ Please enter the clinic or hospital name.'); return; }
    if (!date) { showToast('⚠️ Please pick a date and time.'); return; }
    setSaving(true);
    try {
      await updateAppointment(appointment.id, {
        clinicName: clinic.trim(),
        clinicAddress: address.trim(),
        date,
        reason: reason.trim(),
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not update appointment — please try again.'));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this appointment permanently? (To keep it in history, cancel it instead.)')) return;
    setDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      onClose();
    } catch (err) {
      showToast(errMsg(err, 'Could not delete appointment — please try again.'));
      setDeleting(false);
    }
  };

  return (
    <Modal title="Edit Appointment" onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Clinic</label><input required value={clinic} onChange={(e) => setClinic(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Address</label><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Date &amp; time</label><input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Reason</label><input value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Notes</label><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} /></div>
        <ModalActions saving={saving} deleting={deleting} onDelete={handleDelete} />
      </form>
    </Modal>
  );
};
