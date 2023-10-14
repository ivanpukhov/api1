const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../database.db'));

db.serialize(() => {
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

    db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      phoneNumber TEXT,
      address TEXT
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

db.close();
