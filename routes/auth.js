const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Путь должен вести к вашему authController

// Роут для входа в систему
router.post('/login', authController.login);

module.exports = router;

