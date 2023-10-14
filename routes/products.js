const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController'); // Путь должен вести к вашему productController
const authController = require('../controllers/authController'); // Путь должен вести к вашему authController




router.post('/', authController.authenticateJWT, productController.createProduct);
router.post('/many', authController.authenticateJWT, productController.createProducts);
router.get('/', productController.getAllProducts);
router.get('/top', productController.getTopProducts);
router.get('/top/:category', productController.getTopProductsByCategory);

router.get('/:id', productController.getProductById);
router.put('/:id', authController.authenticateJWT, productController.updateProduct);
router.delete('/:id', authController.authenticateJWT, productController.deleteProduct);


module.exports = router;
