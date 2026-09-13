const router = require('express').Router();
const { register, login, google } = require('../controllers/auth.controller');

// TRD Section 7: the only endpoints that do NOT require a JWT.
router.post('/register', register);
router.post('/login', login);
router.post('/google', google);

module.exports = router;
