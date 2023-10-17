const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем новую базу данных или подключаемся к существующей
const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

// Создаем таблицы, если они еще не созданы
db.serialize(() => {
    // Таблица для продуктов
    db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      subcategory TEXT,
      category TEXT,
      imageUrl TEXT,
      rating REAL DEFAULT 1,
      isAvailable BOOLEAN DEFAULT 1
    );
  `);

    // Таблица для заказов
    db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    phoneNumber TEXT,
    address TEXT,
    products TEXT,
    status TEXT,
    deliveryMethod TEXT,      -- Новый столбец для способа доставки
    paymentMethod TEXT        -- Новый столбец для способа оплаты
  );
`);
    db.run(`
  CREATE TABLE IF NOT EXISTS order_products (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);
});

module.exports = db;
