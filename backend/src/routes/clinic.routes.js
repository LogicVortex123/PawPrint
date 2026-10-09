const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const { nearby, favorites, addFavorite, removeFavorite } = require('../controllers/clinic.controller');

router.use(requireAuth);

router.get('/nearby', nearby);
router.get('/favorites', favorites);
router.put('/:id/favorite', addFavorite);
router.delete('/:id/favorite', removeFavorite);

module.exports = router;
