const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Adding description column to inventory table...');

try {
  db.prepare('ALTER TABLE inventory ADD COLUMN description TEXT').run();
  console.log('✓ description column added successfully');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ description column already exists');
  } else {
    console.error('Error:', error.message);
  }
}

db.close();
