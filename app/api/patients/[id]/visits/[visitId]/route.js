import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id: patientId, visitId } = await params;

    // 1. Get all medicine transactions for this visit to restore stock
    const [transactions] = await pool.query(
      'SELECT id, medicine_id, quantity_boxes, transaction_type FROM patient_medicine_transactions WHERE visit_id = ?',
      [visitId]
    );

    // 2. Restore stock for each transaction
    for (const transaction of transactions) {
      const { medicine_id, quantity_boxes, transaction_type } = transaction;

      const [medicines] = await pool.query(
        'SELECT inventory_id FROM medicines WHERE id = ?',
        [medicine_id]
      );

      const inventory_id = medicines.length > 0 ? medicines[0].inventory_id : null;

      if (inventory_id) {
        const [inventoryRows] = await pool.query(
          'SELECT in_stock_qty_boxes FROM inventory WHERE id = ?',
          [inventory_id]
        );

        if (inventoryRows.length) {
          const currentStock = inventoryRows[0].in_stock_qty_boxes;
          let newStock = currentStock;

          if (transaction_type === 'dispensed') {
            newStock = currentStock + quantity_boxes;
          } else if (transaction_type === 'return' || transaction_type === 'refund') {
            newStock = currentStock - quantity_boxes;
          }

          await pool.query('UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?', [
            newStock,
            inventory_id
          ]);
        }
      }
    }

    // 3. Delete medicine transactions
    await pool.query('DELETE FROM patient_medicine_transactions WHERE visit_id = ?', [visitId]);

    // 4. Delete the visit
    await pool.query('DELETE FROM patient_visits WHERE id = ?', [visitId]);

    return NextResponse.json({ message: 'Visit and related transactions deleted, stock restored' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting visit:', error);
    return NextResponse.json({ error: 'Failed to delete visit' }, { status: 500 });
  }
}
