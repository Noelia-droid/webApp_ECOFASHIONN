const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// Públicas
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Protegidas (admin y vendedor)
router.post('/', auth, rbac(['admin', 'vendedor']), productController.create);
router.put('/:id', auth, rbac(['admin', 'vendedor']), productController.update);
router.delete('/:id', auth, rbac(['admin']), productController.delete);

module.exports = router;