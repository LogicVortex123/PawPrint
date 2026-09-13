const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { update } = require('../controllers/vaccination.controller');

// Top-level per TRD Section 7: PUT /vaccinations/:id
router.put('/:id', requireAuth, update);

module.exports = router;
