'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import InventoryForm from '@/components/InventoryForm';
import toast from 'react-hot-toast';

const NewMedicineBatch = () => {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Medicine batch created');
        router.push(`/dashboard/medicines/${data.id}`);
      } else {
        toast.error('Failed to create medicine batch');
      }
    } catch (error) {
      console.error('Error creating medicine:', error);
      toast.error('Failed to create medicine batch');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => router.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-md)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Add New Medicine Batch
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Create a new batch entry for medicine inventory
        </p>

        <InventoryForm onSubmit={handleSubmit} submitLabel="Create Batch" />
      </div>
    </div>
  );
};

export default NewMedicineBatch;
