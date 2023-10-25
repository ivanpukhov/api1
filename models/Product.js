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
            db.run(sql, [product.name, product.description, product.price, product.subcategory, product.category, product.imageUrl, product.rating], async function(err) {
                if (err) {
                    // Handle error
                    callback(err);
                    return;
                }
                // Assume productID is the id of the inserted product
                product.id = this.lastID;  // Update product object with new id
                console.log('Product ID:', product.id);

                // Now index the product in Elasticsearch
                console.log('Product before indexing:', product);

                try {
                    await Product.indexProduct(product);
                } catch (indexErr) {
                    // Handle Elasticsearch indexing error
                    callback(indexErr);
                    return;
                }
                console.log('Product after indexing:', product);


                completed++;
                if (completed === products.length) {
                    callback(null);  // No error
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

    getByIds(ids, callback) {
        const placeholders = ids.map(() => '?').join(',');
        const sql = `SELECT * FROM products WHERE id IN (${placeholders})`;
        db.all(sql, ids, callback);
    },


    getAllCategories(callback) {
        db.all('SELECT DISTINCT category FROM products', callback);
    },

    // Elasticsearch method
    // s
    async indexProduct(product) {
        await esClient.index({
            index: 'products',
            id: product.id.toString(),  // Убедитесь, что id является строкой
            body: {
                id: product.id,  // Добавьте это поле
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                subcategory: product.subcategory,
                imageUrl: product.imageUrl
            }
        });
    },



    async deleteFromIndex(id) {
        await esClient.delete({
            index: 'products',
            id: id
        });
    },


    async search(query) {
        try {
            console.log("Elasticsearch query being sent:", {index: 'products', q: query});
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

    getAllSubcategoriesByCategory(category, callback) {
        db.all('SELECT DISTINCT subcategory FROM products WHERE category = ?', [category], callback);
    },

    getProductsBySubcategory(subcategory, callback) {
        db.all('SELECT * FROM products WHERE subcategory = ?', [subcategory], callback);
    },


    async searchInCategory(query, category) {
        try {
            console.log("Elasticsearch query being sent:", {index: 'products', q: query, category: category});
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
                                    term: {"category": category}
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
