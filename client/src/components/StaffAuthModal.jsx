import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  StethoscopeIcon,
  ShieldCheckIcon,
  LockIcon,
  UnlockIcon,
  UserIcon,
  CheckIcon
} from './Icons';


export default function StaffAuthModal({ isOpen, onClose, onAuthenticated, doctors = [], currentDoctorId }) {
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('Doctor');
  const [selectedDoctorId, setSelectedDoctorId] = useState(currentDoctorId || doctors[0]?.id || 'DOC-101');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const pinInputRef = useRef(null);

  // Lock background body scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isOpen]);

  // Synchronize initial doctor when modal opens or doctor list loads
  useEffect(() => {
    if (isOpen) {
      if (currentDoctorId && doctors.some(d => d.id === currentDoctorId)) {
        setSelectedDoctorId(currentDoctorId);
      } else if (doctors.length > 0 && (!selectedDoctorId || !doctors.some(d => d.id === selectedDoctorId))) {
        setSelectedDoctorId(doctors[0].id);
      }
      setPin('');
      setError(false);
      // Auto-focus PIN input after opening
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, currentDoctorId, doctors]);

  // Physical Keyboard Support: allow typing digits, Backspace, Escape, and Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing directly inside the input
      if (document.activeElement === pinInputRef.current) {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') verifyPin(pin || '1234');
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        verifyPin(pin.length === 4 ? pin : '1234');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, selectedDoctorId, role, doctors]);

  if (!isOpen) return null;

  const CORRECT_PIN = '1234';

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = async (pinToTest) => {
    try {
      const authResult = await api.authenticateStaff({
        pin: pinToTest,
        role,
        doctorId: role === 'Doctor' ? selectedDoctorId : null
      });

      if (authResult?.success && authResult?.user) {
        onAuthenticated(authResult.user);
        setPin('');
        setError(false);
        return;
      }
    } catch (e) {
      console.warn('API staff-auth check, falling back to local pin check:', e);
    }

    if (pinToTest === CORRECT_PIN) {
      const doc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];
      onAuthenticated({
        role,
        doctorId: role === 'Doctor' ? (selectedDoctorId || doc?.id || 'DOC-101') : 'ALL',
        doctorName: role === 'Doctor' ? (doc?.name || 'Dr. Arvind Mehta') : 'Hospital Administrator',
        department: doc?.departmentName || doc?.specialty || (role === 'Admin' ? 'Executive Management' : 'General'),
        opdRoom: doc?.opdRoom || (role === 'Doctor' ? 'Room 101' : 'Admin Suite'),
        authenticatedAt: new Date().toISOString()
      });
      setPin('');
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 700);
    }
  };

  const handleQuickDemoUnlock = () => {
    verifyPin('1234');
  };

  const currentSelectedDoc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  return (
    <div
      className="modal-backdrop active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '460px',
          width: '100%',
          maxHeight: 'calc(100vh - 3rem)',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 1.75rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.55)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          margin: 'auto 0',
          position: 'relative',
          animation: shake ? 'shakeAnimation 0.5s cubic-bezier(.36,.07,.19,.97) both' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Quick Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.85rem',
            right: '0.85rem',
            background: 'var(--bg-muted)',
            border: 'none',
            borderRadius: '50%',
            width: '1.85rem',
            height: '1.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          title="Close Authorization"
        >
          ✕
        </button>

        {/* Security Shield Icon */}
        <div style={{
          width: '3.4rem',
          height: '3.4rem',
          borderRadius: '50%',
          backgroundColor: error ? 'var(--rose-light)' : 'var(--primary-light)',
          color: error ? 'var(--rose)' : 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          marginBottom: '0.5rem',
          transition: 'all 0.3s ease'
        }}>
          {error ? <LockIcon size={26} color="#f43f5e" /> : <StethoscopeIcon size={26} color="var(--primary)" />}
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.2rem' }}>
          Doctor & Staff Authorization
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Choose doctor identity & unlock dashboard (Default PIN: <strong>1234</strong>)
        </p>

        {/* Role Selector */}
        <div className="flex justify-center gap-2" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setRole('Doctor')}
            className={`btn btn-sm ${role === 'Doctor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <StethoscopeIcon size={14} />
            <span>Specialist Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('Admin')}
            className={`btn btn-sm ${role === 'Admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShieldCheckIcon size={14} />
            <span>Hospital Administrator</span>
          </button>
        </div>

        {/* Doctor Selection Section */}
        {role === 'Doctor' && (
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <label
              htmlFor="auth-doctor-select"
              className="form-label"
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.35rem'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserIcon size={14} color="var(--primary)" />
                <span>Select Your Doctor Profile:</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {doctors.length} Doctors Registered
              </span>
            </label>

            {/* Standard Accessible Select Dropdown */}
            <select
              id="auth-doctor-select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="form-control"
              style={{
                fontSize: '0.85rem',
                padding: '0.55rem 0.75rem',
                fontWeight: 700,
                borderColor: 'var(--primary)',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-app)',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
              }}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty} • {d.opdRoom})
                </option>
              ))}
            </select>

            {/* Quick Click Doctor Avatar Chips for Direct Selection */}
            <div
              style={{
                display: 'flex',
                gap: '0.35rem',
                overflowX: 'auto',
                marginTop: '0.5rem',
                paddingBottom: '0.25rem'
              }}
            >
              {doctors.map(d => {
                const isSelected = d.id === selectedDoctorId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(d.id)}
                    style={{
                      background: isSelected ? 'var(--primary)' : 'var(--bg-surface)',
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '0.3rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                      {isSelected ? <CheckIcon size={12} color="#ffffff" /> : <UserIcon size={12} color={isSelected ? '#ffffff' : 'var(--text-muted)'} />}
                    </span>
                    <span>{d.name.split(' ')[1] || d.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Doctor Summary Card */}
            {currentSelectedDoc && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(2, 132, 199, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <StethoscopeIcon size={14} color="var(--primary)" />
                    <span>{currentSelectedDoc.name}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {currentSelectedDoc.specialty} • {currentSelectedDoc.opdRoom}
                  </div>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', fontWeight: 700 }}>
                  Ready to Unlock
                </span>
              </div>
            )}
          </div>
        )}

        {/* 1-Click Fast Unlock Button */}
        <button
          type="button"
          onClick={handleQuickDemoUnlock}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '0.925rem',
            fontWeight: 800,
            marginBottom: '0.85rem',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem'
          }}
        >
          <UnlockIcon size={16} color="#ffffff" />
          <span>Unlock & Enter Desk: {role === 'Doctor' ? (currentSelectedDoc?.name || 'Doctor') : 'Hospital Administrator'}</span>
        </button>

        {/* PIN Input & Keypad Option */}
        <div style={{ marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
            Or Enter 4-Digit Security PIN (Default: <strong>1234</strong>):
          </div>

          {/* Interactive PIN input box for physical keyboard / mobile typing */}
          <input
            ref={pinInputRef}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(val);
              setError(false);
              if (val.length === 4) verifyPin(val);
            }}
            className="form-control"
            style={{
              textAlign: 'center',
              letterSpacing: '8px',
              fontSize: '1.3rem',
              fontWeight: 800,
              padding: '0.4rem',
              maxWidth: '170px',
              margin: '0 auto 0.6rem',
              borderColor: error ? 'var(--rose)' : 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-app)'
            }}
          />

          {/* PIN Circle Indicators */}
          <div className="flex justify-center gap-3" style={{ marginBottom: '0.4rem' }}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: `2px solid ${error ? 'var(--rose)' : (isFilled ? 'var(--primary)' : 'var(--border-strong)')}`,
                    backgroundColor: isFilled ? (error ? 'var(--rose)' : 'var(--primary)') : 'transparent',
                    transition: 'all 0.2s ease',
                    transform: isFilled ? 'scale(1.15)' : 'scale(1)'
                  }}
                />
              );
            })}
          </div>
        </div>

        {error && (
          <div style={{ color: 'var(--rose)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.65rem' }}>
            Incorrect PIN. Please enter 1234 or click Quick Unlock.
          </div>
        )}

        {/* On-screen Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.4rem',
          maxWidth: '220px',
          margin: '0 auto 0.85rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="btn btn-secondary"
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '0.45rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.45rem' }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="btn btn-secondary"
            style={{ fontSize: '1.05rem', fontWeight: 700, padding: '0.45rem' }}
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-secondary"
            style={{ fontSize: '1.05rem', fontWeight: 700, padding: '0.45rem' }}
          >
            ⌫
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', fontSize: '0.78rem', padding: '0.45rem' }}
        >
          Cancel & Return to Public Portal
        </button>
      </div>

      <style>{`
        @keyframes shakeAnimation {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(3px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
          40%, 60% { transform: translate3d(5px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
