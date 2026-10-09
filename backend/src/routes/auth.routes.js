const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { authLimiter, emailLimiter } = require('../middleware/security.middleware');
const { register, login, me, google, updateMe, changePassword, deleteMe, forgotPassword, resetPassword, exportData } = require('../controllers/auth.controller');

// Public routes — no token needed
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, google);
router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected — requires a valid JWT
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
router.put('/password', requireAuth, changePassword);
router.delete('/me', requireAuth, deleteMe);
router.get('/export', requireAuth, exportData);

module.exports = router;
