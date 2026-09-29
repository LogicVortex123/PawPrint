const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { list } = require('../controllers/reminder.controller');

router.get('/', requireAuth, list);

module.exports = router;
