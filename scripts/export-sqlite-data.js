// Export data from SQLite to JSON for Supabase import
const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./healthtime.db');

const tables = [
  'users',
  'patients', 
  'inventory',
  'medicines',
  'patient_visits',
  'patient_measurements',
  'patient_comments',
  'patient_medicine_transactions',
  'medicine_transactions'
];

const exportData = {};

tables.forEach(table => {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    
    // Convert SQLite boolean integers to JavaScript booleans
    const converted = rows.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        if (key.startsWith('is_') || key.startsWith('diagnosis_')) {
          newRow[key] = Boolean(newRow[key]);
        }
      });
      return newRow;
    });
    
    exportData[table] = converted;
    console.log(`✓ Exported ${converted.length} rows from ${table}`);
  } catch (error) {
    console.log(`⚠ Table ${table} not found or empty`);
    exportData[table] = [];
  }
});

fs.writeFileSync('./supabase-data-export.json', JSON.stringify(exportData, null, 2));
console.log('\n✅ Data exported to supabase-data-export.json');
console.log('\nNext steps:');
console.log('1. Go to Supabase Dashboard > SQL Editor');
console.log('2. Run the SQL from scripts/supabase-migration.sql');
console.log('3. Then use the Supabase Table Editor to import data from supabase-data-export.json');

db.close();
