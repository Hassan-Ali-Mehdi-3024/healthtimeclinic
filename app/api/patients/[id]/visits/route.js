import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id: patientId } = await params;

    const [visits] = await pool.query(
      `SELECT id, visit_date, weight_digital_kg, weight_digital_lbs, weight_manual_kg, 
              height_ft, waist_in, belly_in, hips_in, thighs_in, chest_in, notes, created_at
       FROM patient_visits
       WHERE patient_id = ?
       ORDER BY visit_date DESC`,
      [patientId]
    );

    return NextResponse.json(visits, { status: 200 });
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id: patientId } = await params;
    const body = await request.json();
    const {
      visit_date,
      weight_digital_kg,
      weight_digital_lbs,
      weight_manual_kg,
      height_ft,
      waist_in,
      belly_in,
      hips_in,
      thighs_in,
      chest_in,
      notes
    } = body;

    if (!visit_date) {
      return NextResponse.json({ error: 'Visit date is required' }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO patient_visits 
       (patient_id, visit_date, weight_digital_kg, weight_digital_lbs, weight_manual_kg,
        height_ft, waist_in, belly_in, hips_in, thighs_in, chest_in, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        visit_date,
        weight_digital_kg || null,
        weight_digital_lbs || null,
        weight_manual_kg || null,
        height_ft || null,
        waist_in || null,
        belly_in || null,
        hips_in || null,
        thighs_in || null,
        chest_in || null,
        notes || null
      ]
    );

    return NextResponse.json(
      { id: result.insertId, visit_date, message: 'Visit created' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}
