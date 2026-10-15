import { Currency, ExpenseCategory } from '../types';

// "₹1,500.50" / "$12.00" — in the user's chosen currency, Indian digit grouping for INR
export function formatMoney(amount: number, currency: Currency = 'INR', opts: { compact?: boolean } = {}): string {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: opts.compact || currency === 'JPY' ? 0 : 2,
      minimumFractionDigits: opts.compact || currency === 'JPY' ? 0 : 2,
      notation: opts.compact && amount >= 100_000 ? 'compact' : 'standard',
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
  { value: 'AUD', label: 'A$ Australian Dollar (AUD)' },
  { value: 'CAD', label: 'C$ Canadian Dollar (CAD)' },
  { value: 'SGD', label: 'S$ Singapore Dollar (SGD)' },
  { value: 'AED', label: 'AED UAE Dirham (AED)' },
  { value: 'JPY', label: '¥ Japanese Yen (JPY)' },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: 'vet', label: 'Vet visits', emoji: '🏥' },
  { value: 'medication', label: 'Medication', emoji: '💊' },
  { value: 'food', label: 'Food & treats', emoji: '🍖' },
  { value: 'grooming', label: 'Grooming', emoji: '✂️' },
  { value: 'insurance', label: 'Insurance', emoji: '🛡️' },
  { value: 'supplies', label: 'Supplies & toys', emoji: '🧸' },
  { value: 'training', label: 'Training', emoji: '🎓' },
  { value: 'boarding', label: 'Boarding & sitting', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '📦' },
];

export const categoryInfo = (c: ExpenseCategory) => EXPENSE_CATEGORIES.find((x) => x.value === c) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

// What an expense's category reads as: the owner's own name for an "other"
// expense when they typed one, otherwise the built-in label
export const expenseCategoryLabel = (e: { category: ExpenseCategory; customCategory?: string }) =>
  (e.category === 'other' && e.customCategory?.trim()) || categoryInfo(e.category).label;
