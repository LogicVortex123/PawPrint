import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, Link2, Loader2, Eye, Ban, QrCode, Download } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiRequest } from '../../lib/api';
import { Modal, inputCls, labelCls, primaryBtnCls } from '../common/Modal';
import { Pet, ShareLink } from '../../types';

const DURATIONS = [
  { days: 1, label: '24 hours' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
];

const shareUrl = (token: string) => `${window.location.origin}/share/${token}`;

function expiresLabel(link: ShareLink): string {
  if (link.expired) return 'Expired';
  const ms = new Date(link.expiresAt).getTime() - Date.now();
  const hours = Math.round(ms / 3_600_000);
  if (hours < 24) return `Expires in ${Math.max(hours, 1)}h`;
  return `Expires in ${Math.round(hours / 24)} days`;
}

// "Share with vet": a read-only link (and QR code) to the pet's health summary
// that works without a PawPrint account, expires on its own and can be revoked.
export const ShareDialog: React.FC<{ pet: Pet; onClose: () => void }> = ({ pet, onClose }) => {
  const { token, showToast } = useAppStore();
  const [links, setLinks] = useState<ShareLink[] | null>(null);
  const [days, setDays] = useState(7);
  const [label, setLabel] = useState('');
  const [creating, setCreating] = useState(false);
  const [current, setCurrent] = useState<ShareLink | null>(null);
  const [qr, setQr] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ShareLink[]>(`/pets/${pet.id}/shares`, { token })
      .then(setLinks)
      .catch(() => setLinks([]));
  }, [pet.id, token]);

  useEffect(() => {
    if (!current) { setQr(''); return; }
    QRCode.toDataURL(shareUrl(current.token), { width: 240, margin: 1, color: { dark: '#16352B', light: '#FFFFFF' } })
      .then(setQr)
      .catch(() => setQr(''));
  }, [current]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const link = await apiRequest<ShareLink>(`/pets/${pet.id}/shares`, { method: 'POST', token, body: { days, label: label.trim() || undefined } });
      setLinks((prev) => [link, ...(prev ?? [])]);
      setCurrent(link);
      setLabel('');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not create the link.'}`);
    } finally { setCreating(false); }
  };

  const copy = async (link: ShareLink) => {
    try {
      await navigator.clipboard.writeText(shareUrl(link.token));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('⚠️ Could not copy — select the link and copy it manually.');
    }
  };

  const revoke = async (link: ShareLink) => {
    if (!window.confirm('Turn this link off? Anyone who has it will no longer be able to open it.')) return;
    setRevokingId(link.id);
    try {
      await apiRequest(`/shares/${link.id}`, { method: 'DELETE', token });
      setLinks((prev) => (prev ?? []).filter((l) => l.id !== link.id));
      if (current?.id === link.id) setCurrent(null);
      showToast('🔒 Link turned off.');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not turn the link off.'}`);
    } finally { setRevokingId(null); }
  };

  const canShareNatively = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Modal title={`Share ${pet.name}'s health record`} onClose={onClose} maxWidth="max-w-2xl">
      <p className="text-sm text-paw-secondary dark:text-paw-warm-sage -mt-3 mb-5">
        Create a private, read-only link for a vet, pet sitter or boarding facility. They'll see vaccinations, allergies,
        current medications, weight and contacts — no account needed. They can't change anything.
      </p>

      <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <div>
          <label className={labelCls}>Who is it for? (optional)</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="e.g. Dr. Mehta, Happy Paws boarding" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Link works for</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={inputCls}>
            {DURATIONS.map((d) => <option key={d.days} value={d.days}>{d.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={creating} className={`${primaryBtnCls} inline-flex items-center justify-center gap-2`}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Create link
        </button>
      </form>

      {current && (
        <div className="mt-6 p-5 rounded-2xl bg-paw-light-sage/50 dark:bg-paw-darkcard border border-paw-soft-sage dark:border-paw-darkborder flex flex-col sm:flex-row gap-5 items-center">
          {qr ? (
            <img src={qr} alt={`QR code for ${pet.name}'s health record`} className="w-40 h-40 rounded-xl bg-white p-1 flex-shrink-0" />
          ) : (
            <div className="w-40 h-40 rounded-xl bg-white flex items-center justify-center flex-shrink-0"><QrCode className="w-8 h-8 text-gray-300" /></div>
          )}
          <div className="flex-1 min-w-0 space-y-3 w-full">
            <div className="text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage">Link ready · {expiresLabel(current)}</div>
            <input readOnly value={shareUrl(current.token)} onFocus={(e) => e.target.select()} className={`${inputCls} font-mono text-xs`} />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => copy(current)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied!' : 'Copy link'}
              </button>
              {canShareNatively && (
                <button onClick={() => navigator.share({ title: `${pet.name}'s health record`, url: shareUrl(current.token) }).catch(() => {})}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-paw-forest text-paw-forest dark:text-paw-warm-sage dark:border-paw-warm-sage">
                  Share…
                </button>
              )}
              {qr && (
                <a href={qr} download={`${pet.name}-health-record-qr.png`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-paw-soft-sage dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest">
                  <Download className="w-3.5 h-3.5" /> Save QR
                </a>
              )}
            </div>
            <p className="text-[11px] text-paw-secondary dark:text-paw-warm-sage">The vet can scan the QR code from your phone screen, or you can print it on a boarding form.</p>
          </div>
        </div>
      )}

      <div className="mt-7">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage mb-2">Links you've shared</h4>
        {links === null ? (
          <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-paw-secondary" /></div>
        ) : links.length === 0 ? (
          <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">No links yet.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id} className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border text-sm ${link.expired ? 'opacity-60 border-paw-soft-sage/40 dark:border-paw-darkborder' : 'border-paw-soft-sage dark:border-paw-darkborder bg-white dark:bg-paw-darkcard'}`}>
                <div className="min-w-0">
                  <div className="font-bold text-paw-dark dark:text-white truncate">{link.label || 'Untitled link'}</div>
                  <div className="text-xs text-paw-secondary dark:text-paw-warm-sage flex items-center gap-2 flex-wrap">
                    <span>{expiresLabel(link)}</span>·
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{link.viewCount} view{link.viewCount === 1 ? '' : 's'}</span>
                    {link.lastViewedAt && <span>· last opened {new Date(link.lastViewedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!link.expired && (
                    <button onClick={() => setCurrent(link)} className="px-3 py-1.5 rounded-full text-xs font-bold text-paw-forest dark:text-paw-sage hover:bg-paw-light-sage dark:hover:bg-paw-darksurface">Show QR</button>
                  )}
                  <button onClick={() => revoke(link)} disabled={revokingId === link.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-60">
                    {revokingId === link.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}{link.expired ? 'Remove' : 'Turn off'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};
