import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Get single medicine (Product, Combination, or Batch fallback)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const forceType = searchParams.get('type');

    // 1. Check medicines table (Products & Combinations) - Unless forced to batch
    if (forceType !== 'batch') {
      const [meds] = await pool.query('SELECT * FROM medicines WHERE id = ?', [id]);
      
      if (meds.length > 0) {
        const medicine = meds[0];
        
        if (medicine.is_predefined === 1) {
          // It's a Combination
          return NextResponse.json({ ...medicine, is_combination: true, type: 'combination' });
        } else {
          // It's a Product Concept - Fetch all associated batches
          const [batches] = await pool.query('SELECT * FROM inventory WHERE name = ? ORDER BY created_at DESC', [medicine.name]);
          return NextResponse.json({ ...medicine, batches, type: 'product' });
        }
      }
    }

    // 2. Fallback or Force: Check inventory table (Single Batch)
    const [rows] = await pool.query('SELECT * FROM inventory WHERE id = ?', [id]);
    
    if (rows.length > 0) {
      return NextResponse.json({ ...rows[0], type: 'batch' });
    }

    return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    return NextResponse.json({ error: 'Failed to fetch medicine' }, { status: 500 });
  }
}

// PUT - Update medicine batch
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.is_combination) {
      const { name, description, dosage_pattern, medicines_included, medicine_dosages, tags } = body;
      await pool.query(
        'UPDATE medicines SET name = ?, description = ?, dosage_pattern = ?, medicines_included = ?, medicine_dosages = ?, tags = ? WHERE id = ? AND is_predefined = 1',
        [name, description || '', dosage_pattern || '', medicines_included || '', medicine_dosages || '', tags || '', id]
      );
      return NextResponse.json({ message: 'Combination updated successfully' });
    }

    const {
      name,
      description,
      price_in,
      price_out,
      manufacturing_date,
      expiry_date,
      batch_number,
      batch_in_date,
      batch_qty_expected_cartons,
      batch_qty_expected_boxes,
      batch_qty_received_cartons,
      batch_qty_received_boxes,
      drapact_number,
      warranty_received,
      warranty_receive_date,
      bill_invoice_number
    } = body;

    await pool.query(
      `UPDATE inventory SET 
        name = ?, description = ?, price_in = ?, price_out = ?,
        manufacturing_date = ?, expiry_date = ?, batch_number = ?, batch_in_date = ?,
        batch_qty_expected_cartons = ?, batch_qty_expected_boxes = ?,
        batch_qty_received_cartons = ?, batch_qty_received_boxes = ?,
        drapact_number = ?, warranty_received = ?, warranty_receive_date = ?,
        bill_invoice_number = ?
      WHERE id = ?`,
      [
        name,
        description,
        price_in,
        price_out,
        manufacturing_date,
        expiry_date,
        batch_number,
        batch_in_date,
        batch_qty_expected_cartons || 0,
        batch_qty_expected_boxes || 0,
        batch_qty_received_cartons || 0,
        batch_qty_received_boxes || 0,
        drapact_number,
        warranty_received ? 1 : 0,
        warranty_receive_date,
        bill_invoice_number,
        id
      ]
    );

    // Update the medicines table to reflect any changes in name or description
    await pool.query(
      'UPDATE medicines SET name = ?, description = ? WHERE inventory_id = ?',
      [name, description, id]
    );

    return NextResponse.json({ message: 'Medicine updated successfully' });
  } catch (error) {
    console.error('Error updating medicine:', error);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

// DELETE - Delete medicine batch
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Check if it's a combination
    const [combos] = await pool.query('SELECT id FROM medicines WHERE id = ? AND is_predefined = 1', [id]);
    if (combos.length > 0) {
      await pool.query('DELETE FROM medicines WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Combination deleted successfully' });
    }

    // First, update medicines table to remove the link
    await pool.query('UPDATE medicines SET inventory_id = NULL WHERE inventory_id = ?', [id]);
    
    // Then delete the inventory item
    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Medicine batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}
