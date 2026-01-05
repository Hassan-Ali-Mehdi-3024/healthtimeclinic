# Supabase Migration Guide

## Setup Steps

### 1. Create Database Schema in Supabase

1. Go to your Supabase Dashboard: https://hglvcvdcclmovjibewrp.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `scripts/supabase-migration.sql`
4. Click **Run** to create all tables and indexes

### 2. Import Existing Data

**Option A: Automatic Import (Recommended)**
```bash
node scripts/import-to-supabase.js
```

This will automatically import all data from your SQLite database to Supabase.

**Option B: Manual Import**
1. Data has been exported to `supabase-data-export.json`
2. Go to Supabase Dashboard > **Table Editor**
3. Select each table and use **Insert > Import data from CSV/JSON**
4. Upload the corresponding data from the JSON file

### 3. Environment Variables

The `.env.local` file has been created with:
```
NEXT_PUBLIC_SUPABASE_URL=https://hglvcvdcclmovjibewrp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3Xqo1atMazpfu3tD5tskDw_fYB_jiFX
```

**Important:** Never commit `.env.local` to git. It's already in `.gitignore`.

### 4. Configure Row Level Security (RLS) - IMPORTANT!

By default, Supabase enables RLS which blocks all access. You need to either:

**Option A: Disable RLS (Quick Test - NOT for production)**
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medicine_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_transactions DISABLE ROW LEVEL SECURITY;
```

**Option B: Enable Proper RLS Policies (Production)**
```sql
-- Allow all operations for authenticated users
CREATE POLICY "Enable all for authenticated users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON patients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON inventory
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON medicines
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON patient_visits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON patient_measurements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON patient_comments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON patient_medicine_transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON medicine_transactions
  FOR ALL USING (true) WITH CHECK (true);
```

### 5. Start Development Server

```bash
npm run dev
```

Your app should now be running with Supabase!

## What Changed?

1. **lib/db.js** - Now uses Supabase client instead of better-sqlite3
2. **Environment variables** - Added Supabase credentials
3. **Boolean fields** - SQLite integers (0/1) converted to PostgreSQL booleans (true/false)
4. **Auto-increment IDs** - PostgreSQL SERIAL type instead of SQLite AUTOINCREMENT

## Rollback to SQLite

If you need to rollback:
```bash
# Restore original db.js
cp lib/db-sqlite.js.backup lib/db.js

# Reinstall better-sqlite3
npm install better-sqlite3
```

## Deployment to Vercel

Once Supabase is working locally:

1. Push code to GitHub
2. Go to Vercel Dashboard
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Troubleshooting

**Error: "No rows returned"**
- Check RLS policies are disabled or properly configured
- Verify data was imported successfully in Supabase Table Editor

**Error: "relation does not exist"**
- Run the migration SQL script in Supabase SQL Editor

**Error: "Missing Supabase environment variables"**
- Ensure `.env.local` exists and contains the correct values
- Restart the dev server after creating `.env.local`
