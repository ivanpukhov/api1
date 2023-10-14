
const Product = require('../models/Product');
const productController = {
    createProduct(req, res) {
        Product.create(req.body, function(err) {
            if (err) return res.status(500).json({ error: 'Failed to add product' });
            res.status(200).json({ message: 'Product added successfully' });
        });
    },

    createProducts(req, res) {
        const products = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'No products provided' });
        }

        Product.createMany(products, function (err) {
            if (err) return res.status(500).json({ error: 'Failed to add products' });
            res.status(200).json({ message: 'Products added successfully' });
        });
    },
    getAllProducts(req, res) {
        Product.getAll(function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch products' });
            res.status(200).json(products);
        });
    },
    getProductById(req, res) {
        Product.getById(req.params.id, function(err, product) {
            if (err) return res.status(500).json({ error: 'Failed to fetch product' });
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.status(200).json(product);
        });
    },
    updateProduct(req, res) {
        Product.update(req.params.id, req.body, function(err) {
            if (err) return res.status(500).json({ error: 'Failed to update product' });
            res.status(200).json({ message: 'Product updated successfully' });
        });
    },
    deleteProduct(req, res) {
        Product.delete(req.params.id, function(err) {
            if (err) return res.status(500).json({ error: 'Failed to delete product' });
            res.status(200).json({ message: 'Product deleted successfully' });
        });
    },
    getTopProducts (req, res) {
        Product.getTopProducts(function (err, products) {
            console.log("Error:", err);  // Для диагностики
            console.log("Products:", products);  // Для диагностики
            if (err) return res.status(500).json({error: 'Failed to fetch top products'});
            if (products.length === 0) {
                return res.status(200).json([]);  // Вернуть пустой массив, если нет подходящих продуктов
            }
            res.status(200).json(products);
        });
    },
    getTopProductsByCategory(req, res) {
        const category = req.params.category;
        Product.getTopProductsByCategory(category, function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch top products' });
            if (products.length === 0) {
                return res.status(200).json([]);  // Вернуть пустой массив, если нет подходящих продуктов
            }
            res.status(200).json(products);
        });
    },


};
module.exports = productController;
