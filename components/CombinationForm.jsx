'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';

const CombinationForm = ({ combination, onSave, onCancel }) => {
  const baseMedicines = ['COBECWT', 'COBECWRT', 'COBECGT', 'COBECYT', 'COBECPT', 'SLIM-X'];
  
  const [formData, setFormData] = useState({
    name: '',
    dosage_pattern: '',
    medicines_included: [],
    medicine_dosages: {}, // { "COBECWT": "1+0+1", "SLIM-X": "0+1+0" }
    tags: '',
    description: ''
  });

  useEffect(() => {
    if (combination) {
      const medicinesIncluded = combination.medicines_included ? JSON.parse(combination.medicines_included) : [];
      const medicineDosages = combination.medicine_dosages ? JSON.parse(combination.medicine_dosages) : {};
      
      setFormData({
        name: combination.name || '',
        dosage_pattern: combination.dosage_pattern || '',
        medicines_included: medicinesIncluded,
        medicine_dosages: medicineDosages,
        tags: combination.tags || '',
        description: combination.description || ''
      });
    }
  }, [combination]);

  const handleMedicineToggle = (medicine) => {
    setFormData(prev => {
      const isRemoving = prev.medicines_included.includes(medicine);
      const newMedicines = isRemoving
        ? prev.medicines_included.filter(m => m !== medicine)
        : [...prev.medicines_included, medicine];
      
      // If adding medicine, initialize dosage to 0+0+0
      const newDosages = { ...prev.medicine_dosages };
      if (!isRemoving && !newDosages[medicine]) {
        newDosages[medicine] = '0+0+0';
      }
      // If removing, clean up dosage
      if (isRemoving) {
        delete newDosages[medicine];
      }
      
      return {
        ...prev,
        medicines_included: newMedicines,
        medicine_dosages: newDosages
      };
    });
  };

  const handleDosageChange = (medicine, timeIndex) => {
    setFormData(prev => {
      const currentDosage = prev.medicine_dosages[medicine] || '0+0+0';
      const parts = currentDosage.split('+').map(Number);
      
      // Toggle between 0, 1, 2
      parts[timeIndex] = (parts[timeIndex] + 1) % 3;
      
      const newDosage = parts.join('+');
      
      return {
        ...prev,
        medicine_dosages: {
          ...prev.medicine_dosages,
          [medicine]: newDosage
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      medicines_included: JSON.stringify(formData.medicines_included),
      medicine_dosages: JSON.stringify(formData.medicine_dosages)
    });
  };

  const tagList = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      overflowY: 'auto',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {combination ? 'Edit Combination' : 'Create New Combination'}
          </h2>
          <button onClick={onCancel} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Custom Name */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Combination Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Weight Loss Pack"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Give this combination a memorable name
            </small>
          </div>

          {/* Medicines Selection with Dosages */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>
              Select Medicines & Set Dosages *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {baseMedicines.map(medicine => {
                const isSelected = formData.medicines_included.includes(medicine);
                const dosage = formData.medicine_dosages[medicine] || '0+0+0';
                const [morning, afternoon, night] = dosage.split('+').map(Number);
                
                return (
                  <div
                    key={medicine}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? 'var(--primary-color)' : '#e2e8f0'}`,
                      backgroundColor: isSelected ? '#eff6ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isSelected ? '0.75rem' : '0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMedicineToggle(medicine)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{medicine}</span>
                      </label>
                    </div>
                    
                    {isSelected && (
                      <div style={{ paddingLeft: '1.75rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Dosage per day:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={morning > 0}
                              onChange={() => handleDosageChange(medicine, 0)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Morning</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                              {morning > 0 ? `${morning}x` : '-'}
                            </span>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={afternoon > 0}
                              onChange={() => handleDosageChange(medicine, 1)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Afternoon</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                              {afternoon > 0 ? `${afternoon}x` : '-'}
                            </span>
                          </label>
                          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={night > 0}
                              onChange={() => handleDosageChange(medicine, 2)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Night</span>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                              {night > 0 ? `${night}x` : '-'}
                            </span>
                          </label>
                        </div>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          Pattern: ({dosage})  •  Click checkboxes to cycle 0→1→2
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
              Select medicines and set how many times per day for each time slot
            </small>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Tags (for search)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., weight loss, belly fat, thyroid, morning"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem'
              }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Separate tags with commas. Examples: body parts, conditions, timing
            </small>
            {tagList.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {tagList.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '16px',
                      backgroundColor: '#eff6ff',
                      color: 'var(--primary-color)',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <Tag size={14} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes about this combination..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || formData.medicines_included.length === 0}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: formData.name && formData.medicines_included.length > 0 ? 'var(--primary-color)' : '#cbd5e1',
                color: 'white',
                fontWeight: '600',
                cursor: formData.name && formData.medicines_included.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              {combination ? 'Update Combination' : 'Create Combination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CombinationForm;
