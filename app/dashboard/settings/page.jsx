'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Database, Save, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      if (!user?.username) return;
      
      const response = await fetch(`/api/user?username=${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUsername: user.username
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        // Update auth context with new user data
        login(data.user);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentUsername: user.username,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully');
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and application preferences.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <User size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>Profile Information</h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ marginLeft: 'auto', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleSaveProfile}
                  style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
                >
                  <Save size={16} /> Save
                </button>
                <button 
                  onClick={() => { setIsEditing(false); fetchUserData(); }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div style={sectionContentStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{formData.full_name || 'Not set'}</div>
              )}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{formData.username}</div>
              )}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  placeholder="your.email@example.com"
                />
              ) : (
                <div style={valueStyle}>{formData.email || 'Not set'}</div>
              )}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Role</label>
              <div style={valueStyle}>{user?.role || 'Doctor'}</div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>Security</h3>
            {!isChangingPassword && (
              <button 
                onClick={() => setIsChangingPassword(true)}
                style={{ marginLeft: 'auto', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}
              >
                <Shield size={16} /> Change Password
              </button>
            )}
          </div>
          <div style={sectionContentStyle}>
            {isChangingPassword ? (
              <>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter current password"
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    style={inputStyle}
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    style={inputStyle}
                    placeholder="Confirm new password"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button 
                    onClick={handleChangePassword}
                    style={{ padding: '0.625rem 1.25rem', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Update Password
                  </button>
                  <button 
                    onClick={() => { 
                      setIsChangingPassword(false); 
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    style={{ padding: '0.625rem 1.25rem', backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Click "Change Password" to update your account password.
              </p>
            )}
          </div>
        </section>

        {/* System Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Database size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>System</h3>
          </div>
          <div style={sectionContentStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Database Status</label>
              <div style={{ ...valueStyle, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                Connected (SQLite)
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Version</label>
              <div style={valueStyle}>1.0.0</div>
            </div>
          </div>
        </section>
      </div>
    </div>
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
  alignItems: 'center',
  gap: '0.75rem'
};

const sectionTitleStyle = {
  fontSize: '1.125rem',
  fontWeight: '600',
  color: 'var(--text-primary)',
  margin: 0
};

const sectionContentStyle = {
  padding: '1.5rem'
};

const fieldStyle = {
  marginBottom: '1.25rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--text-secondary)',
  marginBottom: '0.5rem'
};

const valueStyle = {
  fontSize: '1rem',
  color: 'var(--text-primary)',
  fontWeight: '500'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  fontSize: '1rem',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s',
};
