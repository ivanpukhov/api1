const db = require('../config/database');
const esClient = require('../config/elasticsearch'); // Подключение Elasticsearch клиента

const Product = {
updateAvailability(id, isAvailable, callback) {
    const sql = 'UPDATE products SET isAvailable = ? WHERE id = ?';
    db.run(sql, [isAvailable, id], callback);
},
    create(data, callback) {
        const isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
        const discont = data.discont !== undefined ? data.discont : 5;  // Устанавливаем 5% по умолчанию
        const sql = 'INSERT INTO products (name, description, price, subcategory, category, imageUrl, rating, isAvailable, discont) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [data.name, data.description, data.price, data.subcategory, data.category, data.imageUrl, 1, isAvailable, discont], callback);
    },

    createMany(products, callback) {
        const sql = 'INSERT INTO products (name, description, price, subcategory, category, imageUrl, rating, discont) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        let completed = 0;
        products.forEach((product) => {
            const discont = product.discont !== undefined ? product.discont : 5;  // Устанавливаем 5% по умолчанию
            db.run(sql, [product.name, product.description, product.price, product.subcategory, product.category, product.imageUrl, product.rating, discont], async function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                product.id = this.lastID;

                try {
                    await Product.indexProduct(product);
                } catch (indexErr) {
                    callback(indexErr);
                    return;
                }

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
    // Получаем текущие значения из БД
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            callback(err);
            return;
        }

        // Определяем значение isAvailable
        let isAvailableValue;
        if (data.isAvailable === undefined) {
            isAvailableValue = (product.isAvailable === undefined || product.isAvailable === null) ? 1 : product.isAvailable;
        } else {
            isAvailableValue = data.isAvailable;
        }

        // Подготовка обновленных данных
        const updatedProduct = {
            name: data.name || product.name,
            description: data.description || product.description,
            price: data.price || product.price,
            subcategory: data.subcategory || product.subcategory,
            category: data.category || product.category,
            imageUrl: data.imageUrl || product.imageUrl,
            rating: data.rating || product.rating,
            isAvailable: isAvailableValue
        };

        const sql = 'UPDATE products SET name = ?, description = ?, price = ?, subcategory = ?, category = ?, imageUrl = ?, rating = ?, isAvailable = ? WHERE id = ?';
        db.run(sql, [updatedProduct.name, updatedProduct.description, updatedProduct.price, updatedProduct.subcategory, updatedProduct.category, updatedProduct.imageUrl, updatedProduct.rating, updatedProduct.isAvailable, id], callback);
    });
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
                            fields: ['name^5', 'description', 'category', 'subcategory'],
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
