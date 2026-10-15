const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES } = require('../services/expenseSummary.service');

// One thing spent on a pet: a vet bill, food, grooming, insurance... `date` is
// a plain 'YYYY-MM-DD' calendar day so monthly totals never shift by timezone.
const expenseSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    category: { type: String, enum: Object.keys(EXPENSE_CATEGORIES), required: true, default: 'other' },
    // The owner's own name for an "other" expense (e.g. "Daycare", "Pet taxi")
    customCategory: { type: String, trim: true, maxlength: [40, 'Category name must be 40 characters or fewer'] },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be more than zero'],
      max: [10_000_000, 'Amount is too large'],
    },
    date: { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'] },
    description: { type: String, trim: true, maxlength: 120 },
    vendor: { type: String, trim: true, maxlength: 120 }, // clinic, shop, groomer
    // Set when the cost was logged from a completed vet appointment
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  },
  { timestamps: true }
);

expenseSchema.index({ owner: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
