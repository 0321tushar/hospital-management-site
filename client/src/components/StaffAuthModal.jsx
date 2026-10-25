import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  StethoscopeIcon,
  ShieldCheckIcon,
  LockIcon,
  UnlockIcon,
  UserIcon,
  CheckIcon,
  SearchIcon,
  ClockIcon,
  AlertTriangleIcon
} from './Icons';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 300; // 5 minutes = 300 seconds
const STORAGE_KEY_PROFILES = 'pulseaura_profile_security_locks';

// Helper to read per-profile security dictionary from localStorage:
// format: { [profileId]: { failedAttempts: number, lockoutUntil: number } }
const getAllSecurityData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

const getProfileSecurity = (profileId) => {
  if (!profileId) return { failedAttempts: 0, lockoutUntil: 0 };
  const all = getAllSecurityData();
  const entry = all[profileId];
  if (!entry) return { failedAttempts: 0, lockoutUntil: 0 };

  // If lockout expired, automatically clean it up
  if (entry.lockoutUntil && entry.lockoutUntil <= Date.now()) {
    delete all[profileId];
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(all));
    } catch (e) {}
    return { failedAttempts: 0, lockoutUntil: 0 };
  }
  return entry;
};

const recordProfileFailedAttempt = (profileId) => {
  if (!profileId) return { failedAttempts: 1, lockoutUntil: 0, isNowLocked: false };
  const all = getAllSecurityData();
  const current = all[profileId] || { failedAttempts: 0, lockoutUntil: 0 };
  const newAttempts = (current.failedAttempts || 0) + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    const expiry = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
    all[profileId] = { failedAttempts: newAttempts, lockoutUntil: expiry };
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(all));
    } catch (e) {}
    return { failedAttempts: newAttempts, lockoutUntil: expiry, isNowLocked: true };
  } else {
    all[profileId] = { failedAttempts: newAttempts, lockoutUntil: 0 };
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(all));
    } catch (e) {}
    return { failedAttempts: newAttempts, lockoutUntil: 0, isNowLocked: false };
  }
};

const clearProfileSecurity = (profileId) => {
  if (!profileId) return;
  const all = getAllSecurityData();
  if (all[profileId]) {
    delete all[profileId];
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(all));
    } catch (e) {}
  }
};

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function StaffAuthModal({ isOpen, onClose, onAuthenticated, doctors = [], currentDoctorId }) {
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('Doctor');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);

  // Active target profile ID (specific doctor ID or 'ADMIN')
  const activeTargetId = role === 'Doctor' ? selectedDoctorId : 'ADMIN';

  // Security state for the active profile
  const [profileSecurity, setProfileSecurity] = useState({ failedAttempts: 0, lockoutUntil: 0 });
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const pinInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const isCurrentProfileLocked = Boolean(
    profileSecurity?.lockoutUntil &&
    profileSecurity.lockoutUntil > Date.now() &&
    secondsRemaining > 0
  );

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

  // Synchronize when active target profile changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (!activeTargetId) {
      setProfileSecurity({ failedAttempts: 0, lockoutUntil: 0 });
      setSecondsRemaining(0);
      setPin('');
      setError(false);
      setErrorMessage('');
      return;
    }

    const sec = getProfileSecurity(activeTargetId);
    setProfileSecurity(sec);

    if (sec.lockoutUntil && sec.lockoutUntil > Date.now()) {
      setSecondsRemaining(Math.ceil((sec.lockoutUntil - Date.now()) / 1000));
    } else {
      setSecondsRemaining(0);
    }

    setPin('');
    setError(false);
    setErrorMessage('');

    // Auto-focus PIN input if a valid, non-locked doctor is chosen
    if (activeTargetId && (!sec.lockoutUntil || sec.lockoutUntil <= Date.now())) {
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 150);
    }
  }, [activeTargetId, role, isOpen]);

  // Live countdown timer for the active profile
  useEffect(() => {
    if (!profileSecurity?.lockoutUntil || profileSecurity.lockoutUntil <= Date.now()) {
      if (secondsRemaining > 0) setSecondsRemaining(0);
      return;
    }

    setSecondsRemaining(Math.max(0, Math.ceil((profileSecurity.lockoutUntil - Date.now()) / 1000)));

    const interval = setInterval(() => {
      const rem = Math.max(0, Math.ceil((profileSecurity.lockoutUntil - Date.now()) / 1000));
      setSecondsRemaining(rem);

      if (rem <= 0) {
        clearProfileSecurity(activeTargetId);
        setProfileSecurity({ failedAttempts: 0, lockoutUntil: 0 });
        setSecondsRemaining(0);
        setError(false);
        setErrorMessage('');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [profileSecurity?.lockoutUntil, activeTargetId]);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDoctorId('');
      setSearchQuery('');
      setIsDropdownOpen(false);
      setPin('');
      setError(false);
      setErrorMessage('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Physical Keyboard Support: enabled only when a valid profile is chosen and not locked
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // If locked, allow Escape to close
      if (isCurrentProfileLocked) {
        if (e.key === 'Escape') onClose();
        return;
      }

      // If user is currently typing in the search bar, don't intercept digits
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Escape') setIsDropdownOpen(false);
        return;
      }

      // If doctor role but no doctor selected yet, ignore keypad keys
      if (role === 'Doctor' && !selectedDoctorId) {
        if (e.key === 'Escape') onClose();
        return;
      }

      // If activeElement is pinInputRef
      if (document.activeElement === pinInputRef.current) {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') {
          if (pin.length === 4) verifyPin(pin);
        }
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) verifyPin(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, selectedDoctorId, role, isCurrentProfileLocked]);

  if (!isOpen) return null;

  const CORRECT_PIN = '1234';

  const handleKeyPress = (num) => {
    if (!activeTargetId || isCurrentProfileLocked) return;
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      setErrorMessage('');
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (!activeTargetId || isCurrentProfileLocked) return;
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    if (!activeTargetId || isCurrentProfileLocked) return;
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const verifyPin = async (pinToTest) => {
    if (!activeTargetId || isCurrentProfileLocked) return;

    if (role === 'Doctor' && !selectedDoctorId) {
      setError(true);
      setErrorMessage('Please choose a doctor name from the search bar first.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 700);
      return;
    }

    let isSuccess = false;
    let authenticatedUser = null;

    try {
      const authResult = await api.authenticateStaff({
        pin: pinToTest,
        role,
        doctorId: role === 'Doctor' ? selectedDoctorId : null
      });

      if (authResult?.success && authResult?.user) {
        isSuccess = true;
        authenticatedUser = authResult.user;
      }
    } catch (e) {
      console.warn('API staff-auth check, falling back to local pin check:', e);
    }

    if (!isSuccess && pinToTest === CORRECT_PIN) {
      const doc = doctors.find(d => d.id === selectedDoctorId);
      isSuccess = true;
      authenticatedUser = {
        role,
        doctorId: role === 'Doctor' ? (selectedDoctorId || doc?.id || 'DOC-101') : 'ALL',
        doctorName: role === 'Doctor' ? (doc?.name || 'Doctor') : 'Hospital Administrator',
        department: doc?.departmentName || doc?.specialty || (role === 'Admin' ? 'Executive Management' : 'General'),
        opdRoom: doc?.opdRoom || (role === 'Doctor' ? 'Room 101' : 'Admin Suite'),
        authenticatedAt: new Date().toISOString()
      };
    }

    if (isSuccess && authenticatedUser) {
      // Correct password! Clear security lock and failed attempts for this profile only
      clearProfileSecurity(activeTargetId);
      setProfileSecurity({ failedAttempts: 0, lockoutUntil: 0 });
      setSecondsRemaining(0);
      setError(false);
      setErrorMessage('');

      onAuthenticated(authenticatedUser);
      setPin('');
    } else {
      // Incorrect password: record attempt for this specific doctor profile
      const result = recordProfileFailedAttempt(activeTargetId);
      setProfileSecurity(result);

      if (result.isNowLocked) {
        setSecondsRemaining(LOCKOUT_DURATION_SECONDS);
        setError(true);
        const targetName = role === 'Doctor' ? (currentSelectedDoc?.name || 'This doctor') : 'Administrator';
        setErrorMessage(`3 incorrect attempts! ${targetName}'s profile is now locked for 5 minutes.`);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 700);
      } else {
        const remaining = MAX_ATTEMPTS - result.failedAttempts;
        setError(true);
        setErrorMessage(`Incorrect password! ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before this doctor profile is locked.`);
        setShake(true);
        setTimeout(() => {
          setShake(false);
          setPin('');
        }, 700);
      }
    }
  };

  const handleQuickDemoUnlock = () => {
    if (!activeTargetId || isCurrentProfileLocked) return;
    if (role === 'Doctor' && !selectedDoctorId) {
      setError(true);
      setErrorMessage('Please search and select a doctor name first.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
      }, 700);
      return;
    }
    verifyPin(CORRECT_PIN);
  };

  const currentSelectedDoc = doctors.find(d => d.id === selectedDoctorId) || null;

  const filteredDoctors = doctors.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q) || d.opdRoom?.toLowerCase().includes(q);
  });

  // Determines whether to display the password input and keypad:
  // ONLY when a doctor is chosen from the search bar (for Doctor role), or for Admin role!
  const canFillPassword = role === 'Admin' || (role === 'Doctor' && Boolean(selectedDoctorId));

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
          border: isCurrentProfileLocked ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-subtle)',
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

        {/* Security Shield / Lock Icon */}
        <div style={{
          width: '3.6rem',
          height: '3.6rem',
          borderRadius: '50%',
          backgroundColor: isCurrentProfileLocked
            ? 'rgba(239, 68, 68, 0.16)'
            : (error ? 'var(--rose-light)' : 'var(--primary-light)'),
          color: isCurrentProfileLocked ? '#ef4444' : (error ? 'var(--rose)' : 'var(--primary)'),
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.6rem',
          marginBottom: '0.5rem',
          transition: 'all 0.3s ease',
          boxShadow: isCurrentProfileLocked ? '0 0 0 6px rgba(239, 68, 68, 0.2)' : 'none',
          animation: isCurrentProfileLocked ? 'pulseRed 2s infinite ease-in-out' : 'none'
        }}>
          {isCurrentProfileLocked ? (
            <LockIcon size={28} color="#ef4444" />
          ) : error ? (
            <LockIcon size={26} color="#f43f5e" />
          ) : (
            <StethoscopeIcon size={26} color="var(--primary)" />
          )}
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          marginBottom: '0.2rem',
          color: isCurrentProfileLocked ? '#ef4444' : 'var(--text-main)'
        }}>
          {isCurrentProfileLocked
            ? `${role === 'Doctor' ? currentSelectedDoc?.name || 'Doctor' : 'Admin'} Profile Locked`
            : 'Doctor & Staff Authorization'}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          {isCurrentProfileLocked
            ? '3 incorrect attempts for this profile. Only this doctor is locked.'
            : (role === 'Doctor' && !selectedDoctorId
              ? 'Search and choose doctor name from the search bar to enter password'
              : <>Enter credentials for {currentSelectedDoc?.name || 'Administrator'} (Default PIN: <strong>1234</strong>)</>)}
        </p>

        {/* Role Selector: Doctor or Administrator */}
        <div className="flex justify-center gap-2" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => {
              setRole('Doctor');
              setError(false);
              setErrorMessage('');
            }}
            className={`btn btn-sm ${role === 'Doctor' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <StethoscopeIcon size={14} />
            <span>Specialist Doctor</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('Admin');
              setError(false);
              setErrorMessage('');
            }}
            className={`btn btn-sm ${role === 'Admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ShieldCheckIcon size={14} />
            <span>Hospital Administrator</span>
          </button>
        </div>

        {/* Doctor Search & Selection Section (for Doctor Role) */}
        {role === 'Doctor' && (
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1rem', position: 'relative' }}>
            <label
              className="form-label"
              style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0.35rem'
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <SearchIcon size={14} color="var(--primary)" />
                <span>Search Doctor Name:</span>
              </span>
            </label>

            {/* Live Search Input Field: Blank until searched */}
            <div style={{ position: 'relative' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (!e.target.value) {
                    setSelectedDoctorId('');
                  }
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search doctor by name (e.g. Arvind, Priya, Mehta)..."
                className="form-control"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.55rem 2.2rem 0.55rem 2.4rem',
                  fontWeight: 600,
                  borderColor: selectedDoctorId ? 'var(--emerald)' : 'var(--primary)',
                  backgroundColor: 'var(--bg-app)',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon size={15} color={selectedDoctorId ? 'var(--emerald)' : 'var(--primary)'} />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDoctorId('');
                    setIsDropdownOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Results List */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  marginTop: '0.35rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                  maxHeight: '190px',
                  overflowY: 'auto'
                }}
              >
                {filteredDoctors.length === 0 ? (
                  <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No doctor found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredDoctors.map(d => {
                    const isSelected = d.id === selectedDoctorId;
                    const docSec = getProfileSecurity(d.id);
                    const isDocLocked = Boolean(docSec?.lockoutUntil && docSec.lockoutUntil > Date.now());
                    const docRemainingSec = isDocLocked ? Math.ceil((docSec.lockoutUntil - Date.now()) / 1000) : 0;

                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDoctorId(d.id);
                          setSearchQuery(d.name);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: '0.6rem 0.85rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{d.name}</span>
                            {isDocLocked && (
                              <span style={{
                                fontSize: '0.68rem',
                                color: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '9999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontWeight: 700
                              }}>
                                <LockIcon size={11} color="#ef4444" />
                                <span>Locked ({formatTime(docRemainingSec)})</span>
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {d.specialty} • {d.opdRoom}
                          </div>
                        </div>
                        {isSelected ? (
                          <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.75rem' }}>
                            ✓ Selected
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            Select →
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Selected Doctor Summary Card */}
            {currentSelectedDoc && (
              <div style={{
                marginTop: '0.65rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: isCurrentProfileLocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(2, 132, 199, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: isCurrentProfileLocked ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1.5px solid var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <StethoscopeIcon size={14} color={isCurrentProfileLocked ? '#ef4444' : 'var(--primary)'} />
                    <span>{currentSelectedDoc.name}</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isCurrentProfileLocked ? '#ef4444' : 'var(--primary)', fontWeight: 600 }}>
                    {currentSelectedDoc.specialty} • {currentSelectedDoc.opdRoom}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctorId('');
                    setSearchQuery('');
                    setIsDropdownOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.68rem', padding: '0.2rem 0.55rem', fontWeight: 700 }}
                >
                  Change Doctor
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: If Doctor role and NO doctor selected yet from search bar, show search guide only */}
        {role === 'Doctor' && !selectedDoctorId && (
          <div style={{
            padding: '1.25rem 1rem',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.4rem'
            }}>
              <SearchIcon size={20} color="var(--primary)" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Choose Doctor From Search Bar
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '320px', margin: '0 auto' }}>
              Type and select the doctor's name above. Password entry option will be displayed for the chosen doctor.
            </div>
          </div>
        )}

        {/* STEP 2: Doctor IS selected (or Admin role) -> Check if THIS profile is locked out */}
        {canFillPassword && isCurrentProfileLocked && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(185, 28, 28, 0.06) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.45)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1rem',
            marginBottom: '1.2rem',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              color: '#f87171',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.35rem'
            }}>
              <ClockIcon size={16} color="#ef4444" />
              <span>Doctor Profile Security Lockout</span>
            </div>

            <div style={{
              fontSize: '2.75rem',
              fontWeight: 900,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              color: '#ef4444',
              letterSpacing: '2px',
              lineHeight: 1.1,
              margin: '0.35rem 0'
            }}>
              {formatTime(secondsRemaining)}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Time remaining until <strong>{role === 'Doctor' ? currentSelectedDoc?.name : 'Administrator'}</strong> unlocks
            </div>

            {/* Visual Countdown Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, (secondsRemaining / LOCKOUT_DURATION_SECONDS) * 100))}%`,
                height: '100%',
                backgroundColor: '#ef4444',
                borderRadius: '9999px',
                transition: 'width 1s linear'
              }} />
            </div>

            <div style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginTop: '0.85rem',
              padding: '0.45rem 0.65rem',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <LockIcon size={13} color="#ef4444" />
              <span>Only this doctor is locked. Other doctor desks remain open.</span>
            </div>

            {/* Quick button to pick another doctor who is not locked */}
            {role === 'Doctor' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorId('');
                  setSearchQuery('');
                  setIsDropdownOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: '0.85rem',
                  width: '100%',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <SearchIcon size={13} />
                <span>Choose Another Doctor Profile</span>
              </button>
            )}
          </div>
        )}

        {/* STEP 3: Doctor IS selected (or Admin role) AND NOT locked -> Show Password Input & Keypad */}
        {canFillPassword && !isCurrentProfileLocked && (
          <>
            {/* Warning badge if 1 or 2 attempts failed for THIS profile */}
            {profileSecurity?.failedAttempts > 0 && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.85rem',
                marginBottom: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: '#d97706',
                fontWeight: 700
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                  <AlertTriangleIcon size={16} color="#d97706" />
                  <span>{profileSecurity.failedAttempts} of {MAX_ATTEMPTS} attempts used for this profile</span>
                </span>
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {MAX_ATTEMPTS - profileSecurity.failedAttempts} left
                </span>
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
              <span>
                {role === 'Doctor'
                  ? `Unlock & Enter Desk: ${currentSelectedDoc?.name}`
                  : 'Unlock & Enter Desk: Hospital Administrator'}
              </span>
            </button>

            {/* PIN Password Input & Keypad Option */}
            <div style={{ marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Or Enter 4-Digit Security PIN (Default: <strong>1234</strong>):
              </div>

              {/* Interactive PIN input box */}
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
                  setErrorMessage('');
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
                        border: `2px solid ${
                          error ? 'var(--rose)' : (isFilled ? 'var(--primary)' : 'var(--border-strong)')
                        }`,
                        backgroundColor: isFilled ? (error ? 'var(--rose)' : 'var(--primary)') : 'transparent',
                        transition: 'all 0.2s ease',
                        transform: isFilled ? 'scale(1.15)' : 'scale(1)'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && errorMessage && (
              <div style={{
                color: 'var(--rose)',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '0.65rem',
                padding: '0.35rem 0.6rem',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(244, 63, 94, 0.25)'
              }}>
                {errorMessage}
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
          </>
        )}

        {/* Modal Close / Cancel Button */}
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
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}
