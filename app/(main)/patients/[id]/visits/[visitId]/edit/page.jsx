'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    visit_date: '',
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

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const { id: patientId, visitId } = await params;
        const response = await fetch(`/api/patients/${patientId}/visits/${visitId}`);
        
        if (!response.ok) throw new Error('Failed to fetch visit');
        
        const data = await response.json();
        
        // Format date to YYYY-MM-DD for input
        const formattedDate = data.visit_date ? new Date(data.visit_date).toISOString().split('T')[0] : '';

        setFormData({
          visit_date: formattedDate,
          weight_digital_kg: data.weight_digital_kg || '',
          weight_digital_lbs: data.weight_digital_lbs || '',
          weight_manual_kg: data.weight_manual_kg || '',
          height_ft: data.height_ft || '',
          waist_in: data.waist_in || '',
          belly_in: data.belly_in || '',
          hips_in: data.hips_in || '',
          thighs_in: data.thighs_in || '',
          chest_in: data.chest_in || '',
          notes: data.notes || ''
        });
      } catch (error) {
        console.error('Error fetching visit:', error);
        toast.error('Could not load visit details');
      } finally {
        setLoading(false);
      }
    };

    fetchVisit();
  }, [params]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { id: patientId, visitId } = await params;
      const response = await fetch(`/api/patients/${patientId}/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update visit');

      toast.success('Visit updated successfully');
      router.push(`/patients/${patientId}/visits/${visitId}`);
    } catch (error) {
      console.error('Error updating visit:', error);
      toast.error('Failed to update visit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

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
          fontSize: '1rem',
          padding: 0
        }}
      >
        <ArrowLeft size={20} />
        Back to Visit Details
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-md)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '12px', color: 'var(--primary-color)' }}>
            <Calendar size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Edit Visit Details
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Visit Date */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Visit Date
            </label>
            <input
              type="date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              required
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
                    value={formData[field.name]}
                    onChange={handleChange}
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
          </div>

          {/* Notes Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Notes & Observations
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter clinical notes here..."
              rows="6"
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                resize: 'vertical',
                lineHeight: '1.5'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ 
                flex: 1, 
                padding: '1rem', 
                backgroundColor: 'white', 
                color: 'var(--text-secondary)', 
                border: '1px solid #e2e8f0', 
                borderRadius: '10px', 
                fontWeight: '600', 
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ 
                flex: 2, 
                padding: '1rem', 
                backgroundColor: saving ? '#94a3b8' : 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '700', 
                fontSize: '1rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.25)'
              }}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
