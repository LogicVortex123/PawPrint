const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { nearby } = require('../controllers/clinic.controller');

router.get('/nearby', requireAuth, nearby);

module.exports = router;
