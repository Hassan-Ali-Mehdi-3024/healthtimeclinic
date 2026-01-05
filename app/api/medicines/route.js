import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List all medicines (including inventory batches and combinations)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'batch' or 'combination' or null for all

    let query = '';
    if (type === 'combination') {
      query = 'SELECT * FROM medicines WHERE is_predefined = 1 ORDER BY name ASC';
    } else if (type === 'batch') {
      query = 'SELECT * FROM inventory ORDER BY created_at DESC';
    } else {
      // Default: List all inventory batches (this was the main inventory list)
      query = 'SELECT * FROM inventory ORDER BY created_at DESC';
    }

    const [rows] = await pool.query(query);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

// POST - Create new inventory batch or combination
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (body.is_combination) {
      // Create a predefined combination
      const { name, description, dosage_pattern, medicines_included, medicine_dosages, tags } = body;
      const [result] = await pool.query(
        'INSERT INTO medicines (name, description, dosage_pattern, medicines_included, medicine_dosages, tags, is_predefined) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [name, description || '', dosage_pattern || '', medicines_included || '', medicine_dosages || '', tags || '']
      );
      return NextResponse.json({ id: result.insertId, message: 'Combination created successfully' });
    }

    // Otherwise, create new inventory batch (original inventory POST logic)
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
      bill_invoice_number,
      in_stock_qty_boxes
    } = body;

    const [result] = await pool.query(
      `INSERT INTO inventory (
        name, description, price_in, price_out, manufacturing_date, expiry_date,
        batch_number, batch_in_date, batch_qty_expected_cartons, batch_qty_expected_boxes,
        batch_qty_received_cartons, batch_qty_received_boxes, drapact_number,
        warranty_received, warranty_receive_date, bill_invoice_number, in_stock_qty_boxes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        batch_qty_received_boxes || 0
      ]
    );

    const inventoryId = result.insertId;

    // Update or create medicine entry
    const [existingMedicines] = await pool.query(
      'SELECT id FROM medicines WHERE name = ?',
      [name]
    );

    if (existingMedicines.length > 0) {
      await pool.query(
        'UPDATE medicines SET inventory_id = ?, is_predefined = 0 WHERE id = ?',
        [inventoryId, existingMedicines[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO medicines (name, description, inventory_id, is_predefined) VALUES (?, ?, ?, 0)',
        [name, description, inventoryId]
      );
    }

    return NextResponse.json({ id: inventoryId, message: 'Medicine batch created successfully' });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
