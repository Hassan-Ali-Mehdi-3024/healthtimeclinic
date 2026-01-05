import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id: patientId, visitId } = await params;

    // Fetch transactions for this visit
    const [transactions] = await pool.query(
      `SELECT * FROM patient_medicine_transactions
       WHERE patient_id = ? AND visit_id = ?
       ORDER BY created_at DESC`,
      [patientId, visitId]
    );

    // Ensure transactions is an array
    const transactionsArray = Array.isArray(transactions) ? transactions : [];

    // Fetch medicine names for the transactions
    const medicineIds = [...new Set(transactionsArray.map(t => t.medicine_id).filter(Boolean))];
    const medicineMap = {};
    
    if (medicineIds.length > 0) {
      for (const medId of medicineIds) {
        // Try medicines table first
        const [med] = await pool.query(
          'SELECT id, name FROM medicines WHERE id = ?',
          [medId]
        );
        if (med && med.length > 0) {
          medicineMap[medId] = med[0].name;
        } else {
          // If not found, try inventory table (in case medicine_id is actually an inventory ID)
          const [inv] = await pool.query(
            'SELECT id, name FROM inventory WHERE id = ?',
            [medId]
          );
          if (inv && inv.length > 0) {
            medicineMap[medId] = inv[0].name;
          }
        }
      }
    }
    
    // Add medicine names to transactions
    const enrichedTransactions = transactionsArray.map(t => ({
      ...t,
      medicine_name: medicineMap[t.medicine_id] || null
    }));

    return NextResponse.json(enrichedTransactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching medicine transactions:', error);
    return NextResponse.json([], { status: 200 });
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

    // Try to find as a medicine first, then as an inventory batch
    let medicine = null;
    let inventoryId = null;
    
    // Check if it's a medicine in the medicines table
    const [medicineRows] = await pool.query(
      'SELECT id, name, inventory_id, is_predefined FROM medicines WHERE id = ?',
      [medicine_id]
    );

    if (medicineRows.length > 0) {
      medicine = medicineRows[0];
      if (medicine.inventory_id) {
        inventoryId = medicine.inventory_id;
      }
    } else {
      // Try as inventory batch (which might be used directly as medicine_id)
      const [inventoryRows] = await pool.query(
        'SELECT id, name, in_stock_qty_boxes FROM inventory WHERE id = ?',
        [medicine_id]
      );
      
      if (inventoryRows.length > 0) {
        // Create a pseudo-medicine object for inventory
        medicine = {
          id: medicine_id,
          name: inventoryRows[0].name,
          inventory_id: medicine_id,
          is_predefined: false
        };
        inventoryId = medicine_id;
      } else {
        return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
      }
    }

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
