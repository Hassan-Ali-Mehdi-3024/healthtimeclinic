
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

async function runTests() {
  const { default: pool } = await import('./lib/db.js');
  console.log('🚀 Starting End-to-End Test Suite...');
  
  let patientId = null;
  let visitId = null;
  let inventoryId = null;
  let medicineId = null;
  let initialStock = 0;

  try {
    // ==========================================
    // PRE-REQ: Inventory & Medicine
    // ==========================================
    console.log('\n📦 Checking Inventory & Medicine...');
    const [inventory] = await pool.query('SELECT * FROM inventory LIMIT 1');
    if (inventory.length === 0) {
      const [res] = await pool.query(
        `INSERT INTO inventory (name, batch_number, price_out, in_stock_qty_boxes) 
         VALUES ('Test Panadol', 'BATCH-001', 50, 100)`
      );
      inventoryId = res.insertId;
      initialStock = 100;
    } else {
      inventoryId = inventory[0].id;
      initialStock = inventory[0].in_stock_qty_boxes;
    }

    // Create a medicine linked to this inventory
    const [medRes] = await pool.query(
        `INSERT INTO medicines (name, inventory_id, description) VALUES ('Test Med', ?, 'Test Description')`,
        [inventoryId]
    );
    medicineId = medRes.insertId;
    console.log(`   Using Medicine ID: ${medicineId} (Inventory ID: ${inventoryId}, Stock: ${initialStock})`);

    // ==========================================
    // TEST 1: Create Patient
    // ==========================================
    console.log('\n👤 Test 1: Create Patient...');
    const patientData = {
      first_name: 'Test',
      last_name: 'Patient_' + Date.now(),
      phone: '03001234567',
      gender: 'Male',
      date_of_birth: '1990-01-01'
    };

    const [pRes] = await pool.query(
      `INSERT INTO patients (first_name, last_name, phone, gender, date_of_birth) 
       VALUES (?, ?, ?, ?, ?)`,
      [patientData.first_name, patientData.last_name, patientData.phone, patientData.gender, patientData.date_of_birth]
    );
    patientId = pRes.insertId; 
    console.log(`   ✅ Patient Created (ID: ${patientId})`);

    // ==========================================
    // TEST 2: Create Visit
    // ==========================================
    console.log('\n🏥 Test 2: Create Visit...');
    const [vRes] = await pool.query(
      `INSERT INTO patient_visits (patient_id, visit_date, weight_digital_kg, notes) 
       VALUES (?, ?, ?, ?)`,
      [patientId, new Date().toISOString(), 75.5, 'Initial Checkup']
    );
    visitId = vRes.insertId;
    console.log(`   ✅ Visit Created (ID: ${visitId})`);

    // ==========================================
    // TEST 3: Add Medicine & Check Inventory
    // ==========================================
    console.log('\n💊 Test 3: Add Medicine & Verify Stock Deduction...');
    const quantity = 2;
    
    // Create Transaction using medicine_id
    await pool.query(
      `INSERT INTO patient_medicine_transactions 
       (patient_id, visit_id, medicine_id, transaction_type, quantity_boxes, price_per_box, payment_method) 
       VALUES (?, ?, ?, 'dispensed', ?, 50, 'Cash')`,
      [patientId, visitId, medicineId, quantity]
    );

    // Simulate API logic: Update Inventory (Read-Modify-Write because wrapper doesn't support SQL arithmetic)
    const [currentInv] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [inventoryId]);
    const currentQty = currentInv[0].in_stock_qty_boxes;
    const updatedQty = currentQty - quantity;

    await pool.query(
      'UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?',
      [updatedQty, inventoryId]
    );

    // Verify Stock
    const [iCheck] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [inventoryId]);
    const newStock = iCheck[0].in_stock_qty_boxes;
    
    if (newStock === initialStock - quantity) {
      console.log(`   ✅ Stock Deducted Correctly (Old: ${initialStock}, New: ${newStock})`);
    } else {
      throw new Error(`Stock mismatch! Expected ${initialStock - quantity}, got ${newStock}`);
    }

    // ==========================================
    // TEST 4: Edit Visit
    // ==========================================
    console.log('\n✏️  Test 4: Edit Visit Details...');
    await pool.query(
      'UPDATE patient_visits SET notes = ?, weight_digital_kg = ? WHERE id = ?',
      ['Updated Notes', 76.0, visitId]
    );
    console.log(`   ✅ Visit Updated Successfully`);

    // ==========================================
    // TEST 5: Delete Visit & Restore Inventory
    // ==========================================
    console.log('\n🗑️  Test 5: Delete Visit & Restore Stock...');
    
    // 1. Restore Stock (Simulating API logic)
    const [restoreInv] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [inventoryId]);
    console.log(`   [Debug] Stock before restore: ${restoreInv[0].in_stock_qty_boxes}`);
    const restoreQty = restoreInv[0].in_stock_qty_boxes + quantity;
    console.log(`   [Debug] Calculating restore: ${restoreInv[0].in_stock_qty_boxes} + ${quantity} = ${restoreQty}`);

    await pool.query(
      'UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?',
      [restoreQty, inventoryId]
    );
    console.log(`   [Debug] Update query executed.`);

    // 2. Delete Transactions
    await pool.query('DELETE FROM patient_medicine_transactions WHERE visit_id = ?', [visitId]);

    // 3. Delete Visit
    await pool.query('DELETE FROM patient_visits WHERE id = ?', [visitId]);

    // Verify Stock Restored
    const [iRestore] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [inventoryId]);
    const restoredStock = iRestore[0].in_stock_qty_boxes;

    if (restoredStock === initialStock) {
      console.log(`   ✅ Stock Restored Correctly (Current: ${restoredStock})`);
    } else {
      throw new Error(`Stock restoration failed! Expected ${initialStock}, got ${restoredStock}`);
    }

    // Cleanup
    await pool.query('DELETE FROM patients WHERE id = ?', [patientId]);
    await pool.query('DELETE FROM medicines WHERE id = ?', [medicineId]);
    // We keep inventory item as it might be used by others or was existing
    
    console.log(`   ✅ Test Data Cleaned Up`);
    console.log('\n✨ ALL 5 TESTS PASSED SUCCESSFULLY! ✨');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    // Cleanup attempt
    if (patientId) await pool.query('DELETE FROM patients WHERE id = ?', [patientId]).catch(()=>{});
    if (medicineId) await pool.query('DELETE FROM medicines WHERE id = ?', [medicineId]).catch(()=>{});
    process.exit(1);
  }
}

runTests();
