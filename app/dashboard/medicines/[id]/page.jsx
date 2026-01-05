'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus, TrendingDown, TrendingUp, FileText, Pill } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicineDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState({
    transaction_type: 'dispensed',
    quantity_boxes: '',
    patient_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/medicines/${id}`);
      const data = await response.json();
      setItem(data);
      if (!data.is_combination) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error fetching medicine:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/medicines/${id}/transactions`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Deleted successfully');
        router.push('/dashboard/medicines');
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    let quantityToSubmit = parseInt(transactionData.quantity_boxes);
    if (transactionData.transaction_type === 'dispensed') {
      quantityToSubmit = -Math.abs(quantityToSubmit);
    }

    try {
      const response = await fetch(`/api/medicines/${id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...transactionData, quantity_boxes: quantityToSubmit }),
      });

      if (response.ok) {
        toast.success('Transaction added');
        setShowAddTransaction(false);
        setTransactionData({ transaction_type: 'dispensed', quantity_boxes: '', patient_id: '', notes: '' });
        fetchItem();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!item) return <div style={{ padding: '2rem' }}>Medicine not found.</div>;

  if (item.is_combination) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => router.push('/dashboard/medicines')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <ArrowLeft size={18} /> Back to Medicines
        </button>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>{item.name}</h1>
                <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#dbeafe', color: 'var(--primary-color)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>Combination</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{item.description || 'No description provided.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button onClick={() => router.push('/dashboard/medicines')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft size={18} /> Back to Medicines
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push(`/dashboard/medicines/${id}/edit`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'white', color: 'var(--text-primary)', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
            <Edit size={18} /> Edit Batch
          </button>
          <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
            <Trash2 size={18} /> Delete Batch
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary-color)" /> Batch Information
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <InfoItem label="Medicine Name" value={item.name} />
              <InfoItem label="Batch Number" value={item.batch_number} />
              <InfoItem label="Price (In)" value={`Rs. ${item.price_in}`} />
              <InfoItem label="Price (Out)" value={`Rs. ${item.price_out}`} />
              <InfoItem label="Manufacturing Date" value={item.manufacturing_date ? new Date(item.manufacturing_date).toLocaleDateString() : 'N/A'} />
              <InfoItem label="Expiry Date" value={item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'} />
              <InfoItem label="Batch In Date" value={item.batch_in_date ? new Date(item.batch_in_date).toLocaleDateString() : 'N/A'} />
              <InfoItem label="DRAP/ACT #" value={item.drapact_number || 'N/A'} />
            </div>
          </section>

          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} color="var(--primary-color)" /> Transaction History
              </h2>
              <button onClick={() => setShowAddTransaction(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
                <Plus size={18} /> Add Transaction
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Date</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Type</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Qty</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Patient</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 0.5rem' }}>{new Date(t.transaction_date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', backgroundColor: t.transaction_type === 'dispensed' ? '#fee2e2' : '#dcfce7', color: t.transaction_type === 'dispensed' ? '#dc2626' : '#16a34a' }}>
                          {t.transaction_type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '600', color: t.quantity_boxes < 0 ? '#dc2626' : '#16a34a' }}>
                        {t.quantity_boxes > 0 ? `+${t.quantity_boxes}` : t.quantity_boxes}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>{t.first_name ? `${t.first_name} ${t.last_name}` : '-'}</td>
                      <td style={{ padding: '1rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Stock</h3>
            <div style={{ fontSize: '3rem', fontWeight: '800', color: item.in_stock_qty_boxes < 10 ? '#dc2626' : 'var(--text-primary)' }}>
              {item.in_stock_qty_boxes}
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>boxes in stock</p>
          </section>
        </div>
      </div>

      {showAddTransaction && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Add Transaction</h2>
            <form onSubmit={handleAddTransaction}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                <select value={transactionData.transaction_type} onChange={(e) => setTransactionData({ ...transactionData, transaction_type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="dispensed">Dispensed (Stock Out)</option>
                  <option value="received">Received (Stock In)</option>
                  <option value="return">Return</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity (Boxes)</label>
                <input type="number" required value={transactionData.quantity_boxes} onChange={(e) => setTransactionData({ ...transactionData, quantity_boxes: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} placeholder="Enter positive number" />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                <textarea value={transactionData.notes} onChange={(e) => setTransactionData({ ...transactionData, notes: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setShowAddTransaction(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: 'var(--primary-color)', color: 'white', fontWeight: '600' }}>Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{value || '-'}</div>
  </div>
);

export default MedicineDetail;
