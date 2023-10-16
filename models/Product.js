const db = require('../config/database');
const esClient = require('../config/elasticsearch'); // Подключение Elasticsearch клиента

const Product = {
    create(data, callback) {
        const isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
        const sql = 'INSERT INTO products (name, description, price, subcategory, category, imageUrl, rating, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [data.name, data.description, data.price, data.subcategory, data.category, data.imageUrl, 1, isAvailable], callback);
    },
    createMany(products, callback) {
        const sql = 'INSERT INTO products (name, description, price, subcategory, category, imageUrl, rating) VALUES (?, ?, ?, ?, ?, ?, ?)';
        let completed = 0;
        products.forEach((product) => {
            db.run(sql, [product.name, product.description, product.price, product.subcategory, product.category, product.imageUrl, product.rating], (err) => {
                completed++;
                if (completed === products.length) {
                    callback(err);
                }
            });
        });
    },
    getAll(callback) {
        db.all('SELECT * FROM products', callback);
    },
    getById(id, callback) {
        db.get('SELECT * FROM products WHERE id = ?', [id], callback);
    },
    update(id, data, callback) {
        const sql = 'UPDATE products SET name = ?, description = ?, price = ?, subcategory = ?, category = ?, imageUrl = ?, rating = ? WHERE id = ?';
        db.run(sql, [data.name, data.description, data.price, data.subcategory, data.category, data.imageUrl, data.rating, id], callback);
    },
    delete(id, callback) {
        db.run('DELETE FROM products WHERE id = ?', [id], callback);
    },
    getTopProducts(callback) {
        db.all('SELECT * FROM products ORDER BY rating DESC LIMIT 12', callback);
    },
    getTopProductsByCategory(category, callback) {
        db.all('SELECT * FROM products WHERE category = ? ORDER BY rating DESC LIMIT 12', [category], callback);
    },
    getCategoryProductsByCategory(category, callback) {
        db.all('SELECT * FROM products WHERE category = ? ORDER BY rating DESC ', [category], callback);
    },
    // Elasticsearch methods
    async indexProduct(product) {
        await esClient.index({
            index: 'products',
            id: product.id,
            body: {
                name: product.name,
                description: product.description,
                category: product.category,
                subcategory: product.subcategory
            }
        });
    },
    async deleteFromIndex(id) {
        await esClient.delete({
            index: 'products',
            id: id
        });
    },


    async  search(query) {
        try {
            console.log("Elasticsearch query being sent:", { index: 'products', q: query });
            const response = await esClient.search({
                index: 'products',
                body: {
                    query: {
                        multi_match: {
                            query: query,
                            fields: ['name^5', 'description'],
                            fuzziness: 'AUTO'
                        }
                    },
                    "size": 50

                }
            });

            console.log("Elasticsearch raw response:", JSON.stringify(response, null, 2));

            if (response && response.hits && response.hits.hits) {
                return response.hits.hits.map(hit => hit._source);
            }

            console.log("No hits in Elasticsearch response");
            return [];
        } catch (error) {
            console.error("An error occurred during the Elasticsearch search:", error);
            throw error;
        }
    },

    async searchInCategory(query, category) {
        try {
            console.log("Elasticsearch query being sent:", { index: 'products', q: query, category: category });
            const response = await esClient.search({
                index: 'products',
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    multi_match: {
                                        query: query,
                                        fields: ['name^5', 'description'],
                                        fuzziness: 'AUTO'
                                    }
                                }
                            ],
                            filter: [
                                {
                                    term: { "category": category }
                                }
                            ]
                        }
                    },
                    "size": 50
                }
            });

            console.log("Elasticsearch raw response:", JSON.stringify(response, null, 2));

            if (response && response.hits && response.hits.hits) {
                return response.hits.hits.map(hit => hit._source);
            }

            console.log("No hits in Elasticsearch response");
            return [];
        } catch (error) {
            console.error("An error occurred during the Elasticsearch search:", error);
            throw error;
        }
    }






};

module.exports = Product;
