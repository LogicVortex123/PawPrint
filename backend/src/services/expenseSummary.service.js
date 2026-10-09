// Spending summaries for the expense tracker. Pure function (no DB access) so
// the numbers are easy to unit-test and identical for web and mobile.

const EXPENSE_CATEGORIES = {
  vet: 'Vet visits',
  medication: 'Medication',
  food: 'Food & treats',
  grooming: 'Grooming',
  insurance: 'Insurance',
  supplies: 'Supplies & toys',
  training: 'Training',
  boarding: 'Boarding & sitting',
  other: 'Other',
};

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED', 'JPY'];

// Money is summed in whole cents/paise so 0.1 + 0.2 never shows as 0.30000000000000004
const toCents = (amount) => Math.round(Number(amount) * 100);
const fromCents = (cents) => cents / 100;

/**
 * @param {{ amount: number, date: string, category: string, pet: any, _id?: any, description?: string }[]} expenses
 * @param {{ year: number, todayKey: string }} options — todayKey 'YYYY-MM-DD'
 */
function summarizeExpenses(expenses, { year, todayKey }) {
  const inYear = expenses.filter((e) => typeof e.date === 'string' && e.date.startsWith(`${year}-`));
  const monthCents = Array(12).fill(0);
  const categories = new Map();
  const pets = new Map();
  let totalCents = 0;
  let largest = null;

  for (const e of inYear) {
    const cents = toCents(e.amount);
    const month = Number(e.date.slice(5, 7)) - 1;
    totalCents += cents;
    monthCents[month] += cents;

    const cat = categories.get(e.category) || { cents: 0, count: 0 };
    cat.cents += cents;
    cat.count += 1;
    categories.set(e.category, cat);

    const petKey = String(e.pet);
    pets.set(petKey, (pets.get(petKey) || 0) + cents);

    if (!largest || cents > toCents(largest.amount)) largest = e;
  }

  // For the current year, average over the months so far; past years over all 12
  const [todayYear, todayMonth] = todayKey.split('-').map(Number);
  const monthsElapsed = year === todayYear ? todayMonth : year < todayYear ? 12 : 0;

  // "This month" vs "last month" always refer to the calendar, across years
  const monthKey = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
  const thisMonthKey = monthKey(todayYear, todayMonth);
  const lastMonthKey = todayMonth === 1 ? monthKey(todayYear - 1, 12) : monthKey(todayYear, todayMonth - 1);
  const sumMonth = (key) => fromCents(expenses.filter((e) => e.date?.startsWith(`${key}-`)).reduce((s, e) => s + toCents(e.amount), 0));

  return {
    year,
    total: fromCents(totalCents),
    count: inYear.length,
    byMonth: monthCents.map(fromCents),
    byCategory: [...categories.entries()]
      .map(([category, { cents, count }]) => ({ category, label: EXPENSE_CATEGORIES[category] || category, total: fromCents(cents), count }))
      .sort((a, b) => b.total - a.total),
    byPet: Object.fromEntries([...pets.entries()].map(([pet, cents]) => [pet, fromCents(cents)])),
    thisMonth: sumMonth(thisMonthKey),
    lastMonth: sumMonth(lastMonthKey),
    monthlyAverage: monthsElapsed ? Math.round(totalCents / monthsElapsed) / 100 : 0,
    largest: largest
      ? { id: largest._id, amount: largest.amount, description: largest.description || '', category: largest.category, date: largest.date }
      : null,
  };
}

// RFC 4180 CSV — quotes fields with commas/quotes/newlines, and neutralises
// spreadsheet formulas (=, +, -, @) so an export can't run code when opened
function toCsv(rows) {
  const cell = (value) => {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text) && !/^-?\d+(\.\d+)?$/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

module.exports = { EXPENSE_CATEGORIES, CURRENCIES, summarizeExpenses, toCsv };
