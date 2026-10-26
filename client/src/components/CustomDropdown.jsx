import React, { useState, useRef, useEffect } from 'react';
import {
  StethoscopeIcon,
  SearchIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  HospitalBuildingIcon,
  DoctorBadgeIcon,
  HeartPulseIcon,
  BrainIcon,
  BoneIcon,
  BabyIcon,
  FemaleIcon
} from './Icons';

// Modern department color palettes & vector icon mapping
const DEPT_CONFIG = {
  cardiology: {
    bg: 'linear-gradient(135deg, #ef4444, #f43f5e)',
    lightBg: 'rgba(239, 68, 68, 0.12)',
    color: '#f43f5e',
    name: 'Cardiology'
  },
  neurology: {
    bg: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    lightBg: 'rgba(139, 92, 246, 0.12)',
    color: '#8b5cf6',
    name: 'Neurology'
  },
  orthopedics: {
    bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    lightBg: 'rgba(245, 158, 11, 0.12)',
    color: '#f59e0b',
    name: 'Orthopedics'
  },
  pediatrics: {
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    lightBg: 'rgba(16, 185, 129, 0.12)',
    color: '#10b981',
    name: 'Pediatrics'
  },
  medicine: {
    bg: 'linear-gradient(135deg, #0284c7, #2563eb)',
    lightBg: 'rgba(2, 132, 199, 0.12)',
    color: '#0284c7',
    name: 'Internal Medicine'
  },
  gynecology: {
    bg: 'linear-gradient(135deg, #ec4899, #db2777)',
    lightBg: 'rgba(236, 72, 153, 0.12)',
    color: '#ec4899',
    name: 'Gynecology'
  },
  default: {
    bg: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
    lightBg: 'rgba(14, 165, 233, 0.12)',
    color: '#0ea5e9',
    name: 'Specialist'
  }
};

// Render modern vector icon per clinical specialty
function SpecialtyIcon({ deptId, size = 16, color = '#ffffff' }) {
  switch (deptId) {
    case 'cardiology':
      return <HeartPulseIcon size={size} color={color} />;
    case 'neurology':
      return <BrainIcon size={size} color={color} />;
    case 'orthopedics':
      return <BoneIcon size={size} color={color} />;
    case 'pediatrics':
      return <BabyIcon size={size} color={color} />;
    case 'medicine':
      return <StethoscopeIcon size={size} color={color} />;
    case 'gynecology':
      return <FemaleIcon size={size} color={color} />;
    default:
      return <DoctorBadgeIcon size={size} color={color} />;
  }
}

/**
 * Custom Animated Doctor Selection Dropdown with Modern Vector Icons
 */
export function CustomDoctorSelect({
  doctors = [],
  value = '',
  onChange,
  currency = '₹',
  darkMode = false,
  placeholder = '-- Select Doctor --',
  isOpen: controlledIsOpen,
  onToggle
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (next) => {
    if (onToggle) onToggle(typeof next === 'function' ? next(isOpen) : next);
    else setInternalIsOpen(next);
  };

  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedDoctor = doctors.find(d => d.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredDoctors = doctors.filter(d => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q) ||
      d.departmentName?.toLowerCase().includes(q) ||
      d.opdRoom?.toLowerCase().includes(q)
    );
  });

  const getDoctorInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0] || 'DR').slice(0, 2).toUpperCase();
  };

  const selectedDeptConfig = selectedDoctor
    ? (DEPT_CONFIG[selectedDoctor.departmentId] || DEPT_CONFIG.default)
    : DEPT_CONFIG.default;

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', flex: 1 }}>
          {selectedDoctor ? (
            <>
              <div
                className="doctor-avatar-circle"
                style={{
                  background: selectedDeptConfig.bg,
                  width: '34px',
                  height: '34px',
                  fontSize: '0.74rem'
                }}
              >
                {getDoctorInitials(selectedDoctor.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', lineHeight: 1.25 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: darkMode ? '#ffffff' : '#0f172a' }}>
                    {selectedDoctor.name}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    backgroundColor: selectedDeptConfig.lightBg,
                    color: selectedDeptConfig.color,
                    fontSize: '0.65rem',
                    fontWeight: 700
                  }}>
                    {selectedDeptConfig.name}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: darkMode ? '#94a3b8' : 'var(--text-muted)' }}>
                  {selectedDoctor.specialty} • {selectedDoctor.opdRoom || 'Chamber'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: darkMode ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary, #0284c7)',
                border: '1px solid rgba(2, 132, 199, 0.25)'
              }}>
                <StethoscopeIcon size={18} color="var(--primary, #0284c7)" />
              </div>
              <span style={{ color: darkMode ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.88rem' }}>
                {placeholder}
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {selectedDoctor && (
            <span className="doctor-fee-badge">
              {currency}{selectedDoctor.fee}
            </span>
          )}
          <span className="custom-dropdown-chevron">
            <ChevronDownIcon size={16} />
          </span>
        </div>
      </button>

      {/* Sub-List Popup Menu */}
      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {/* Quick Filter Search */}
          <div className="custom-dropdown-search-wrapper">
            <span className="custom-dropdown-search-icon">
              <SearchIcon size={14} color="var(--primary, #0284c7)" />
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="custom-dropdown-search-input"
              placeholder="Search doctor, specialty, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {search && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSearch(''); }}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.9rem',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* List of Doctors - isolated smooth scroll with thin 4px thumb */}
          <div
            className="custom-dropdown-list"
            onWheel={(e) => e.stopPropagation()}
          >
            {filteredDoctors.length === 0 ? (
              <div style={{
                padding: '1.25rem 0.75rem',
                textAlign: 'center',
                color: darkMode ? '#94a3b8' : 'var(--text-muted)',
                fontSize: '0.82rem'
              }}>
                No doctors found matching "{search}"
              </div>
            ) : (
              filteredDoctors.map((doc) => {
                const isSelected = doc.id === value;
                const deptCfg = DEPT_CONFIG[doc.departmentId] || DEPT_CONFIG.default;
                return (
                  <div
                    key={doc.id}
                    className={`custom-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange(doc.id);
                      setIsOpen(false);
                    }}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onChange(doc.id);
                        setIsOpen(false);
                      }
                    }}
                  >
                    {/* Left: Avatar with modern vector icon badge overlay */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div className="doctor-avatar-circle" style={{ background: deptCfg.bg }}>
                        {getDoctorInitials(doc.name)}
                      </div>
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        border: '1.5px solid ' + deptCfg.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>
                        <SpecialtyIcon deptId={doc.departmentId} size={10} color={deptCfg.color} />
                      </div>
                    </div>

                    {/* Middle: Doctor Details */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: darkMode ? '#f8fafc' : '#0f172a'
                        }}>
                          {doc.name}
                        </span>
                        {doc.experience && (
                          <span style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            backgroundColor: darkMode ? '#334155' : '#e2e8f0',
                            color: darkMode ? '#cbd5e1' : '#475569',
                            fontWeight: 600
                          }}>
                            {doc.experience}
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.75rem',
                        color: darkMode ? '#94a3b8' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <span>{doc.specialty}</span>
                        {doc.opdRoom && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--primary, #0284c7)', fontWeight: 600 }}>{doc.opdRoom}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Fee and Selection Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                      <span className="doctor-fee-badge">
                        {currency}{doc.fee}
                      </span>
                      {isSelected && (
                        <CheckCircleIcon size={18} color="var(--primary, #0284c7)" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Custom Animated Clinical Department Selection Dropdown with Modern Vector Icons
 */
export function CustomDepartmentSelect({
  departments = [],
  value = '',
  onChange,
  darkMode = false,
  placeholder = '-- All Clinical Specialties --',
  isOpen: controlledIsOpen,
  onToggle
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (next) => {
    if (onToggle) onToggle(typeof next === 'function' ? next(isOpen) : next);
    else setInternalIsOpen(next);
  };

  const dropdownRef = useRef(null);

  const selectedDept = departments.find(d => d.id === value);
  const selectedDeptConfig = selectedDept
    ? (DEPT_CONFIG[selectedDept.id] || DEPT_CONFIG.default)
    : null;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className={`custom-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden', flex: 1 }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: selectedDeptConfig ? selectedDeptConfig.bg : (darkMode ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selectedDeptConfig ? '#ffffff' : 'var(--primary, #0284c7)',
            border: selectedDeptConfig ? 'none' : '1px solid rgba(2, 132, 199, 0.25)',
            boxShadow: selectedDeptConfig ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
            flexShrink: 0
          }}>
            {selectedDept ? (
              <SpecialtyIcon deptId={selectedDept.id} size={18} color="#ffffff" />
            ) : (
              <HospitalBuildingIcon size={18} color="var(--primary, #0284c7)" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
            <span style={{
              fontWeight: selectedDept ? 700 : 500,
              fontSize: '0.9rem',
              color: selectedDept ? (darkMode ? '#ffffff' : '#0f172a') : (darkMode ? '#94a3b8' : 'var(--text-muted)')
            }}>
              {selectedDept ? selectedDept.name : placeholder}
            </span>
          </div>
        </div>

        <span className="custom-dropdown-chevron">
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu" role="listbox">
          {/* Fits all departments cleanly with ZERO scrollbar */}
          <div
            className="custom-dropdown-list custom-dropdown-list-fit"
            onWheel={(e) => e.stopPropagation()}
          >
            {/* All Specialties Option */}
            <div
              className={`custom-dropdown-item ${!value ? 'is-selected' : ''}`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              role="option"
              aria-selected={!value}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: darkMode ? '#1e293b' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary, #0284c7)'
                }}>
                  <HospitalBuildingIcon size={16} color="var(--primary, #0284c7)" />
                </div>
                <span style={{
                  fontWeight: !value ? 700 : 500,
                  fontSize: '0.88rem',
                  color: darkMode ? '#f8fafc' : '#0f172a'
                }}>
                  -- All Clinical Specialties --
                </span>
              </div>
              {!value && <CheckCircleIcon size={18} color="var(--primary, #0284c7)" />}
            </div>

            {/* Department Items */}
            {departments.map((dept) => {
              const isSelected = dept.id === value;
              const deptCfg = DEPT_CONFIG[dept.id] || DEPT_CONFIG.default;
              return (
                <div
                  key={dept.id}
                  className={`custom-dropdown-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(dept.id);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: deptCfg.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                      flexShrink: 0
                    }}>
                      <SpecialtyIcon deptId={dept.id} size={15} color="#ffffff" />
                    </div>
                    <span style={{
                      fontWeight: isSelected ? 700 : 600,
                      fontSize: '0.88rem',
                      color: darkMode ? '#f8fafc' : '#0f172a'
                    }}>
                      {dept.name}
                    </span>
                  </div>
                  {isSelected && <CheckCircleIcon size={18} color="var(--primary, #0284c7)" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
