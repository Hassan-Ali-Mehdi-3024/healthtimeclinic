const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('=== TESTING COMBINATION STOCK DEDUCTION ===\n');

// Test the parsing logic
function parseCombination(combinationName) {
  const parts = combinationName.split(' + ');
  const baseMedicines = [];
  
  for (const part of parts) {
    const match = part.match(/^([A-Z\-]+)/);
    if (match) {
      baseMedicines.push(match[1]);
    }
  }
  
  return baseMedicines;
}

// Test cases
const testCombinations = [
  'COBECWT (1+0+0)',
  'COBECWT (1+0+1)',
  'COBECWT (1+0+0) + COBECGT (0+0+1)',
  'COBECWT (1+0+0) + SLIM-X (0+1+0) + COBECGT (0+0+1)',
  'SLIM-X (1+0+0)',
  'SLIM-X (2+0+2)'
];

console.log('PARSING TEST:');
testCombinations.forEach(combo => {
  const baseMeds = parseCombination(combo);
  console.log(`"${combo}"`);
  console.log(`  → Base medicines: ${baseMeds.join(', ')}\n`);
});

console.log('\n=== CURRENT INVENTORY STATUS ===\n');

const inventory = db.prepare(`
  SELECT id, name, batch_number, in_stock_qty_boxes 
  FROM inventory 
  ORDER BY name, created_at DESC
`).all();

if (inventory.length === 0) {
  console.log('⚠ No inventory batches found!');
  console.log('You need to add medicine batches before dispensing combinations.\n');
  console.log('Required base medicines: COBECWT, COBECWRT, COBECGT, COBECYT, COBECPT, SLIM-X');
} else {
  console.log('Available inventory:');
  inventory.forEach(inv => {
    console.log(`  ${inv.name} (Batch: ${inv.batch_number}) - Stock: ${inv.in_stock_qty_boxes} boxes`);
  });
}

console.log('\n=== SIMULATION ===\n');

// Simulate dispensing a combination
const testCombination = 'COBECWT (1+0+0) + COBECGT (0+0+1)';
const quantityToDispense = 30; // 30 boxes (e.g., 1 month supply)

console.log(`Simulating: Dispense ${quantityToDispense} boxes of "${testCombination}"\n`);

const baseMeds = parseCombination(testCombination);
console.log('This combination requires:');
baseMeds.forEach(medName => {
  const inv = inventory.find(i => i.name === medName);
  if (inv) {
    console.log(`  - ${medName}: ${quantityToDispense} boxes (Current stock: ${inv.in_stock_qty_boxes})`);
    const afterStock = inv.in_stock_qty_boxes - quantityToDispense;
    if (afterStock < 0) {
      console.log(`    ✗ INSUFFICIENT STOCK! Need ${Math.abs(afterStock)} more boxes`);
    } else {
      console.log(`    ✓ OK - After dispensing: ${afterStock} boxes remaining`);
    }
  } else {
    console.log(`  - ${medName}: ${quantityToDispense} boxes ✗ NOT IN INVENTORY!`);
  }
});

console.log('\n=== RECOMMENDATIONS ===\n');

const requiredMedicines = ['COBECWT', 'COBECWRT', 'COBECGT', 'COBECYT', 'COBECPT', 'SLIM-X'];
const missingMedicines = requiredMedicines.filter(med => 
  !inventory.some(inv => inv.name === med)
);

if (missingMedicines.length > 0) {
  console.log('⚠ Missing medicine batches:');
  missingMedicines.forEach(med => {
    console.log(`  - ${med}: Please add a batch via /dashboard/medicines/new`);
  });
} else {
  console.log('✓ All base medicines have inventory batches');
}

console.log('\n=== HOW IT WORKS ===\n');
console.log('When dispensing combinations:');
console.log('1. System parses combination name (e.g., "COBECWT (1+0+0) + COBECGT (0+0+1)")');
console.log('2. Extracts base medicine names: COBECWT, COBECGT');
console.log('3. For each base medicine, finds the latest inventory batch');
console.log('4. Decreases stock by the quantity dispensed');
console.log('5. If any base medicine has insufficient stock, transaction fails\n');

console.log('Example: Dispensing 30 boxes of "COBECWT (1+0+0) + COBECGT (0+0+1)"');
console.log('  → COBECWT inventory: -30 boxes');
console.log('  → COBECGT inventory: -30 boxes');

db.close();
