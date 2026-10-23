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
    setIsStaffAuthenticated(false);
    setStaffSession({});
    setActiveMode('public');
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
        onRequestERPMode={handleRequestERPMode}
        onBackToPublic={() => setActiveMode('public')}
        isStaffAuthenticated={isStaffAuthenticated}
        hospital={hospital}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {activeMode === 'public' ? (
        <main style={{ flex: 1 }}>
          <HeroBooking
            doctors={doctors}
            hospital={hospital}
            onAppointmentBooked={handleAppointmentBooked}
            selectedDoctorForBooking={selectedDoctorForBooking}
          />
          <LiveQueueBoard
            doctors={doctors}
            appointments={appointments}
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
                <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '0.85rem' }}>Staff Operations</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Protected portal for doctors, clinicians, and administration.</p>
                <button
                  onClick={handleRequestERPMode}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  {isStaffAuthenticated ? <UnlockIcon size={14} color="#ffffff" /> : <LockIcon size={14} color="#ffffff" />}
                  <span>{isStaffAuthenticated ? 'Open Staff ERP Desk' : 'Unlock Staff ERP Desk (PIN)'}</span>
                </button>
              </div>
            </div>

            <div className="container" style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
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
