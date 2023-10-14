
const db = require('../config/database');
const Product = {
    create(data, callback) {
        const isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
        const sql = 'INSERT INTO products (name, description, price, subcategory, category, imageUrl, rating, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [data.name, data.description, data.price, data.subcategory, data.category, data.imageUrl, data.rating, isAvailable], callback);
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



};


module.exports = Product;
