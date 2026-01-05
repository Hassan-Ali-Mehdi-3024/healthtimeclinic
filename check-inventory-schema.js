const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Inventory table schema:');
const schema = db.prepare("PRAGMA table_info(inventory)").all();
console.log(schema);

db.close();
