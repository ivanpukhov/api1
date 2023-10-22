const db = require('../config/database');
const axios = require('axios');
const send_message = require('../send_message');
const {getByIds} = require("./Product");  // Подключите функцию send_message


const Order = {

    async create(data, callback) {
        const sql = 'INSERT INTO orders (firstName, lastName, phoneNumber, address, products, deliveryMethod, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, "1")';
        db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products), data.deliveryMethod, data.paymentMethod], function (error) {  // замените стрелочную функцию на обычную функцию
            if (error) {
                callback(error);
                return;
            }

            const orderId = this.lastID;  // Получите ID нового заказа

            // Получение информации о продуктах
            const productIds = data.products.map(product => product.id);
            getByIds(productIds, async (error, products) => {
                if (error) {
                    callback(error);
                    return;
                }

                // Объединение информации о количестве с информацией о продуктах
                const productsWithQuantities = products.map((product, index) => {
                    return {
                        ...product,
                        quantity: data.products[index].quantity
                    };
                });

                // Вычисление общей стоимости
                const totalCost = productsWithQuantities.reduce((sum, product) => sum + (product.price * product.quantity), 0);

                // Отправка сообщения
                await send_message(productsWithQuantities, totalCost, data, orderId);  // Передайте orderId в send_message

                // Вызов callback после отправки сообщения
                callback(null);
            });
        });
    },

    delete(id, callback) {
        db.run('DELETE FROM orders WHERE id = ?', [id], callback);
    },

    update(id, data, callback) {
        const sql = 'UPDATE orders SET firstName = ?, lastName = ?, phoneNumber = ?, address = ?, products = ?, deliveryMethod = ?, paymentMethod = ? WHERE id = ?';
        db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products), data.deliveryMethod, data.paymentMethod, id], callback);
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
