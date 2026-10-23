import React, { useState, useMemo } from 'react';
import {
  SearchIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  HeartPulseIcon,
  BabyIcon,
  BoneIcon,
  BrainIcon,
  DropletIcon,
  FemaleIcon,
  StethoscopeIcon
} from './Icons';

export default function DoctorDirectory({ doctors = [], hospital, onSelectDoctorForBooking }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [sortBy, setSortBy] = useState('RATING'); // 'RATING' | 'EXPERIENCE' | 'FEE_ASC' | 'NAME'
  const [clickedDocId, setClickedDocId] = useState(null);

  const departments = [
    { id: 'ALL', name: 'All Specialties' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'medicine', name: 'Internal Medicine' },
    { id: 'gynecology', name: 'Gynecology' }
  ];

  const quickConditions = [
    { label: 'Heart & BP', query: 'cardiology', icon: <HeartPulseIcon size={14} color="#f43f5e" /> },
    { label: 'Pediatrics & Fever', query: 'pediatrics', icon: <BabyIcon size={14} color="#f59e0b" /> },
    { label: 'Joint & Spine', query: 'orthopedics', icon: <BoneIcon size={14} color="#0ea5e9" /> },
    { label: 'Neuro & Stroke', query: 'neurology', icon: <BrainIcon size={14} color="#8b5cf6" /> },
    { label: 'Diabetes & Sugar', query: 'medicine', icon: <DropletIcon size={14} color="#10b981" /> },
    { label: 'Pregnancy & Gynae', query: 'gynecology', icon: <FemaleIcon size={14} color="#ec4899" /> }
  ];

  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctors];

    // 1. Department filter
    if (selectedDept !== 'ALL') {
      result = result.filter(d => d.departmentId === selectedDept);
    }

    // 2. Keyword Search filter (Name, Specialty, Department, Qualifications, OPD Room)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q) ||
        d.departmentName?.toLowerCase().includes(q) ||
        d.qualifications?.toLowerCase().includes(q) ||
        d.opdRoom?.toLowerCase().includes(q) ||
        d.schedule?.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    if (sortBy === 'RATING') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'EXPERIENCE') {
      const getYears = exp => parseInt(exp) || 0;
      result.sort((a, b) => getYears(b.experience) - getYears(a.experience));
    } else if (sortBy === 'FEE_ASC') {
      result.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    } else if (sortBy === 'NAME') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [doctors, selectedDept, searchQuery, sortBy]);

  const handleBookDoctor = (doc) => {
    setClickedDocId(doc.id);
    setTimeout(() => setClickedDocId(null), 650);
    if (onSelectDoctorForBooking) {
      onSelectDoctorForBooking(doc);
    } else {
      const bookingEl = document.getElementById('booking');
      if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickConditionClick = (query) => {
    setSelectedDept(query);
    setSearchQuery('');
  };

  const curr = hospital?.currency || '₹';

  return (
    <section id="find-doctor" style={{ padding: '4.5rem 0 5rem', backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Anchor for doctors section */}
      <span id="doctors" style={{ display: 'block', position: 'relative', top: '-80px', visibility: 'hidden' }} />

      <div className="container">
        {/* Title & Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            padding: '0.35rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '0.75rem',
            border: '1px solid var(--primary-light)'
          }}>
            <StethoscopeIcon size={16} color="var(--primary)" />
            <span>VERIFIED CLINICAL FACULTY</span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Find a Doctor & Book Consultation
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Search by doctor name, medical department, disease symptoms, or qualifications.
            Connect directly with leading board-certified specialists.
          </p>
        </div>

        {/* FIND A DOCTOR SEARCH CARD */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
          position: 'relative'
        }}>
          {/* Main Search Bar Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input with Icon */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--primary)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon size={20} color="var(--primary)" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Doctor Name (e.g. Dr. Arvind Mehta), Specialty, Disease..."
                className="form-control"
                style={{
                  paddingLeft: '3rem',
                  paddingRight: searchQuery ? '2.5rem' : '1rem',
                  fontSize: '0.95rem',
                  height: '50px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Dropdown */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="form-control"
                style={{ height: '50px', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-control"
                style={{ height: '50px', fontSize: '0.85rem', borderRadius: 'var(--radius-md)' }}
              >
                <option value="RATING">Highest Rated Specialists</option>
                <option value="EXPERIENCE">Years of Experience</option>
                <option value="FEE_ASC">Fee: Low to High</option>
                <option value="NAME">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Badges for Common Symptoms */}
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              Quick Find by Condition:
            </span>
            {quickConditions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickConditionClick(q.query)}
                className="btn btn-sm btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: selectedDept === q.query ? 'var(--primary-subtle)' : 'var(--bg-muted)',
                  borderColor: selectedDept === q.query ? 'var(--primary)' : 'var(--border-subtle)',
                  color: selectedDept === q.query ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: selectedDept === q.query ? 700 : 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {q.icon}
                <span>{q.label}</span>
              </button>
            ))}
            {(selectedDept !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => { setSelectedDept('ALL'); setSearchQuery(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--rose)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 700,
                  marginLeft: 'auto'
                }}
              >
                Reset All Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Live Search Status Bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-main)' }}>{filteredAndSortedDoctors.length}</strong> of {doctors.length} Doctors
            {selectedDept !== 'ALL' && <span> in <strong>{departments.find(d => d.id === selectedDept)?.name}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>
          <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
            All Doctors Available for In-Clinic Consultation
          </span>
        </div>

        {/* Doctors Grid Display */}
        {filteredAndSortedDoctors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-subtle)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <SearchIcon size={34} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              No Doctors Found Matching Your Criteria
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
              We could not find any medical specialist for "{searchQuery}". Try searching for broader terms like "Cardiology" or "Physician".
            </p>
            <button
              onClick={() => { setSelectedDept('ALL'); setSearchQuery(''); }}
              className="btn btn-primary btn-sm"
            >
              Clear Search & Show All Doctors
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredAndSortedDoctors.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleBookDoctor(doc)}
                className={`card ${clickedDocId === doc.id ? 'card-3d-active' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden'
                }}
                title={`Click to book appointment with ${doc.name}`}
              >
                {/* 3D Glossy Light Reflection */}
                <div className="card-glare" />

                {/* Doctor Card Top Profile */}
                <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
                  <div
                    className="card-layer-icon"
                    style={{
                      width: '4.2rem',
                      height: '4.2rem',
                      borderRadius: '50%',
                      background: doc.imageBg || 'linear-gradient(135deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-md)',
                      flexShrink: 0
                    }}
                  >
                    {doc.avatarText || 'DR'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h4
                        className="card-layer-title"
                        style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}
                      >
                        {doc.name}
                      </h4>
                      <span title="NABH Certified Specialist" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <CheckCircleIcon size={15} color="#0284c7" />
                      </span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.1rem' }}>
                      {doc.specialty}
                    </p>
                    <span className="badge badge-neutral" style={{ fontSize: '0.68rem', marginTop: '0.25rem' }}>
                      {doc.departmentName || doc.departmentId}
                    </span>
                  </div>
                </div>

                {/* Qualifications & Degrees */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.45, minHeight: '38px' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Degrees:</strong> {doc.qualifications}
                </p>

                {/* Key Doctor Details Table */}
                <div style={{
                  fontSize: '0.8rem',
                  padding: '0.65rem 0.85rem',
                  margin: '0.5rem 0 1rem',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Experience</div>
                    <div style={{ fontWeight: 800, marginTop: '0.15rem' }}>{doc.experience}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>OPD Chamber</div>
                    <div style={{ fontWeight: 800, marginTop: '0.15rem', color: 'var(--primary)' }}>{doc.opdRoom}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>OPD Fee</div>
                    <div style={{ fontWeight: 800, marginTop: '0.15rem', color: 'var(--emerald)' }}>{curr}{doc.fee}</div>
                  </div>
                </div>

                {/* Schedule timeslots pill */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ClockIcon size={14} color="var(--text-muted)" />
                  <span>{doc.schedule}</span>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between" style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ color: '#eab308', fontWeight: 800, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <StarIcon size={15} color="#eab308" fill="#eab308" />
                    <span>{doc.rating}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({doc.reviewsCount} reviews)</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleBookDoctor(doc); }}
                    className="btn btn-primary btn-sm"
                    style={{ fontWeight: 700, padding: '0.45rem 0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CalendarIcon size={14} color="#ffffff" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
