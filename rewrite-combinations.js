const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('=== Rewriting Combination Table with Consistent Data ===\n');

// Define all combinations with proper structure
const combinations = [
  // Single medicine combinations
  'COBECWT(1+0+0)',
  'COBECWT(1+0+1)',
  'COBECGT(1+0+0)',
  'COBECGT(1+0+1)',
  'COBECWRT(0+0+1)',
  'COBECWRT(1+0+1)',
  'COBECYT(1+0+0)',
  'COBECYT(1+0+1)',
  'COBECPT(0+0+1)',
  'COBECPT(1+0+1)',
  'SLIM-X(1+0+0)',
  'SLIM-X(1+0+1)',
  'SLIM-X(0+0+1)',
  'SLIM-X(1+1+1)',
  'SLIM-X(2+0+2)',
  
  // Two medicine combinations
  'COBECWT(1+0+0) + COBECGT(0+0+1)',
  'COBECWT(1+0+0) + COBECWRT(0+0+1)',
  'COBECWT(1+0+0) + COBECYT(0+0+1)',
  'COBECWT(1+0+0) + COBECPT(0+0+1)',
  'COBECWRT(0+0+1) + COBECGT(1+0+0)',
  'COBECWRT(0+0+1) + COBECYT(1+0+0)',
  'COBECWRT(0+0+1) + COBECPT(1+0+0)',
  'COBECGT(1+0+0) + COBECYT(0+0+1)',
  'COBECGT(1+0+0) + COBECPT(0+0+1)',
  'COBECYT(1+0+0) + COBECPT(0+0+1)',
  'COBECYT(1+0+0) + COBECGT(0+0+1)',
  'COBECPT(1+0+0) + COBECYT(0+0+1)',
  'COBECPT(1+0+0) + COBECGT(0+0+1)',
  
  // Three medicine combinations
  'COBECWT(1+0+0) + COBECGT(0+1+0) + COBECWRT(0+0+1)',
  'COBECWT(1+0+0) + COBECYT(0+1+0) + COBECWRT(0+0+1)',
  'COBECWT(1+0+0) + COBECPT(0+1+0) + COBECWRT(0+0+1)',
  'COBECGT(1+0+0) + COBECYT(0+1+0) + COBECPT(0+0+1)',
  'COBECYT(1+0+0) + COBECPT(0+1+0) + COBECGT(0+0+1)',
  'COBECPT(1+0+0) + COBECGT(0+1+0) + COBECYT(0+0+1)',
  'COBECYT(1+0+0) + COBECGT(0+1+0) + COBECPT(0+0+1)',
  
  // SLIM-X two medicine combinations
  'SLIM-X(1+0+0) + COBECWT(0+0+1)',
  'SLIM-X(1+0+0) + COBECWRT(0+0+1)',
  'SLIM-X(1+0+0) + COBECGT(0+0+1)',
  'SLIM-X(1+0+0) + COBECYT(0+0+1)',
  'SLIM-X(1+0+0) + COBECPT(0+0+1)',
  
  // SLIM-X three medicine combinations
  'COBECWT(1+0+0) + SLIM-X(0+1+0) + COBECGT(0+0+1)',
  'COBECWT(1+0+0) + SLIM-X(0+1+0) + COBECWRT(0+0+1)',
  'COBECWT(1+0+0) + SLIM-X(0+1+0) + COBECYT(0+0+1)',
  'COBECWT(1+0+0) + SLIM-X(0+1+0) + COBECPT(0+0+1)',
  'COBECGT(1+0+0) + SLIM-X(0+1+0) + COBECPT(0+0+1)',
  'COBECGT(1+0+0) + SLIM-X(0+1+0) + COBECYT(0+0+1)',
  'COBECGT(1+0+0) + SLIM-X(0+1+0) + COBECWRT(0+0+1)',
  'COBECPT(1+0+0) + SLIM-X(0+1+0) + COBECYT(0+0+1)',
  'COBECPT(1+0+0) + SLIM-X(0+1+0) + COBECGT(0+0+1)',
  'COBECPT(1+0+0) + SLIM-X(0+1+0) + COBECWRT(0+0+1)',
  'COBECYT(1+0+0) + SLIM-X(0+1+0) + COBECPT(0+0+1)',
  'COBECYT(1+0+0) + SLIM-X(0+1+0) + COBECGT(0+0+1)',
  'COBECYT(1+0+0) + SLIM-X(0+1+0) + COBECWRT(0+0+1)',
  
  // Four medicine combinations
  'COBECWT(1+0+0) + SLIM-X(1+0+0) + COBECWRT(0+0+1) + SLIM-X(0+0+1)',
  'COBECGT(1+0+0) + SLIM-X(1+0+0) + COBECGT(0+0+1) + SLIM-X(0+0+1)',
  'COBECYT(1+0+0) + SLIM-X(1+0+0) + COBECYT(0+0+1) + SLIM-X(0+0+1)',
  'COBECPT(1+0+0) + SLIM-X(1+0+0) + COBECPT(0+0+1) + SLIM-X(0+0+1)',
  'COBECPT(1+0+0) + COBECGT(1+0+0) + COBECPT(0+0+1) + COBECGT(0+0+1)',
  'COBECYT(1+0+0) + COBECGT(1+0+0) + COBECYT(0+0+1) + COBECGT(0+0+1)',
  'COBECWT(1+0+0) + COBECWRT(1+0+0) + COBECWT(0+0+1) + COBECWRT(0+0+1)',
  'COBECGT(1+0+0) + COBECWRT(1+0+0) + COBECGT(0+0+1) + COBECWRT(0+0+1)',
  'COBECYT(1+0+0) + COBECWRT(1+0+0) + COBECYT(0+0+1) + COBECWRT(0+0+1)',
  'COBECPT(1+0+0) + COBECWRT(1+0+0) + COBECPT(0+0+1) + COBECWRT(0+0+1)',
  'COBECPT(1+0+0) + COBECYT(1+0+0) + COBECPT(0+0+1) + COBECYT(0+0+1)',
  'COBECWT(1+0+0) + COBECGT(1+0+0) + COBECWT(0+0+1) + COBECGT(0+0+1)'
];

// Function to parse combination string
function parseCombination(comboString) {
  const parts = comboString.split(' + ');
  const medicines = {};
  const medicinesList = [];
  
  parts.forEach(part => {
    const match = part.trim().match(/^([A-Z\-]+)\(([0-9+]+)\)$/);
    if (match) {
      const medicineName = match[1];
      const dosage = match[2];
      
      if (!medicines[medicineName]) {
        medicines[medicineName] = dosage;
        medicinesList.push(medicineName);
      } else {
        // If medicine appears multiple times, sum the dosages
        const existing = medicines[medicineName].split('+').map(Number);
        const newDosage = dosage.split('+').map(Number);
        const combined = existing.map((val, idx) => val + newDosage[idx]);
        medicines[medicineName] = combined.join('+');
      }
    }
  });
  
  return { medicines, medicinesList };
}

// Function to generate description
function generateDescription(medicines) {
  const descriptions = [];
  for (const [med, dosage] of Object.entries(medicines)) {
    const [m, a, n] = dosage.split('+').map(Number);
    const times = [];
    if (m > 0) times.push(`${m} Morning`);
    if (a > 0) times.push(`${a} Afternoon`);
    if (n > 0) times.push(`${n} Night`);
    descriptions.push(`${med}: ${times.join(', ')}`);
  }
  return descriptions.join(' | ');
}

// Backup existing data
console.log('Backing up existing combinations...');
const backup = db.prepare('SELECT * FROM medicines WHERE is_predefined = 1').all();
console.log(`✓ Backed up ${backup.length} combinations\n`);

// Clear existing combinations by updating to temporary state
console.log('Marking existing combinations for update...');
db.prepare('UPDATE medicines SET name = name || \'_OLD\' WHERE is_predefined = 1').run();
console.log('✓ Marked\n');

// Insert new combinations
console.log('Inserting new combinations with consistent data...\n');

const insertStmt = db.prepare(`
  INSERT INTO medicines 
  (name, description, dosage_pattern, medicines_included, medicine_dosages, tags, is_predefined)
  VALUES (?, ?, ?, ?, ?, ?, 1)
`);

const updateStmt = db.prepare(`
  UPDATE medicines 
  SET name = ?, description = ?, dosage_pattern = ?, medicines_included = ?, medicine_dosages = ?, tags = ?
  WHERE name = ? AND is_predefined = 1
`);

let insertCount = 0;
let updateCount = 0;

combinations.forEach((combo, index) => {
  const { medicines, medicinesList } = parseCombination(combo);
  const description = generateDescription(medicines);
  
  // Determine overall dosage pattern (first medicine's pattern as summary)
  const firstMed = Object.values(medicines)[0];
  const dosagePattern = `(${firstMed})`;
  
  const medicinesIncludedJson = JSON.stringify(medicinesList);
  const medicineDosagesJson = JSON.stringify(medicines);
  
  try {
    // Check if a combination with this name exists (marked as _OLD)
    const existing = db.prepare('SELECT id FROM medicines WHERE name = ? AND is_predefined = 1').get(combo + '_OLD');
    
    if (existing) {
      // Update existing
      updateStmt.run(
        combo,  // name
        description,  // description
        dosagePattern,  // dosage_pattern
        medicinesIncludedJson,  // medicines_included
        medicineDosagesJson,  // medicine_dosages
        '',  // tags
        combo + '_OLD'  // WHERE name
      );
      updateCount++;
    } else {
      // Insert new
      insertStmt.run(
        combo,  // name
        description,  // description
        dosagePattern,  // dosage_pattern
        medicinesIncludedJson,  // medicines_included
        medicineDosagesJson,  // medicine_dosages
        '',  // tags
      );
      insertCount++;
    }
    
    if ((index + 1) % 10 === 0) {
      console.log(`Processed ${index + 1}/${combinations.length} combinations...`);
    }
  } catch (error) {
    console.error(`Error processing: ${combo}`);
    console.error(error.message);
  }
});

console.log(`\n✓ Inserted ${insertCount} new combinations`);
console.log(`✓ Updated ${updateCount} existing combinations\n`);

// Mark old combinations as non-predefined instead of deleting (to preserve foreign key references)
const markOld = db.prepare('UPDATE medicines SET is_predefined = 0 WHERE name LIKE \'%_OLD\'').run();
console.log(`✓ Archived ${markOld.changes} old combinations\n`);

// Verify the data
console.log('=== Verification ===\n');

const sampleCombos = db.prepare(`
  SELECT name, description, medicine_dosages, medicines_included
  FROM medicines 
  WHERE is_predefined = 1 
  ORDER BY 
    CASE 
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 0 THEN 1
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 1 THEN 2
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 2 THEN 3
      ELSE 4
    END,
    name
  LIMIT 20
`).all();

console.log('Sample combinations:');
sampleCombos.forEach(combo => {
  console.log(`\n${combo.name}`);
  console.log(`  Description: ${combo.description}`);
  console.log(`  Medicines: ${combo.medicines_included}`);
  console.log(`  Dosages: ${combo.medicine_dosages}`);
});

// Summary
const counts = db.prepare(`
  SELECT 
    CASE 
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 0 THEN '1 medicine'
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 1 THEN '2 medicines'
      WHEN LENGTH(medicines_included) - LENGTH(REPLACE(medicines_included, ',', '')) = 2 THEN '3 medicines'
      ELSE '4+ medicines'
    END as category,
    COUNT(*) as count
  FROM medicines 
  WHERE is_predefined = 1
  GROUP BY category
  ORDER BY count DESC
`).all();

console.log('\n\n=== Summary ===');
counts.forEach(c => {
  console.log(`${c.category}: ${c.count} combinations`);
});

const total = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE is_predefined = 1').get();
console.log(`\nTotal combinations: ${total.count}`);

db.close();
console.log('\n✅ Combination table rewritten successfully!');
