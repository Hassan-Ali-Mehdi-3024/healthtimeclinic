const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'healthtime.db');

console.log(`Migrating database at ${dbPath}...`);

// Predefined medicine combinations
const COMBINATIONS = [
  // Single medicines
  { name: 'COBECWT (1+0+0)', description: 'COBECWT Morning only' },
  { name: 'COBECWT (1+0+1)', description: 'COBECWT Morning & Night' },
  { name: 'COBECGT (1+0+0)', description: 'COBECGT Morning only' },
  { name: 'COBECGT (1+0+1)', description: 'COBECGT Morning & Night' },
  { name: 'COBECWRT (0+0+1)', description: 'COBECWRT Night only' },
  { name: 'COBECWRT (1+0+1)', description: 'COBECWRT Morning & Night' },
  { name: 'COBECYT (1+0+0)', description: 'COBECYT Morning only' },
  { name: 'COBECYT (1+0+1)', description: 'COBECYT Morning & Night' },
  { name: 'COBECPT (0+0+1)', description: 'COBECPT Night only' },
  { name: 'COBECPT (1+0+1)', description: 'COBECPT Morning & Night' },
  { name: 'SLIM-X (1+0+0)', description: 'SLIM-X Morning only' },
  { name: 'SLIM-X (1+0+1)', description: 'SLIM-X Morning & Night' },
  { name: 'SLIM-X (0+0+1)', description: 'SLIM-X Night only' },
  { name: 'SLIM-X (1+1+1)', description: 'SLIM-X Morning, Afternoon & Night' },
  { name: 'SLIM-X (2+0+2)', description: 'SLIM-X 2x Morning & 2x Night' },
  // Two medicine combinations
  { name: 'COBECWT (1+0+0) + COBECGT (0+0+1)', description: 'COBECWT Morning + COBECGT Night' },
  { name: 'COBECWT (1+0+0) + COBECWRT (0+0+1)', description: 'COBECWT Morning + COBECWRT Night' },
  { name: 'COBECWT (1+0+0) + COBECYT (0+0+1)', description: 'COBECWT Morning + COBECYT Night' },
  { name: 'COBECWT (1+0+0) + COBECPT (0+0+1)', description: 'COBECWT Morning + COBECPT Night' },
  { name: 'COBECWRT (0+0+1) + COBECGT (1+0+0)', description: 'COBECWRT Night + COBECGT Morning' },
  { name: 'COBECWRT (0+0+1) + COBECYT (1+0+0)', description: 'COBECWRT Night + COBECYT Morning' },
  { name: 'COBECWRT (0+0+1) + COBECPT (1+0+0)', description: 'COBECWRT Night + COBECPT Morning' },
  { name: 'COBECGT (1+0+0) + COBECYT (0+0+1)', description: 'COBECGT Morning + COBECYT Night' },
  { name: 'COBECGT (1+0+0) + COBECPT (0+0+1)', description: 'COBECGT Morning + COBECPT Night' },
  { name: 'COBECYT (1+0+0) + COBECPT (0+0+1)', description: 'COBECYT Morning + COBECPT Night' },
  { name: 'COBECYT (1+0+0) + COBECGT (0+0+1)', description: 'COBECYT Morning + COBECGT Night' },
  { name: 'COBECPT (1+0+0) + COBECYT (0+0+1)', description: 'COBECPT Morning + COBECYT Night' },
  { name: 'COBECPT (1+0+0) + COBECGT (0+0+1)', description: 'COBECPT Morning + COBECGT Night' },
  // Three medicine combinations
  { name: 'COBECWT (1+0+0) + COBECGT (0+1+0) + COBECWRT (0+0+1)', description: '3-combo: COBECWT M + COBECGT AF + COBECWRT N' },
  { name: 'COBECWT (1+0+0) + COBECYT (0+1+0) + COBECWRT (0+0+1)', description: '3-combo: COBECWT M + COBECYT AF + COBECWRT N' },
  { name: 'COBECWT (1+0+0) + COBECPT (0+1+0) + COBECWRT (0+0+1)', description: '3-combo: COBECWT M + COBECPT AF + COBECWRT N' },
  { name: 'COBECGT (1+0+0) + COBECYT (0+1+0) + COBECPT (0+0+1)', description: '3-combo: COBECGT M + COBECYT AF + COBECPT N' },
  { name: 'COBECYT (1+0+0) + COBECPT (0+1+0) + COBECGT (0+0+1)', description: '3-combo: COBECYT M + COBECPT AF + COBECGT N' },
  { name: 'COBECPT (1+0+0) + COBECGT (0+1+0) + COBECYT (0+0+1)', description: '3-combo: COBECPT M + COBECGT AF + COBECYT N' },
  { name: 'COBECYT (1+0+0) + COBECGT (0+1+0) + COBECPT (0+0+1)', description: '3-combo: COBECYT M + COBECGT AF + COBECPT N' },
  // SLIM-X combinations with others
  { name: 'SLIM-X (1+0+0) + COBECWT (0+0+1)', description: 'SLIM-X Morning + COBECWT Night' },
  { name: 'SLIM-X (1+0+0) + COBECWRT (0+0+1)', description: 'SLIM-X Morning + COBECWRT Night' },
  { name: 'SLIM-X (1+0+0) + COBECGT (0+0+1)', description: 'SLIM-X Morning + COBECGT Night' },
  { name: 'SLIM-X (1+0+0) + COBECYT (0+0+1)', description: 'SLIM-X Morning + COBECYT Night' },
  { name: 'SLIM-X (1+0+0) + COBECPT (0+0+1)', description: 'SLIM-X Morning + COBECPT Night' },
  { name: 'COBECWT (1+0+0) + SLIM-X (0+1+0) + COBECGT (0+0+1)', description: 'COBECWT M + SLIM-X AF + COBECGT N' },
  { name: 'COBECWT (1+0+0) + SLIM-X (0+1+0) + COBECWRT (0+0+1)', description: 'COBECWT M + SLIM-X AF + COBECWRT N' },
  { name: 'COBECWT (1+0+0) + SLIM-X (0+1+0) + COBECYT (0+0+1)', description: 'COBECWT M + SLIM-X AF + COBECYT N' },
  { name: 'COBECWT (1+0+0) + SLIM-X (0+1+0) + COBECPT (0+0+1)', description: 'COBECWT M + SLIM-X AF + COBECPT N' },
  { name: 'COBECGT (1+0+0) + SLIM-X (0+1+0) + COBECPT (0+0+1)', description: 'COBECGT M + SLIM-X AF + COBECPT N' },
  { name: 'COBECGT (1+0+0) + SLIM-X (0+1+0) + COBECYT (0+0+1)', description: 'COBECGT M + SLIM-X AF + COBECYT N' },
  { name: 'COBECGT (1+0+0) + SLIM-X (0+1+0) + COBECWRT (0+0+1)', description: 'COBECGT M + SLIM-X AF + COBECWRT N' },
  { name: 'COBECPT (1+0+0) + SLIM-X (0+1+0) + COBECYT (0+0+1)', description: 'COBECPT M + SLIM-X AF + COBECYT N' },
  { name: 'COBECPT (1+0+0) + SLIM-X (0+1+0) + COBECGT (0+0+1)', description: 'COBECPT M + SLIM-X AF + COBECGT N' },
  { name: 'COBECPT (1+0+0) + SLIM-X (0+1+0) + COBECWRT (0+0+1)', description: 'COBECPT M + SLIM-X AF + COBECWRT N' },
  { name: 'COBECYT (1+0+0) + SLIM-X (0+1+0) + COBECPT (0+0+1)', description: 'COBECYT M + SLIM-X AF + COBECPT N' },
  { name: 'COBECYT (1+0+0) + SLIM-X (0+1+0) + COBECGT (0+0+1)', description: 'COBECYT M + SLIM-X AF + COBECGT N' },
  { name: 'COBECYT (1+0+0) + SLIM-X (0+1+0) + COBECWRT (0+0+1)', description: 'COBECYT M + SLIM-X AF + COBECWRT N' },
  // Four medicine combinations
  { name: 'COBECWT (1+0+0) + SLIM-X (1+0+0) + COBECWRT (0+0+1) + SLIM-X (0+0+1)', description: '4-combo: COBECWT M + SLIM-X M + COBECWRT N + SLIM-X N' },
  { name: 'COBECGT (1+0+0) + SLIM-X (1+0+0) + COBECGT (0+0+1) + SLIM-X (0+0+1)', description: '4-combo: COBECGT M + SLIM-X M + COBECGT N + SLIM-X N' },
  { name: 'COBECYT (1+0+0) + SLIM-X (1+0+0) + COBECYT (0+0+1) + SLIM-X (0+0+1)', description: '4-combo: COBECYT M + SLIM-X M + COBECYT N + SLIM-X N' },
  { name: 'COBECPT (1+0+0) + SLIM-X (1+0+0) + COBECPT (0+0+1) + SLIM-X (0+0+1)', description: '4-combo: COBECPT M + SLIM-X M + COBECPT N + SLIM-X N' },
  { name: 'COBECPT (1+0+0) + COBECGT (1+0+0) + COBECPT (0+0+1) + COBECGT (0+0+1)', description: '4-combo: COBECPT M + COBECGT M + COBECPT N + COBECGT N' },
  { name: 'COBECYT (1+0+0) + COBECGT (1+0+0) + COBECYT (0+0+1) + COBECGT (0+0+1)', description: '4-combo: COBECYT M + COBECGT M + COBECYT N + COBECGT N' },
  { name: 'COBECWT (1+0+0) + COBECWRT (1+0+0) + COBECWT (0+0+1) + COBECWRT (0+0+1)', description: '4-combo: COBECWT M + COBECWRT M + COBECWT N + COBECWRT N' },
  { name: 'COBECGT (1+0+0) + COBECWRT (1+0+0) + COBECGT (0+0+1) + COBECWRT (0+0+1)', description: '4-combo: COBECGT M + COBECWRT M + COBECGT N + COBECWRT N' },
  { name: 'COBECYT (1+0+0) + COBECWRT (1+0+0) + COBECYT (0+0+1) + COBECWRT (0+0+1)', description: '4-combo: COBECYT M + COBECWRT M + COBECYT N + COBECWRT N' },
  { name: 'COBECPT (1+0+0) + COBECWRT (1+0+0) + COBECPT (0+0+1) + COBECWRT (0+0+1)', description: '4-combo: COBECPT M + COBECWRT M + COBECPT N + COBECWRT N' },
  { name: 'COBECPT (1+0+0) + COBECYT (1+0+0) + COBECPT (0+0+1) + COBECYT (0+0+1)', description: '4-combo: COBECPT M + COBECYT M + COBECPT N + COBECYT N' },
  { name: 'COBECWT (1+0+0) + COBECGT (1+0+0) + COBECWT (0+0+1) + COBECGT (0+0+1)', description: '4-combo: COBECWT M + COBECGT M + COBECWT N + COBECGT N' },
];

try {
  const db = new Database(dbPath);

  // Add missing columns to patients table
  const migrations = [
    "ALTER TABLE patients ADD COLUMN marital_status TEXT",
    "ALTER TABLE patients ADD COLUMN country TEXT",
    "ALTER TABLE patients ADD COLUMN city TEXT",
    "ALTER TABLE patients ADD COLUMN area TEXT",
    "ALTER TABLE patients ADD COLUMN reference TEXT",
    "ALTER TABLE patients ADD COLUMN no_of_kids INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN kids_delivery_info TEXT",
    "ALTER TABLE patients ADD COLUMN is_lactating INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN is_breastfeeding INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_hypothyroid INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_hyperthyroid INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_constipation INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_diabetes INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_stomach_issue INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_liver_issue INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_cervical_spondylosis INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_sciatica INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_frozen_shoulder INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_migraine INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_epilepsy INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_insomnia INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_sleep_apnea INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_pcos_pcod INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_fibroids INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_ovarian_cyst INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN diagnosis_gynae_issue INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN gynae_issue_details TEXT",
    "ALTER TABLE patients ADD COLUMN diagnosis_multivitamin INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN multivitamin_details TEXT",
    "ALTER TABLE patients ADD COLUMN diagnosis_medication INTEGER DEFAULT 0",
    "ALTER TABLE patients ADD COLUMN medication_details TEXT"
  ];

  migrations.forEach(sql => {
    try {
      db.exec(sql);
      console.log(`✓ ${sql.split(' ')[5]}`);
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log(`- ${sql.split(' ')[5]} (already exists)`);
      } else {
        console.error(`✗ Failed: ${sql}`);
        console.error(`  Error: ${err.message}`);
      }
    }
  });

  // Create patient_comments table if not exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS patient_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log('✓ patient_comments table created');
  } catch (err) {
    console.log('- patient_comments table already exists');
  }

  // Create patient_visits table
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS patient_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        visit_date TEXT NOT NULL,
        weight_digital_kg REAL,
        weight_digital_lbs REAL,
        weight_manual_kg REAL,
        height_ft REAL,
        waist_in REAL,
        belly_in REAL,
        hips_in REAL,
        thighs_in REAL,
        chest_in REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log('✓ patient_visits table created');
  } catch (err) {
    console.log('- patient_visits table already exists');
  }

  // Create medicine_combinations table
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS medicine_combinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        is_predefined INTEGER DEFAULT 1,
        combination_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ medicine_combinations table created');

    // Seed predefined combinations
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO medicine_combinations (name, description, is_predefined)
      VALUES (?, ?, 1)
    `);

    COMBINATIONS.forEach(combo => {
      try {
        stmt.run(combo.name, combo.description);
      } catch (err) {
        // Silently skip duplicates
      }
    });

    console.log(`✓ ${COMBINATIONS.length} predefined medicine combinations seeded`);
  } catch (err) {
    console.log('- medicine_combinations table already exists');
  }

  // Create patient_medicine_transactions table
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS patient_medicine_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        visit_id INTEGER,
        inventory_id INTEGER NOT NULL,
        combination_id INTEGER,
        transaction_type TEXT NOT NULL,
        quantity_boxes INTEGER NOT NULL,
        price_per_box REAL,
        discount_type TEXT,
        discount_value REAL,
        payment_method TEXT,
        reason TEXT,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (visit_id) REFERENCES patient_visits(id),
        FOREIGN KEY (inventory_id) REFERENCES inventory(id),
        FOREIGN KEY (combination_id) REFERENCES medicine_combinations(id)
      )
    `);
    console.log('✓ patient_medicine_transactions table created');
  } catch (err) {
    console.log('- patient_medicine_transactions table already exists');
  }

  // Create inventory table if not exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price_in REAL,
        price_out REAL,
        manufacturing_date TEXT,
        expiry_date TEXT,
        batch_number TEXT NOT NULL,
        batch_in_date TEXT,
        batch_qty_expected_cartons INTEGER DEFAULT 0,
        batch_qty_expected_boxes INTEGER DEFAULT 0,
        batch_qty_received_cartons INTEGER DEFAULT 0,
        batch_qty_received_boxes INTEGER DEFAULT 0,
        drapact_number TEXT,
        warranty_received INTEGER DEFAULT 0,
        warranty_receive_date TEXT,
        bill_invoice_number TEXT,
        in_stock_qty_boxes INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ inventory table created');
  } catch (err) {
    console.log('- inventory table already exists');
    // Try to add description column if table exists
    try {
      db.exec('ALTER TABLE inventory ADD COLUMN description TEXT');
      console.log('✓ description column added to inventory');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('- description column already exists');
      }
    }
  }

  // Create medicine_transactions table if not exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS medicine_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inventory_id INTEGER NOT NULL,
        patient_id INTEGER,
        transaction_type TEXT NOT NULL,
        quantity_boxes INTEGER NOT NULL,
        notes TEXT,
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_id) REFERENCES inventory(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log('✓ medicine_transactions table created');
  } catch (err) {
    console.log('- medicine_transactions table already exists');
  }

  console.log('\nMigration completed successfully!');
  db.close();
} catch (err) {
  console.error('Migration error:', err);
  process.exit(1);
}
