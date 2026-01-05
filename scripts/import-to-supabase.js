// Import SQLite data to Supabase
import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';

const supabaseUrl = 'https://hglvcvdcclmovjibewrp.supabase.co';
const supabaseKey = 'sb_publishable_3Xqo1atMazpfu3tD5tskDw_fYB_jiFX';

const supabase = createClient(supabaseUrl, supabaseKey);
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

async function importTable(tableName) {
  try {
    const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
    
    if (rows.length === 0) {
      console.log(`⚠ Table ${tableName} is empty`);
      return;
    }
    
    // Convert SQLite boolean integers to JavaScript booleans
    const converted = rows.map(row => {
      const newRow = { ...row };
      Object.keys(newRow).forEach(key => {
        // Only convert diagnosis_ and is_lactating/is_breastfeeding to boolean
        // Keep is_predefined as integer
        if (key !== 'is_predefined' && (key.startsWith('is_') || key.startsWith('diagnosis_'))) {
          newRow[key] = Boolean(newRow[key]);
        }
      });
      return newRow;
    });
    
    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < converted.length; i += batchSize) {
      const batch = converted.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`✗ Error importing ${tableName}:`, error.message);
        throw error;
      }
    }
    
    console.log(`✓ Imported ${converted.length} rows to ${tableName}`);
  } catch (error) {
    console.error(`✗ Failed to import ${tableName}:`, error.message);
  }
}

async function main() {
  console.log('=== Importing SQLite data to Supabase ===\n');
  
  for (const table of tables) {
    await importTable(table);
  }
  
  console.log('\n✅ Data import complete!');
  db.close();
}

main().catch(console.error);
