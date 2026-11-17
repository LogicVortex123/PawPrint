export type VaccinationStatus = 'Overdue' | 'Upcoming' | 'Completed';

// Same rule as the API: overdue if the due date has passed, upcoming within 30 days, otherwise completed.
export function deriveVaccinationStatus(nextDueDate: string, now = new Date()): VaccinationStatus {
  const due = new Date(nextDueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue <= 30) return 'Upcoming';
  return 'Completed';
}
