const Product = require('../models/Product');
const esClient = require('../config/elasticsearch');  // Import Elasticsearch client

const productController = {
    // Create a single product
    async createProduct(req, res) {
        try {
            Product.create(req.body, async function(err, newProduct) {
                if (err) return res.status(500).json({ error: 'Failed to add product' });

                // Index new product to Elasticsearch
                await Product.indexProduct(newProduct);

                res.status(200).json({ message: 'Product added successfully' });
            });
        } catch (err) {
            res.status(500).json({ error: 'An error occurred' });
        }
    },

    // Create multiple products
    async createProducts(req, res) {
        const products = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'No products provided' });
        }

        // Your existing logic to add multiple products
        Product.createMany(products, async function(err) {
            if (err) return res.status(500).json({ error: 'Failed to add products' });

            // Index all new products to Elasticsearch
            for (const product of products) {
                await Product.indexProduct(product);
            }

            res.status(200).json({ message: 'Products added successfully' });
        });
    },

    // Get all products
    getAllProducts(req, res) {
        Product.getAll(function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch products' });
            res.status(200).json(products);
        });
    },

    // Get a single product by ID
    getProductById(req, res) {
        Product.getById(req.params.id, function(err, product) {
            if (err) return res.status(500).json({ error: 'Failed to fetch product' });
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.status(200).json(product);
        });
    },

    // Update a single product
    async updateProduct(req, res) {
        try {
            Product.update(req.params.id, req.body, async function(err) {
                if (err) return res.status(500).json({ error: 'Failed to update product' });

                // Update product in Elasticsearch
                const updatedProduct = { id: req.params.id, ...req.body };
                await Product.indexProduct(updatedProduct);

                res.status(200).json({ message: 'Product updated successfully' });
            });
        } catch (err) {
            res.status(500).json({ error: 'An error occurred' });
        }
    },

    // Delete a product
    async deleteProduct(req, res) {
        Product.delete(req.params.id, async function(err) {
            if (err) return res.status(500).json({ error: 'Failed to delete product' });

            // Delete product from Elasticsearch
            await Product.deleteFromIndex(req.params.id);

            res.status(200).json({ message: 'Product deleted successfully' });
        });
    },

    // Get top products
    getTopProducts(req, res) {
        Product.getTopProducts(function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch top products' });
            if (products.length === 0) {
                return res.status(200).json([]);  // Return an empty array if no suitable products
            }
            res.status(200).json(products);
        });
    },

    // Get top products by category
    getTopProductsByCategory(req, res) {
        const category = req.params.category;
        Product.getTopProductsByCategory(category, function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch top products' });
            if (products.length === 0) {
                return res.status(200).json([]);  // Return an empty array if no suitable products
            }
            res.status(200).json(products);
        });
    },

    getCategoryProductsByCategory(req, res) {
        const category = req.params.category;
        Product.getCategoryProductsByCategory(category, function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch top products' });
            if (products.length === 0) {
                return res.status(200).json([]);  // Return an empty array if no suitable products
            }
            res.status(200).json(products);
        });
    },

    async searchProducts(req, res) {

        const query = req.query.q;

        try {
            const results = await Product.search(query);

            if (results.length > 0) {
                console.log("Search successful, sending results"); // Четвертый лог: успешный поиск, отправка результатов
                res.status(200).json(results);
            } else {
                console.log("No products found, sending empty array"); // Пятый лог: поиск неудачный, отправка пустого массива
                res.status(200).json([]);
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred during the search' });
        }
    },

    getAllSubcategoriesByCategory(req, res) {
        const category = req.params.category;
        Product.getAllSubcategoriesByCategory(category, function(err, subcategories) {
            if (err) return res.status(500).json({ error: 'Failed to fetch subcategories' });
            res.status(200).json(subcategories);
        });
    },

    getAllCategories(req, res) {
        Product.getAllCategories(function(err, categories) {
            if (err) return res.status(500).json({ error: 'Failed to fetch categories' });
            res.status(200).json(categories);
        });
    },

    getProductsBySubcategory(req, res) {
        const subcategory = req.params.subcategory;
        Product.getProductsBySubcategory(subcategory, function(err, products) {
            if (err) return res.status(500).json({ error: 'Failed to fetch products' });
            res.status(200).json(products);
        });
    },


    async searchProductsInCategory(req, res) {
        const query = req.query.q;
        const category = req.query.category;  // Получаем категорию из запроса

        try {
            const results = await Product.searchInCategory(query, category); // Используем новый метод поиска в категории

            if (results.length > 0) {
                console.log("Search in category successful, sending results");
                res.status(200).json(results);
            } else {
                console.log("No products found in category, sending empty array");
                res.status(200).json([]);
            }
        } catch (error) {
            res.status(500).json({ error: 'An error occurred during the search in category' });
        }
    }


};

module.exports = productController;
