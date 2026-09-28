const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { remove } = require('../controllers/document.controller');

// Top-level like /vaccinations/:id — list/upload stay nested under /pets/:id/documents
router.delete('/:id', requireAuth, remove);

module.exports = router;
