import React, { useState } from 'react';
import {
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
  HospitalPulseIcon,
  MenuIcon,
  CloseIcon
} from './Icons';

export default function Navbar({
  activeMode,
  publicView = 'home',
  onSelectPublicView,
  onRequestERPMode,
  onBackToPublic,
  isStaffAuthenticated,
  hospital,
  darkMode,
  setDarkMode
}) {
  const isERP = activeMode === 'erp';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


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

              <span className="top-bar-secondary-info" style={{ color: '#64748b', fontSize: '0.75rem' }}>|</span>

              <span className="top-bar-secondary-info" style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <PhoneIcon size={13} color="#94a3b8" />
                <span>Ambulance Dispatch • NABH Accredited Super Specialty</span>
              </span>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-3">
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
      <header className="main-navbar-header" style={{
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
                  <span className="badge badge-primary erp-header-badge" style={{ fontSize: '0.65rem', padding: '0.15rem 0.55rem' }}>
                    Clinical ERP OS
                  </span>
                </div>
                <p className="erp-header-subtitle" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>
                  Doctor OPD Desk • EMR Rx Writer • IPD Bed Matrix • Pharmacy Stock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="erp-live-badge" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                <span>Live OPD</span>
              </span>

              <button
                onClick={onBackToPublic}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.85rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <GlobeIcon size={15} color="var(--primary)" />
                <span className="erp-public-btn-text">Public Portal</span>
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
            gap: '1rem',
            position: 'relative'
          }}>
            {/* Logo & Brand */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onSelectPublicView) onSelectPublicView('home');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3"
              style={{ textDecoration: 'none', cursor: 'pointer', zIndex: 101 }}
            >
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)',
                flexShrink: 0
              }}>
                <HospitalPulseIcon size={20} color="#ffffff" />
              </div>
              <div style={{ maxWidth: 'calc(100vw - 150px)' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.15, color: 'var(--text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {hospital?.name || 'PulseAura Super Specialty Hospital'}
                </h1>
                <p className="navbar-brand-tagline" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {hospital?.tagline || 'Center for Advanced Medicine & Compassionate Care'}
                </p>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="navbar-desktop-nav flex items-center" style={{ gap: '0.45rem' }}>
              {/* 1. Book Consultation */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setTimeout(() => {
                    const el = document.getElementById('booking');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: publicView === 'home' ? 'var(--text-main)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.72rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <CalendarIcon size={15} color={publicView === 'home' ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>Book Appointment</span>
              </button>

              {/* 2. Live Queue Board */}
              <button
                type="button"
                id="nav-live-queue-btn"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('queue');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="nav-link-pill"
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: publicView === 'queue' ? '#10b981' : 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.72rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  whiteSpace: 'nowrap',
                  background: publicView === 'queue' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: publicView === 'queue' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  cursor: 'pointer'
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
              </button>

              {/* 3. Specialties */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setTimeout(() => {
                    const el = document.getElementById('specialties');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.72rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <StethoscopeIcon size={15} color="var(--text-muted)" />
                <span>Specialties</span>
              </button>

              {/* 4. My Health Records */}
              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setTimeout(() => {
                    const el = document.getElementById('patient-portal');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="nav-link-pill"
                style={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.42rem 0.72rem',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                  whiteSpace: 'nowrap',
                  background: 'transparent',
                  border: '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                <RecordsIcon size={15} color="var(--text-muted)" />
                <span>Health Records</span>
              </button>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '26px', backgroundColor: 'var(--border-subtle)', margin: '0 0.35rem' }} />

              {/* Login Button */}
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
                <span>Login</span>
              </button>
            </nav>

            {/* Mobile Actions: Theme Toggle + Hamburger Button */}
            <div className="navbar-mobile-actions items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center' }}
                title="Toggle Dark/Light Mode"
                aria-label="Toggle Theme"
              >
                {darkMode ? <SunIcon size={15} color="#f59e0b" /> : <MoonIcon size={15} color="#64748b" />}
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn btn-secondary btn-sm mobile-hamburger-btn"
                style={{
                  padding: '0.45rem 0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-md)'
                }}
                aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Navigation Menu'}
              >
                {mobileMenuOpen ? <CloseIcon size={20} color="var(--text-main)" /> : <MenuIcon size={20} color="var(--text-main)" />}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Premium Mobile Slide-Out Drawer & Backdrop */}
      {!isERP && mobileMenuOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              zIndex: 9998,
              backdropFilter: 'blur(4px)',
              animation: 'alertModalScaleIn 0.2s ease-out'
            }}
          />
          <div
            className="mobile-nav-drawer"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '85vw',
              maxWidth: '360px',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.45)',
              padding: '1.25rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              zIndex: 9999,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderLeft: '1px solid var(--border-subtle)'
            }}
          >
            {/* Drawer Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                }}>
                  <HospitalPulseIcon size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.1 }}>
                    PulseAura Health
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Mobile Navigation
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  padding: 0,
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close Menu"
              >
                <CloseIcon size={18} color="var(--text-main)" />
              </button>
            </div>

            {/* Navigation Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('booking');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <CalendarIcon size={18} color="var(--primary)" />
                <span>Book Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('queue');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <ActivityIcon size={18} color="#10b981" />
                <span>Live Queue Board</span>
                <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                  LIVE
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('specialties');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <StethoscopeIcon size={18} color="var(--primary)" />
                <span>Specialties & Doctors</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSelectPublicView) onSelectPublicView('home');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('patient-portal');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem',
                  fontSize: '0.925rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <RecordsIcon size={18} color="var(--primary)" />
                <span>Patient Health Records</span>
              </button>
            </div>

            {/* Bottom Section */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRequestERPMode();
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
                }}
              >
                {isStaffAuthenticated ? <UnlockIcon size={18} color="#ffffff" /> : <LockIcon size={18} color="#ffffff" />}
                <span>Staff & Doctor Login</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-secondary btn-sm"
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {darkMode ? <SunIcon size={16} color="#f59e0b" /> : <MoonIcon size={16} color="#64748b" />}
                <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              <div style={{
                textAlign: 'center',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem'
              }}>
                Emergency: <strong>{hospital?.emergencyPhone || '1066'}</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


