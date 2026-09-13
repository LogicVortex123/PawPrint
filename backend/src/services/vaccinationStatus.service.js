// TR-006: Derive Upcoming/Overdue/Completed by comparing nextDueDate to now.
// Kept out of controllers so the same rule applies to every response shape.
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
