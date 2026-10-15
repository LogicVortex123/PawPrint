const Expense = require('../models/Expense.model');
const Pet = require('../models/Pet.model');
const Appointment = require('../models/Appointment.model');
const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findOwnedPetOrFail } = require('../services/petAccess.service');
const { EXPENSE_CATEGORIES, categoryLabel, summarizeExpenses, toCsv } = require('../services/expenseSummary.service');
const { isDateKey, localDateKey } = require('../services/medicationSchedule.service');
const { pick, requireNumber, optionalString } = require('../utils/validate');

const MAX_LIST = 1000;

function todayFrom(req) {
  return isDateKey(req.query.date) ? req.query.date : localDateKey();
}

function yearFrom(req, todayKey) {
  const year = Number(req.query.year);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : Number(todayKey.slice(0, 4));
}

// Validates and normalises the editable fields of an expense
async function readExpenseFields(body, userId, { partial = false } = {}) {
  const fields = pick(body, ['category', 'customCategory', 'amount', 'date', 'description', 'vendor', 'appointment']);

  if (!partial || fields.amount !== undefined) {
    fields.amount = Math.round(requireNumber(fields.amount, 'Amount', { min: 0, max: 10_000_000 }) * 100) / 100;
    // A zero (or rounds-to-zero) amount isn't a cost and would only skew the averages
    if (fields.amount <= 0) throw new ApiError(400, 'Amount must be more than zero');
  }
  if (!partial || fields.date !== undefined) {
    if (!isDateKey(fields.date)) throw new ApiError(400, 'A valid date is required');
  }
  if (fields.category !== undefined && !EXPENSE_CATEGORIES[fields.category]) throw new ApiError(400, 'Unknown expense category');
  if (fields.description !== undefined) fields.description = optionalString(fields.description, 'Description', { max: 120 });
  if (fields.vendor !== undefined) fields.vendor = optionalString(fields.vendor, 'Where', { max: 120 });
  // A blank custom name means plain "Other" — unset it rather than storing ''
  if (fields.customCategory !== undefined) fields.customCategory = optionalString(fields.customCategory, 'Category name', { max: 40 }) || undefined;

  // Linking to an appointment only works for the user's own appointments
  if (fields.appointment) {
    if (typeof fields.appointment !== 'string') throw new ApiError(400, 'Invalid appointment');
    const exists = await Appointment.exists({ _id: fields.appointment, owner: userId });
    if (!exists) throw new ApiError(404, 'Appointment not found');
  } else if (fields.appointment === null || fields.appointment === '') {
    fields.appointment = undefined;
  }
  return fields;
}

// A custom name only belongs to "other" — switching to a built-in category drops it
function keepCustomCategoryForOther(expense) {
  if (expense.category !== 'other') expense.customCategory = undefined;
}

// GET /expenses?pet=&year=&category= — newest first
const list = asyncHandler(async (req, res) => {
  const query = { owner: req.userId };
  if (req.query.pet) {
    await findOwnedPetOrFail(req.query.pet, req.userId);
    query.pet = req.query.pet;
  }
  if (req.query.year) query.date = { $regex: `^${yearFrom(req, todayFrom(req))}-` };
  if (typeof req.query.category === 'string' && EXPENSE_CATEGORIES[req.query.category]) query.category = req.query.category;

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).limit(MAX_LIST);
  res.json(expenses);
});

// POST /pets/:id/expenses
const createForPet = asyncHandler(async (req, res) => {
  await findOwnedPetOrFail(req.params.id, req.userId);
  const fields = await readExpenseFields(req.body, req.userId);
  const expense = new Expense({ category: 'other', ...fields, pet: req.params.id, owner: req.userId });
  keepCustomCategoryForOther(expense);
  await expense.save();
  res.status(201).json(expense);
});

async function findOwnedExpenseOrFail(id, userId) {
  const expense = await Expense.findOne({ _id: id, owner: userId });
  if (!expense) throw new ApiError(404, 'Expense not found');
  return expense;
}

// PUT /expenses/:id — can also move the expense to another of the user's pets
const update = asyncHandler(async (req, res) => {
  const expense = await findOwnedExpenseOrFail(req.params.id, req.userId);
  const fields = await readExpenseFields(req.body, req.userId, { partial: true });
  if (req.body.pet && String(req.body.pet) !== String(expense.pet)) {
    await findOwnedPetOrFail(req.body.pet, req.userId);
    expense.pet = req.body.pet;
  }
  Object.assign(expense, fields);
  keepCustomCategoryForOther(expense);
  await expense.save();
  res.json(expense);
});

// DELETE /expenses/:id
const remove = asyncHandler(async (req, res) => {
  const expense = await findOwnedExpenseOrFail(req.params.id, req.userId);
  await expense.deleteOne();
  res.status(204).send();
});

// GET /expenses/summary?year=2026&pet=<id>&date=YYYY-MM-DD
const summary = asyncHandler(async (req, res) => {
  const todayKey = todayFrom(req);
  const year = yearFrom(req, todayKey);
  const query = { owner: req.userId };
  if (req.query.pet) {
    await findOwnedPetOrFail(req.query.pet, req.userId);
    query.pet = req.query.pet;
  }
  // The selected year, plus last December so "last month" works in January
  query.date = { $gte: `${Math.min(year, Number(todayKey.slice(0, 4))) - 1}-12-01` };

  const [expenses, user] = await Promise.all([
    Expense.find(query).select('amount date category customCategory pet description').lean(),
    User.findById(req.userId).select('preferences.currency').lean(),
  ]);
  res.json({ currency: user?.preferences?.currency || 'INR', ...summarizeExpenses(expenses, { year, todayKey }) });
});

// GET /expenses/export.csv?year= — spreadsheet download
const exportCsv = asyncHandler(async (req, res) => {
  const query = { owner: req.userId };
  if (req.query.year) query.date = { $regex: `^${yearFrom(req, todayFrom(req))}-` };

  const [expenses, pets, user] = await Promise.all([
    Expense.find(query).sort({ date: 1 }).lean(),
    Pet.find({ owner: req.userId }).select('name').lean(),
    User.findById(req.userId).select('preferences.currency').lean(),
  ]);
  const petName = new Map(pets.map((p) => [String(p._id), p.name]));
  const currency = user?.preferences?.currency || 'INR';

  const csv = toCsv([
    ['Date', 'Pet', 'Category', 'Description', 'Where', `Amount (${currency})`],
    ...expenses.map((e) => [e.date, petName.get(String(e.pet)) || '', categoryLabel(e), e.description || '', e.vendor || '', e.amount.toFixed(2)]),
  ]);

  const suffix = req.query.year ? `-${yearFrom(req, todayFrom(req))}` : '';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="pawprint-expenses${suffix}.csv"`);
  // BOM so Excel opens the file as UTF-8 (₹, €, names with accents)
  res.send(`﻿${csv}\r\n`);
});

module.exports = { list, createForPet, update, remove, summary, exportCsv };
