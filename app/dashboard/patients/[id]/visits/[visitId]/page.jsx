'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pill, Trash2, Plus, Edit2, TrendingDown, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VisitDetailPage() {
  const { id: patientId, visitId } = useParams();
  const router = useRouter();
  const [visit, setVisit] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitRes, medicinesRes] = await Promise.all([
          fetch(`/api/patients/${patientId}/visits`),
          fetch(`/api/patients/${patientId}/visits/${visitId}/medicines`)
        ]);

        if (!visitRes.ok || !medicinesRes.ok) throw new Error('Failed to fetch');

        const visits = await visitRes.json();
        const medicinesData = await medicinesRes.json();

        const currentVisit = visits.find(v => v.id === parseInt(visitId));
        setVisit(currentVisit);
        setMedicines(medicinesData || []);
      } catch (error) {
        console.error('Error fetching visit details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, visitId]);

  const handleDeleteMedicine = async (medicineTransactionId) => {
    if (!confirm('Delete this medicine transaction? This will also restore/update inventory stock.')) return;

    try {
      const response = await fetch(`/api/patients/${patientId}/visits/${visitId}/medicines/${medicineTransactionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMedicines(prev => prev.filter(m => m.id !== medicineTransactionId));
        toast.success('Medicine transaction deleted and stock updated.');
      } else {
        const error = await response.json();
        toast.error(`Failed to delete: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('An error occurred while deleting the medicine.');
    }
  };

  const dispensedMedicines = medicines.filter(m => m.transaction_type === 'dispensed');
  const returnedMedicines = medicines.filter(m => m.transaction_type === 'return' || m.transaction_type === 'refund');

  const calculateTotalCost = (meds) => {
    return meds.reduce((sum, m) => {
      const baseCost = (m.price_per_box || 0) * (m.quantity_boxes || 0);
      const discount = m.discount_type === 'percentage' 
        ? (baseCost * (m.discount_value || 0)) / 100 
        : (m.discount_value || 0);
      return sum + (baseCost - discount);
    }, 0);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!visit) return <div style={{ padding: '2rem' }}>Visit not found</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}
      >
        <ArrowLeft size={20} />
        Back to Patient
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Visit on {new Date(visit.visit_date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Visit ID: #{visit.id} • Recorded {new Date(visit.created_at).toLocaleString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.push(`/dashboard/patients/${patientId}/visits/${visitId}/edit`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Edit2 size={16} />
            Edit Measurements
          </button>
          <button
            onClick={async () => {
              if (confirm('Are you sure you want to delete this entire visit? This will also delete all medicine transactions and restore inventory stock.')) {
                try {
                  const res = await fetch(`/api/patients/${patientId}/visits/${visitId}`, { method: 'DELETE' });
                  if (res.ok) {
                    toast.success('Visit deleted');
                    router.push(`/dashboard/patients/${patientId}`);
                  } else {
                    toast.error('Failed to delete visit');
                  }
                } catch (err) {
                  console.error(err);
                  toast.error('Error deleting visit');
                }
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: '#fef2f2',
              color: 'var(--error-color)',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            <Trash2 size={16} />
            Delete Visit
          </button>
        </div>
      </div>

      {/* Measurements Grid */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #e2e8f0',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--primary-color)', borderRadius: '2px' }} />
          Measurements
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Digital Weight', value: visit.weight_digital_kg, unit: 'kg', icon: '⚖️' },
            { label: 'Digital Weight', value: visit.weight_digital_lbs, unit: 'lbs', icon: '⚖️' },
            { label: 'Manual Weight', value: visit.weight_manual_kg, unit: 'kg', icon: '⚖️' },
            { label: 'Height', value: visit.height_ft, unit: 'ft', icon: '📏' },
            { label: 'Waist', value: visit.waist_in, unit: 'in', icon: '📐' },
            { label: 'Belly', value: visit.belly_in, unit: 'in', icon: '📐' },
            { label: 'Hips', value: visit.hips_in, unit: 'in', icon: '📐' },
            { label: 'Thighs', value: visit.thighs_in, unit: 'in', icon: '📐' },
            { label: 'Chest', value: visit.chest_in, unit: 'in', icon: '📐' }
          ]
            .filter(m => m.value !== null && m.value !== undefined && m.value !== '')
            .map((measurement, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{measurement.icon}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {measurement.label}
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  {measurement.value}{measurement.unit}
                </p>
              </div>
            ))}
        </div>

        {visit.notes && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.5rem' }}>
              Notes
            </p>
            <p style={{ color: 'var(--text-primary)' }}>{visit.notes}</p>
          </div>
        )}
      </div>

      {/* Medicines Dispensed */}
      {dispensedMedicines.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Pill size={20} style={{ color: '#10b981' }} />
            Medicines Dispensed ({dispensedMedicines.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dispensedMedicines.map((medicine) => {
              const baseCost = (medicine.price_per_box || 0) * (medicine.quantity_boxes || 0);
              const discount = medicine.discount_type === 'percentage'
                ? (baseCost * (medicine.discount_value || 0)) / 100
                : (medicine.discount_value || 0);
              const finalCost = baseCost - discount;

              return (
                <div
                  key={medicine.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    border: '2px solid #86efac'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {medicine.medicine_name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDeleteMedicine(medicine.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>QUANTITY</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>{medicine.quantity_boxes} box{medicine.quantity_boxes !== 1 ? 'es' : ''}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>UNIT PRICE</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>
                        {medicine.price_per_box ? `Rs. ${medicine.price_per_box.toFixed(2)}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>SUBTOTAL</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>Rs. {baseCost.toFixed(2)}</p>
                    </div>
                    {discount > 0 && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DISCOUNT</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10b981' }}>
                          -Rs. {discount.toFixed(2)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          ({medicine.discount_type === 'percentage' ? `${medicine.discount_value}%` : 'Fixed'})
                        </p>
                      </div>
                    )}
                    <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                        Rs. {finalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #d1fae5', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Payment</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{medicine.payment_method}</p>
                    </div>
                    {medicine.reason && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{medicine.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: '600' }}>Total Cost (Dispensed):</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
              Rs. {calculateTotalCost(dispensedMedicines).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Medicines Returned */}
      {returnedMedicines.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingDown size={20} style={{ color: '#f59e0b' }} />
            Returns/Refunds ({returnedMedicines.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {returnedMedicines.map((medicine) => {
              const baseCost = (medicine.price_per_box || 0) * (medicine.quantity_boxes || 0);
              const discount = medicine.discount_type === 'percentage'
                ? (baseCost * (medicine.discount_value || 0)) / 100
                : (medicine.discount_value || 0);
              const finalCost = baseCost - discount;

              return (
                <div
                  key={medicine.id}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#fffbeb',
                    borderRadius: '12px',
                    border: '2px solid #fcd34d'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {medicine.medicine_name}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Type: {medicine.transaction_type === 'return' ? 'Return' : 'Refund'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>QUANTITY</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>{medicine.quantity_boxes} box{medicine.quantity_boxes !== 1 ? 'es' : ''}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REASON</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: '700' }}>{medicine.reason || 'Not specified'}</p>
                    </div>
                    {medicine.price_per_box && (
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REFUND AMOUNT</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10b981' }}>
                          Rs. {finalCost.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid #fed7aa',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Recorded: {new Date(medicine.transaction_date).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dispensedMedicines.length === 0 && returnedMedicines.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem 2rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <Pill size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-secondary)', opacity: 0.5 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            No medicines recorded for this visit yet.
          </p>
        </div>
      )}

      {/* Add Medicine Button */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <button
          onClick={() => router.push(`/dashboard/patients/${patientId}/visits/${visitId}/add-medicine`)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          <Plus size={20} />
          Add Medicine to This Visit
        </button>
      </div>
    </div>
  );
}
