import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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
    
    await pool.query(
      `UPDATE patients SET
        first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, marital_status = ?,
        country = ?, city = ?, area = ?, phone = ?, email = ?, reference = ?,
        no_of_kids = ?, kids_delivery_info = ?, is_lactating = ?, is_breastfeeding = ?,
        diagnosis_hypothyroid = ?, diagnosis_hyperthyroid = ?, diagnosis_constipation = ?,
        diagnosis_diabetes = ?, diagnosis_stomach_issue = ?, diagnosis_liver_issue = ?,
        diagnosis_cervical_spondylosis = ?, diagnosis_sciatica = ?, diagnosis_frozen_shoulder = ?,
        diagnosis_migraine = ?, diagnosis_epilepsy = ?, diagnosis_insomnia = ?,
        diagnosis_sleep_apnea = ?, diagnosis_pcos_pcod = ?, diagnosis_fibroids = ?,
        diagnosis_ovarian_cyst = ?, diagnosis_gynae_issue = ?, gynae_issue_details = ?,
        diagnosis_multivitamin = ?, multivitamin_details = ?, diagnosis_medication = ?,
        medication_details = ?
      WHERE id = ?`,
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
        medication_details,
        id
      ]
    );
    
    return NextResponse.json({ message: 'Patient updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Start a transaction or just delete in order
    // 1. Delete medicine transactions
    await pool.query('DELETE FROM patient_medicine_transactions WHERE patient_id = ?', [id]);
    
    // 2. Delete visits
    await pool.query('DELETE FROM patient_visits WHERE patient_id = ?', [id]);
    
    // 3. Delete comments
    await pool.query('DELETE FROM patient_comments WHERE patient_id = ?', [id]);
    
    // 4. Delete appointments
    await pool.query('DELETE FROM appointments WHERE patient_id = ?', [id]);
    
    // 5. Finally delete the patient
    await pool.query('DELETE FROM patients WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Patient and all related records deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
