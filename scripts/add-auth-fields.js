
import pool from '../lib/db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  console.log('Starting auth migration...');

  try {
    // 1. Add new columns to users table
    // Note: SQLite/Postgres syntax compatibility handled by the fact we are likely on Supabase (Postgres)
    // but the wrapper tries to be generic. 
    // We'll try adding columns one by one. If they exist, it might fail, so we catch errors.
    
    const columns = [
      'ALTER TABLE users ADD COLUMN email TEXT;',
      'ALTER TABLE users ADD COLUMN reset_token TEXT;',
      'ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME;'
    ];

    for (const sql of columns) {
      try {
        await pool.query(sql);
        console.log(`Executed: ${sql}`);
      } catch (e) {
        // Ignore error if column likely exists
        console.log(`Skipped (may exist): ${sql}`);
      }
    }

    // 2. Update default doctor password to be hashed
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('healthtime', salt);

    // Update the default doctor user
    // We also set a default email if it's missing
    await pool.query(
      `UPDATE users 
       SET password = ?, 
           email = COALESCE(email, 'doctor@healthtime.clinic') 
       WHERE username = 'doctor'`,
      [hashedPassword]
    );
    
    console.log('Updated default doctor password to hash and set email.');
    console.log('Migration complete.');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
