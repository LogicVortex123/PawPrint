const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { list, update, remove, summary, exportCsv } = require('../controllers/expense.controller');

router.use(requireAuth);

// Per-pet create lives under /pets/:id/expenses
router.get('/', list);
router.get('/summary', summary);
router.get('/export.csv', exportCsv);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
