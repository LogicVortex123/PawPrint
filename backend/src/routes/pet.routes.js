const router = require('express').Router();
const requireAuth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { listPets, getPet, createPet, updatePet, deletePet } = require('../controllers/pet.controller');
const vaccinationController = require('../controllers/vaccination.controller');
const weightController = require('../controllers/weight.controller');
const documentController = require('../controllers/document.controller');

router.use(requireAuth);

router.get('/', listPets);
router.post('/', createPet);
router.get('/:id', getPet);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

// Nested per TRD Section 7: GET/POST /pets/:id/vaccinations|weights|documents
router.get('/:id/vaccinations', vaccinationController.listForPet);
router.post('/:id/vaccinations', vaccinationController.createForPet);

router.get('/:id/weights', weightController.listForPet);
router.post('/:id/weights', weightController.createForPet);

router.get('/:id/documents', documentController.listForPet);
router.post('/:id/documents', upload.single('file'), documentController.createForPet);

module.exports = router;
