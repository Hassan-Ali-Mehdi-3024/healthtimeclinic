import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const [appointments] = await pool.query(
      `SELECT a.*, p.first_name || ' ' || p.last_name as patient_name, u.full_name as doctor_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       LEFT JOIN users u ON a.doctor_id = u.id
       ORDER BY a.appointment_date ASC`,
      []
    );

    return NextResponse.json(appointments, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { patient_id, doctor_id, appointment_date, reason, status = 'scheduled' } = body;

    if (!patient_id || !appointment_date) {
      return NextResponse.json({ error: 'patient_id and appointment_date are required' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [patient_id, doctor_id || null, appointment_date, reason || null, status]
    );

    return NextResponse.json({ id: result.insertId, message: 'Appointment created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
