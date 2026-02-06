'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import '../login/Login.css'; // Reuse login styles

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Password reset instructions have been sent to your email.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Stethoscope size={32} />
          </div>
          <h2>Forgot Password</h2>
          <p className="welcome-text">Enter your username to recover your account</p>
        </div>

        {status === 'error' && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="success-message" style={{ textAlign: 'center' }}>
            <div style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={48} />
            </div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              {message}
            </p>
            <Link href="/login" className="login-button" style={{ display: 'block', textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            <button type="submit" className="login-button" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Reset Password'}
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
