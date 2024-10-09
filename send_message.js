const axios = require("axios");

const send_message = async (products, data, orderId) => {
    const idInstance = '1101834631';
    const apiTokenInstance = 'b6a5812c82f049d28b697b802aa81667c54a6842696c4aac87';
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    // Расчет общей стоимости с учетом 5% скидки для товаров не из категории "discont"
    const totalCostWithDiscount = products.reduce((acc, product) => {
        if (product.category === 'discont') {
            return acc + product.price * product.quantity; // Товар без скидки
        }
        return acc + (product.price * product.quantity * 0.95); // Применение 5% скидки
    }, 0);

    const productsList = products.map(product =>
        `
${product.name} - ${product.price} тенге x ${product.quantity} шт. 
___
        `
    ).join('\n');

    const message = `Новый заказ:
Товары:
___
${productsList} 

Заказчик:
${data.firstName + ' ' + data.lastName}
Адрес: ${data.address}
${data.phoneNumber}

Итого: ${totalCostWithDiscount.toFixed(2)} тенге (учтена скидка -5% для товаров, не входящих в категорию "discont")

Ссылка на заказ:
    https://admin.miko-astana.kz/orders/${orderId}  
`;

    const headers = {
        'Content-Type': 'application/json'
    };

    // Фиксированные номера для отправки сообщений
    const phoneNumbers = ['77066001330', '77020581667', '77088024110'];

    // Цикл для отправки сообщения на каждый номер
    for (let chatId of phoneNumbers) {
        const payload = {
            chatId: `${chatId}@c.us`,
            message: message
        };

        try {
            const response = await axios.post(url, payload, {headers});
            console.log(`Сообщение отправлено на ${chatId}:`, response.data);
            console.log(message)
        } catch (error) {
            console.log(`Ошибка при отправке на ${chatId}:`, error);
        }
    }
};

module.exports = send_message;
