
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('healthtime', salt);

    console.log('Updating doctor password to hashed version...');
    
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        email: 'doctor@healthtime.clinic' 
      })
      .eq('username', 'doctor')
      .select();

    if (error) {
      console.error('Error updating user:', error);
    } else {
      console.log('Success! User updated:', data);
    }
  } catch (err) {
    console.error('Script failed:', err);
  }
}

main();
