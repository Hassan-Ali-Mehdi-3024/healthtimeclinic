-- Create users table (for the doctor)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'doctor',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert the default doctor user
INSERT OR IGNORE INTO users (username, password, full_name, role) 
VALUES ('doctor', 'healthtime', 'Dr. Faryad', 'doctor');

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT,
    gender TEXT,
    marital_status TEXT,
    country TEXT,
    city TEXT,
    area TEXT,
    phone TEXT,
    email TEXT,
    reference TEXT,
    no_of_kids INTEGER DEFAULT 0,
    kids_delivery_info TEXT,
    is_lactating INTEGER DEFAULT 0,
    is_breastfeeding INTEGER DEFAULT 0,
    
    -- Diagnosis fields (boolean: 0=no, 1=yes)
    diagnosis_hypothyroid INTEGER DEFAULT 0,
    diagnosis_hyperthyroid INTEGER DEFAULT 0,
    diagnosis_constipation INTEGER DEFAULT 0,
    diagnosis_diabetes INTEGER DEFAULT 0,
    diagnosis_stomach_issue INTEGER DEFAULT 0,
    diagnosis_liver_issue INTEGER DEFAULT 0,
    diagnosis_cervical_spondylosis INTEGER DEFAULT 0,
    diagnosis_sciatica INTEGER DEFAULT 0,
    diagnosis_frozen_shoulder INTEGER DEFAULT 0,
    diagnosis_migraine INTEGER DEFAULT 0,
    diagnosis_epilepsy INTEGER DEFAULT 0,
    diagnosis_insomnia INTEGER DEFAULT 0,
    diagnosis_sleep_apnea INTEGER DEFAULT 0,
    diagnosis_pcos_pcod INTEGER DEFAULT 0,
    diagnosis_fibroids INTEGER DEFAULT 0,
    diagnosis_ovarian_cyst INTEGER DEFAULT 0,
    diagnosis_gynae_issue INTEGER DEFAULT 0,
    gynae_issue_details TEXT,
    diagnosis_multivitamin INTEGER DEFAULT 0,
    multivitamin_details TEXT,
    diagnosis_medication INTEGER DEFAULT 0,
    medication_details TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_date TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Create patient visits table (replaces patient measurements)
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
);

-- Create medicine combinations table
CREATE TABLE IF NOT EXISTS medicine_combinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_predefined INTEGER DEFAULT 1,
    combination_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create patient medicine transactions table
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
);

-- Create patient comments table
CREATE TABLE IF NOT EXISTS patient_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Create inventory table
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
);

-- Create medicine transactions table
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
);
