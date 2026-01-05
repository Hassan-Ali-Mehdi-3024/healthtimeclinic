# Fix Supabase SERIAL Sequence Issues

If you see errors like "duplicate key value violates unique constraint", it means the PostgreSQL sequences are out of sync with your migrated data.

## Quick Fix (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Run the following commands one by one:

```sql
-- Fix sequence for each table
SELECT setval('patient_medicine_transactions_id_seq', (SELECT COALESCE(MAX(id), 0) FROM patient_medicine_transactions) + 1);
SELECT setval('patient_visits_id_seq', (SELECT COALESCE(MAX(id), 0) FROM patient_visits) + 1);
SELECT setval('patient_measurements_id_seq', (SELECT COALESCE(MAX(id), 0) FROM patient_measurements) + 1);
SELECT setval('patient_comments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM patient_comments) + 1);
SELECT setval('patients_id_seq', (SELECT COALESCE(MAX(id), 0) FROM patients) + 1);
SELECT setval('inventory_id_seq', (SELECT COALESCE(MAX(id), 0) FROM inventory) + 1);
SELECT setval('medicines_id_seq', (SELECT COALESCE(MAX(id), 0) FROM medicines) + 1);
SELECT setval('appointments_id_seq', (SELECT COALESCE(MAX(id), 0) FROM appointments) + 1);
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users) + 1);
```

5. After running these commands, try creating a new visit again - it should work!

## Why This Happens

When migrating from SQLite to PostgreSQL/Supabase:
- The data gets imported with existing IDs
- But the SERIAL sequences aren't updated
- PostgreSQL tries to use the next sequence number (usually 1, 2, 3...)
- This conflicts with imported data that already uses those IDs
- The fix: Tell PostgreSQL what the next valid ID should be
