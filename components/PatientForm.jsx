'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const PatientForm = ({ initialData = {}, onSubmit, title }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    marital_status: 'Single',
    country: '',
    city: '',
    area: '',
    phone: '',
    email: '',
    reference: '',
    no_of_kids: 0,
    kids_delivery_info: '',
    is_lactating: false,
    is_breastfeeding: false,
    
    // Diagnosis fields
    diagnosis_hypothyroid: false,
    diagnosis_hyperthyroid: false,
    diagnosis_constipation: false,
    diagnosis_diabetes: false,
    diagnosis_stomach_issue: false,
    diagnosis_liver_issue: false,
    diagnosis_cervical_spondylosis: false,
    diagnosis_sciatica: false,
    diagnosis_frozen_shoulder: false,
    diagnosis_migraine: false,
    diagnosis_epilepsy: false,
    diagnosis_insomnia: false,
    diagnosis_sleep_apnea: false,
    diagnosis_pcos_pcod: false,
    diagnosis_fibroids: false,
    diagnosis_ovarian_cyst: false,
    diagnosis_gynae_issue: false,
    gynae_issue_details: '',
    diagnosis_multivitamin: false,
    multivitamin_details: '',
    diagnosis_medication: false,
    medication_details: ''
  });
  const [dateDisplay, setDateDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Format date for input field (YYYY-MM-DD)
      const formattedData = { ...initialData };
      if (formattedData.date_of_birth) {
        formattedData.date_of_birth = new Date(formattedData.date_of_birth).toISOString().split('T')[0];
        const [year, month, day] = formattedData.date_of_birth.split('-');
        setDateDisplay(`${day}/${month}/${year}`);
      }
      // Convert SQLite integers to booleans
      formattedData.is_breastfeeding = Boolean(formattedData.is_breastfeeding);
      formattedData.is_lactating = Boolean(formattedData.is_lactating);
      formattedData.diagnosis_hypothyroid = Boolean(formattedData.diagnosis_hypothyroid);
      formattedData.diagnosis_hyperthyroid = Boolean(formattedData.diagnosis_hyperthyroid);
      formattedData.diagnosis_constipation = Boolean(formattedData.diagnosis_constipation);
      formattedData.diagnosis_diabetes = Boolean(formattedData.diagnosis_diabetes);
      formattedData.diagnosis_stomach_issue = Boolean(formattedData.diagnosis_stomach_issue);
      formattedData.diagnosis_liver_issue = Boolean(formattedData.diagnosis_liver_issue);
      formattedData.diagnosis_cervical_spondylosis = Boolean(formattedData.diagnosis_cervical_spondylosis);
      formattedData.diagnosis_sciatica = Boolean(formattedData.diagnosis_sciatica);
      formattedData.diagnosis_frozen_shoulder = Boolean(formattedData.diagnosis_frozen_shoulder);
      formattedData.diagnosis_migraine = Boolean(formattedData.diagnosis_migraine);
      formattedData.diagnosis_epilepsy = Boolean(formattedData.diagnosis_epilepsy);
      formattedData.diagnosis_insomnia = Boolean(formattedData.diagnosis_insomnia);
      formattedData.diagnosis_sleep_apnea = Boolean(formattedData.diagnosis_sleep_apnea);
      formattedData.diagnosis_pcos_pcod = Boolean(formattedData.diagnosis_pcos_pcod);
      formattedData.diagnosis_fibroids = Boolean(formattedData.diagnosis_fibroids);
      formattedData.diagnosis_ovarian_cyst = Boolean(formattedData.diagnosis_ovarian_cyst);
      formattedData.diagnosis_gynae_issue = Boolean(formattedData.diagnosis_gynae_issue);
      formattedData.diagnosis_multivitamin = Boolean(formattedData.diagnosis_multivitamin);
      formattedData.diagnosis_medication = Boolean(formattedData.diagnosis_medication);
      
      // Replace nulls with empty strings for controlled inputs
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === null) {
          formattedData[key] = '';
        }
      });

      setFormData(formattedData);
    }
  }, [initialData]);

  const handleDateChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
    
    // Auto-format as user types
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    if (value.length >= 5) {
      value = value.slice(0, 5) + '/' + value.slice(5, 9);
    }
    
    setDateDisplay(value);
    
    // Parse and validate complete date
    if (value.length === 10) {
      const [day, month, year] = value.split('/');
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        const isoDate = `${year}-${month}-${day}`;
        setFormData(prev => ({ ...prev, date_of_birth: isoDate }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #e2e8f0'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</h2>
          <button 
            type="button"
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
            >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: 'var(--error-color)', 
            padding: '1rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #fee2e2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary-color)' }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>First Name *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Last Name *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Date of Birth</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="date_of_birth"
                  value={dateDisplay}
                  onChange={handleDateChange}
                  placeholder="dd/mm/yyyy"
                  maxLength="10"
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Gender</label>
                <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}
                >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Marital Status</label>
                <select
                name="marital_status"
                value={formData.marital_status}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', backgroundColor: 'white' }}
                >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="How did you hear about us?"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary-color)' }}>Contact Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Country</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Area</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="Neighborhood or specific area"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
            </div>
          </div>

          {/* Maternity Information */}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary-color)' }}>Maternity Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Number of Kids</label>
              <input
                type="number"
                name="no_of_kids"
                value={formData.no_of_kids}
                onChange={handleChange}
                min="0"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_lactating"
                    checked={formData.is_lactating}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Lactating Mother</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_breastfeeding"
                    checked={formData.is_breastfeeding}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Breast Feeding</span>
                </label>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                Type Of Delivery For Each Kid
              </label>
              <textarea
                name="kids_delivery_info"
                value={formData.kids_delivery_info}
                onChange={handleChange}
                rows="2"
                placeholder="e.g., Kid 1: C-Section, Kid 2: Normal Delivery"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Diagnosis */}
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--primary-color)' }}>Diagnosis</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { name: 'diagnosis_hypothyroid', label: 'Hypothyroid' },
              { name: 'diagnosis_hyperthyroid', label: 'Hyperthyroid' },
              { name: 'diagnosis_constipation', label: 'Constipation' },
              { name: 'diagnosis_diabetes', label: 'Diabetes' },
              { name: 'diagnosis_stomach_issue', label: 'Stomach Issue' },
              { name: 'diagnosis_liver_issue', label: 'Liver Issue' },
              { name: 'diagnosis_cervical_spondylosis', label: 'Cervical Spondylosis' },
              { name: 'diagnosis_sciatica', label: 'Sciatica/Sciatic Pain' },
              { name: 'diagnosis_frozen_shoulder', label: 'Frozen Shoulder' },
              { name: 'diagnosis_migraine', label: 'Migraine' },
              { name: 'diagnosis_epilepsy', label: 'Epilepsy' },
              { name: 'diagnosis_insomnia', label: 'Insomnia' },
              { name: 'diagnosis_sleep_apnea', label: 'Sleep Apnea' },
              { name: 'diagnosis_pcos_pcod', label: 'PCOS/PCOD' },
              { name: 'diagnosis_fibroids', label: 'Fibroids' },
              { name: 'diagnosis_ovarian_cyst', label: 'Ovarian Cyst' }
            ].map(diagnosis => (
              <label key={diagnosis.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', backgroundColor: formData[diagnosis.name] ? '#eff6ff' : 'transparent' }}>
                <input
                  type="checkbox"
                  name={diagnosis.name}
                  checked={formData[diagnosis.name]}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{diagnosis.label}</span>
              </label>
            ))}
          </div>

          {/* Conditional Text Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="diagnosis_gynae_issue"
                  checked={formData.diagnosis_gynae_issue}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Gynae Issue</span>
              </label>
              {formData.diagnosis_gynae_issue && (
                <textarea
                  name="gynae_issue_details"
                  value={formData.gynae_issue_details}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Please provide details..."
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="diagnosis_multivitamin"
                  checked={formData.diagnosis_multivitamin}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Multi-Vitamin</span>
              </label>
              {formData.diagnosis_multivitamin && (
                <textarea
                  name="multivitamin_details"
                  value={formData.multivitamin_details}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Please specify which vitamins..."
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="diagnosis_medication"
                  checked={formData.diagnosis_medication}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Medication</span>
              </label>
              {formData.diagnosis_medication && (
                <textarea
                  name="medication_details"
                  value={formData.medication_details}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Please list current medications..."
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'white',
                color: 'var(--text-secondary)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
