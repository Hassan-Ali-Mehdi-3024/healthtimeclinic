'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Shield, Database, Save, Edit2, X, Building2, Palette, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingApp, setIsEditingApp] = useState(false);
  
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

  const [clinicSettings, setClinicSettings] = useState({
    clinicName: '',
    address: '',
    phone: '',
    email: ''
  });

  const [appSettings, setAppSettings] = useState({
    currency: 'Rs',
    dateFormat: 'DD/MM/YYYY',
    itemsPerPage: 10,
    primaryColor: '#3b82f6'
  });

  const [usersList, setUsersList] = useState([]);
  const [isManagingUsers, setIsManagingUsers] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'Doctor'
  });

  useEffect(() => {
    fetchUserData();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (user?.role === 'Head Doctor') {
      fetchUsersList();
    }
  }, [user]);

  const fetchUsersList = async () => {
    try {
      const response = await fetch('/api/user?type=list');
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      if (!newUser.username || !newUser.password) {
        toast.error('Username and password are required');
        return;
      }

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User created successfully');
        setIsAddingUser(false);
        setNewUser({ username: '', password: '', full_name: '', email: '', role: 'Doctor' });
        fetchUsersList();
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingUser,
          isHeadDoctorAction: true
        })
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsersList();
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setClinicSettings({
          clinicName: data.clinicName || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || ''
        });
        setAppSettings({
          currency: data.currency || 'Rs',
          dateFormat: data.dateFormat || 'DD/MM/YYYY',
          itemsPerPage: data.itemsPerPage || 10,
          primaryColor: data.primaryColor || '#3b82f6'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
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
        setIsEditingProfile(false);
        login(data.user);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSaveSettings = async (type) => {
    try {
      const body = type === 'clinic' ? clinicSettings : appSettings;
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast.success(`${type === 'clinic' ? 'Clinic' : 'Application'} settings updated`);
        if (type === 'clinic') setIsEditingClinic(false);
        if (type === 'app') setIsEditingApp(false);
        // Refresh to ensure sync
        fetchSettings();
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
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
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account, clinic information, and application preferences.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Clinic Information Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Building2 size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>Clinic Information</h3>
            {!isEditingClinic ? (
              <button 
                onClick={() => setIsEditingClinic(true)}
                style={editButtonStyle}
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleSaveSettings('clinic')}
                  style={saveButtonStyle}
                >
                  <Save size={16} /> Save
                </button>
                <button 
                  onClick={() => { setIsEditingClinic(false); fetchSettings(); }}
                  style={cancelButtonStyle}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div style={sectionContentStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Clinic Name</label>
              {isEditingClinic ? (
                <input
                  type="text"
                  value={clinicSettings.clinicName}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, clinicName: e.target.value })}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{clinicSettings.clinicName || 'Not set'}</div>
              )}
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Address</label>
              {isEditingClinic ? (
                <input
                  type="text"
                  value={clinicSettings.address}
                  onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                  style={inputStyle}
                />
              ) : (
                <div style={valueStyle}>{clinicSettings.address || 'Not set'}</div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Phone Number</label>
                {isEditingClinic ? (
                  <input
                    type="text"
                    value={clinicSettings.phone}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  <div style={valueStyle}>{clinicSettings.phone || 'Not set'}</div>
                )}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Email Address</label>
                {isEditingClinic ? (
                  <input
                    type="email"
                    value={clinicSettings.email}
                    onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                    style={inputStyle}
                  />
                ) : (
                  <div style={valueStyle}>{clinicSettings.email || 'Not set'}</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Application Preferences */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Palette size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>Application Preferences</h3>
            {!isEditingApp ? (
              <button 
                onClick={() => setIsEditingApp(true)}
                style={editButtonStyle}
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => handleSaveSettings('app')}
                  style={saveButtonStyle}
                >
                  <Save size={16} /> Save
                </button>
                <button 
                  onClick={() => { setIsEditingApp(false); fetchSettings(); }}
                  style={cancelButtonStyle}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div style={sectionContentStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Currency Symbol</label>
                {isEditingApp ? (
                  <select
                    value={appSettings.currency}
                    onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Rs">Rs (Rupee)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                ) : (
                  <div style={valueStyle}>{appSettings.currency}</div>
                )}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Date Format</label>
                {isEditingApp ? (
                  <select
                    value={appSettings.dateFormat}
                    onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                ) : (
                  <div style={valueStyle}>{appSettings.dateFormat}</div>
                )}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Rows Per Page</label>
                {isEditingApp ? (
                  <select
                    value={appSettings.itemsPerPage}
                    onChange={(e) => setAppSettings({ ...appSettings, itemsPerPage: parseInt(e.target.value) })}
                    style={inputStyle}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                ) : (
                  <div style={valueStyle}>{appSettings.itemsPerPage}</div>
                )}
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Primary Color</label>
                {isEditingApp ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                      style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <span>{appSettings.primaryColor}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: appSettings.primaryColor }}></div>
                    <div style={valueStyle}>{appSettings.primaryColor}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* User Profile Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <User size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>User Profile</h3>
            {!isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(true)}
                style={editButtonStyle}
              >
                <Edit2 size={16} /> Edit
              </button>
            ) : (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleSaveProfile}
                  style={saveButtonStyle}
                >
                  <Save size={16} /> Save
                </button>
                <button 
                  onClick={() => { setIsEditingProfile(false); fetchUserData(); }}
                  style={cancelButtonStyle}
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>
          <div style={sectionContentStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Full Name</label>
              {isEditingProfile ? (
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
              {isEditingProfile ? (
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
              {isEditingProfile ? (
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

        {/* Staff Management Section (Visible only to Head Doctor) */}
        {user?.role === 'Head Doctor' && (
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <User size={20} color="var(--primary-color)" />
              <h3 style={sectionTitleStyle}>Staff Management</h3>
              {!isManagingUsers ? (
                <button 
                  onClick={() => setIsManagingUsers(true)}
                  style={editButtonStyle}
                >
                  <Edit2 size={16} /> Manage
                </button>
              ) : (
                <button 
                  onClick={() => setIsManagingUsers(false)}
                  style={cancelButtonStyle}
                >
                  <X size={16} /> Close
                </button>
              )}
            </div>
            {isManagingUsers && (
              <div style={sectionContentStyle}>
                {!isAddingUser && !editingUser ? (
                  <>
                    <button 
                      onClick={() => setIsAddingUser(true)}
                      style={{ ...saveButtonStyle, marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}
                    >
                      <User size={16} /> Add New User
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {usersList.map(u => (
                        <div key={u.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>{u.full_name || u.username}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.role} • {u.username}</div>
                          </div>
                          <button 
                            onClick={() => setEditingUser(u)}
                            style={{ padding: '0.5rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : isAddingUser ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Add New User</h4>
                    <input
                      type="text"
                      placeholder="Username *"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      type="password"
                      placeholder="Password *"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      style={inputStyle}
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Head Doctor">Head Doctor</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Nurse">Nurse</option>
                    </select>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleAddUser} style={saveButtonStyle}>Create User</button>
                      <button onClick={() => setIsAddingUser(false)} style={cancelButtonStyle}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Edit User: {editingUser.username}</h4>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={editingUser.full_name || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                      style={inputStyle}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      style={inputStyle}
                    />
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Head Doctor">Head Doctor</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Nurse">Nurse</option>
                    </select>
                    <input
                      type="password"
                      placeholder="New Password (leave blank to keep current)"
                      value={editingUser.newPassword || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                      style={inputStyle}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleUpdateUser} style={saveButtonStyle}>Update User</button>
                      <button onClick={() => setEditingUser(null)} style={cancelButtonStyle}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Security Section */}
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield size={20} color="var(--primary-color)" />
            <h3 style={sectionTitleStyle}>Security</h3>
            {!isChangingPassword && (
              <button 
                onClick={() => setIsChangingPassword(true)}
                style={editButtonStyle}
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
                    style={saveButtonStyle}
                  >
                    Update Password
                  </button>
                  <button 
                    onClick={() => { 
                      setIsChangingPassword(false); 
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    style={cancelButtonStyle}
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
                Connected (Supabase)
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Version</label>
              <div style={valueStyle}>1.1.0</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Styles
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

const editButtonStyle = {
  marginLeft: 'auto', 
  padding: '0.5rem 1rem', 
  backgroundColor: 'var(--primary-color)', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  fontWeight: '500'
};

const saveButtonStyle = {
  padding: '0.5rem 1rem', 
  backgroundColor: 'var(--primary-color)', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  fontWeight: '500'
};

const cancelButtonStyle = {
  padding: '0.5rem 1rem', 
  backgroundColor: '#f3f4f6', 
  color: '#6b7280', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  display: 'flex', 
  alignItems: 'center', 
  gap: '0.5rem', 
  fontWeight: '500'
};
