
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, price REAL, subcategory TEXT, category TEXT, imageUrl TEXT, rating REAL)");
});
module.exports = db;

