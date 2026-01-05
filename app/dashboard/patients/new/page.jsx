'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PatientForm from '../../../../components/PatientForm';

const AddPatient = () => {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create patient');
    }

    router.push('/dashboard/patients');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <PatientForm 
        title="Add New Patient" 
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default AddPatient;
