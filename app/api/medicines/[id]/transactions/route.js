import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List all transactions for a medicine batch
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const [rows] = await pool.query(
      `SELECT mt.*, p.first_name, p.last_name 
       FROM medicine_transactions mt
       LEFT JOIN patients p ON mt.patient_id = p.id
       WHERE mt.inventory_id = ?
       ORDER BY mt.transaction_date DESC`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Create new transaction and update stock
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { patient_id, transaction_type, quantity_boxes, notes } = await request.json();

    // Insert transaction
    const [result] = await pool.query(
      `INSERT INTO medicine_transactions (
        inventory_id, patient_id, transaction_type, quantity_boxes, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [id, patient_id || null, transaction_type, quantity_boxes, notes]
    );

    // Update inventory stock
    await pool.query(
      `UPDATE inventory 
       SET in_stock_qty_boxes = in_stock_qty_boxes + ? 
       WHERE id = ?`,
      [quantity_boxes, id]
    );

    // Get updated stock quantity
    const [inventory] = await pool.query('SELECT in_stock_qty_boxes FROM inventory WHERE id = ?', [id]);

    return NextResponse.json({
      id: result.insertId,
      inventory_id: id,
      patient_id,
      transaction_type,
      quantity_boxes,
      notes,
      updated_stock: inventory[0]?.in_stock_qty_boxes || 0,
      message: 'Transaction recorded successfully'
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
