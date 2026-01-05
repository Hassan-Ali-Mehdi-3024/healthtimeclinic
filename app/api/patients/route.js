import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      first_name, last_name, date_of_birth, gender, marital_status,
      country, city, area, phone, email, reference,
      no_of_kids, kids_delivery_info, is_lactating, is_breastfeeding,
      diagnosis_hypothyroid, diagnosis_hyperthyroid, diagnosis_constipation,
      diagnosis_diabetes, diagnosis_stomach_issue, diagnosis_liver_issue,
      diagnosis_cervical_spondylosis, diagnosis_sciatica, diagnosis_frozen_shoulder,
      diagnosis_migraine, diagnosis_epilepsy, diagnosis_insomnia,
      diagnosis_sleep_apnea, diagnosis_pcos_pcod, diagnosis_fibroids,
      diagnosis_ovarian_cyst, diagnosis_gynae_issue, gynae_issue_details,
      diagnosis_multivitamin, multivitamin_details, diagnosis_medication,
      medication_details
    } = body;

    const [result] = await pool.query(
      `INSERT INTO patients (
        first_name, last_name, date_of_birth, gender, marital_status,
        country, city, area, phone, email, reference,
        no_of_kids, kids_delivery_info, is_lactating, is_breastfeeding,
        diagnosis_hypothyroid, diagnosis_hyperthyroid, diagnosis_constipation,
        diagnosis_diabetes, diagnosis_stomach_issue, diagnosis_liver_issue,
        diagnosis_cervical_spondylosis, diagnosis_sciatica, diagnosis_frozen_shoulder,
        diagnosis_migraine, diagnosis_epilepsy, diagnosis_insomnia,
        diagnosis_sleep_apnea, diagnosis_pcos_pcod, diagnosis_fibroids,
        diagnosis_ovarian_cyst, diagnosis_gynae_issue, gynae_issue_details,
        diagnosis_multivitamin, multivitamin_details, diagnosis_medication,
        medication_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, date_of_birth, gender, marital_status,
        country, city, area, phone, email, reference,
        no_of_kids || 0, kids_delivery_info, is_lactating ? 1 : 0, is_breastfeeding ? 1 : 0,
        diagnosis_hypothyroid ? 1 : 0, diagnosis_hyperthyroid ? 1 : 0, diagnosis_constipation ? 1 : 0,
        diagnosis_diabetes ? 1 : 0, diagnosis_stomach_issue ? 1 : 0, diagnosis_liver_issue ? 1 : 0,
        diagnosis_cervical_spondylosis ? 1 : 0, diagnosis_sciatica ? 1 : 0, diagnosis_frozen_shoulder ? 1 : 0,
        diagnosis_migraine ? 1 : 0, diagnosis_epilepsy ? 1 : 0, diagnosis_insomnia ? 1 : 0,
        diagnosis_sleep_apnea ? 1 : 0, diagnosis_pcos_pcod ? 1 : 0, diagnosis_fibroids ? 1 : 0,
        diagnosis_ovarian_cyst ? 1 : 0, diagnosis_gynae_issue ? 1 : 0, gynae_issue_details,
        diagnosis_multivitamin ? 1 : 0, multivitamin_details, diagnosis_medication ? 1 : 0,
        medication_details
      ]
    );
    return NextResponse.json({ id: result.insertId, message: 'Patient created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
