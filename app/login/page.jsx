'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { 
  Stethoscope, 
  User, 
  Lock, 
  Activity, 
  Heart, 
  Pill, 
  Thermometer, 
  Syringe,
  AlertCircle
} from 'lucide-react';
import './Login.css'; // I'll need to move this CSS file too or inline it. I'll assume I move it.

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  // Background icons configuration
  const backgroundIcons = [
    { Icon: Heart, style: { top: '10%', left: '10%', fontSize: '48px', color: '#ef4444' } },
    { Icon: Activity, style: { top: '20%', right: '15%', fontSize: '64px', color: '#3b82f6' } },
    { Icon: Pill, style: { bottom: '15%', left: '20%', fontSize: '56px', color: '#10b981' } },
    { Icon: Thermometer, style: { bottom: '25%', right: '10%', fontSize: '48px', color: '#f59e0b' } },
    { Icon: Syringe, style: { top: '40%', left: '5%', fontSize: '40px', color: '#8b5cf6' } },
    { Icon: Stethoscope, style: { top: '50%', right: '5%', fontSize: '72px', color: '#6366f1' } },
  ];

  return (
    <div className="login-container">
      <div className="background-icons">
        {backgroundIcons.map((item, index) => (
          <div 
            key={index} 
            className="floating-icon" 
            style={{ 
              ...item.style, 
              animationDelay: `${index * 2}s` 
            }}
          >
            <item.Icon size={parseInt(item.style.fontSize)} />
          </div>
        ))}
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Stethoscope size={32} />
          </div>
          <h2>Health Time Clinic</h2>
          <p>Welcome back, Doctor</p>
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
