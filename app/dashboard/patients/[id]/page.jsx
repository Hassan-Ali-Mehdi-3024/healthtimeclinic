'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Activity, Calendar, Ruler, Weight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, visitsRes, commentsRes] = await Promise.all([
          fetch(`/api/patients/${id}`),
          fetch(`/api/patients/${id}/visits`),
          fetch(`/api/patients/${id}/comments`)
        ]);

        if (!patientRes.ok) throw new Error('Failed to fetch patient');
        
        const patientData = await patientRes.json();
        const visitsData = await visitsRes.json();
        const commentsData = await commentsRes.json();

        setPatient(patientData);
        setMeasurements(Array.isArray(visitsData) ? visitsData : []);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment(value);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/patients/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        setNewComment('');
        toast.success('Comment added');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePatient = async () => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Patient deleted');
        router.push('/dashboard/patients');
      } else {
        toast.error('Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/patients/${id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        toast.success('Comment deleted');
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!patient) return <div style={{ padding: '2rem' }}>Patient not found</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
        Back to Patients
      </button>

      {/* Header with Edit and Delete buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
          {patient.first_name} {patient.last_name}
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => router.push(`/dashboard/patients/${id}/edit`)}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            Edit Patient
          </button>
          <button 
            onClick={handleDeletePatient}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: '#fef2f2',
              color: 'var(--error-color)',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Left Column: Patient Info & Measurements History */}
        <div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span>{patient.gender}</span>
                <span>{new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years old</span>
                <span>{patient.marital_status || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>{patient.phone}</span>
                {patient.email && <span>{patient.email}</span>}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Address</label>
                <p>{[patient.area, patient.city, patient.country].filter(Boolean).join(', ') || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Reference</label>
                <p>{patient.reference || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Entry Date</label>
                <p>{new Date(patient.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Maternity Info */}
            {(patient.no_of_kids > 0 || patient.is_lactating || patient.is_breastfeeding) && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Maternity Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {patient.no_of_kids > 0 && (
                    <div>
                      <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Number of Kids</label>
                      <p>{patient.no_of_kids}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {patient.is_lactating && (
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#eff6ff', color: 'var(--primary-color)', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                        Lactating
                      </span>
                    )}
                    {patient.is_breastfeeding && (
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500' }}>
                        Breastfeeding
                      </span>
                    )}
                  </div>
                  {patient.kids_delivery_info && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Delivery Info</label>
                      <p>{patient.kids_delivery_info}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnosis Section */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>Diagnosis</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { key: 'diagnosis_hypothyroid', label: 'Hypothyroid' },
                  { key: 'diagnosis_hyperthyroid', label: 'Hyperthyroid' },
                  { key: 'diagnosis_constipation', label: 'Constipation' },
                  { key: 'diagnosis_diabetes', label: 'Diabetes' },
                  { key: 'diagnosis_stomach_issue', label: 'Stomach Issue' },
                  { key: 'diagnosis_liver_issue', label: 'Liver Issue' },
                  { key: 'diagnosis_cervical_spondylosis', label: 'Cervical Spondylosis' },
                  { key: 'diagnosis_sciatica', label: 'Sciatica' },
                  { key: 'diagnosis_frozen_shoulder', label: 'Frozen Shoulder' },
                  { key: 'diagnosis_migraine', label: 'Migraine' },
                  { key: 'diagnosis_epilepsy', label: 'Epilepsy' },
                  { key: 'diagnosis_insomnia', label: 'Insomnia' },
                  { key: 'diagnosis_sleep_apnea', label: 'Sleep Apnea' },
                  { key: 'diagnosis_pcos_pcod', label: 'PCOS/PCOD' },
                  { key: 'diagnosis_fibroids', label: 'Fibroids' },
                  { key: 'diagnosis_ovarian_cyst', label: 'Ovarian Cyst' },
                  { key: 'diagnosis_gynae_issue', label: 'Gynae Issue' },
                  { key: 'diagnosis_multivitamin', label: 'Multi-Vitamin' },
                  { key: 'diagnosis_medication', label: 'Medication' }
                ]
                  .filter(d => patient[d.key])
                  .map(d => (
                    <span 
                      key={d.key} 
                      style={{ 
                        padding: '0.375rem 0.75rem', 
                        backgroundColor: '#eff6ff', 
                        color: 'var(--primary-color)', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {d.label}
                    </span>
                  ))}
              </div>
              {patient.gynae_issue_details && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Gynae Issue Details:</label>
                  <p style={{ fontSize: '0.9rem' }}>{patient.gynae_issue_details}</p>
                </div>
              )}
              {patient.multivitamin_details && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Multivitamin Details:</label>
                  <p style={{ fontSize: '0.9rem' }}>{patient.multivitamin_details}</p>
                </div>
              )}
              {patient.medication_details && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Medication Details:</label>
                  <p style={{ fontSize: '0.9rem' }}>{patient.medication_details}</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Additional Comments</h3>
            <form onSubmit={handleAddComment} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment... (Press Enter to save)"
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '1rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
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
                </button>
              </div>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      borderLeft: '3px solid var(--primary-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{comment.comment}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        padding: '0.25rem',
                        backgroundColor: 'transparent',
                        color: 'var(--error-color)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Delete comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Visit History</h2>
            <button 
              onClick={() => router.push(`/dashboard/patients/${id}/visit/new`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#eff6ff',
                color: 'var(--primary-color)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <Plus size={18} /> New Visit
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {measurements.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No visits recorded yet.</p>
            ) : (
              measurements.map((visit) => (
                <div 
                  key={visit.id}
                  onClick={() => router.push(`/dashboard/patients/${id}/visits/${visit.id}`)}
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    _hover: { boxShadow: 'var(--shadow-md)', transform: 'translateY(-2px)' }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <Calendar size={14} />
                    {new Date(visit.visit_date).toLocaleDateString()}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {visit.weight_digital_kg && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Weight (Digital kg)</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.weight_digital_kg} kg</span>
                      </div>
                    )}
                    {visit.weight_digital_lbs && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Weight (Digital lbs)</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.weight_digital_lbs} lbs</span>
                      </div>
                    )}
                    {visit.weight_manual_kg && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Weight (Manual kg)</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.weight_manual_kg} kg</span>
                      </div>
                    )}
                    {visit.height_ft && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Height</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.height_ft} ft</span>
                      </div>
                    )}
                    {visit.waist_in && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Waist</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.waist_in} in</span>
                      </div>
                    )}
                    {visit.belly_in && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Belly</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.belly_in} in</span>
                      </div>
                    )}
                    {visit.hips_in && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Hips</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.hips_in} in</span>
                      </div>
                    )}
                    {visit.thighs_in && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Thighs</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.thighs_in} in</span>
                      </div>
                    )}
                    {visit.chest_in && (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Chest</span>
                        <span style={{ fontWeight: '600', fontSize: '1.125rem' }}>{visit.chest_in} in</span>
                      </div>
                    )}
                  </div>

                  {visit.notes && (
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}><strong>Notes:</strong> {visit.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Stats or Quick Actions */}
        <div>
          <div style={{ 
            backgroundColor: 'var(--primary-color)', 
            color: 'white',
            padding: '1.5rem', 
            borderRadius: '16px', 
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ opacity: 0.8 }}>Total Visits</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{measurements.length}</span>
              </div>
              {measurements.length > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ opacity: 0.8 }}>Latest Weight</span>
                    <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>
                      {measurements[0].weight_digital_kg || measurements[0].weight_manual_kg || '-'} kg
                    </span>
                  </div>
                  {measurements.length > 1 && measurements[measurements.length - 1].weight_digital_kg && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      paddingTop: '0.5rem', 
                      borderTop: '1px solid rgba(255,255,255,0.2)',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{ opacity: 0.8 }}>Progress</span>
                      <span style={{ fontWeight: '700', fontSize: '1.25rem', color: '#86efac' }}>
                        {(
                          (measurements[measurements.length - 1].weight_digital_kg || 0) - 
                          (measurements[0].weight_digital_kg || 0)
                        ).toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
