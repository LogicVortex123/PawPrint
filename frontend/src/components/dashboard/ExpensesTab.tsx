import React, { useEffect, useMemo, useState } from 'react';
import { Wallet, Plus, Pencil, Trash2, FileSpreadsheet, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { apiRequest } from '../../lib/api';
import { Modal, inputCls, labelCls, primaryBtnCls, dangerBtnCls } from '../common/Modal';
import { Expense, ExpenseCategory, ExpenseInput, ExpenseSummary, Pet, DEFAULT_PREFERENCES } from '../../types';
import { EXPENSE_CATEGORIES, categoryInfo, formatMoney } from '../../lib/money';
import { todayKey, formatDateKey } from '../../lib/dates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Add / edit form ──────────────────────────────────────────────────────────

export type ExpensePrefill = Partial<ExpenseInput>;

export const ExpenseFormModal: React.FC<{ pet: Pet; expense?: Expense; prefill?: ExpensePrefill; onClose: () => void }> = ({ pet, expense, prefill, onClose }) => {
  const { addExpense, updateExpense, deleteExpense, showToast, user } = useAppStore();
  const currency = user?.preferences?.currency ?? DEFAULT_PREFERENCES.currency;
  const [amount, setAmount] = useState(expense ? String(expense.amount) : prefill?.amount ? String(prefill.amount) : '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? prefill?.category ?? 'food');
  const [date, setDate] = useState(expense?.date ?? prefill?.date ?? todayKey());
  const [description, setDescription] = useState(expense?.description ?? prefill?.description ?? '');
  const [vendor, setVendor] = useState(expense?.vendor ?? prefill?.vendor ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!amount || !Number.isFinite(value) || value < 0) { showToast('⚠️ Enter the amount spent.'); return; }
    setSaving(true);
    try {
      const input: ExpenseInput = { amount: value, category, date, description: description.trim(), vendor: vendor.trim() };
      if (expense) await updateExpense(expense.id, input);
      else await addExpense(pet.id, { ...input, appointment: prefill?.appointment ?? undefined });
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not save the expense.'}`);
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!expense || !window.confirm('Delete this expense?')) return;
    setDeleting(true);
    try {
      await deleteExpense(expense.id);
      onClose();
    } catch (err) {
      showToast(`❌ ${err instanceof Error ? err.message : 'Could not delete the expense.'}`);
      setDeleting(false);
    }
  };

  return (
    <Modal title={expense ? 'Edit expense' : `New expense for ${pet.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Amount ({currency}) *</label>
            <input required autoFocus type="number" inputMode="decimal" min="0" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input required type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)} aria-pressed={category === c.value}
                className={`px-2 py-2 rounded-xl text-xs font-bold border transition-colors ${category === c.value
                  ? 'bg-paw-forest text-white border-paw-forest'
                  : 'bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white border-paw-soft-sage dark:border-paw-darkborder hover:border-paw-forest'}`}>
                <span aria-hidden>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>What for</label>
            <input value={description} maxLength={120} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Annual checkup, 10 kg kibble" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Where</label>
            <input value={vendor} maxLength={120} onChange={(e) => setVendor(e.target.value)} placeholder="Clinic, shop or groomer" className={inputCls} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 pt-2">
          {expense ? (
            <button type="button" onClick={remove} disabled={deleting} className={dangerBtnCls}>
              <Trash2 className="w-3.5 h-3.5" /><span>{deleting ? 'Deleting…' : 'Delete'}</span>
            </button>
          ) : <span />}
          <button type="submit" disabled={saving} className={primaryBtnCls}>{saving ? 'Saving…' : expense ? 'Save changes' : 'Add expense'}</button>
        </div>
      </form>
    </Modal>
  );
};

// ── Monthly bar chart ─────────────────────────────────────────────────────────

const MonthlyChart: React.FC<{ byMonth: number[]; currency: ExpenseSummary['currency']; currentMonth: number | null }> = ({ byMonth, currency, currentMonth }) => {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...byMonth, 0);
  const W = 600;
  const H = 180;
  const top = 16;
  const bottom = 24;
  const slot = W / 12;
  const barW = slot - 10;
  const plotH = H - top - bottom;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Spending by month">
        {/* recessive baseline + midline */}
        <line x1="0" x2={W} y1={H - bottom} y2={H - bottom} className="stroke-paw-soft-sage dark:stroke-paw-darkborder" strokeWidth="1" />
        <line x1="0" x2={W} y1={top + plotH / 2} y2={top + plotH / 2} className="stroke-paw-soft-sage/60 dark:stroke-paw-darkborder/60" strokeWidth="1" strokeDasharray="3 4" />
        {byMonth.map((value, i) => {
          const h = max ? Math.max((value / max) * plotH, value > 0 ? 3 : 0) : 0;
          const x = i * slot + 5;
          const y = H - bottom - h;
          const r = Math.min(4, h / 2, barW / 2);
          // Rounded top only; the bar sits flat on the baseline
          const path = h > 0
            ? `M${x},${H - bottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${H - bottom} Z`
            : '';
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* full-height hit target, larger than the bar */}
              <rect x={i * slot} y={top} width={slot} height={plotH} fill="transparent" />
              {path && <path d={path} className={`fill-paw-forest dark:fill-paw-warm-sage transition-opacity ${hover !== null && hover !== i ? 'opacity-40' : ''}`} />}
              <text x={i * slot + slot / 2} y={H - 6} textAnchor="middle"
                className={`text-[11px] ${i === currentMonth ? 'fill-paw-dark dark:fill-white font-bold' : 'fill-paw-secondary dark:fill-paw-warm-sage'}`}>
                {MONTHS[i]}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-paw-dark text-white text-xs font-bold shadow-soft whitespace-nowrap"
          style={{ left: `${((hover + 0.5) / 12) * 100}%`, top: `${Math.max(((H - bottom - (max ? (byMonth[hover] / max) * plotH : 0)) / H) * 100 - 4, 0)}%` }}>
          {MONTHS[hover]}: {formatMoney(byMonth[hover], currency)}
        </div>
      )}
      <p className="sr-only">{byMonth.map((v, i) => `${MONTHS[i]} ${formatMoney(v, currency)}`).join(', ')}</p>
    </div>
  );
};

// ── Tab ──────────────────────────────────────────────────────────────────────

export const ExpensesTab: React.FC<{ pet: Pet }> = ({ pet }) => {
  const { expenses, expensesLoading, pets, token, downloadExpensesCsv, showToast, user } = useAppStore();
  const currency = user?.preferences?.currency ?? DEFAULT_PREFERENCES.currency;
  const thisYear = Number(todayKey().slice(0, 4));
  const [year, setYear] = useState(thisYear);
  const [scope, setScope] = useState<'pet' | 'all'>('pet');
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Re-summarise whenever the records, year, pet or scope change
  useEffect(() => {
    const petQuery = scope === 'pet' ? `&pet=${pet.id}` : '';
    apiRequest<ExpenseSummary>(`/expenses/summary?year=${year}&date=${todayKey()}${petQuery}`, { token })
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [expenses, year, scope, pet.id, token]);

  const visible = useMemo(
    () => expenses.filter((e) => e.date.startsWith(`${year}-`) && (scope === 'all' || e.petId === pet.id)),
    [expenses, year, scope, pet.id],
  );
  const years = useMemo(() => {
    const set = new Set([thisYear, ...expenses.map((e) => Number(e.date.slice(0, 4)))]);
    return [...set].sort((a, b) => b - a);
  }, [expenses, thisYear]);
  const petName = (id: string) => pets.find((p) => p.id === id)?.name ?? '';

  const exportCsv = async () => {
    setExporting(true);
    try { await downloadExpensesCsv(year); } catch (err) { showToast(`❌ ${err instanceof Error ? err.message : 'Export failed.'}`); } finally { setExporting(false); }
  };

  const change = summary && summary.lastMonth > 0 ? Math.round(((summary.thisMonth - summary.lastMonth) / summary.lastMonth) * 100) : null;
  const topCategory = summary?.byCategory[0];
  const maxCategory = summary?.byCategory[0]?.total || 0;
  const shown = showAll ? visible : visible.slice(0, 12);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-paw-soft-sage/30 dark:border-paw-darkborder/50">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-paw-forest dark:text-paw-sage"><Wallet className="w-4 h-4" /><span>Expense Tracker</span></div>
          <h2 className="text-3xl font-extrabold text-paw-dark dark:text-white">What {scope === 'pet' ? pet.name : 'your pets'} cost{scope === 'pet' ? 's' : ''}</h2>
          <p className="text-paw-secondary dark:text-paw-warm-sage/80 text-sm pt-1">Log vet bills, food, grooming and more to see where the money goes and plan ahead.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-paw-cream dark:bg-paw-darkcard p-1 rounded-2xl border border-paw-soft-sage/50 dark:border-paw-darkborder">
            {(['pet', 'all'] as const).map((s) => (
              <button key={s} onClick={() => setScope(s)} aria-pressed={scope === s}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${scope === s ? 'bg-paw-forest text-white' : 'text-paw-secondary dark:text-paw-warm-sage hover:text-paw-dark'}`}>
                {s === 'pet' ? pet.name : 'All pets'}
              </button>
            ))}
          </div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label="Year"
            className="px-3 py-2 rounded-xl border border-paw-soft-sage dark:border-paw-darkborder bg-paw-cream dark:bg-paw-darkcard text-paw-dark dark:text-white text-xs font-bold">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportCsv} disabled={exporting || visible.length === 0} title="Download as a spreadsheet (CSV)"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-paw-soft-sage dark:border-paw-darkborder text-paw-dark dark:text-white hover:border-paw-forest disabled:opacity-50">
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />} Export CSV
          </button>
          <button onClick={() => setEditing('new')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-paw-forest text-white hover:bg-paw-deep shadow-soft">
            <Plus className="w-3.5 h-3.5" /> Add Expense
          </button>
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: `Total ${year}`, value: summary ? formatMoney(summary.total, currency) : '—', hint: summary ? `${summary.count} expense${summary.count === 1 ? '' : 's'}` : '' },
          {
            label: 'This month',
            value: summary ? formatMoney(summary.thisMonth, currency) : '—',
            hint: change === null ? 'No spending last month' : `${change > 0 ? '+' : ''}${change}% vs last month`,
            icon: change === null ? null : change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />,
          },
          { label: 'Monthly average', value: summary ? formatMoney(summary.monthlyAverage, currency) : '—', hint: year === thisYear ? 'So far this year' : `Across ${year}` },
          { label: 'Biggest category', value: topCategory ? `${categoryInfo(topCategory.category).emoji} ${topCategory.label}` : '—', hint: topCategory ? formatMoney(topCategory.total, currency) : 'Nothing logged yet' },
        ].map((tile) => (
          <div key={tile.label} className="bg-paw-cream dark:bg-paw-darkcard rounded-2xl p-5 border border-paw-soft-sage/60 dark:border-paw-darkborder">
            <div className="text-[11px] font-bold uppercase tracking-wider text-paw-secondary dark:text-paw-warm-sage">{tile.label}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-paw-dark dark:text-white mt-1 truncate">{tile.value}</div>
            <div className="text-xs text-paw-secondary dark:text-paw-warm-sage mt-1 inline-flex items-center gap-1">{tile.icon}{tile.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder">
          <h3 className="text-sm font-bold text-paw-dark dark:text-white mb-2">Spending by month · {year}</h3>
          {summary && summary.total > 0
            ? <MonthlyChart byMonth={summary.byMonth} currency={currency} currentMonth={year === thisYear ? Number(todayKey().slice(5, 7)) - 1 : null} />
            : <p className="text-sm text-paw-secondary dark:text-paw-warm-sage py-12 text-center">Nothing logged for {year} yet.</p>}
        </div>
        <div className="bg-paw-cream dark:bg-paw-darkcard rounded-3xl p-6 border border-paw-soft-sage/60 dark:border-paw-darkborder">
          <h3 className="text-sm font-bold text-paw-dark dark:text-white mb-4">By category</h3>
          {summary && summary.byCategory.length ? (
            <ul className="space-y-3">
              {summary.byCategory.map((c) => (
                <li key={c.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-paw-dark dark:text-white">{categoryInfo(c.category).emoji} {c.label}</span>
                    <span className="font-bold text-paw-dark dark:text-white">{formatMoney(c.total, currency)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-paw-soft-sage/50 dark:bg-paw-darkborder overflow-hidden">
                    <div className="h-full rounded-full bg-paw-forest dark:bg-paw-warm-sage" style={{ width: `${maxCategory ? (c.total / maxCategory) * 100 : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-paw-secondary dark:text-paw-warm-sage">Categories appear once you log expenses.</p>}
        </div>
      </div>

      {/* The records */}
      <div>
        <h3 className="text-sm font-bold text-paw-dark dark:text-white mb-3">Expenses in {year}</h3>
        {expensesLoading && !expenses.length ? (
          <div className="py-8 text-center"><Loader2 className="w-6 h-6 mx-auto animate-spin text-paw-secondary" /></div>
        ) : visible.length === 0 ? (
          <div className="text-center py-10 text-paw-secondary dark:text-paw-warm-sage/60">
            <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No expenses logged for {year}.</p>
            <p className="text-xs mt-1">Hit “Add Expense” after a vet visit, food run or grooming session.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-paw-soft-sage/40 dark:divide-paw-darkborder rounded-2xl border border-paw-soft-sage/60 dark:border-paw-darkborder bg-white dark:bg-paw-darkcard overflow-hidden">
              {shown.map((e) => (
                <li key={e.id} className="flex items-center gap-4 px-4 py-3">
                  <span className="w-9 h-9 rounded-xl bg-paw-light-sage dark:bg-paw-darksurface flex items-center justify-center text-base flex-shrink-0" aria-hidden>{categoryInfo(e.category).emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-paw-dark dark:text-white truncate">{e.description || categoryInfo(e.category).label}</div>
                    <div className="text-xs text-paw-secondary dark:text-paw-warm-sage truncate">
                      {formatDateKey(e.date)} · {categoryInfo(e.category).label}{e.vendor && ` · ${e.vendor}`}{scope === 'all' && ` · ${petName(e.petId)}`}
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-paw-dark dark:text-white whitespace-nowrap">{formatMoney(e.amount, currency)}</div>
                  <button onClick={() => setEditing(e)} aria-label="Edit expense" className="p-1.5 rounded-full text-paw-secondary hover:text-paw-forest hover:bg-paw-light-sage dark:hover:bg-paw-darksurface">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            {visible.length > 12 && (
              <button onClick={() => setShowAll((v) => !v)} className="mt-3 text-sm font-bold text-paw-forest dark:text-paw-sage hover:underline">
                {showAll ? 'Show fewer' : `Show all ${visible.length}`}
              </button>
            )}
          </>
        )}
      </div>

      {editing && (
        <ExpenseFormModal
          pet={editing === 'new' ? pet : pets.find((p) => p.id === editing.petId) ?? pet}
          expense={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};
