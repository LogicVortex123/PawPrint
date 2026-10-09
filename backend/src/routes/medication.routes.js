const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { list, update, remove, markDose, unmarkDose } = require('../controllers/medication.controller');

router.use(requireAuth);

// Per-pet list/create live under /pets/:id/medications
router.get('/', list);
router.put('/:id', update);
router.delete('/:id', remove);
router.post('/:id/doses', markDose);
router.delete('/:id/doses', unmarkDose);

module.exports = router;
