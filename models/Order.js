const db = require('../config/database');
const axios = require('axios');
const send_message = require('../send_message');
const {getByIds} = require("./Product");  // Подключите функцию send_message


const Order = {

    async create(data, callback) {
        const sql = 'INSERT INTO orders (firstName, lastName, phoneNumber, address, products, deliveryMethod, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products), data.deliveryMethod, data.paymentMethod], async (error) => {
            if (error) {
                callback(error);
                return;
            }

            // Получение информации о продуктах
            const productIds = data.products.map(product => product.id);
            getByIds(productIds, async (error, products) => {
                if (error) {
                    callback(error);
                    return;
                }

                // Вычисление общей стоимости
                const totalCost = products.reduce((sum, product) => sum + product.price, 0);

                // Отправка сообщения
                await send_message(products, totalCost, data);

                // Вызов callback после отправки сообщения
                callback(null);
            });
        });
    },


    getAll(callback) {
        db.all('SELECT * FROM orders', callback);
    }, getById(id, callback) {
        db.get('SELECT * FROM orders WHERE id = ?', [id], callback);
    }, updateStatus(id, status, callback) {
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        db.run(sql, [status, id], callback);
    },


};


module.exports = Order;
