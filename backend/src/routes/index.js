const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/pets', require('./pet.routes'));
router.use('/vaccinations', require('./vaccination.routes'));
router.use('/appointments', require('./appointment.routes'));
router.use('/clinics', require('./clinic.routes'));

module.exports = router;
