import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navbar from './components/Navbar';
import HeroBooking from './components/HeroBooking';
import LiveQueueBoard from './components/LiveQueueBoard';
import SpecialtiesGrid from './components/SpecialtiesGrid';
import DoctorDirectory from './components/DoctorDirectory';
import PatientPortal from './components/PatientPortal';
import StaffERP from './components/StaffERP';
import StaffAuthModal from './components/StaffAuthModal';
import PrintModal from './components/PrintModal';
import { SirenIcon, PhoneIcon, DropletIcon, StethoscopeIcon, LockIcon, UnlockIcon } from './components/Icons';


export default function App() {
  const [activeMode, setActiveMode] = useState('public'); // 'public' | 'erp'
  const [publicView, setPublicView] = useState('home'); // 'home' | 'queue'
  const [darkMode, setDarkMode] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activePrintDoc, setActivePrintDoc] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  // Security Authentication State
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState(() => {
    return sessionStorage.getItem('pulseaura_staff_auth') === 'true';
  });
  const [staffSession, setStaffSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pulseaura_staff_session') || '{}');
    } catch (e) {
      return {};
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [h, d, a] = await Promise.all([
        api.getHospital(),
        api.getDoctors(),
        api.getAppointments()
      ]);
      setHospital(h);
      setDoctors(d);
      setAppointments(a);
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  const handleAppointmentBooked = async (newApt) => {
    setAppointments([newApt, ...appointments]);
  };

  // ERP Authentication Flow
  const handleRequestERPMode = () => {
    if (isStaffAuthenticated) {
      setActiveMode('erp');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleStaffAuthenticated = (sessionInfo) => {
    sessionStorage.setItem('pulseaura_staff_auth', 'true');
    sessionStorage.setItem('pulseaura_staff_session', JSON.stringify(sessionInfo));
    setIsStaffAuthenticated(true);
    setStaffSession(sessionInfo);
    setIsAuthModalOpen(false);
    setActiveMode('erp');
  };

  const handleStaffLogout = () => {
    sessionStorage.removeItem('pulseaura_staff_auth');
    sessionStorage.removeItem('pulseaura_staff_session');
    sessionStorage.removeItem('pulseaura_jwt_token');
    setIsStaffAuthenticated(false);
    setStaffSession({});
    setActiveMode('public');
    setPublicView('home');
  };

  return (
    <div
      className="app-container"
      style={{
        height: activeMode === 'erp' ? '100vh' : 'auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: activeMode === 'erp' ? 'hidden' : 'visible'
      }}
    >
      <Navbar
        activeMode={activeMode}
        publicView={publicView}
        onSelectPublicView={(v) => {
          setActiveMode('public');
          setPublicView(v);
        }}
        onRequestERPMode={handleRequestERPMode}
        onBackToPublic={() => {
          setActiveMode('public');
          setPublicView('home');
        }}
        isStaffAuthenticated={isStaffAuthenticated}
        hospital={hospital}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {activeMode === 'public' ? (
        <main style={{ flex: 1 }}>
          {publicView === 'queue' ? (
            <div>
              {/* Back Navigation Bar for Queue Display */}
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0.85rem 0'
              }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setPublicView('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
                  >
                    <span>← Back to Home / Book Consultation</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#10b981',
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                      Real-Time Digital Lounge Signage
                    </span>
                  </div>
                </div>
              </div>

              <LiveQueueBoard
                doctors={doctors}
                appointments={appointments}
              />
            </div>
          ) : (
            <>
              <HeroBooking
                doctors={doctors}
                hospital={hospital}
                onAppointmentBooked={handleAppointmentBooked}
                selectedDoctorForBooking={selectedDoctorForBooking}
                onViewLiveQueue={() => setPublicView('queue')}
                darkMode={darkMode}
              />
              <SpecialtiesGrid />
              <DoctorDirectory
                doctors={doctors}
                hospital={hospital}
                onSelectDoctorForBooking={(doc) => {
                  setSelectedDoctorForBooking(doc);
                  const el = document.getElementById('booking');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <PatientPortal
                hospital={hospital}
                onPrintDocument={(doc) => setActivePrintDoc(doc)}
              />
            </>
          )}

          {/* Footer */}
          <footer style={{ backgroundColor: '#090d16', color: '#94a3b8', padding: '4rem 0 2rem', borderTop: '1px solid #1e293b' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.85rem' }}>
                  {hospital?.name || 'PulseAura Hospital'}
                </h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8' }}>
                  {hospital?.tagline || 'Leading multi-specialty healthcare institution with world-class facilities and compassionate clinical care.'}
                </p>
                <div style={{ marginTop: '1rem', color: '#38bdf8', fontSize: '0.825rem', fontWeight: 700 }}>
                  Accreditation: NABH 5th Edition
                </div>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.85rem' }}>Emergency Services</h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <SirenIcon size={15} color="#fb7185" />
                    <span>24/7 Trauma: <strong>{hospital?.emergencyPhone}</strong></span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <PhoneIcon size={14} color="#38bdf8" />
                    <span>Ambulance Dispatch Hotline</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <DropletIcon size={14} color="#f43f5e" />
                    <span>24/7 Blood Bank & Transfusion</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <StethoscopeIcon size={15} color="#34d399" />
                    <span>Level-III Adult & Neonatal ICU</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.85rem' }}>Hospital Address</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {hospital?.address || 'Plot 14, Health City Boulevard, Medical District, New Delhi'}
                </p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Email: <strong>{hospital?.email}</strong>
                </p>
              </div>

              <div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.85rem' }}>OPD Consultation Hours</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8' }}>
                  Monday – Saturday: 08:00 AM – 08:00 PM<br />
                  Sunday: 09:00 AM – 02:00 PM<br />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>Emergency & Trauma: Open 24/7</span>
                </p>
              </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', color: '#64748b' }}>
              <div>© 2026 {hospital?.name}. All rights reserved. MERN Stack Health Platform.</div>
              <div>Patient Confidentiality • NABH Standard • HIPAA Ready</div>
            </div>
          </footer>
        </main>
      ) : (
        <StaffERP
          hospital={hospital}
          onUpdateHospital={(h) => setHospital(h)}
          onPrintDocument={(doc) => setActivePrintDoc(doc)}
          setActiveMode={setActiveMode}
          staffSession={staffSession}
          onUpdateStaffSession={(newSession) => {
            sessionStorage.setItem('pulseaura_staff_session', JSON.stringify(newSession));
            setStaffSession(newSession);
          }}
          onLogout={handleStaffLogout}
          onRequestSwitchDoctor={() => setIsAuthModalOpen(true)}
        />
      )}

      {/* Staff PIN Authentication Modal */}
      <StaffAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={handleStaffAuthenticated}
        doctors={doctors}
        currentDoctorId={staffSession?.doctorId}
      />

      {/* Official Print Preview Modal */}
      {activePrintDoc && (
        <PrintModal
          document={activePrintDoc}
          hospital={hospital}
          onClose={() => setActivePrintDoc(null)}
        />
      )}
    </div>
  );
}
