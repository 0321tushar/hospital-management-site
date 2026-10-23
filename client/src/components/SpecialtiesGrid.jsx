import React, { useState, useRef } from 'react';
import {
  HeartPulseIcon,
  BrainIcon,
  BoneIcon,
  BabyIcon,
  StethoscopeIcon,
  FemaleIcon,
  MicroscopeIcon,
  DropletIcon,
  CheckIcon,
  ArrowRightIcon
} from './Icons';

const SPECIALTIES_DATA = [
  {
    id: 'cardiology',
    name: 'Cardiology & Heart Care',
    desc: 'Cath lab angioplasty, pacemaker implantation, 24/7 cardiac emergency.',
    icon: <HeartPulseIcon size={30} color="#f43f5e" />,
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.25)'
  },
  {
    id: 'neurology',
    name: 'Neurology & Stroke Unit',
    desc: 'Comprehensive stroke management, neuro-critical care, spine surgery.',
    icon: <BrainIcon size={30} color="#8b5cf6" />,
    accentColor: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.25)'
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Robotic Surgery',
    desc: 'Joint replacement, arthroscopy, sports trauma, fracture rehabilitation.',
    icon: <BoneIcon size={30} color="#0ea5e9" />,
    accentColor: '#0ea5e9',
    glowColor: 'rgba(14, 165, 233, 0.25)'
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Level-III NICU',
    desc: 'Neonatal intensive care, growth monitoring, child immunization clinic.',
    icon: <BabyIcon size={30} color="#f59e0b" />,
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)'
  },
  {
    id: 'medicine',
    name: 'Internal Medicine & Diabetology',
    desc: 'Chronic disease management, metabolic syndrome, diabetic foot care.',
    icon: <StethoscopeIcon size={30} color="#10b981" />,
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  {
    id: 'gynecology',
    name: 'Obstetrics & High-Risk Pregnancy',
    desc: 'Painless delivery, laparoscopic gynecological surgery, fetal medicine.',
    icon: <FemaleIcon size={30} color="#ec4899" />,
    accentColor: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.25)'
  },
  {
    id: 'oncology',
    name: 'Medical & Surgical Oncology',
    desc: 'Precision chemotherapy, comprehensive tumor boards, oncology daycare.',
    icon: <MicroscopeIcon size={30} color="#6366f1" />,
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.25)'
  },
  {
    id: 'nephrology',
    name: 'Nephrology & 24/7 Dialysis',
    desc: 'Hemodialysis stations, renal failure care, kidney transplant support.',
    icon: <DropletIcon size={30} color="#06b6d4" />,
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.25)'
  }
];

function Interactive3DCard({ item, index, onCardClick }) {
  const [tiltStyle, setTiltStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripplePos, setRipplePos] = useState(null);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current || isClicked) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate 3D tilt angles based on cursor offset
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-10px) scale3d(1.03, 1.03, 1.03)`,
      '--glare-x': `${(x / rect.width) * 100}%`,
      '--glare-y': `${(y / rect.height) * 100}%`,
      boxShadow: `0 24px 45px -12px ${item.glowColor}, 0 10px 20px -6px rgba(0,0,0,0.12), 0 0 0 1px ${item.accentColor}55`,
      borderColor: item.accentColor
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isClicked) {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)',
        boxShadow: '',
        borderColor: ''
      });
    }
  };

  const handleClick = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setRipplePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    setIsClicked(true);

    setTimeout(() => {
      setIsClicked(false);
      setRipplePos(null);
    }, 650);

    if (onCardClick) {
      onCardClick(item);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`card ${isClicked ? 'card-3d-active' : ''}`}
      style={{
        padding: '1.85rem',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        position: 'relative',
        background: isHovered
          ? `linear-gradient(135deg, var(--bg-surface) 0%, ${item.accentColor}08 100%)`
          : 'var(--bg-surface)',
        ...tiltStyle
      }}
      title={`Click to explore ${item.name}`}
    >
      {/* 3D Glossy Light Reflection */}
      <div className="card-glare" />

      {/* 3D Click Wave / Ripple */}
      {ripplePos && (
        <span
          className="card-ripple-effect"
          style={{
            left: `${ripplePos.x}px`,
            top: `${ripplePos.y}px`,
            background: `radial-gradient(circle, ${item.accentColor}70 0%, ${item.accentColor}00 70%)`
          }}
        />
      )}

      {/* Top Row: 3D Floating Icon + Selected Pill */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
        <div
          className="card-layer-icon"
          style={{
            width: '3.6rem',
            height: '3.6rem',
            borderRadius: '16px',
            backgroundColor: `${item.accentColor}18`,
            border: `1px solid ${item.accentColor}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            boxShadow: isHovered ? `0 10px 20px -5px ${item.glowColor}` : 'var(--shadow-sm)'
          }}
        >
          {item.icon}
        </div>

        {isClicked && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              backgroundColor: item.accentColor,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              animation: 'alertModalScaleIn 0.25s ease'
            }}
          >
            <CheckIcon size={12} color="#ffffff" />
            <span>Selected</span>
          </span>
        )}
      </div>

      {/* 3D Title */}
      <h3
        className="card-layer-title"
        style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          marginBottom: '0.5rem',
          lineHeight: 1.3
        }}
      >
        {item.name}
      </h3>

      {/* 3D Description */}
      <p
        className="card-layer-desc"
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          marginBottom: '1.25rem'
        }}
      >
        {item.desc}
      </p>

      {/* 3D Action Footer Link */}
      <div
        className="card-layer-cta"
        style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.875rem',
          fontWeight: 800,
          color: item.accentColor
        }}
      >
        <span>Consult Specialist</span>
        <ArrowRightIcon size={14} color="currentColor" />
      </div>
    </div>
  );
}

export default function SpecialtiesGrid({ onSelectSpecialty }) {
  const handleCardClick = (item) => {
    if (onSelectSpecialty) {
      onSelectSpecialty(item.id);
      return;
    }
    // Default smooth navigation to Doctor Directory or Booking
    const docElem = document.getElementById('find-doctor');
    const bookElem = document.getElementById('booking');
    if (docElem) {
      docElem.scrollIntoView({ behavior: 'smooth' });
    } else if (bookElem) {
      bookElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="specialties" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            Multi-Disciplinary Clinical Excellence
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Centres of Clinical Excellence
          </h2>
          <p style={{ fontSize: '0.975rem', color: 'var(--text-muted)', marginTop: '0.65rem', lineHeight: 1.6 }}>
            Hover and click any department card to experience dynamic 3D clinical specialty details and consult our board-certified surgeons and specialists.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.75rem',
          perspective: '1500px'
        }}>
          {SPECIALTIES_DATA.map((item, idx) => (
            <Interactive3DCard
              key={item.id}
              item={item}
              index={idx}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
