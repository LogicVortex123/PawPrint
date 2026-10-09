const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/pets', require('./pet.routes'));
router.use('/vaccinations', require('./vaccination.routes'));
router.use('/weights', require('./weight.routes'));
router.use('/documents', require('./document.routes'));
router.use('/appointments', require('./appointment.routes'));
router.use('/clinics', require('./clinic.routes'));
router.use('/reminders', require('./reminder.routes'));
router.use('/medications', require('./medication.routes'));
router.use('/shares', require('./share.routes'));
router.use('/expenses', require('./expense.routes'));

module.exports = router;
