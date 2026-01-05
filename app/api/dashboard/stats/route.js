import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get total patients
    const [patientCount] = await pool.query('SELECT COUNT(*) as count FROM patients');
    
    // Get total visits
    const [visitCount] = await pool.query('SELECT COUNT(*) as count FROM patient_visits');
    
    // Get upcoming appointments
    const [appointmentCount] = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= date('now') AND status = 'scheduled'"
    );
    
    // Get low stock items
    const [lowStockCount] = await pool.query('SELECT COUNT(*) as count FROM inventory WHERE in_stock_qty_boxes < 10');
    
    // Get recent patients
    const [recentPatients] = await pool.query(
      'SELECT id, first_name, last_name, created_at FROM patients ORDER BY created_at DESC LIMIT 5'
    );
    
    // Get recent visits
    const [recentVisits] = await pool.query(
      `SELECT v.id, v.patient_id, p.first_name, p.last_name, v.visit_date 
       FROM patient_visits v 
       JOIN patients p ON v.patient_id = p.id 
       ORDER BY v.visit_date DESC, v.id DESC 
       LIMIT 5`
    );

    return NextResponse.json({
      stats: {
        totalPatients: patientCount[0].count,
        totalVisits: visitCount[0].count,
        upcomingAppointments: appointmentCount[0].count,
        lowStockItems: lowStockCount[0].count,
      },
      recentPatients,
      recentVisits
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
