const sqlite3 = require('better-sqlite3');
const db = sqlite3('healthtime.db');

console.log('Current inventory schema:');
const currentSchema = db.prepare("PRAGMA table_info(inventory)").all();
console.log(currentSchema);

console.log('\nRecreating inventory table without NOT NULL constraint on medicine_id...');

// Since SQLite doesn't support ALTER COLUMN, we need to recreate the table
db.exec(`
  -- Create new table with correct schema
  CREATE TABLE inventory_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_id TEXT,
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
  );

  -- Copy data from old table
  INSERT INTO inventory_new SELECT * FROM inventory;

  -- Drop old table
  DROP TABLE inventory;

  -- Rename new table
  ALTER TABLE inventory_new RENAME TO inventory;
`);

console.log('✓ Inventory table recreated successfully');

console.log('\nNew inventory schema:');
const newSchema = db.prepare("PRAGMA table_info(inventory)").all();
console.log(newSchema);

db.close();
