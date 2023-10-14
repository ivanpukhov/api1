const db = require('../config/database');

const Order = {
    create(data, callback) {
        const sql = 'INSERT INTO orders (firstName, lastName, phoneNumber, address, products) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products)], callback);
    },
    getAll(callback) {
        db.all('SELECT * FROM orders', callback);
    },
    getById(id, callback) {
        db.get('SELECT * FROM orders WHERE id = ?', [id], callback);
    },
    updateStatus(id, status, callback) {
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        db.run(sql, [status, id], callback);
    },
};


module.exports = Order;
