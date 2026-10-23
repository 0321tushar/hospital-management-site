import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BellIcon, StethoscopeIcon, ActivityIcon, ClockIcon, CheckCircleIcon } from './Icons';

export default function LiveQueueBoard({ doctors, appointments: initialAppointments }) {
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [lastAnnouncement, setLastAnnouncement] = useState('Welcome to PulseAura OPD. Please watch the board for your token.');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Real-time synchronization: Poll backend every 4 seconds
  useEffect(() => {
    const fetchLatestQueue = async () => {
      try {
        const latest = await api.getAppointments();
        setAppointments(latest);

        // Check if there is an active 'Calling Next' patient and announce
        const calling = latest.find(a => a.status === 'Calling Next');
        if (calling) {
          setLastAnnouncement(`Now Calling Token ${calling.tokenNumber} (${calling.patientName}) to ${calling.opdRoom} with ${calling.doctorName}`);
        } else {
          const inConsult = latest.find(a => a.status === 'In Consultation');
          if (inConsult) {
            setLastAnnouncement(`Current Consultation: Token ${inConsult.tokenNumber} inside ${inConsult.opdRoom} (${inConsult.doctorName})`);
          }
        }
      } catch (err) {
        console.warn('Queue poll warning', err);
      }
    };

    const interval = setInterval(fetchLatestQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute live status per doctor
  const doctorStatuses = doctors.map(doc => {
    const docApts = appointments.filter(a => a.doctorId === doc.id);
    const inConsult = docApts.find(a => a.status === 'In Consultation');
    const callingNext = docApts.find(a => a.status === 'Calling Next');
    const waitingList = docApts.filter(a => a.status === 'Waiting');
    const completedList = docApts.filter(a => a.status === 'Completed');

    let currentAction = 'Standby';
    let activeToken = '--';
    let activePatient = 'Chamber Idle';
    let statusClass = 'standby';

    if (callingNext) {
      currentAction = 'Calling Next Patient';
      activeToken = callingNext.tokenNumber;
      activePatient = callingNext.patientName;
      statusClass = 'calling';
    } else if (inConsult) {
      currentAction = 'In Consultation';
      activeToken = inConsult.tokenNumber;
      activePatient = inConsult.patientName;
      statusClass = 'consulting';
    } else if (waitingList.length > 0) {
      currentAction = 'Next in Queue';
      activeToken = waitingList[0].tokenNumber;
      activePatient = waitingList[0].patientName;
      statusClass = 'waiting';
    }

    return {
      doctor: doc,
      currentAction,
      activeToken,
      activePatient,
      statusClass,
      waitingCount: waitingList.length,
      completedCount: completedList.length,
      nextWaiting: waitingList.slice(0, 3)
    };
  });

  const filteredDoctors = filterStatus === 'ALL'
    ? doctorStatuses
    : doctorStatuses.filter(s => {
        if (filterStatus === 'CONSULTING') return s.statusClass === 'consulting';
        if (filterStatus === 'CALLING') return s.statusClass === 'calling';
        if (filterStatus === 'WAITING') return s.waitingCount > 0;
        return true;
      });

  return (
    <section id="queue" style={{
      padding: '3.5rem 0',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container">
        {/* Digital Lounge Queue Board Header */}
        <div style={{
          background: 'linear-gradient(135deg, #090d16, #0f172a)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div className="flex items-center justify-between" style={{
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div className="flex items-center gap-2">
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 12px #10b981',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite'
                }}></span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                  Live Doctor OPD Consultation & Queue Display
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Real-time chamber status: In Consultation • Calling Next • Waiting List
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                All Chambers
              </button>
              <button
                onClick={() => setFilterStatus('CALLING')}
                className={`btn btn-sm ${filterStatus === 'CALLING' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: '#f59e0b', color: filterStatus === 'CALLING' ? '#ffffff' : '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <BellIcon size={13} color="currentColor" />
                <span>Calling Now</span>
              </button>
              <button
                onClick={() => setFilterStatus('CONSULTING')}
                className={`btn btn-sm ${filterStatus === 'CONSULTING' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderColor: '#10b981', color: filterStatus === 'CONSULTING' ? '#ffffff' : '#10b981', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <StethoscopeIcon size={13} color="currentColor" />
                <span>In Consultation</span>
              </button>
            </div>
          </div>

          {/* Live Audio/Visual Ticker Banner */}
          <div style={{
            background: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#38bdf8',
            fontSize: '0.875rem',
            fontWeight: 700
          }}>
            <BellIcon size={18} color="#38bdf8" />
            <span style={{ color: '#f8fafc' }}>{lastAnnouncement}</span>
          </div>

          {/* Multi-Doctor Chamber Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {filteredDoctors.map(({ doctor, currentAction, activeToken, activePatient, statusClass, waitingCount, completedCount, nextWaiting }) => {
              // Color themes for different doctor states
              const isCalling = statusClass === 'calling';
              const isConsulting = statusClass === 'consulting';

              return (
                <div key={doctor.id} style={{
                  background: isCalling
                    ? 'rgba(245, 158, 11, 0.12)'
                    : (isConsulting ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.04)'),
                  border: isCalling
                    ? '2px solid rgba(245, 158, 11, 0.65)'
                    : (isConsulting ? '2px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)'),
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.35rem',
                  boxShadow: isCalling ? '0 0 25px rgba(245, 158, 11, 0.25)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Chamber Room & Status Pill */}
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px'
                    }}>
                      {doctor.opdRoom}
                    </span>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      backgroundColor: isCalling
                        ? '#f59e0b'
                        : (isConsulting ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)'),
                      color: isCalling
                        ? '#000000'
                        : (isConsulting ? '#34d399' : '#94a3b8'),
                      boxShadow: isCalling ? '0 0 12px rgba(245, 158, 11, 0.6)' : 'none'
                    }}>
                      {isCalling ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <BellIcon size={12} color="#000000" />
                          <span>Calling Next Patient</span>
                        </span>
                      ) : isConsulting ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ActivityIcon size={12} color="#34d399" />
                          <span>In Consultation</span>
                        </span>
                      ) : (
                        <span>Standby / Idle</span>
                      )}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{doctor.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>{doctor.specialty}</p>
                  </div>

                  {/* Active Token Callout Box */}
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {isCalling ? 'PLEASE ENTER CHAMBER' : (isConsulting ? 'PATIENT CURRENTLY INSIDE' : 'NEXT TOKEN')}
                    </div>
                    <div style={{
                      fontSize: '2.2rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      lineHeight: 1.1,
                      margin: '0.25rem 0',
                      color: isCalling ? '#f59e0b' : (isConsulting ? '#34d399' : '#38bdf8')
                    }}>
                      {activeToken}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activePatient}
                    </div>
                  </div>

                  {/* Waiting Queue List */}
                  {nextWaiting.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Upcoming in Queue: </span>
                      {nextWaiting.map(w => w.tokenNumber).join(', ')}
                    </div>
                  )}

                  {/* Footer Counts */}
                  <div className="flex items-center justify-between" style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '0.65rem',
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ClockIcon size={12} color="#94a3b8" />
                      <span><strong>{waitingCount}</strong> Waiting</span>
                    </span>
                    <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircleIcon size={12} color="#34d399" />
                      <span><strong>{completedCount}</strong> Completed</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
