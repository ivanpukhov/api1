const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');


router.post('/', orderController.createOrder);
router.get('/', authController.authenticateJWT, orderController.getAllOrders);
router.get('/:id', authController.authenticateJWT, orderController.getOrderById);
router.put('/:id/status', authController.authenticateJWT, orderController.updateOrderStatus);

module.exports = router;
