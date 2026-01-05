#!/usr/bin/env node
/**
 * Fix PostgreSQL SERIAL sequence issues in Supabase
 * Run this after data migration to ensure IDs auto-increment correctly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSequences() {
  const tables = [
    'users',
    'patients',
    'inventory',
    'medicines',
    'patient_visits',
    'patient_measurements',
    'patient_comments',
    'patient_medicine_transactions',
    'appointments'
  ];

  console.log('🔧 Fixing PostgreSQL sequences...\n');

  for (const table of tables) {
    try {
      // Use the Supabase admin API to run raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `SELECT setval('${table}_id_seq', (SELECT COALESCE(MAX(id), 0) FROM ${table}) + 1);`
      }).catch(async () => {
        // If rpc method doesn't work, try alternative approach
        console.log(`⚠️  Couldn't fix sequence for ${table} via RPC. This typically requires direct database access.`);
        console.log(`   To fix manually, run in Supabase SQL Editor:`);
        console.log(`   SELECT setval('${table}_id_seq', (SELECT COALESCE(MAX(id), 0) FROM ${table}) + 1);\n`);
        return null;
      });

      if (data !== null && !error) {
        console.log(`✅ Fixed sequence for ${table}`);
      }
    } catch (err) {
      console.log(`⚠️  Could not fix sequence for ${table}`);
      console.log(`   Run in Supabase SQL Editor: SELECT setval('${table}_id_seq', (SELECT COALESCE(MAX(id), 0) FROM ${table}) + 1);\n`);
    }
  }

  console.log('\n✨ Sequence fix complete!');
  console.log('\nIf you received warnings, please:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Open the SQL Editor');
  console.log('3. Run the commands shown above for each table');
}

fixSequences().catch(console.error);
