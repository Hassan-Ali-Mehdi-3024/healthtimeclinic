'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, User, Phone, Calendar } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const searchTerms = searchLower.split(/\s+/); // Split by whitespace
    
    // Create searchable fields from patient data
    const searchableFields = {
      fullName: `${patient.first_name || ''} ${patient.last_name || ''}`.toLowerCase(),
      firstName: (patient.first_name || '').toLowerCase(),
      lastName: (patient.last_name || '').toLowerCase(),
      phone: (patient.phone || '').toLowerCase(),
      email: (patient.email || '').toLowerCase(),
      area: (patient.area || '').toLowerCase(),
      city: (patient.city || '').toLowerCase(),
      country: (patient.country || '').toLowerCase()
    };
    
    // Combine all searchable text
    const combinedText = Object.values(searchableFields).join(' ');
    
    // Check if all search terms are found in the combined text
    // This allows for searches like "Hassan DHA Lahore" to match
    const allTermsMatch = searchTerms.every(term => combinedText.includes(term));
    
    if (allTermsMatch) return true;
    
    // Also check for exact matches in individual fields
    return Object.values(searchableFields).some(field => field.includes(searchLower));
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Patients</h1>
        <button 
          onClick={() => router.push('/dashboard/patients/new')}
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
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Add Patient
        </button>
      </div>

      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
        <input
          type="text"
          placeholder="Search by name, area, city, phone, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {loading ? (
        <p>Loading patients...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredPatients.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No patients found.</p>
          ) : (
            filteredPatients.map(patient => (
              <Link href={`/dashboard/patients/${patient.id}`} key={patient.id} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: '#eff6ff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--primary-color)'
                    }}>
                      <User size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{patient.first_name} {patient.last_name}</h3>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {patient.gender}, {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs
                        {patient.marital_status && ` • ${patient.marital_status}`}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patient.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Phone size={16} />
                        {patient.phone}
                      </div>
                    )}
                    {patient.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Calendar size={16} />
                        {patient.email}
                      </div>
                    )}
                    {(patient.area || patient.city || patient.country) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <Calendar size={16} />
                        {[patient.area, patient.city, patient.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Patients;
