const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth.middleware');
const { chatLimiter } = require('../middleware/security.middleware');
const { status, chat } = require('../controllers/assistant.controller');

// Both work signed out (general help) and signed in (answers from the pet's records)
router.get('/status', optionalAuth, status);
router.post('/chat', chatLimiter, optionalAuth, chat);

module.exports = router;
