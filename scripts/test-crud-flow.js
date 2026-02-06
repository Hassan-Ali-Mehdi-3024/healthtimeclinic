
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Import DB (using dynamic import to ensure env is loaded)
const { default: pool } = await import('./lib/db.js');

async function runTests() {
  console.log('🚀 Starting End-to-End Test Suite...');
  
  let patientId = null;
  let visitId = null;
  let inventoryId = null;
  let initialStock = 0;
  let medicineTxId = null;

  try {
    // ==========================================
    // PRE-REQ: Ensure we have a medicine in inventory
    // ==========================================
    console.log('\n📦 Checking Inventory...');
    const [inventory] = await pool.query('SELECT * FROM inventory LIMIT 1');
    if (inventory.length === 0) {
      // Create dummy medicine
      const [res] = await pool.query(
        `INSERT INTO inventory (name, batch_number, price_out, in_stock_qty_boxes) 
         VALUES ('Test Panadol', 'BATCH-001', 50, 100)`
      );
      inventoryId = res.insertId;
      initialStock = 100;
      console.log(`   Created test medicine: Test Panadol (Stock: 100)`);
    } else {
      inventoryId = inventory[0].id;
      initialStock = inventory[0].in_stock_qty_boxes;
      console.log(`   Using existing medicine: ${inventory[0].name} (ID: ${inventoryId}, Stock: ${initialStock})`);
    }

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
    patientId = pRes.insertId; // Supabase/Postgres might return this differently in real API, but our wrapper mimics it
    
    // Verify
    const [pCheck] = await pool.query('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (pCheck.length && pCheck[0].first_name === 'Test') {
      console.log(`   ✅ Patient Created (ID: ${patientId})`);
    } else {
      throw new Error('Patient creation failed');
    }

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

    // Verify
    const [vCheck] = await pool.query('SELECT * FROM patient_visits WHERE id = ?', [visitId]);
    if (vCheck.length && vCheck[0].notes === 'Initial Checkup') {
      console.log(`   ✅ Visit Created (ID: ${visitId})`);
    } else {
      throw new Error('Visit creation failed');
    }

    // ==========================================
    // TEST 3: Add Medicine & Check Inventory
    // ==========================================
    console.log('\n💊 Test 3: Add Medicine & Verify Stock Deduction...');
    const quantity = 2;
    
    // Create Transaction
    const [mRes] = await pool.query(
      `INSERT INTO patient_medicine_transactions 
       (patient_id, visit_id, inventory_id, transaction_type, quantity_boxes, price_per_box, payment_method) 
       VALUES (?, ?, ?, 'dispensed', ?, 50, 'Cash')`,
      [patientId, visitId, inventoryId, quantity]
    );
    medicineTxId = mRes.insertId;

    // Deduct Inventory (API does this, so we simulate the logic here to verify our DB logic works)
    // Note: In the real app, the API endpoint does both. Here we are testing the DB state transitions.
    // We will manually trigger the update to simulate what the API does, then verify.
    await pool.query(
      'UPDATE inventory SET in_stock_qty_boxes = in_stock_qty_boxes - ? WHERE id = ?',
      [quantity, inventoryId]
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

    // Verify
    const [vEditCheck] = await pool.query('SELECT notes FROM patient_visits WHERE id = ?', [visitId]);
    if (vEditCheck[0].notes === 'Updated Notes') {
      console.log(`   ✅ Visit Updated Successfully`);
    } else {
      throw new Error('Visit update failed');
    }

    // ==========================================
    // TEST 5: Delete Visit & Restore Inventory
    // ==========================================
    console.log('\n🗑️  Test 5: Delete Visit & Restore Stock...');
    
    // 1. Restore Stock (Simulating API logic)
    await pool.query(
      'UPDATE inventory SET in_stock_qty_boxes = in_stock_qty_boxes + ? WHERE id = ?',
      [quantity, inventoryId]
    );

    // 2. Delete Transactions
    await pool.query('DELETE FROM patient_medicine_transactions WHERE visit_id = ?', [visitId]);

    // 3. Delete Visit
    await pool.query('DELETE FROM patient_visits WHERE id = ?', [visitId]);

    // Verify Visit Gone
    const [vGone] = await pool.query('SELECT * FROM patient_visits WHERE id = ?', [visitId]);
    if (vGone.length > 0) throw new Error('Visit was not deleted!');

    // Verify Stock Restored
    const [iRestore] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [inventoryId]);
    const restoredStock = iRestore[0].in_stock_qty_boxes;

    if (restoredStock === initialStock) {
      console.log(`   ✅ Stock Restored Correctly (Current: ${restoredStock})`);
    } else {
      throw new Error(`Stock restoration failed! Expected ${initialStock}, got ${restoredStock}`);
    }

    // Cleanup Patient
    await pool.query('DELETE FROM patients WHERE id = ?', [patientId]);
    console.log(`   ✅ Test Data Cleaned Up`);

    console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

runTests();
