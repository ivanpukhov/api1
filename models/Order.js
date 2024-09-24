const db = require('../config/database');
const axios = require('axios');
const send_message = require('../send_message');
const {getByIds} = require("./Product");
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

            // Вычисляем totalCost с учетом скидки для товаров, которые не относятся к категории "discont"
            const totalCost = data.products.reduce((sum, product) => {
                const fullProductInfo = products.find(p => p.id === product.id);
                if (fullProductInfo.category === 'discont') {
                    return sum + (fullProductInfo.price * product.quantity); // Не применяем скидку
                }
                return sum + (fullProductInfo.price * product.quantity * 0.95); // Применяем скидку 5% к остальным товарам
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
                    astanaTime
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

                    // Отправляем сообщение с полной информацией о заказе
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
        const productIds = data.products.map(product => product.id);
        getByIds(productIds, (error, products) => {
            if (error) {
                callback(error);
                return;
            }

            // Вычисляем totalCost с учетом скидки для товаров, которые не относятся к категории "discont"
            const totalCost = data.products.reduce((sum, product) => {
                const fullProductInfo = products.find(p => p.id === product.id);
                if (fullProductInfo.category === 'discont') {
                    return sum + (fullProductInfo.price * product.quantity); // Не применяем скидку
                }
                return sum + (fullProductInfo.price * product.quantity * 0.95); // Применяем скидку 5% к остальным товарам
            }, 0);

            const sql = 'UPDATE orders SET firstName = ?, lastName = ?, phoneNumber = ?, address = ?, products = ?, deliveryMethod = ?, paymentMethod = ?, totalCost = ? WHERE id = ?';
            db.run(sql, [data.firstName, data.lastName, data.phoneNumber, data.address, JSON.stringify(data.products), data.deliveryMethod, data.paymentMethod, totalCost, id], callback);
        });
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
    },

    getById(id, callback) {
        db.get('SELECT * FROM orders WHERE id = ?', [id], callback);
    },

    updateStatus(id, status, callback) {
        const sql = 'UPDATE orders SET status = ? WHERE id = ?';
        db.run(sql, [status, id], callback);
    },

    getOrdersByPeriod(startDate, endDate, callback) {
        const sql = `SELECT * FROM orders WHERE DATE(createdAt) BETWEEN ? AND ?`;
        db.all(sql, [startDate, endDate], (err, rows) => {
            if (err) {
                callback(err);
                return;
            }

            const allProductIds = rows.reduce((acc, order) => {
                const productIds = JSON.parse(order.products).map(product => product.id);
                return acc.concat(productIds);
            }, []);

            getByIds([...new Set(allProductIds)], (error, products) => {
                if (error) {
                    callback(error);
                    return;
                }

                const orders = rows.map(order => {
                    const orderProducts = JSON.parse(order.products).map(product => {
                        const fullProductInfo = products.find(p => p.id === product.id);
                        return {
                            ...product,
                            name: fullProductInfo ? fullProductInfo.name : 'Unknown Product',
                        };
                    });

                    return {
                        ...order,
                        products: orderProducts
                    };
                });

                callback(null, orders);
            });
        });
    }
};

module.exports = Order;
