const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('=== DATABASE STRUCTURE CHECK ===\n');

console.log('1. INVENTORY TABLE (Medicine Batches):');
console.log('   Used by: Add Medicine Batch form, Medicine Transactions');
const inventorySchema = db.prepare("PRAGMA table_info(inventory)").all();
console.log('   Columns:', inventorySchema.map(c => c.name).join(', '));
const inventoryCount = db.prepare('SELECT COUNT(*) as count FROM inventory').get();
console.log(`   Current records: ${inventoryCount.count}\n`);

console.log('2. MEDICINES TABLE (Predefined Combinations + Links to Inventory):');
console.log('   Used by: Patient Visit Medicine Assignment');
const medicinesSchema = db.prepare("PRAGMA table_info(medicines)").all();
console.log('   Columns:', medicinesSchema.map(c => c.name).join(', '));
const medicinesCount = db.prepare('SELECT COUNT(*) as count FROM medicines').get();
console.log(`   Current records: ${medicinesCount.count}`);
const linkedCount = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE inventory_id IS NOT NULL').get();
console.log(`   Linked to inventory: ${linkedCount.count}`);
const predefinedCount = db.prepare('SELECT COUNT(*) as count FROM medicines WHERE is_predefined = 1').get();
console.log(`   Predefined combinations: ${predefinedCount.count}\n`);

console.log('3. PATIENT_MEDICINE_TRANSACTIONS TABLE:');
console.log('   Used by: Patient Visit - Add Medicine');
const pmtSchema = db.prepare("PRAGMA table_info(patient_medicine_transactions)").all();
console.log('   Columns:', pmtSchema.map(c => c.name).join(', '));
const pmtCount = db.prepare('SELECT COUNT(*) as count FROM patient_medicine_transactions').get();
console.log(`   Current records: ${pmtCount.count}\n`);

console.log('4. MEDICINE_TRANSACTIONS TABLE:');
console.log('   Used by: Medicine Batch Detail - Transactions (Stock Adjustments)');
const mtSchema = db.prepare("PRAGMA table_info(medicine_transactions)").all();
console.log('   Columns:', mtSchema.map(c => c.name).join(', '));
const mtCount = db.prepare('SELECT COUNT(*) as count FROM medicine_transactions').get();
console.log(`   Current records: ${mtCount.count}\n`);

console.log('=== CHECKING DATA CONSISTENCY ===\n');

// Check if there are medicines linked to inventory
const linkedMedicines = db.prepare(`
  SELECT m.id, m.name, m.inventory_id, i.name as inventory_name, i.in_stock_qty_boxes
  FROM medicines m
  LEFT JOIN inventory i ON m.inventory_id = i.id
  WHERE m.inventory_id IS NOT NULL
  LIMIT 5
`).all();

if (linkedMedicines.length > 0) {
  console.log('✓ Sample medicines linked to inventory:');
  linkedMedicines.forEach(m => {
    console.log(`  - ${m.name} → Inventory ID: ${m.inventory_id} (${m.inventory_name}, Stock: ${m.in_stock_qty_boxes})`);
  });
} else {
  console.log('✗ No medicines are currently linked to inventory batches');
  console.log('  This means patient medicine transactions won\'t affect inventory stock');
}

console.log('\n=== WORKFLOW ANALYSIS ===\n');

console.log('WORKFLOW 1: Add Medicine Batch');
console.log('  Form → POST /api/medicines');
console.log('  Tables affected: inventory (INSERT), medicines (UPDATE or INSERT)');
console.log('  Creates: New batch in inventory + Links/creates medicine record\n');

console.log('WORKFLOW 2: Patient Visit - Add Medicine');
console.log('  Form → POST /api/patients/[id]/visits/[visitId]/medicines');
console.log('  Tables affected: patient_medicine_transactions (INSERT), inventory (UPDATE stock)');
console.log('  Logic: Looks up medicine.inventory_id → Updates inventory.in_stock_qty_boxes\n');

console.log('WORKFLOW 3: Medicine Batch - Stock Transactions');
console.log('  Form → POST /api/medicines/[id]/transactions');
console.log('  Tables affected: medicine_transactions (INSERT), inventory (UPDATE stock)');
console.log('  Logic: Directly updates inventory.in_stock_qty_boxes\n');

console.log('=== POTENTIAL ISSUES ===\n');

// Check for medicines without inventory_id that might be selected in patient visits
const orphanMedicines = db.prepare(`
  SELECT COUNT(*) as count 
  FROM medicines 
  WHERE is_predefined = 1 AND inventory_id IS NULL
`).get();

if (orphanMedicines.count > 0) {
  console.log(`⚠ ${orphanMedicines.count} predefined combinations have no inventory link`);
  console.log('  These are combination medicines - they shouldn\'t affect stock directly');
} else {
  console.log('✓ All predefined combinations are properly configured');
}

// Check for patient transactions referencing medicines
const patientTransWithMedicines = db.prepare(`
  SELECT COUNT(*) as count 
  FROM patient_medicine_transactions
  WHERE medicine_id IS NOT NULL
`).get();

console.log(`\n✓ ${patientTransWithMedicines.count} patient medicine transactions recorded`);

db.close();
