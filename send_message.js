const axios = require("axios");
const send_message = async (products, totalCost, data, orderId) => {  // Добавьте параметр orderId
    const idInstance = '1101834631';
    const apiTokenInstance = 'f0aafa8020394baea4aa3db58aeb2afb02afca8b0e9b4ce4b5';
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    const productsList = products.map(product =>
        `
${product.name} - ${product.price} тенге x ${product.quantity} шт. 
___
        `
    ).join('\n');

    const totalCostWithDiscount = totalCost * 0.95;  // Вычислите итоговую сумму со скидкой

    const message = `Новый заказ:
Товары:
___
${productsList} 

Заказчик:
${data.firstName + ' ' + data.lastName}
Адрес: ${data.address}
${data.phoneNumber}

Итого:
 ${totalCost} тенге - 5% = ${totalCostWithDiscount} тенге

Ссылка на заказ:
    https://admin.miko-astana.kz/orders/${orderId}  
`;

    const payload = {
        chatId: `77066001330@c.us`,
        message: message
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, payload, {headers});
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
};

module.exports = send_message;  // Экспорт функции send_message для использования в других файлах
