import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapPinIcon, SearchIcon, ActivityIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons';
import { CustomDoctorSelect, CustomDepartmentSelect } from './CustomDropdown';

const HERO_IMAGES = [
  {
    url: '/images/hero1.jpg',
    caption: 'State-of-the-Art Multi-Specialty Atrium & Emergency Reception',
    subtitle: 'Advanced diagnostic infrastructure with 24/7 patient support'
  },
  {
    url: '/images/hero2.jpg',
    caption: 'Renowned Board-Certified Consultants & Surgical Specialists',
    subtitle: 'Over 50+ senior doctors across 8 clinical centers of excellence'
  },
  {
    url: '/images/hero3.jpg',
    caption: 'Level-III Critical Care & Robotic Precision Operation Theatres',
    subtitle: 'Equipped with next-generation continuous patient telemetry'
  }
];

export default function HeroBooking({ doctors, hospital, onAppointmentBooked, selectedDoctorForBooking, onViewLiveQueue, darkMode }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [department, setDepartment] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedApt, setConfirmedApt] = useState(null);
  const [bookingAlert, setBookingAlert] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Sync when doctor is selected from "Find a Doctor" directory
  useEffect(() => {
    if (selectedDoctorForBooking) {
      setDepartment(selectedDoctorForBooking.departmentId || '');
      setDoctorId(selectedDoctorForBooking.id);
      if (selectedDoctorForBooking.availableSlots && selectedDoctorForBooking.availableSlots.length > 0) {
        setTimeSlot(selectedDoctorForBooking.availableSlots[0]);
      }
    }
  }, [selectedDoctorForBooking]);

  // Auto-change background image every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const departments = [
    { id: 'cardiology', name: 'Cardiology & Cardiac Surgery' },
    { id: 'neurology', name: 'Neurology & Neurosurgery' },
    { id: 'orthopedics', name: 'Orthopedics & Joint Replacement' },
    { id: 'pediatrics', name: 'Pediatrics & Neonatal Care' },
    { id: 'medicine', name: 'Internal Medicine & Diabetology' },
    { id: 'gynecology', name: 'Obstetrics & Gynecology' }
  ];

  const filteredDoctors = doctors.filter(d => !department || d.departmentId === department);
  const selectedDoctor = doctors.find(d => d.id === doctorId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setBookingAlert('Please select a doctor to proceed with consultation booking.');
      return;
    }
    if (!timeSlot) {
      setBookingAlert('Please choose an available appointment time slot.');
      return;
    }
    const cleanPhone = (patientPhone || '').replace(/\D/g, '');
    if (!patientName || !cleanPhone) {
      setBookingAlert('Please fill in both patient full name and 10-digit mobile phone number.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setBookingAlert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setBookingAlert('Indian mobile numbers must start with 6, 7, 8, or 9.');
      return;
    }

    setBookingAlert(null);
    setLoading(true);
    try {
      const phoneToSave = `+91 ${cleanPhone}`;
      let patient = await api.searchPatient(cleanPhone);
      if (!patient) {
        patient = await api.registerPatient({
          name: patientName,
          phone: phoneToSave,
          age: parseInt(patientAge) || 30,
          gender: patientGender,
          bloodGroup: 'B+',
          allergies: 'None declared'
        });
      }

      const newApt = await api.bookAppointment({
        uhid: patient.uhid,
        patientName: patient.name,
        patientPhone: patient.phone || phoneToSave,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        department: selectedDoctor.departmentName || 'Specialist OPD',
        opdRoom: selectedDoctor.opdRoom,
        date: new Date().toISOString().split('T')[0],
        timeSlot,
        chiefComplaint: complaint || 'General Health Consultation',
        fee: selectedDoctor.fee,
        paymentStatus: 'Paid'
      });

      setConfirmedApt(newApt);
      if (onAppointmentBooked) onAppointmentBooked(newApt);
    } catch (err) {
      setBookingAlert('Error booking appointment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setConfirmedApt(null);
    setDoctorId('');
    setTimeSlot('');
    setPatientName('');
    setPatientPhone('');
    setComplaint('');
  };

  return (
    <section id="booking" className="hero-booking-section">
      {/* Crisp, Full-Color Auto-Changing Background Images */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        backgroundColor: '#090d16'
      }}>
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? 'scale(1.02)' : 'scale(1)',
              filter: 'brightness(0.92) contrast(1.05) saturate(1.1)',
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 5s ease-out',
              zIndex: currentSlide === idx ? 1 : 0
            }}
          />
        ))}

        {/* Cinematic Vignette Overlay: Dark on the left for crisp white typography, clear & transparent on right so the photo is richly visible */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(9, 13, 22, 0.88) 0%, rgba(9, 13, 22, 0.72) 42%, rgba(9, 13, 22, 0.32) 100%)',
          zIndex: 2
        }} />

        {/* Bottom subtle gradient blend */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(9, 13, 22, 0.7), transparent)',
          zIndex: 2
        }} />
      </div>

      <div className="container hero-grid-container" style={{
        position: 'relative',
        zIndex: 3
      }}>
        {/* Left Column: Hospital Value Proposition with Crisp High-Contrast Text */}
        <div className="hero-left-col">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.4rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.5)',
              letterSpacing: '0.02em'
            }}>
              ✦ Next-Gen Hospital Operating Platform
            </span>
          </div>

          <h1 className="hero-main-heading" style={{
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
          }}>
            Compassionate Care,<br className="hero-heading-break" />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Powered by Clinical Excellence
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: '#e2e8f0',
            marginBottom: '1.5rem',
            maxWidth: '560px',
            fontWeight: 500,
            textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Book instant specialist consultations, track real-time waiting room tokens, and access paperless prescriptions and diagnostic reports seamlessly.
          </p>

          {/* Real-time caption of the current photo */}
          <div className="hero-caption-badge" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.55rem 0.85rem',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            marginBottom: '2rem',
            fontSize: '0.825rem',
            color: '#38bdf8',
            fontWeight: 700,
            maxWidth: '100%'
          }}>
            <MapPinIcon size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{HERO_IMAGES[currentSlide].caption}</span>
          </div>

          {/* Quick Doctor Search Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <a
              href="#find-doctor"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(10px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <SearchIcon size={16} color="#ffffff" />
              <span>Find a Doctor & Specialists</span>
            </a>
          </div>

          {/* Clinical Key Stats Row */}
          <div className="hero-stats-row" style={{
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div>
              <h3 style={{ fontSize: '2rem', color: '#38bdf8', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>50+</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Senior Specialists</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', color: '#34d399', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>24/7</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>ICU & Trauma Care</p>
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', color: '#fb7185', fontWeight: 800, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>99.4%</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>Patient Satisfaction</p>
            </div>
          </div>

          {/* Slider Dots Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '2rem' }}>
            {HERO_IMAGES.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                title={`Go to photo ${dotIdx + 1}`}
                style={{
                  width: currentSlide === dotIdx ? '32px' : '12px',
                  height: '12px',
                  borderRadius: '9999px',
                  backgroundColor: currentSlide === dotIdx ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)',
                  border: currentSlide === dotIdx ? '2px solid #ffffff' : 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, width 0.2s ease',
                  boxShadow: currentSlide === dotIdx ? '0 0 10px #38bdf8' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Column: High-End Glassmorphic Appointment Booking Card */}
        <div
          id="booking"
          className="card card-static hero-booking-card"
          style={{
            boxShadow: darkMode
              ? '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            background: darkMode ? '#000000' : 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(20px)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: 'var(--radius-xl)',
            transform: 'none',
            cursor: 'default',
            transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
          }}
        >
          {confirmedApt ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: 'var(--emerald-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircleIcon size={34} color="var(--emerald)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Appointment Confirmed!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Token allocated for today's live OPD queue.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-muted)',
                border: '2px dashed var(--primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Token Number</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{confirmedApt.tokenNumber}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Patient UHID</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{confirmedApt.uhid}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div><strong>Patient:</strong> {confirmedApt.patientName}</div>
                  <div><strong>Doctor:</strong> {confirmedApt.doctorName}</div>
                  <div><strong>Chamber:</strong> {confirmedApt.opdRoom}</div>
                  <div><strong>Time Slot:</strong> {confirmedApt.timeSlot}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
                <button onClick={resetForm} className="btn btn-secondary btn-sm">Book Another</button>
                <button onClick={() => window.print()} className="btn btn-primary btn-sm">Print Token Slip</button>
                {onViewLiveQueue && (
                  <button
                    type="button"
                    onClick={onViewLiveQueue}
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', fontWeight: 700 }}
                  >
                    Track in Live Queue →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem', fontSize: '0.7rem' }}>Online OPD Counter</span>
                <h3
                  className="booking-card-title"
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: darkMode ? '#ffffff' : '#0f172a'
                  }}
                >
                  Instant Doctor Appointment
                </h3>
                <p style={{ fontSize: '0.825rem', color: darkMode ? '#94a3b8' : 'var(--text-muted)' }}>
                  Choose specialty, doctor and slot in 60 seconds
                </p>
              </div>

              {bookingAlert && (
                <div style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.08)',
                  border: '1px solid rgba(244, 63, 94, 0.35)',
                  borderLeft: '4px solid #f43f5e',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  color: '#e11d48',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  animation: 'alertModalScaleIn 0.25s ease-out'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangleIcon size={16} color="#e11d48" />
                    <span>{bookingAlert}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingAlert(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e11d48',
                      fontSize: '1.1rem',
                      padding: 0,
                      lineHeight: 1,
                      fontWeight: 700
                    }}
                    title="Dismiss alert"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">1. Clinical Department</label>
                <CustomDepartmentSelect
                  departments={departments}
                  value={department}
                  onChange={(val) => { setDepartment(val); setDoctorId(''); setTimeSlot(''); setOpenDropdown(null); }}
                  isOpen={openDropdown === 'dept'}
                  onToggle={(open) => setOpenDropdown(open ? 'dept' : null)}
                  darkMode={darkMode}
                />
              </div>

              <div className="form-group">
                <label className="form-label">2. Specialist Doctor</label>
                <CustomDoctorSelect
                  doctors={filteredDoctors}
                  value={doctorId}
                  onChange={(val) => { setDoctorId(val); setTimeSlot(''); setOpenDropdown(null); }}
                  isOpen={openDropdown === 'doc'}
                  onToggle={(open) => setOpenDropdown(open ? 'doc' : null)}
                  currency={hospital?.currency || '₹'}
                  darkMode={darkMode}
                />
              </div>

              {selectedDoctor && (
                <div className="form-group">
                  <label className="form-label">3. Available Slots (Today)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {selectedDoctor.availableSlots.map(slot => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setTimeSlot(slot)}
                        className={`btn btn-sm ${timeSlot === slot ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.78rem', padding: '0.4rem 0.2rem' }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="hero-form-row hero-form-row-name-phone">
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full Name"
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Phone (India)</label>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.65rem 0.75rem',
                      backgroundColor: darkMode ? '#1e293b' : 'var(--bg-muted)',
                      border: '1px solid var(--border-subtle)',
                      borderRight: 'none',
                      borderTopLeftRadius: 'var(--radius-md)',
                      borderBottomLeftRadius: 'var(--radius-md)',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: darkMode ? '#f8fafc' : 'var(--text-main)',
                      userSelect: 'none',
                      whiteSpace: 'nowrap'
                    }}>
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      value={patientPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPatientPhone(val);
                      }}
                      placeholder="10-digit number (e.g. 9811234501)"
                      className="form-control"
                      style={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0
                      }}
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="Please enter a valid 10-digit Indian mobile number"
                      required
                    />
                  </div>
                  {patientPhone && patientPhone.length < 10 && (
                    <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.2rem' }}>
                      {10 - patientPhone.length} more digit{10 - patientPhone.length > 1 ? 's' : ''} required
                    </span>
                  )}
                </div>
              </div>

              <div className="hero-form-row hero-form-row-age-gender">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Age"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="form-control"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Chief Health Concern</label>
                <input
                  type="text"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="e.g. Fever, chest heaviness, joint pain"
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', fontSize: '0.95rem' }}
              >
                {loading ? 'Generating Token...' : `Confirm & Generate Live Token (${hospital?.currency || '₹'}${selectedDoctor ? selectedDoctor.fee : '0'})`}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
