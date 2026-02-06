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
    const updateStockForCombination = async (medicineId, quantityBoxes, transactionType) => {
      // 1. Get combination details
      const [comboRows] = await pool.query(
        'SELECT medicines_included FROM medicines WHERE id = ?',
        [medicineId]
      );

      if (!comboRows.length) throw new Error('Combination not found');
      
      let includedMedicines = [];
      try {
        // Handle if it's already an array or a JSON string
        const raw = comboRows[0].medicines_included;
        includedMedicines = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        console.error('Error parsing included medicines:', e);
        throw new Error('Invalid combination configuration');
      }

      if (!Array.isArray(includedMedicines) || includedMedicines.length === 0) {
        // Fallback to name parsing if JSON is empty (legacy support)
        // ... (skipping legacy parsing for now to enforce new structure, or add back if needed)
        throw new Error('Combination has no base medicines defined');
      }

      // 2. Process each base medicine
      for (const baseMedicineName of includedMedicines) {
        let remainingToDeduct = quantityBoxes;
        
        // Get all batches with stock, ordered by expiry (FIFO)
        // For returns, we might just add to the newest batch or a specific "Return" batch? 
        // For simplicity, returns -> Add to newest batch. Dispense -> Deduct from oldest.
        
        if (transactionType === 'dispensed') {
          const [batches] = await pool.query(
            'SELECT id, in_stock_qty_boxes FROM inventory WHERE name = ? AND in_stock_qty_boxes > 0 ORDER BY expiry_date ASC, created_at ASC',
            [baseMedicineName]
          );

          if (!batches.length) {
             throw new Error(`Out of stock: ${baseMedicineName}`);
          }

          // Check total availability first
          const totalStock = batches.reduce((sum, b) => sum + b.in_stock_qty_boxes, 0);
          if (totalStock < remainingToDeduct) {
             throw new Error(`Insufficient stock for ${baseMedicineName}. Required: ${remainingToDeduct}, Available: ${totalStock}`);
          }

          // Deduct from batches
          for (const batch of batches) {
            if (remainingToDeduct <= 0) break;

            const deductFromThis = Math.min(batch.in_stock_qty_boxes, remainingToDeduct);
            
            await pool.query(
              'UPDATE inventory SET in_stock_qty_boxes = in_stock_qty_boxes - ? WHERE id = ?',
              [deductFromThis, batch.id]
            );

            remainingToDeduct -= deductFromThis;
          }
        } else {
          // Return/Refund: Add back to the most recent batch (or one with latest expiry)
          // Ideally we'd know which batch it came from, but we don't track that granularly yet.
          const [batches] = await pool.query(
            'SELECT id FROM inventory WHERE name = ? ORDER BY expiry_date DESC, created_at DESC LIMIT 1',
            [baseMedicineName]
          );

          if (batches.length) {
            await pool.query(
              'UPDATE inventory SET in_stock_qty_boxes = in_stock_qty_boxes + ? WHERE id = ?',
              [quantityBoxes, batches[0].id]
            );
          } else {
             // Edge case: No batches exist (maybe deleted?). 
             // We can't return stock if no container exists. 
             // In a real app, we might create a "Returns" batch.
             throw new Error(`Cannot return ${baseMedicineName}: No active batch found to restore stock.`);
          }
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
        await updateStockForCombination(medicine.id, quantity_boxes, transaction_type);
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
