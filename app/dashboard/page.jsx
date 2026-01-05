'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock,
  Package, 
  PlusCircle, 
  UserPlus, 
  ClipboardList,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || { totalPatients: 0, totalVisits: 0, upcomingAppointments: 0, lowStockItems: 0 };
  const recentPatients = data?.recentPatients || [];
  const recentVisits = data?.recentVisits || [];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Dr. Faryad. Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <StatCard 
          icon={<Users size={24} color="#3b82f6" />} 
          label="Total Patients" 
          value={stats.totalPatients} 
          color="#eff6ff"
        />
        <StatCard 
          icon={<Calendar size={24} color="#10b981" />} 
          label="Total Visits" 
          value={stats.totalVisits} 
          color="#ecfdf5"
        />
        <StatCard 
          icon={<Clock size={24} color="#8b5cf6" />} 
          label="Upcoming Appointments" 
          value={stats.upcomingAppointments} 
          color="#f5f3ff"
        />
        <StatCard 
          icon={<AlertTriangle size={24} color={stats.lowStockItems > 0 ? "#ef4444" : "#f59e0b"} />} 
          label="Low Stock Items" 
          value={stats.lowStockItems} 
          color={stats.lowStockItems > 0 ? "#fef2f2" : "#fffbeb"}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '2rem'
      }}>
        {/* Recent Patients */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Recent Patients</h3>
            <Link href="/dashboard/patients" style={viewAllStyle}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div style={listStyle}>
            {recentPatients.length > 0 ? recentPatients.map(patient => (
              <Link 
                key={patient.id} 
                href={`/dashboard/patients/${patient.id}`}
                style={listItemStyle}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{patient.first_name} {patient.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Added on {new Date(patient.created_at).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" />
              </Link>
            )) : (
              <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No patients found.</p>
            )}
          </div>
        </section>

        {/* Recent Visits */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={sectionTitleStyle}>Recent Visits</h3>
            <Link href="/dashboard/patients" style={viewAllStyle}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div style={listStyle}>
            {recentVisits.length > 0 ? recentVisits.map(visit => (
              <Link 
                key={visit.id} 
                href={`/dashboard/patients/${visit.patient_id}/visits/${visit.id}`}
                style={listItemStyle}
              >
                <div>
                  <div style={{ fontWeight: '600' }}>{visit.first_name} {visit.last_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Visit on {new Date(visit.visit_date).toLocaleDateString()}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-secondary)" />
              </Link>
            )) : (
              <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No visits found.</p>
            )}
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section style={{ marginTop: '3rem' }}>
        <h3 style={{ ...sectionTitleStyle, marginBottom: '1.5rem' }}>Quick Actions</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <QuickActionLink 
            href="/dashboard/patients/new" 
            icon={<UserPlus size={20} />} 
            label="Add New Patient" 
          />
          <QuickActionLink 
            href="/dashboard/medicines/new" 
            icon={<PlusCircle size={20} />} 
            label="Add Inventory" 
          />
          <QuickActionLink 
            href="/dashboard/patients" 
            icon={<ClipboardList size={20} />} 
            label="Record Visit" 
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        backgroundColor: color,
        padding: '0.75rem',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

function QuickActionLink({ href, icon, label }) {
  return (
    <Link href={href} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '10px',
      border: '1px solid #e5e7eb',
      color: 'var(--text-primary)',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = 'var(--primary-color)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = '#e5e7eb';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <span style={{ color: 'var(--primary-color)' }}>{icon}</span>
      {label}
    </Link>
  );
}

const sectionStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  overflow: 'hidden'
};

const sectionHeaderStyle = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid #f3f4f6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const sectionTitleStyle = {
  fontSize: '1.125rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  margin: 0
};

const viewAllStyle = {
  fontSize: '0.875rem',
  color: 'var(--primary-color)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  fontWeight: '500'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const listItemStyle = {
  padding: '1rem 1.5rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textDecoration: 'none',
  color: 'inherit',
  borderBottom: '1px solid #f9fafb',
  transition: 'background-color 0.2s ease'
};
