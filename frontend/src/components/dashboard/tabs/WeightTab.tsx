import React, { useEffect, useRef, useState } from 'react';
import { Scale, Plus, TrendingUp, TrendingDown, Minus, Target, Loader2, Pencil } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { weightTargetStatus } from '../../../lib/adapters';
import { WeightRecord } from '../../../types';
import { EditWeightModal } from '../RecordEditModals';
import { EmptyState, SectionHeader, StatTile } from '../../ui';
import type { TabProps } from './types';

const WeightChart: React.FC<{ records: WeightRecord[]; min: number | null; max: number | null }> = ({ records, min: targetMin, max: targetMax }) => {
  const [hover, setHover] = useState<number | null>(null);
  // Draw at the container's real width so text and dots stay a normal size
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 260, L = 40, R = 16, T = 18, B = 30;
  const weights = records.map((r) => r.weight);
  const targets = [targetMin, targetMax].filter((t): t is number => t != null);
  const lo = Math.floor(Math.min(...weights, ...targets) - 1);
  const hi = Math.ceil(Math.max(...weights, ...targets) + 1);
  const range = hi - lo || 1;
  const x = (i: number) => L + (records.length === 1 ? (W - L - R) / 2 : (i / (records.length - 1)) * (W - L - R));
  const y = (kg: number) => T + (1 - (kg - lo) / range) * (H - T - B);
  const pts = records.map((r, i) => [x(i), y(r.weight)] as const);
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]},${H - B} L${pts[0][0]},${H - B} Z`;
  const ticks = Array.from({ length: 4 }, (_, i) => lo + (range * i) / 3);
  const step = Math.max(1, Math.ceil(records.length / Math.max(2, Math.floor(W / 110))));

  return (
    <div className="relative" ref={boxRef}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label="Weight history chart">
        <defs>
          <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="stroke-paw-line dark:stroke-paw-darkborder" strokeDasharray="3 5" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="fill-paw-secondary dark:fill-paw-warm-sage text-[10px]">{t.toFixed(range < 6 ? 1 : 0)}</text>
          </g>
        ))}
        {targets.length > 0 && (
          <g>
            <rect x={L} width={W - L - R} y={targetMax != null ? y(targetMax) : T} height={Math.max((targetMin != null ? y(targetMin) : H - B) - (targetMax != null ? y(targetMax) : T), 2)}
              className="fill-emerald-500/10 dark:fill-emerald-400/10" />
            <text x={W - R - 6} y={(targetMax != null ? y(targetMax) : T) + 13} textAnchor="end" className="fill-emerald-700 dark:fill-emerald-300 text-[10px] font-bold">Healthy range</text>
          </g>
        )}
        {records.length > 1 && <path d={area} fill="url(#weightArea)" />}
        {records.length > 1 && <path d={line} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-amber-500" pathLength={1000} strokeDasharray="1000" style={{ animation: 'draw 1.4s ease-out both' }} />}
        {pts.map(([px, py], i) => (
          <g key={records[i].id} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <circle cx={px} cy={py} r="14" fill="transparent" />
            <circle cx={px} cy={py} r={hover === i || i === pts.length - 1 ? 6 : 4.5} className="fill-white dark:fill-paw-darkcard stroke-amber-500 transition-all" strokeWidth="3" />
          </g>
        ))}
        {records.map((r, i) => (i % step === 0 || i === records.length - 1) && (
          <text key={r.id} x={x(i)} y={H - 8} textAnchor="middle" className="fill-paw-secondary dark:fill-paw-warm-sage text-[10px]">{r.date.replace(/,? \d{4}$/, '')}</text>
        ))}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-paw-dark text-white text-xs font-bold shadow-soft-lg whitespace-nowrap animate-pop"
          style={{ left: `${(pts[hover][0] / W) * 100}%`, top: `${(pts[hover][1] / H) * 100 - 4}%` }}>
          {records[hover].weight} kg · {records[hover].date}
        </div>
      )}
    </div>
  );
};

export const WeightTab: React.FC<TabProps> = ({ pet, onEditPet }) => {
  const { weightRecords, addWeightRecord, showToast } = useAppStore();
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<WeightRecord | null>(null);

  const records = weightRecords[pet.id] || [];
  const latest = records[records.length - 1];
  const first = records[0];
  const target = weightTargetStatus(pet.weight, pet.targetWeightMinKg, pet.targetWeightMaxKg);
  const hasRange = pet.targetWeightMinKg != null || pet.targetWeightMaxKg != null;
  const rangeLabel = `${pet.targetWeightMinKg ?? '–'}–${pet.targetWeightMaxKg ?? '–'} kg`;
  const totalChange = latest && first && records.length > 1 ? Math.round((latest.weight - first.weight) * 10) / 10 : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(input);
    if (isNaN(kg) || kg <= 0) { showToast('⚠️ Please enter a valid weight in kilograms.'); return; }
    if (kg > 200) { showToast('⚠️ That weight seems too high — please double-check the value.'); return; }
    setSaving(true);
    try {
      await addWeightRecord(pet.id, kg);
      setInput('');
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save weight — please try again.'}`);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader icon={Scale} tone="amber" eyebrow="Weight" title="Growth & body condition"
        description="Regular weigh-ins catch changes early. A swing of 10% or more is worth mentioning to your vet."
        actions={
          <form onSubmit={submit} className="flex items-center gap-2">
            <div className="relative">
              <input type="number" step="0.1" min="0.1" max="200" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Weight" aria-label="Weight in kilograms" className="input w-32 pr-10" />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-paw-secondary">kg</span>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Log weight</button>
          </form>
        } />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Current" value={latest ? `${latest.weight} kg` : '—'} icon={Scale} tone="amber" hint={latest ? latest.date : 'No weigh-ins yet'} />
        <StatTile label="Since last" tone="sky"
          icon={latest?.trendPercent == null ? Minus : latest.trendPercent > 0 ? TrendingUp : TrendingDown}
          value={latest?.trendPercent == null ? '—' : `${latest.trendPercent > 0 ? '+' : ''}${latest.trendPercent}%`}
          hint={latest?.trendPercent != null && Math.abs(latest.trendPercent) >= 10 ? 'Big change — tell your vet' : 'Change vs previous'} />
        <StatTile label="Overall" icon={TrendingUp} tone="violet" value={totalChange === null ? '—' : `${totalChange > 0 ? '+' : ''}${totalChange} kg`} hint={first ? `Since ${first.date}` : 'Log two to compare'} />
        {hasRange ? (
          <StatTile label="Healthy range" icon={Target} tone={target?.status === 'within' || !target ? 'forest' : 'rose'} value={rangeLabel}
            hint={!target ? 'Log a weight to compare' : target.status === 'within' ? '✓ Within range' : `${target.percent}% ${target.status} range`} onClick={onEditPet} />
        ) : (
          <StatTile label="Healthy range" icon={Target} tone="forest" value="Not set" hint="Tap to add your vet's range" onClick={onEditPet} />
        )}
      </div>

      {records.length === 0 ? (
        <EmptyState icon={Scale} tone="amber" image="/images/corgi-puppy.webp" title={`No weigh-ins yet for ${pet.name}`}
          text="Enter a weight above and hit “Log weight”. Your chart, trend and range alerts build up from there." />
      ) : (
        <>
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-extrabold text-paw-dark dark:text-white">Weight history</h3>
              <span className="text-xs text-paw-secondary dark:text-paw-warm-sage">{records.length} weigh-in{records.length === 1 ? '' : 's'}</span>
            </div>
            <WeightChart records={records} min={pet.targetWeightMinKg} max={pet.targetWeightMaxKg} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-paw-dark dark:text-white">All weigh-ins</h3>
              <span className="text-xs text-paw-secondary dark:text-paw-warm-sage">Tap one to edit or delete</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...records].reverse().map((w) => (
                <button key={w.id} onClick={() => setEditing(w)} title="Edit or delete" className="card card-interactive p-3.5 text-center group relative">
                  <Pencil className="w-3 h-3 absolute top-2.5 right-2.5 text-paw-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] font-semibold text-paw-secondary dark:text-paw-warm-sage">{w.date}</div>
                  <div className="text-lg font-extrabold text-paw-dark dark:text-white">{w.weight} kg</div>
                  {w.trendPercent !== null && (
                    <div className={`text-[10px] font-bold ${w.trendPercent > 0 ? 'text-amber-600' : w.trendPercent < 0 ? 'text-sky-600' : 'text-paw-secondary'}`}>
                      {w.trendPercent > 0 ? '▲' : w.trendPercent < 0 ? '▼' : '•'} {Math.abs(w.trendPercent)}%
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {editing && <EditWeightModal record={editing} onClose={() => setEditing(null)} />}
    </div>
  );
};
