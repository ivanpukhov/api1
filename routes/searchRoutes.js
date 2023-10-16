const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');

router.get('/autocomplete', SearchController.getAutocomplete);

module.exports = router;
