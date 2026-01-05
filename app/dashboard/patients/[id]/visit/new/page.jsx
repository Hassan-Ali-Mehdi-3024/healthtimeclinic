'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import VisitForm from '@/components/VisitForm';

export default function NewVisitPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [patientId, setPatientId] = useState(null);
  const [lastVisitMedicines, setLastVisitMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setPatientId(resolvedParams.id);
      
      try {
        // Fetch last visit to get its medicines
        const visitsRes = await fetch(`/api/patients/${resolvedParams.id}/visits`);
        const visits = await visitsRes.json();
        
        if (visits && visits.length > 0) {
          const lastVisit = visits[0];
          const medicinesRes = await fetch(`/api/patients/${resolvedParams.id}/visits/${lastVisit.id}/medicines`);
          const medicines = await medicinesRes.json();
          
          // Filter only dispensed medicines for continuation
          setLastVisitMedicines(medicines.filter(m => m.transaction_type === 'dispensed'));
        }
      } catch (error) {
        console.error('Error fetching last visit data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, [params]);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  const handleVisitCreated = (visitId) => {
    router.push(`/dashboard/patients/${patientId}/visits/${visitId}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          onClick={() => router.push(`/dashboard/patients/${patientId}`)}
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
          Back to Patient Profile
        </button>

        <VisitForm 
          patientId={patientId} 
          onVisitCreated={handleVisitCreated} 
          lastVisitMedicines={lastVisitMedicines}
        />
      </div>
    </div>
  );
}
