const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Updating medicines table for per-medicine dosages...');

try {
  // Add medicine_dosages column (will store JSON like: {"COBECWT": "1+0+0", "SLIM-X": "0+0+1"})
  db.prepare('ALTER TABLE medicines ADD COLUMN medicine_dosages TEXT').run();
  console.log('✓ medicine_dosages column added');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ medicine_dosages column already exists');
  } else {
    console.error('Error:', error.message);
  }
}

console.log('\n=== Migrating existing combinations ===\n');

// Migrate existing combinations
const combinations = db.prepare(`
  SELECT id, name, dosage_pattern, medicines_included 
  FROM medicines 
  WHERE is_predefined = 1 AND medicines_included IS NOT NULL
`).all();

for (const combo of combinations) {
  if (!combo.medicines_included) continue;
  
  const medicines = JSON.parse(combo.medicines_included);
  const dosagePattern = combo.dosage_pattern || '(1+0+0)';
  
  // Create dosages object - assign same dosage to all medicines
  const dosages = {};
  medicines.forEach(med => {
    dosages[med] = dosagePattern.replace(/[()]/g, ''); // Remove parentheses
  });
  
  const dosagesJson = JSON.stringify(dosages);
  
  db.prepare('UPDATE medicines SET medicine_dosages = ? WHERE id = ?').run(dosagesJson, combo.id);
  
  console.log(`ID ${combo.id}: ${combo.name}`);
  console.log(`  Medicines: ${medicines.join(', ')}`);
  console.log(`  Dosages: ${dosagesJson}\n`);
}

console.log(`✓ Migrated ${combinations.length} combinations`);

console.log('\n=== Sample migrated data ===\n');
const samples = db.prepare(`
  SELECT id, name, medicine_dosages 
  FROM medicines 
  WHERE is_predefined = 1 AND medicine_dosages IS NOT NULL 
  LIMIT 5
`).all();

samples.forEach(s => {
  console.log(`${s.name}:`);
  console.log(`  Dosages: ${s.medicine_dosages}\n`);
});

db.close();
console.log('Migration completed!');
