const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/top', productController.getTopProducts);
router.get('/top/:category', productController.getTopProductsByCategory);

router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);


module.exports = router;
