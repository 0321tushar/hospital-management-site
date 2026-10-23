import React from 'react';
import { PrinterIcon, XIcon } from './Icons';

export default function PrintModal({ document, hospital, onClose }) {
  if (!document) return null;

  const { type, data } = document;
  const curr = hospital?.currency || '₹';

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {type === 'prescription' ? 'Official Doctor Prescription' : (type === 'invoice' ? 'Hospital Tax Invoice' : 'Patient ID Card')}
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <XIcon size={14} color="currentColor" />
            <span>Close</span>
          </button>
        </div>

        <div className="modal-body">
          {/* 1. Official Prescription */}
          {type === 'prescription' && (
            <div className="print-document-sheet">
              <div className="letterhead-header">
                <div>
                  <div className="hospital-print-name">{hospital?.name || 'PulseAura Super Specialty Hospital'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                    {hospital?.address || 'Medical District, Health City'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                    Phone: {hospital?.phone} • Emergency: {hospital?.emergencyPhone}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, marginTop: '0.2rem' }}>
                    NABH Fully Accredited (5th Edition)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{data.doctorName}</div>
                  <div style={{ fontSize: '0.825rem', color: '#0284c7', fontWeight: 600 }}>{data.doctorSpecialty}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reg: {data.doctorRegNo}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Date: <strong>{data.date}</strong></div>
                </div>
              </div>

              <div className="patient-info-banner">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>PATIENT NAME</strong>
                  <span>{data.patientName}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>UHID NUMBER</strong>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{data.uhid}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>AGE / GENDER</strong>
                  <span>{data.patientAge} Yrs / {data.patientGender}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>VITALS (BP / SPO2)</strong>
                  <span>{data.vitals?.bp} • {data.vitals?.spo2}</span>
                </div>
              </div>

              <div style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                {data.complaints && <div><strong>Chief Complaints:</strong> {data.complaints}</div>}
                <div style={{ marginTop: '0.35rem' }}>
                  <strong>Clinical Diagnosis:</strong> <span style={{ color: '#0369a1', fontWeight: 700 }}>{data.diagnosis}</span>
                </div>
              </div>

              <div style={{ fontFamily: 'serif', fontSize: '2rem', fontWeight: 'bold', color: '#0284c7', lineHeight: 1, marginBottom: '0.5rem' }}>
                ℞
              </div>

              <table className="print-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Medication Name</th>
                    <th>Dosage & Frequency</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.medicines?.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.dosage}</td>
                      <td>{m.duration}</td>
                      <td>{m.instruction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.advice && (
                <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                  <strong>Advice & Lifestyle Counseling:</strong>
                  <p style={{ color: '#475569', marginTop: '0.2rem' }}>{data.advice}</p>
                </div>
              )}

              <div style={{
                marginTop: '3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '1rem'
              }}>
                <div style={{
                  width: '75px',
                  height: '75px',
                  border: '1px dashed #94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  color: '#64748b'
                }}>
                  <span>[ QR CODE ]</span>
                  <span>Verified</span>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.825rem' }}>
                  <div style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '0.25rem' }}>Electronically Signed by:</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{data.doctorName}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{data.doctorSpecialty}</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Official Hospital Invoice */}
          {type === 'invoice' && (
            <div className="print-document-sheet">
              <div className="letterhead-header">
                <div>
                  <div className="hospital-print-name">{hospital?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>{hospital?.address}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569' }}>GSTIN / Tax ID: 07AAAAA0000A1Z5</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>TAX INVOICE</div>
                  <div style={{ fontSize: '0.85rem' }}>Invoice #: <strong>{data.id}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {data.date}</div>
                </div>
              </div>

              <div className="patient-info-banner">
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>BILLED TO</strong>
                  <span>{data.patientName}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>UHID NUMBER</strong>
                  <span>{data.uhid}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>BILLING CATEGORY</strong>
                  <span>{data.category}</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>PAYMENT STATUS</strong>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{data.status}</span>
                </div>
              </div>

              <table className="print-table">
                <thead>
                  <tr>
                    <th>Description of Service</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Rate ({curr})</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Amount ({curr})</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>{item.rate}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ maxWidth: '300px', marginLeft: 'auto', fontSize: '0.9rem', lineHeight: 1.8 }}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{curr}{data.subtotal}</span>
                </div>
                <div className="flex justify-between" style={{ color: '#64748b' }}>
                  <span>Tax (GST {data.taxPercent}%):</span>
                  <span>{curr}{data.taxAmount}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: '1.2rem', fontWeight: 800, borderTop: '2px solid #cbd5e1', paddingTop: '0.4rem', color: '#0369a1' }}>
                  <span>Total Paid:</span>
                  <span>{curr}{data.totalAmount}</span>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #cbd5e1', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                <div>Payment Mode: <strong>{data.paymentMode}</strong></div>
                <div>Authorized Hospital Cashier Signatory</div>
              </div>
            </div>
          )}

          {/* 3. Patient ID Card */}
          {type === 'card' && (
            <div style={{
              maxWidth: '450px',
              margin: '0 auto',
              border: '2px solid #0284c7',
              borderRadius: '12px',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #ffffff, #f0f9ff)'
            }}>
              <div className="flex items-center justify-between" style={{ borderBottom: '2px solid #0284c7', paddingBottom: '0.65rem', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ color: '#0369a1', fontWeight: 800 }}>{hospital?.name}</h4>
                  <div style={{ fontSize: '0.65rem', color: '#64748b' }}>PATIENT HEALTH IDENTIFICATION CARD</div>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7' }}>NABH</span>
              </div>

              <div className="flex gap-4 items-center" style={{ marginBottom: '1rem' }}>
                <div style={{ width: '70px', height: '80px', background: '#e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#64748b' }}>
                  👤
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{data.name}</div>
                  <div><strong>UHID:</strong> <span style={{ color: '#0284c7', fontWeight: 700 }}>{data.uhid}</span></div>
                  <div><strong>Age / Gender:</strong> {data.age} yrs / {data.gender}</div>
                  <div><strong>Blood Group:</strong> <strong style={{ color: '#e11d48' }}>{data.bloodGroup}</strong></div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}>
                <div><strong>Emergency Contact:</strong> {data.emergencyContact || data.phone}</div>
                <div><strong>Allergies:</strong> {data.allergies || 'None declared'}</div>
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '4px', color: '#64748b' }}>
                ||||| | |||| ||| |||||| ||||| ||||
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            <PrinterIcon size={16} color="#ffffff" />
            <span>Print Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
