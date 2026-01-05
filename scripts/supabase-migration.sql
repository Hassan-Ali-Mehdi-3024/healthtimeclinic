-- Supabase Migration Script for Health Time Clinic
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'doctor',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    marital_status TEXT,
    country TEXT,
    city TEXT,
    area TEXT,
    reference TEXT,
    no_of_kids INTEGER DEFAULT 0,
    kids_delivery_info TEXT,
    is_lactating BOOLEAN DEFAULT false,
    is_breastfeeding BOOLEAN DEFAULT false,
    
    -- Diagnosis fields
    diagnosis_hypothyroid BOOLEAN DEFAULT false,
    diagnosis_hyperthyroid BOOLEAN DEFAULT false,
    diagnosis_constipation BOOLEAN DEFAULT false,
    diagnosis_diabetes BOOLEAN DEFAULT false,
    diagnosis_stomach_issue BOOLEAN DEFAULT false,
    diagnosis_liver_issue BOOLEAN DEFAULT false,
    diagnosis_cervical_spondylosis BOOLEAN DEFAULT false,
    diagnosis_sciatica BOOLEAN DEFAULT false,
    diagnosis_frozen_shoulder BOOLEAN DEFAULT false,
    diagnosis_migraine BOOLEAN DEFAULT false,
    diagnosis_epilepsy BOOLEAN DEFAULT false,
    diagnosis_insomnia BOOLEAN DEFAULT false,
    diagnosis_sleep_apnea BOOLEAN DEFAULT false,
    diagnosis_pcos_pcod BOOLEAN DEFAULT false,
    diagnosis_fibroids BOOLEAN DEFAULT false,
    diagnosis_ovarian_cyst BOOLEAN DEFAULT false,
    diagnosis_gynae_issue BOOLEAN DEFAULT false,
    diagnosis_multivitamin BOOLEAN DEFAULT false,
    diagnosis_medication BOOLEAN DEFAULT false,
    
    gynae_issue_details TEXT,
    multivitamin_details TEXT,
    medication_details TEXT
);

-- Create inventory table (stock batches)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    medicine_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    price_in REAL,
    price_out REAL,
    manufacturing_date TEXT,
    expiry_date TEXT,
    batch_number TEXT,
    batch_in_date TEXT,
    batch_qty_expected_cartons INTEGER,
    batch_qty_expected_boxes INTEGER,
    batch_qty_received_cartons INTEGER,
    batch_qty_received_boxes INTEGER,
    drapact_number TEXT,
    warranty_received INTEGER,
    warranty_receive_date TEXT,
    bill_invoice_number TEXT,
    in_stock_qty_boxes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create medicines table (predefined combinations)
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    inventory_id INTEGER,
    is_predefined INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    tags TEXT,
    medicines_included TEXT,
    dosage_pattern TEXT,
    medicine_dosages TEXT
);

-- Create patient_visits table
CREATE TABLE IF NOT EXISTS patient_visits (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create patient_measurements table
CREATE TABLE IF NOT EXISTS patient_measurements (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    weight REAL,
    height REAL,
    waist REAL,
    hips REAL,
    bmi REAL,
    notes TEXT,
    visit_date TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create patient_comments table
CREATE TABLE IF NOT EXISTS patient_comments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create patient_medicine_transactions table
CREATE TABLE IF NOT EXISTS patient_medicine_transactions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    visit_id INTEGER REFERENCES patient_visits(id) ON DELETE CASCADE,
    medicine_id INTEGER REFERENCES medicines(id),
    transaction_type TEXT,
    quantity_boxes INTEGER,
    price_per_box REAL,
    discount_type TEXT,
    discount_value REAL,
    payment_method TEXT,
    reason TEXT,
    transaction_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create medicine_transactions table
CREATE TABLE IF NOT EXISTS medicine_transactions (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER REFERENCES inventory(id),
    transaction_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    transaction_date TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default user
INSERT INTO users (username, password, full_name, role) 
VALUES ('muhammadfayrad', 'doctor', 'Muhammad Faryad', 'doctor')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patient_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_measurements_patient_id ON patient_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_comments_patient_id ON patient_comments(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medicine_transactions_patient_id ON patient_medicine_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_medicine_transactions_visit_id ON patient_medicine_transactions(visit_id);
CREATE INDEX IF NOT EXISTS idx_medicines_is_predefined ON medicines(is_predefined);
