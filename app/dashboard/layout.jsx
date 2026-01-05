'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Package, Pill } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Basic client-side protection
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null; // Or loading spinner

  const isActive = (path) => pathname === path;

  const linkStyle = (path) => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    padding: '0.75rem 1rem', 
    backgroundColor: isActive(path) ? '#eff6ff' : 'transparent', 
    color: isActive(path) ? 'var(--primary-color)' : 'var(--text-secondary)', 
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--background-color)',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 10
      }}>
        <div style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          color: 'var(--primary-color)',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          Health Time Clinic
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <Link href="/dashboard" style={linkStyle('/dashboard')}>
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/dashboard/patients" style={linkStyle('/dashboard/patients')}>
                <Users size={20} />
                Patients
              </Link>
            </li>
            <li>
              <Link href="/dashboard/medicines" style={linkStyle('/dashboard/medicines')}>
                <Pill size={20} />
                Medicines
              </Link>
            </li>
            <li>
              <Link href="/dashboard/appointments" style={linkStyle('/dashboard/appointments')}>
                <Calendar size={20} />
                Appointments
              </Link>
            </li>
            <li>
              <Link href="/dashboard/settings" style={linkStyle('/dashboard/settings')}>
                <Settings size={20} />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <button 
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#fef2f2',
            color: 'var(--error-color)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            width: '100%',
            marginTop: 'auto'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '2rem',
        overflowY: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
