import React, { useRef, useState } from 'react';
import { FileText, UploadCloud, Download, Trash2, Loader2, ShieldCheck, FileImage, Pill, Stethoscope, FileBadge, Home } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { fileUrl } from '../../../lib/api';
import { DocumentCategory } from '../../../types';
import { EmptyState, SectionHeader } from '../../ui';
import type { TabProps } from './types';

const CATEGORIES: { value: DocumentCategory; icon: typeof FileText; tone: string }[] = [
  { value: 'Medical Report', icon: Stethoscope, tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' },
  { value: 'Prescription', icon: Pill, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' },
  { value: 'Insurance', icon: FileBadge, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  { value: 'Adoption', icon: Home, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
];
const MAX_MB = 10;
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp';

export const DocumentsTab: React.FC<TabProps> = ({ pet }) => {
  const { documents, uploadDocument, deleteDocument, showToast } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<DocumentCategory>('Medical Report');
  const [filter, setFilter] = useState<'all' | DocumentCategory>('all');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const petDocs = documents.filter((d) => d.petId === pet.id);
  const shown = petDocs.filter((d) => filter === 'all' || d.category === filter);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const okType = /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
    if (!okType) { showToast('⚠️ Only PDF, JPG, PNG or WebP files can be stored.'); return; }
    if (file.size > MAX_MB * 1024 * 1024) { showToast(`⚠️ File is too large. Maximum size is ${MAX_MB} MB.`); return; }
    setUploading(true);
    try {
      await uploadDocument(pet.id, file, category);
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Upload failed — please try a smaller file or different format.'}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" from the vault? The file will be removed permanently.`)) return;
    setDeletingId(id);
    try { await deleteDocument(id); } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not delete document — please try again.'}`);
    } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={FileText} tone="indigo" eyebrow="Medical vault" title="Records & documents"
        description={`Lab reports, prescriptions, insurance and adoption papers for ${pet.name} — stored safely and always on hand at the vet.`} />

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files?.[0]); }}
        className={`rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-all ${dragging
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-[1.01]'
          : 'border-paw-line dark:border-paw-darkborder bg-white/60 dark:bg-paw-darkcard/50'}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-4 flex-1">
            <span className={`w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center ${dragging ? 'animate-bounce-short' : ''}`}>
              {uploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
            </span>
            <div>
              <p className="font-extrabold text-paw-dark dark:text-white">{uploading ? 'Uploading…' : 'Drop a file here, or browse'}</p>
              <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">PDF, JPG, PNG or WebP · up to {MAX_MB} MB</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} aria-label="Document category" className="input w-auto py-2">
              {CATEGORIES.map((c) => <option key={c.value}>{c.value}</option>)}
            </select>
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary"><UploadCloud className="w-4 h-4" /> Choose file</button>
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </div>
        </div>
      </div>

      {petDocs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`chip ${filter === 'all' ? 'chip-active' : ''}`}>All ({petDocs.length})</button>
          {CATEGORIES.map((c) => {
            const count = petDocs.filter((d) => d.category === c.value).length;
            if (!count) return null;
            return <button key={c.value} onClick={() => setFilter(c.value)} className={`chip ${filter === c.value ? 'chip-active' : ''}`}><c.icon className="w-3.5 h-3.5" />{c.value} ({count})</button>;
          })}
        </div>
      )}

      {petDocs.length === 0 ? (
        <EmptyState icon={FileText} tone="indigo" title="The vault is empty" image="/images/cat-ginger.webp"
          text="Upload vaccination certificates, lab results or insurance policies so they're ready whenever the vet asks." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {shown.map((doc) => {
            const cat = CATEGORIES.find((c) => c.value === doc.category) ?? CATEGORIES[0];
            const isImage = /\.(jpe?g|png|webp)$/i.test(doc.fileUrl || doc.title);
            const Icon = isImage ? FileImage : cat.icon;
            return (
              <article key={doc.id} className="card card-interactive p-5 flex items-center gap-4">
                <span className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${cat.tone}`}><Icon className="w-6 h-6" /></span>
                <div className="flex-1 min-w-0">
                  <span className="eyebrow text-indigo-700 dark:text-indigo-300 text-[10px]">{doc.category}</span>
                  <h3 className="text-sm font-extrabold text-paw-dark dark:text-white truncate" title={doc.title}>{doc.title}</h3>
                  <p className="text-xs text-paw-secondary dark:text-paw-warm-sage">{doc.date}{doc.fileSize && ` · ${doc.fileSize}`}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400"><ShieldCheck className="w-3 h-3" /> Stored in vault</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a href={fileUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => { if (!doc.fileUrl) { e.preventDefault(); showToast('⚠️ File not available.'); } }}
                    className="icon-btn bg-paw-mist dark:bg-paw-darksurface" title="Open document" aria-label={`Open ${doc.title}`}>
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => remove(doc.id, doc.title)} disabled={deletingId === doc.id}
                    className="icon-btn hover:!text-rose-600 hover:!bg-rose-50 dark:hover:!bg-rose-500/10" title="Delete document" aria-label={`Delete ${doc.title}`}>
                    {deletingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
