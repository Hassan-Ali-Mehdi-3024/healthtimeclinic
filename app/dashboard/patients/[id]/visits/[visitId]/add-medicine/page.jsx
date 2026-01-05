'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddMedicinePage() {
  const { id: patientId, visitId } = useParams();
  const router = useRouter();
  
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState({
    medicine_id: '',
    transaction_type: 'dispensed',
    quantity_boxes: '',
    price_per_box: '',
    discount_type: 'percentage',
    discount_value: '',
    payment_method: 'Cash',
    reason: ''
  });
  const [medicinesToAdd, setMedicinesToAdd] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch('/api/medicines');
        const data = await response.json();
        setMedicineList(data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };
    fetchMedicines();
  }, []);

  // Filter medicines
  useEffect(() => {
    const filtered = medicineList.filter(
      item =>
        !medicineSearch.trim() ||
        item.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(medicineSearch.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [medicineSearch, medicineList]);

  const handleMedicineChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedicine(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectMedicine = (item) => {
    setCurrentMedicine(prev => ({
      ...prev,
      medicine_id: item.id,
      price_per_box: item.price_per_box || ''
    }));
    setMedicineSearch(item.name);
    setShowMedicineDropdown(false);
  };

  const handleAddToList = () => {
    if (!currentMedicine.medicine_id || !currentMedicine.quantity_boxes) {
      toast.error('Please select a medicine and quantity');
      return;
    }

    const medicineItem = medicineList.find(m => m.id === parseInt(currentMedicine.medicine_id));

    setMedicinesToAdd(prev => [
      ...prev,
      {
        ...currentMedicine,
        id: Date.now(),
        medicine_name: medicineItem?.name || ''
      }
    ]);

    // Reset form
    setCurrentMedicine({
      medicine_id: '',
      transaction_type: 'dispensed',
      quantity_boxes: '',
      price_per_box: '',
      discount_type: 'percentage',
      discount_value: '',
      payment_method: 'Cash',
      reason: ''
    });
    setMedicineSearch('');
  };

  const handleRemoveFromList = (id) => {
    setMedicinesToAdd(prev => prev.filter(m => m.id !== id));
  };

  const handleSaveMedicines = async () => {
    if (medicinesToAdd.length === 0) return;
    setLoading(true);

    try {
      for (const medicine of medicinesToAdd) {
        const response = await fetch(`/api/patients/${patientId}/visits/${visitId}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicine_id: parseInt(medicine.medicine_id),
            transaction_type: medicine.transaction_type,
            quantity_boxes: parseInt(medicine.quantity_boxes),
            price_per_box: medicine.price_per_box ? parseFloat(medicine.price_per_box) : null,
            discount_type: medicine.discount_type,
            discount_value: medicine.discount_value ? parseFloat(medicine.discount_value) : null,
            payment_method: medicine.payment_method,
            reason: medicine.reason
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add medicine');
        }
      }

      toast.success('Medicines added successfully!');
      router.push(`/dashboard/patients/${patientId}/visits/${visitId}`);
    } catch (error) {
      console.error('Error adding medicines:', error);
      toast.error(error.message || 'Failed to add medicines');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return medicinesToAdd.reduce((sum, med) => {
      const base = (parseFloat(med.price_per_box) || 0) * (parseInt(med.quantity_boxes) || 0);
      const discount = med.discount_type === 'percentage' 
        ? (base * (parseFloat(med.discount_value) || 0)) / 100 
        : (parseFloat(med.discount_value) || 0);
      return sum + (base - discount);
    }, 0);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
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
        Back to Visit
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-md)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
          Add Medicines to Visit #{visitId}
        </h1>

        {/* Add Medicine Form */}
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid #bae6fd',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Medicine & Combination
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  onFocus={() => setShowMedicineDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMedicineDropdown(false), 200)}
                  placeholder="Search medicine..."
                  style={{ 
                    width: '100%', 
                    padding: '0.625rem', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem'
                  }}
                />
                {showMedicineDropdown && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px', 
                    boxShadow: 'var(--shadow-lg)', 
                    marginTop: '4px', 
                    zIndex: 10 
                  }}>
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectMedicine(item);
                          }}
                          style={{ 
                            width: '100%', 
                            textAlign: 'left', 
                            padding: '0.75rem', 
                            border: 'none', 
                            backgroundColor: 'transparent', 
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {item.inventory_id ? `Stock: ${item.stock} • Price: Rs. ${item.price_per_box}` : 'Predefined'}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No medicines found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Transaction Type
              </label>
              <select
                name="transaction_type"
                value={currentMedicine.transaction_type}
                onChange={handleMedicineChange}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              >
                <option value="dispensed">Dispensed</option>
                <option value="return">Return</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Qty (boxes)
              </label>
              <input
                type="number"
                name="quantity_boxes"
                value={currentMedicine.quantity_boxes}
                onChange={handleMedicineChange}
                placeholder="1"
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Price/Box
              </label>
              <input
                type="number"
                step="0.01"
                name="price_per_box"
                value={currentMedicine.price_per_box}
                onChange={handleMedicineChange}
                placeholder="0.00"
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Disc. Type
              </label>
              <select
                name="discount_type"
                value={currentMedicine.discount_type}
                onChange={handleMedicineChange}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              >
                <option value="percentage">%</option>
                <option value="amount">PKR</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Disc. Val
              </label>
              <input
                type="number"
                step="0.01"
                name="discount_value"
                value={currentMedicine.discount_value}
                onChange={handleMedicineChange}
                placeholder="0"
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Payment Method
              </label>
              <select
                name="payment_method"
                value={currentMedicine.payment_method}
                onChange={handleMedicineChange}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              >
                <option value="Cash">Cash</option>
                <option value="Account">Account</option>
                <option value="Jazzcash">Jazzcash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                Reason (for return/refund)
              </label>
              <input
                type="text"
                name="reason"
                value={currentMedicine.reason}
                onChange={handleMedicineChange}
                placeholder="Optional..."
                style={{ 
                  width: '100%', 
                  padding: '0.625rem', 
                  borderRadius: '6px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToList}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              backgroundColor: '#0284c7', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} /> Add to List
          </button>
        </div>

        {/* List of Medicines to Add */}
        {medicinesToAdd.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Medicines to be Added</h2>
              <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                Total: Rs. {calculateTotal().toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {medicinesToAdd.map(med => {
                const base = (parseFloat(med.price_per_box) || 0) * (parseInt(med.quantity_boxes) || 0);
                const discount = med.discount_type === 'percentage' 
                  ? (base * (parseFloat(med.discount_value) || 0)) / 100 
                  : (parseFloat(med.discount_value) || 0);
                const final = base - discount;

                return (
                  <div
                    key={med.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      backgroundColor: '#f8fafc', 
                      padding: '1rem', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600' }}>{med.medicine_name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {med.transaction_type.toUpperCase()} • Qty: {med.quantity_boxes} • Rs. {final.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFromList(med.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSaveMedicines}
              disabled={loading}
              style={{ 
                width: '100%', 
                marginTop: '1.5rem',
                padding: '1rem', 
                backgroundColor: loading ? '#94a3b8' : 'var(--success-color)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save All Medicines to Visit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
