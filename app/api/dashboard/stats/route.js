import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get total patients
    const [patients] = await pool.query('SELECT id FROM patients');
    const patientCount = patients.length;
    
    // Get total visits
    const [visits] = await pool.query('SELECT id FROM patient_visits');
    const visitCount = visits.length;
    
    // Get low stock items
    const [lowStock] = await pool.query('SELECT id FROM inventory WHERE in_stock_qty_boxes < 10');
    const lowStockCount = lowStock.length;
    
    // Get recent patients
    const [recentPatients] = await pool.query(
      'SELECT id, first_name, last_name, created_at FROM patients ORDER BY created_at DESC LIMIT 5'
    );
    
    // Get recent visits with patient names
    const [recentVisitsRaw] = await pool.query(
      'SELECT id, patient_id, visit_date FROM patient_visits ORDER BY visit_date DESC, id DESC LIMIT 5'
    );
    
    // Enrich with patient names
    const recentVisits = [];
    for (const visit of recentVisitsRaw) {
      const [patientRows] = await pool.query(
        'SELECT first_name, last_name FROM patients WHERE id = ?',
        [visit.patient_id]
      );
      const patient = patientRows.length > 0 ? patientRows[0] : null;
      recentVisits.push({
        ...visit,
        first_name: patient?.first_name || null,
        last_name: patient?.last_name || null
      });
    }

    return NextResponse.json({
      stats: {
        totalPatients: patientCount,
        totalVisits: visitCount,
        upcomingAppointments: 0,
        lowStockItems: lowStockCount,
      },
      recentPatients,
      recentVisits
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
