'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VisitForm({
  patientId,
  onVisitCreated,
  lastVisitMedicines = [],
  onContinuePrevious
}) {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurements, setMeasurements] = useState({
    weight_digital_kg: '',
    weight_digital_lbs: '',
    weight_manual_kg: '',
    height_ft: '',
    waist_in: '',
    belly_in: '',
    hips_in: '',
    thighs_in: '',
    chest_in: '',
    notes: ''
  });
  const [medicines, setMedicines] = useState([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState({
    medicine_id: '',
    quantity_boxes: '',
    price_per_box: '',
    discount_type: 'percentage',
    discount_value: '',
    payment_method: 'Cash',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  // Fetch medicines (unified list)
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

  // Filter medicines based on search
  useEffect(() => {
    const filtered = medicineList.filter(
      item =>
        !medicineSearch.trim() ||
        item.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(medicineSearch.toLowerCase())
    );
    setFilteredMedicines(filtered);
  }, [medicineSearch, medicineList]);

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleAddMedicine = () => {
    if (!currentMedicine.medicine_id || !currentMedicine.quantity_boxes) {
      toast.error('Please select a medicine and quantity');
      return;
    }

    const medicineItem = medicineList.find(m => m.id === parseInt(currentMedicine.medicine_id));

    setMedicines(prev => [
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
      quantity_boxes: '',
      price_per_box: '',
      discount_type: 'percentage',
      discount_value: '',
      payment_method: 'Cash',
      reason: ''
    });
    setMedicineSearch('');
  };

  const handleRemoveMedicine = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleContinuePrevious = () => {
    if (!lastVisitMedicines.length) return;
    
    const previousMedicines = lastVisitMedicines.map(m => ({
      id: Math.random().toString(36).substr(2, 9),
      medicine_id: m.medicine_id,
      medicine_name: m.medicine_name,
      quantity_boxes: m.quantity_boxes,
      price_per_box: m.price_per_box,
      discount_type: m.discount_type || 'percentage',
      discount_value: m.discount_value || 0,
      payment_method: m.payment_method || 'Cash',
      transaction_type: 'dispensed'
    }));
    
    setMedicines(previousMedicines);
  };

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create visit
      const visitResponse = await fetch(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_date: visitDate,
          ...measurements
        })
      });

      if (!visitResponse.ok) throw new Error('Failed to create visit');

      const visitData = await visitResponse.json();
      const visitId = visitData.id;

      // Add medicines for this visit
      for (const medicine of medicines) {
        await fetch(`/api/patients/${patientId}/visits/${visitId}/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medicine_id: parseInt(medicine.medicine_id),
            transaction_type: 'dispensed',
            quantity_boxes: parseInt(medicine.quantity_boxes),
            price_per_box: medicine.price_per_box ? parseFloat(medicine.price_per_box) : null,
            discount_type: medicine.discount_type,
            discount_value: medicine.discount_value ? parseFloat(medicine.discount_value) : null,
            payment_method: medicine.payment_method,
            reason: medicine.reason
          })
        });
      }

      if (onVisitCreated) {
        onVisitCreated(visitId);
      }

      toast.success('Visit recorded successfully!');
    } catch (error) {
      console.error('Error creating visit:', error);
      toast.error('Failed to record visit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '16px', 
      boxShadow: 'var(--shadow-md)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Record New Visit
      </h2>

      <form onSubmit={handleCreateVisit}>
        {/* Visit Date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            Visit Date
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Measurements Section */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--primary-color)', borderRadius: '2px' }} />
            Measurements
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Weight (Digital - kg)', name: 'weight_digital_kg' },
              { label: 'Weight (Digital - lbs)', name: 'weight_digital_lbs' },
              { label: 'Weight (Manual - kg)', name: 'weight_manual_kg' },
              { label: 'Height (ft)', name: 'height_ft' },
              { label: 'Waist (in)', name: 'waist_in' },
              { label: 'Belly (in)', name: 'belly_in' },
              { label: 'Hips (in)', name: 'hips_in' },
              { label: 'Thighs (in)', name: 'thighs_in' },
              { label: 'Chest (in)', name: 'chest_in' }
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name={field.name}
                  value={measurements[field.name]}
                  onChange={handleMeasurementChange}
                  placeholder="0.0"
                  style={{ 
                    width: '100%', 
                    padding: '0.625rem', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={measurements.notes}
              onChange={handleMeasurementChange}
              placeholder="Additional notes..."
              rows="2"
              style={{ 
                width: '100%', 
                padding: '0.625rem', 
                borderRadius: '6px', 
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Medicines Section */}
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1.5rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '4px', height: '18px', backgroundColor: '#0284c7', borderRadius: '2px' }} />
            Medicines
          </h3>

          {/* Add Medicine Form */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.25rem', 
            borderRadius: '10px', 
            border: '1px solid #e0f2fe',
            marginBottom: '1.5rem'
          }}>
            <div style={{ marginBottom: '1rem' }}>
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
                  placeholder="Search medicine or combination..."
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
                            e.preventDefault(); // Prevent blur from firing before selection
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
              onClick={handleAddMedicine}
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
              <Plus size={18} /> Add Medicine
            </button>
          </div>

          {/* Selected Medicines List */}
          {medicines.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Selected Medicines:
                </h4>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                  Total: Rs. {medicines.reduce((sum, med) => {
                    const base = (parseFloat(med.price_per_box) || 0) * (parseInt(med.quantity_boxes) || 0);
                    const discount = med.discount_type === 'percentage' 
                      ? (base * (parseFloat(med.discount_value) || 0)) / 100 
                      : (parseFloat(med.discount_value) || 0);
                    return sum + (base - discount);
                  }, 0).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {medicines.map(med => {
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
                        backgroundColor: 'white', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '8px', 
                        border: '1px solid #e0f2fe'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{med.medicine_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Qty: {med.quantity_boxes} • Price: Rs. {med.price_per_box} • Total: Rs. {final.toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        style={{ 
                          padding: '0.5rem', 
                          backgroundColor: 'transparent', 
                          color: '#ef4444', 
                          border: 'none', 
                          cursor: 'pointer' 
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              backgroundColor: loading ? '#94a3b8' : 'var(--success-color)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: '700', 
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            {loading ? 'Creating Visit...' : 'Create Visit'}
          </button>
          {lastVisitMedicines.length > 0 && (
            <button
              type="button"
              onClick={handleContinuePrevious}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              Continue Previous
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
