// Vaccination status is derived on every read by comparing nextDueDate to today.
// We never store it in the DB because it would go stale without an active background job.
function deriveVaccinationStatus(nextDueDate, now = new Date()) {
  const due = new Date(nextDueDate);
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue <= 30) return 'Upcoming';
  return 'Completed';
}

function withStatus(vaccination) {
  const obj = vaccination.toObject ? vaccination.toObject() : vaccination;
  return { ...obj, status: deriveVaccinationStatus(obj.nextDueDate) };
}

module.exports = { deriveVaccinationStatus, withStatus };
