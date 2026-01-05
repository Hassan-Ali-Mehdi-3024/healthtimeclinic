const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'healthtime.db');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log(`Setting up database at ${dbPath}...`);

try {
  // Delete existing DB if you want a fresh start, or just open it
  // fs.unlinkSync(dbPath); 
  
  const db = new Database(dbPath);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running schema...');
  db.exec(schemaSql);

  console.log('Database setup completed successfully!');
  console.log('Created tables: users, patients, appointments, patient_measurements');
  console.log('Inserted default user: doctor');
  
  db.close();
} catch (err) {
  console.error('Error setting up database:', err);
  process.exit(1);
}
