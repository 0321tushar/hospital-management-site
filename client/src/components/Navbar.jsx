import React from 'react';
import {
  SearchIcon,
  CalendarIcon,
  ActivityIcon,
  StethoscopeIcon,
  RecordsIcon,
  LockIcon,
  UnlockIcon,
  PhoneIcon,
  SirenIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  HospitalPulseIcon
} from './Icons';

export default function Navbar({
  activeMode,
  onRequestERPMode,
  onBackToPublic,
  isStaffAuthenticated,
  hospital,
  darkMode,
  setDarkMode
}) {
  const isERP = activeMode === 'erp';

  return (
    <>
      {/* Top Utility Bar (Only in Public mode) */}
      {!isERP && (
        <div style={{
          background: 'linear-gradient(90deg, #090d16, #0f172a)',
          color: '#f8fafc',
          fontSize: '0.8rem',
          padding: '0.45rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none'
        }}>
          <div style={{
            width: '100%',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {/* Left Emergency & Trauma Info */}
            <div className="flex items-center gap-3">
              <span style={{
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem'
              }}>
                <SirenIcon size={14} color="#fb7185" />
                <span>24/7 TRAUMA: {hospital?.emergencyPhone || '1066'}</span>
              </span>

              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>|</span>

              <span style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <PhoneIcon size={13} color="#94a3b8" />
                <span>Ambulance Dispatch • NABH Accredited Super Specialty</span>
              </span>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={onRequestERPMode}
                style={{
                  background: 'rgba(2, 132, 199, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(2, 132, 199, 0.45)',
                  padding: '0.22rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {isStaffAuthenticated ? <UnlockIcon size={13} color="#38bdf8" /> : <LockIcon size={13} color="#38bdf8" />}
                <span>{isStaffAuthenticated ? 'Staff ERP Desk (Unlocked)' : 'Staff Login (PIN)'}</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '0.22rem 0.6rem',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                title="Toggle Theme"
              >
                {darkMode ? <SunIcon size={13} color="#f59e0b" /> : <MoonIcon size={13} color="#64748b" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Header Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 100,
        backdropFilter: 'blur(16px)',
        flexShrink: 0,
        height: isERP ? '62px' : '72px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {isERP ? (
          /* ERP Full-Width Clean Header */
          <div style={{
            width: '100%',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}>
                <HospitalPulseIcon size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
                    {hospital?.name || 'PulseAura Super Specialty Hospital'}
                  </h2>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.55rem' }}>
                    Clinical ERP OS
                  </span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>
                  Doctor OPD Desk • EMR Rx Writer • IPD Bed Matrix • Pharmacy Stock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.3rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                <span>Live OPD Active</span>
              </span>

              <button
                onClick={onBackToPublic}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 1rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <GlobeIcon size={15} color="var(--primary)" />
                <span>View Public Portal</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? <SunIcon size={14} color="#f59e0b" /> : <MoonIcon size={14} color="#64748b" />}
              </button>
            </div>
          </div>
        ) : (
          /* Public Portal Standard Header */
          <div style={{
            width: '100%',
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            {/* Logo & Brand */}
            <a href="#" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)',
                flexShrink: 0
              }}>
                <HospitalPulseIcon size={22} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-main)', margin: 0 }}>
                  {hospital?.name || 'PulseAura Super Specialty Hospital'}
                </h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                  {hospital?.tagline || 'Center for Advanced Medicine & Compassionate Care'}
                </p>
              </div>
            </a>

            {/* Navigation Links with Modern Icons & Generous Spacing */}
            <nav className="flex items-center" style={{ gap: '0.65rem' }}>
              {/* 1. Find a Doctor */}
              <a
                href="#find-doctor"
                className="nav-link-pill"
                style={{
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'var(--primary-subtle)',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--primary-light)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <SearchIcon size={14} color="var(--primary)" />
                <span>Find a Doctor</span>
              </a>

              {/* 2. Book Consultation */}
              <a
                href="#booking"
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <CalendarIcon size={15} color="var(--text-muted)" />
                <span>Book Appointment</span>
              </a>

              {/* 3. Live Queue Board */}
              <a
                href="#queue"
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <ActivityIcon size={15} color="#10b981" />
                <span>Live Queue</span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  borderRadius: '9999px',
                  fontWeight: 700
                }}>
                  LIVE
                </span>
              </a>

              {/* 4. Specialties */}
              <a
                href="#specialties"
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <StethoscopeIcon size={15} color="var(--text-muted)" />
                <span>Specialties</span>
              </a>

              {/* 5. My Health Records */}
              <a
                href="#patient-portal"
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <RecordsIcon size={15} color="var(--text-muted)" />
                <span>Health Records</span>
              </a>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '26px', backgroundColor: 'var(--border-subtle)', margin: '0 0.35rem' }} />

              {/* 6. Staff ERP Portal Button */}
              <button
                onClick={onRequestERPMode}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  padding: '0.5rem 1.05rem',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                {isStaffAuthenticated ? <UnlockIcon size={14} color="#ffffff" /> : <LockIcon size={14} color="#ffffff" />}
                <span>{isStaffAuthenticated ? 'Staff Portal' : 'Staff Login'}</span>
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
