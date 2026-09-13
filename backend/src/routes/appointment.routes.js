const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { list, create, update } = require('../controllers/appointment.controller');

router.use(requireAuth);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);

module.exports = router;
