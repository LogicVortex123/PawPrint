const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { register, login, me, google } = require('../controllers/auth.controller');

// Public routes — no token needed
router.post('/register', register);
router.post('/login', login);
router.post('/google', google);

// Protected — requires a valid JWT
router.get('/me', requireAuth, me);

module.exports = router;
