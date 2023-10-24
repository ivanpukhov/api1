const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');
const {find} = require("../models/Product");
const Product = require("../models/Product");

router.get('/autocomplete', SearchController.getAutocomplete);

router.get('/autocompleter', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const products = await Product.search(q);
        res.json(products);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
