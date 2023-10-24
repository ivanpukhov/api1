const db = require('../config/database');
const axios = require('axios');
const send_message = require('../send_message');
const {getByIds} = require("./Product");  // Подключите функцию send_message
const moment = require('moment-timezone');


const Order = {

    async create(data, callback) {
        const astanaTime = moment.tz("Asia/Almaty").format('YYYY-MM-DD HH:mm:ss');

        // Получаем полную информацию о продуктах по их IDs
        const productIds = data.products.map(product => product.id);
        getByIds(productIds, async (error, products) => {
            if (error) {
                callback(error);
                return;
            }

            // Вычисляем totalCost на основе полученной информации о продуктах
            const totalCost = data.products.reduce((sum, product) => {
                const fullProductInfo = products.find(p => p.id === product.id);
                return sum + (fullProductInfo.price * product.quantity * 0.95); // скидка 5%
            }, 0);

            // SQL-запрос для добавления нового заказа
            const sql = `
INSERT INTO orders 
(firstName, lastName, phoneNumber, address, products, status, deliveryMethod, paymentMethod, totalCost, createdAt) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

            db.run(sql,
                [
                    data.firstName,
                    data.lastName,
                    data.phoneNumber,
                    data.address,
                    JSON.stringify(data.products),
                    data.status || "1",
                    data.deliveryMethod,
                    data.paymentMethod,
                    totalCost,
                    astanaTime  // Используем переменную astanaTime
                ],
                async function (error) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    const orderId = this.lastID;  // Получаем ID нового заказа

                    // Объединение информации о количестве с информацией о продуктах
                    const productsWithQuantities = products.map((product, index) => {
                        return {
                            ...product,
                            quantity: data.products[index].quantity
                        };
                    });

                    // Отправляем сообщение (если у вас есть такая функциональность)
                    await send_message(productsWithQuantities, totalCost, data, orderId);

                    // Вызываем callback
                    callback(null, {id: orderId, totalCost});
                }
            );
        });
    },


    delete(id, callback) {
        db.run('DELETE FROM orders WHERE id = ?', [id], callback);
    },

    update(id, data, callback) {
        const sql = 'UPDATE orders SET firstName = ?, lastName = ?, phoneNumber = ?, address = ?, products = ?, deliveryMethod = ?, paymentMethod = ? WHERE id = ?';
        db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products), data.deliveryMethod, data.paymentMethod, id], callback);
    },

    getTotalOrders(startDate, endDate, callback) {
        db.get(`SELECT COUNT(*) as totalOrders FROM orders WHERE DATE(createdAt) BETWEEN ? AND ?`, [startDate, endDate], callback);
    },

    getRevenueByPeriod(startDate, endDate, callback) {
        db.get(`SELECT SUM(totalCost) as revenue FROM orders WHERE DATE(createdAt) BETWEEN ? AND ?`, [startDate, endDate], callback);
    },

    getAverageCheckByPeriod(startDate, endDate, callback) {
        db.get(`SELECT AVG(totalCost) as averageCheck FROM orders WHERE DATE(createdAt) BETWEEN ? AND ?`, [startDate, endDate], callback);
    },

    getOrderStatusCounts(startDate, endDate, callback) {
        db.all(`SELECT status, COUNT(*) as count FROM orders WHERE DATE(createdAt) BETWEEN ? AND ? GROUP BY status`, [startDate, endDate], callback);
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
