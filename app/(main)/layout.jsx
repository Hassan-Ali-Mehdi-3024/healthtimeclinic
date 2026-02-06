'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Calendar, Settings, LogOut, Pill, Menu, X } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push('/login');
    }
  }, [user, router]);

  // Close sidebar on mobile when path changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  if (!user) return null;

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  // Module Colors
  const moduleColors = {
    dashboard: '#3b82f6', // Blue
    patients: '#10b981', // Emerald
    medicines: '#8b5cf6', // Violet
    appointments: '#f59e0b', // Amber
    settings: '#64748b', // Slate
  };

  const getModuleColor = (path) => {
    if (path.startsWith('/patients')) return moduleColors.patients;
    if (path.startsWith('/medicines')) return moduleColors.medicines;
    if (path.startsWith('/appointments')) return moduleColors.appointments;
    if (path.startsWith('/settings')) return moduleColors.settings;
    return moduleColors.dashboard;
  };

  const currentModuleColor = getModuleColor(pathname);

  const linkStyle = (path, color) => ({
    display: 'flex', 
    alignItems: 'center', 
    gap: '0.75rem', 
    padding: '0.875rem 1rem', 
    backgroundColor: isActive(path) ? `${color}15` : 'transparent', // 15 is hex opacity
    color: isActive(path) ? color : 'var(--text-secondary)', 
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: isActive(path) ? '600' : '500',
    transition: 'all 0.2s ease',
    borderLeft: isActive(path) ? `4px solid ${color}` : '4px solid transparent'
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      display: 'flex',
      position: 'relative'
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', // Changed to space-between
          padding: '0 1rem', // Reduced padding slightly
          zIndex: 40,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' // Added subtle shadow
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#1e293b',
                padding: '0.5rem',
                marginLeft: '-0.5rem' // Negative margin to align icon
              }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                backgroundColor: currentModuleColor, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                <span style={{ fontSize: '1rem', fontWeight: '700' }}>H</span>
              </div>
              <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#1e293b' }}>Health Time</span>
            </div>
          </div>
          
          {/* User Avatar (Mobile) */}
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #e2e8f0'
          }}>
             <span style={{ fontWeight: '600', color: '#64748b', fontSize: '0.875rem' }}>{user.username?.[0]?.toUpperCase()}</span>
          </div>
        </header>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 45
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: isSidebarOpen ? 0 : '-280px',
        top: 0,
        zIndex: 50,
        transition: 'left 0.3s ease-in-out',
        boxShadow: isMobile && isSidebarOpen ? '4px 0 24px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: '800', 
          color: currentModuleColor,
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '0.5rem'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            backgroundColor: currentModuleColor, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white'
          }}>
            <span style={{ fontSize: '1.25rem' }}>H</span>
          </div>
          Health Time
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" style={linkStyle('/dashboard', moduleColors.dashboard)}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/patients" style={linkStyle('/patients', moduleColors.patients)}>
            <Users size={20} />
            Patients
          </Link>
          <Link href="/medicines" style={linkStyle('/medicines', moduleColors.medicines)}>
            <Pill size={20} />
            Medicines
          </Link>
          <Link href="/appointments" style={linkStyle('/appointments', moduleColors.appointments)}>
            <Calendar size={20} />
            Appointments
          </Link>
          <Link href="/settings" style={linkStyle('/settings', moduleColors.settings)}>
            <Settings size={20} />
            Settings
          </Link>
        </nav>

        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: '600', color: '#64748b' }}>{user.username?.[0]?.toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.full_name || 'Doctor'}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</p>
            </div>
          </div>
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
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: !isMobile && isSidebarOpen ? '280px' : 0, 
        padding: isMobile ? '5rem 1rem 2rem' : '2rem',
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease-in-out',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
