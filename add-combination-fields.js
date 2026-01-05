const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Adding tags and medicines_included columns to medicines table...');

try {
  // Add tags column
  db.prepare('ALTER TABLE medicines ADD COLUMN tags TEXT').run();
  console.log('✓ tags column added');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ tags column already exists');
  } else {
    console.error('Error adding tags:', error.message);
  }
}

try {
  // Add medicines_included column (JSON array of base medicine names)
  db.prepare('ALTER TABLE medicines ADD COLUMN medicines_included TEXT').run();
  console.log('✓ medicines_included column added');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ medicines_included column already exists');
  } else {
    console.error('Error adding medicines_included:', error.message);
  }
}

try {
  // Add dosage_pattern column to store the (1+0+0) pattern
  db.prepare('ALTER TABLE medicines ADD COLUMN dosage_pattern TEXT').run();
  console.log('✓ dosage_pattern column added');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('✓ dosage_pattern column already exists');
  } else {
    console.error('Error adding dosage_pattern:', error.message);
  }
}

console.log('\n=== Migrating existing combinations ===\n');

// Parse existing combinations to extract data
const existingCombinations = db.prepare('SELECT id, name, description FROM medicines WHERE is_predefined = 1').all();

for (const combo of existingCombinations) {
  // Extract medicines from name
  const parts = combo.name.split(' + ');
  const medicines = [];
  let dosagePattern = '';
  
  for (const part of parts) {
    const match = part.match(/^([A-Z\-]+)\s*(\([0-9+]+\))?/);
    if (match) {
      medicines.push(match[1]);
      if (match[2] && !dosagePattern) {
        dosagePattern = match[2]; // Use first pattern found
      }
    }
  }
  
  const medicinesJson = JSON.stringify(medicines);
  
  // Update the record
  db.prepare(`
    UPDATE medicines 
    SET dosage_pattern = ?,
        medicines_included = ?,
        description = ?
    WHERE id = ?
  `).run(dosagePattern || combo.description, medicinesJson, combo.description, combo.id);
}

console.log(`✓ Migrated ${existingCombinations.length} existing combinations`);

console.log('\n=== Sample updated combinations ===\n');
const samples = db.prepare('SELECT id, name, description, dosage_pattern, medicines_included, tags FROM medicines WHERE is_predefined = 1 LIMIT 5').all();
samples.forEach(s => {
  console.log(`ID ${s.id}: ${s.name}`);
  console.log(`  Dosage: ${s.dosage_pattern}`);
  console.log(`  Medicines: ${s.medicines_included}`);
  console.log(`  Tags: ${s.tags || '(none)'}\n`);
});

db.close();
console.log('Migration completed!');
