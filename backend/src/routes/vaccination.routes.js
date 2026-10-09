const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { update, remove, catalog } = require('../controllers/vaccination.controller');

router.use(requireAuth);

// Suggested vaccines and booster intervals per species
router.get('/catalog', catalog);

// Top-level per TRD Section 7: PUT /vaccinations/:id — list/create stay nested under /pets/:id/vaccinations
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
