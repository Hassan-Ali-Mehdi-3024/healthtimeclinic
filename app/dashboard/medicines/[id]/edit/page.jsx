'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import InventoryForm from '@/components/InventoryForm';
import toast from 'react-hot-toast';

const EditMedicineBatch = () => {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/medicines/${id}`);
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Medicine updated');
        router.push(`/dashboard/medicines/${id}`);
      } else {
        toast.error('Failed to update medicine');
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Failed to update medicine');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!item) return <div style={{ padding: '2rem' }}>Medicine not found.</div>;

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
          Edit Medicine Batch
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Update batch details for {item.name}
        </p>

        <InventoryForm initialData={item} onSubmit={handleSubmit} submitLabel="Update Batch" />
      </div>
    </div>
  );
};

export default EditMedicineBatch;
