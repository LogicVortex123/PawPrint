const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { publicLimiter } = require('../middleware/security.middleware');
const { revoke, viewPublic } = require('../controllers/share.controller');

// Public — whoever holds the link can read the summary, no account needed
router.get('/public/:token', publicLimiter, viewPublic);

// Per-pet list/create live under /pets/:id/shares
router.delete('/:id', requireAuth, revoke);

module.exports = router;
