import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    // Get appointments
    const [appointments] = await pool.query(
      'SELECT * FROM appointments ORDER BY appointment_date ASC',
      []
    );

    // Enrich each appointment with patient and doctor names
    const enriched = [];
    for (const appointment of appointments) {
      let patient_name = null;
      let doctor_name = null;

      // Get patient name
      if (appointment.patient_id) {
        const [patients] = await pool.query(
          'SELECT first_name, last_name FROM patients WHERE id = ?',
          [appointment.patient_id]
        );
        if (patients.length > 0) {
          patient_name = `${patients[0].first_name} ${patients[0].last_name}`;
        }
      }

      // Get doctor name
      if (appointment.doctor_id) {
        const [users] = await pool.query(
          'SELECT full_name FROM users WHERE id = ?',
          [appointment.doctor_id]
        );
        if (users.length > 0) {
          doctor_name = users[0].full_name;
        }
      }

      enriched.push({
        ...appointment,
        patient_name,
        doctor_name
      });
    }

    return NextResponse.json(enriched, { status: 200 });
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
