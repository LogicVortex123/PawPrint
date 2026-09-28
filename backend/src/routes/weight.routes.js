const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { update, remove } = require('../controllers/weight.controller');

// Top-level like /vaccinations/:id — list/create stay nested under /pets/:id/weights
router.use(requireAuth);

router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
