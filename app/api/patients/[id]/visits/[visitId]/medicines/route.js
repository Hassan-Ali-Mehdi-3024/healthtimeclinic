import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id: patientId, visitId } = await params;

    const [transactions] = await pool.query(
      `SELECT pmt.*, m.name as medicine_name
       FROM patient_medicine_transactions pmt
       LEFT JOIN medicines m ON pmt.medicine_id = m.id
       WHERE pmt.patient_id = ? AND pmt.visit_id = ?
       ORDER BY pmt.created_at DESC`,
      [patientId, visitId]
    );

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching medicine transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { id: patientId, visitId } = await params;
    const body = await request.json();
    const {
      medicine_id,
      transaction_type,
      quantity_boxes,
      price_per_box,
      discount_type,
      discount_value,
      payment_method,
      reason
    } = body;

    if (!medicine_id || !transaction_type || !quantity_boxes) {
      return NextResponse.json(
        { error: 'medicine_id, transaction_type, and quantity_boxes are required' },
        { status: 400 }
      );
    }

    // Get medicine info
    const [medicineRows] = await pool.query(
      'SELECT id, name, inventory_id, is_predefined FROM medicines WHERE id = ?',
      [medicine_id]
    );

    if (!medicineRows.length) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    const medicine = medicineRows[0];

    // Helper function to parse combination and update stock
    const updateStockForCombination = async (medicineName, quantityBoxes, transactionType) => {
      // Parse the combination name to extract base medicines
      // Format: "COBECWT (1+0+0)" or "COBECWT (1+0+0) + COBECGT (0+0+1)"
      const parts = medicineName.split(' + ');
      
      for (const part of parts) {
        // Extract medicine name (before the parentheses or just the name)
        const match = part.match(/^([A-Z\-]+)/);
        if (!match) continue;
        
        const baseMedicineName = match[1];
        
        // Find inventory for this base medicine
        const [inventoryRows] = await pool.query(
          'SELECT id, in_stock_qty_boxes FROM inventory WHERE name = ? ORDER BY created_at DESC LIMIT 1',
          [baseMedicineName]
        );

        if (inventoryRows.length) {
          const inventory = inventoryRows[0];
          let stockChange = 0;

          if (transactionType === 'dispensed') {
            stockChange = -quantityBoxes;
          } else if (transactionType === 'return' || transactionType === 'refund') {
            stockChange = quantityBoxes;
          }

          const newStock = inventory.in_stock_qty_boxes + stockChange;

          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${baseMedicineName}. Available: ${inventory.in_stock_qty_boxes}, Required: ${Math.abs(stockChange)}`);
          }

          await pool.query(
            'UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?',
            [newStock, inventory.id]
          );
        }
      }
    };

    // Update stock based on medicine type
    if (medicine.inventory_id) {
      // Direct inventory link (single base medicine batch)
      const [inventoryRows] = await pool.query(
        'SELECT in_stock_qty_boxes FROM inventory WHERE id = ?',
        [medicine.inventory_id]
      );

      if (inventoryRows.length) {
        const currentStock = inventoryRows[0].in_stock_qty_boxes;
        let newStock = currentStock;

        if (transaction_type === 'dispensed') {
          newStock = currentStock - quantity_boxes;
          if (newStock < 0) {
            return NextResponse.json(
              { error: 'Insufficient stock available' },
              { status: 400 }
            );
          }
        } else if (transaction_type === 'return' || transaction_type === 'refund') {
          newStock = currentStock + quantity_boxes;
        }

        await pool.query('UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?', [
          newStock,
          medicine.inventory_id
        ]);
      }
    } else if (medicine.is_predefined) {
      // Predefined combination - update stock for each base medicine
      try {
        await updateStockForCombination(medicine.name, quantity_boxes, transaction_type);
      } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // Insert transaction
    const [result] = await pool.query(
      `INSERT INTO patient_medicine_transactions
       (patient_id, visit_id, medicine_id, transaction_type, quantity_boxes,
        price_per_box, discount_type, discount_value, payment_method, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        visitId,
        medicine_id,
        transaction_type,
        quantity_boxes,
        price_per_box || null,
        discount_type || null,
        discount_value || null,
        payment_method || null,
        reason || null
      ]
    );

    return NextResponse.json(
      {
        id: result.insertId,
        patient_id: patientId,
        visit_id: visitId,
        medicine_id,
        transaction_type,
        quantity_boxes,
        message: 'Medicine transaction recorded'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating medicine transaction:', error);
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}
