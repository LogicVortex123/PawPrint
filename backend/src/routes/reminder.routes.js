const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { list, sendTest, emailStatus } = require('../controllers/reminder.controller');

router.get('/', requireAuth, list);
router.post('/send-test', requireAuth, sendTest);
router.get('/email-status', requireAuth, emailStatus);

module.exports = router;

