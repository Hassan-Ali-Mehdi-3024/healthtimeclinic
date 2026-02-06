'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus, TrendingDown, TrendingUp, FileText, Pill, Package, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicineDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/medicines/${id}`);
      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error('Error fetching medicine:', error);
      toast.error('Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medicine and ALL its history? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Deleted successfully');
        router.push('/medicines');
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!item) return <div style={{ padding: '2rem', textAlign: 'center' }}>Medicine not found.</div>;

  // Render Combination View
  if (item.type === 'combination') {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => router.push('/medicines')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
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
          {/* Combo details would go here if needed */}
        </div>
      </div>
    );
  }

  // Render Product View (Aggregated Batches)
  if (item.type === 'product') {
    const totalStock = item.batches?.reduce((sum, b) => sum + (b.in_stock_qty_boxes || 0), 0) || 0;
    
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button onClick={() => router.push('/medicines')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={18} /> Back to Medicines
          </button>
          <button onClick={() => router.push(`/medicines/new?name=${encodeURIComponent(item.name)}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}>
            <Plus size={18} /> Add New Batch
          </button>
        </div>

        {/* Product Header */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.name}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{item.description || 'No description available'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>TOTAL STOCK</div>
               <div style={{ fontSize: '2.5rem', fontWeight: '800', color: totalStock < 10 ? '#dc2626' : 'var(--primary-color)' }}>
                 {totalStock}
               </div>
               <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>boxes available</div>
            </div>
          </div>
        </div>

        {/* Batches List */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Inventory Batches ({item.batches?.length || 0})</h2>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Batch #</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Expiry Date</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {item.batches?.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No batches found.</td></tr>
              ) : (
                item.batches?.map(batch => {
                  const isExpired = batch.expiry_date && new Date(batch.expiry_date) < new Date();
                  const isLowStock = batch.in_stock_qty_boxes < 10;
                  
                  return (
                    <tr key={batch.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>{batch.batch_number}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontWeight: '600', color: batch.in_stock_qty_boxes === 0 ? '#dc2626' : 'inherit' }}>
                          {batch.in_stock_qty_boxes} boxes
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {isExpired && (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>Expired</span>
                          )}
                          {isLowStock && !isExpired && (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: '600' }}>Low Stock</span>
                          )}
                          {!isExpired && !isLowStock && (
                            <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: '600' }}>Good</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button 
                            onClick={() => router.push(`/medicines/batch/${batch.id}`)}
                            style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                          >
                            Details
                          </button>
                          <button 
                            onClick={() => router.push(`/medicines/batch/${batch.id}/edit`)}
                            style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback: Render Single Batch View (if accessed directly via ID or legacy link)
  // This reuses the old logic but simplified since we have /medicines/batch/[id] now
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Redirecting to batch details...</p>
      {/* We could auto-redirect here if type is batch */}
      {useEffect(() => {
        if (item.type === 'batch') {
          router.replace(`/medicines/batch/${item.id}`);
        }
      }, [item])}
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
