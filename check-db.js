const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\nMedicine Combinations:');
try {
  const combinations = db.prepare('SELECT * FROM medicine_combinations').all();
  console.log(combinations);
} catch (e) {
  console.log('Error:', e.message);
}

console.log('\nMedicines table:');
try {
  const medicines = db.prepare('SELECT * FROM medicines').all();
  console.log(medicines);
} catch (e) {
  console.log('Error:', e.message);
}

db.close();
