import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id: patientId, visitId, transactionId } = await params;

    // 1. Get transaction details to know which medicine and quantity to restore
    const [transactions] = await pool.query(
      'SELECT medicine_id, quantity_boxes, transaction_type FROM patient_medicine_transactions WHERE id = ?',
      [transactionId]
    );

    if (!transactions.length) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const { medicine_id, quantity_boxes, transaction_type } = transactions[0];

    // 2. Get linked inventory if any
    const [medicines] = await pool.query(
      'SELECT inventory_id FROM medicines WHERE id = ?',
      [medicine_id]
    );

    const inventory_id = medicines.length > 0 ? medicines[0].inventory_id : null;

    // 3. Restore stock if linked to inventory
    if (inventory_id) {
      const [inventoryRows] = await pool.query(
        'SELECT in_stock_qty_boxes FROM inventory WHERE id = ?',
        [inventory_id]
      );

      if (inventoryRows.length) {
        const currentStock = inventoryRows[0].in_stock_qty_boxes;
        let newStock = currentStock;

        if (transaction_type === 'dispensed') {
          // Restore stock
          newStock = currentStock + quantity_boxes;
        } else if (transaction_type === 'return' || transaction_type === 'refund') {
          // Remove restored stock
          newStock = currentStock - quantity_boxes;
        }

        await pool.query('UPDATE inventory SET in_stock_qty_boxes = ? WHERE id = ?', [
          newStock,
          inventory_id
        ]);
      }
    }

    // 4. Delete the transaction
    await pool.query('DELETE FROM patient_medicine_transactions WHERE id = ?', [transactionId]);

    return NextResponse.json({ message: 'Transaction deleted and stock updated' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting medicine transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
