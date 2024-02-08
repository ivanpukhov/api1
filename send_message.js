const axios = require("axios");

const send_message = async (products, totalCost, data, orderId) => {
    const idInstance = '1101834631';
    const apiTokenInstance = 'f0aafa8020394baea4aa3db58aeb2afb02afca8b0e9b4ce4b5';
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

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

Итого: - 5% = ${totalCost} тенге

Ссылка на заказ:
    https://admin.miko-astana.kz/orders/${orderId}  
`;

    const headers = {
        'Content-Type': 'application/json'
    };

    // Фиксированные номера для отправки сообщений
    const phoneNumbers = ['77066001330', '77020581667'];

    // Цикл для отправки сообщения на каждый номер
    for (let chatId of phoneNumbers) {
        const payload = {
            chatId: `${chatId}@c.us`,
            message: message
        };

        try {
            const response = await axios.post(url, payload, {headers});
            console.log(`Сообщение отправлено на ${chatId}:`, response.data);
        } catch (error) {
            console.log(`Ошибка при отправке на ${chatId}:`, error);
        }
    }
};

module.exports = send_message;  // Экспорт функции send_message для использования в других файлах
