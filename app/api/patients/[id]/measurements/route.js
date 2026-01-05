import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM patient_measurements WHERE patient_id = ? ORDER BY visit_date DESC', [id]);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { weight, height, waist, hips, bmi, notes, visit_date } = await request.json();
    
    const [result] = await pool.query(
      'INSERT INTO patient_measurements (patient_id, weight, height, waist, hips, bmi, notes, visit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, weight, height, waist, hips, bmi, notes, visit_date]
    );
    
    return NextResponse.json({ 
      id: result.insertId, 
      patient_id: id,
      weight, height, waist, hips, bmi, notes, visit_date 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
