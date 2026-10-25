import React, { useState } from 'react';
import { api } from '../services/api';
import { IdCardIcon, PrinterIcon, RecordsIcon } from './Icons';

export default function PatientPortal({ onPrintDocument, hospital }) {
  const [searchTerm, setSearchTerm] = useState('PA-2026-0056');
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('rx');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const found = await api.searchPatient(searchTerm.trim());
      setPatient(found);
      if (found) {
        const rx = await api.getPrescriptions(found.uhid);
        const inv = await api.getInvoices(found.uhid);
        setPrescriptions(rx);
        setInvoices(inv);
      } else {
        setPrescriptions([]);
        setInvoices([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = () => {
    if (!patient) return;
    onPrintDocument({
      type: 'card',
      data: patient
    });
  };

  const handlePrintRx = (rx) => {
    onPrintDocument({
      type: 'prescription',
      data: rx
    });
  };

  const handlePrintInvoice = (inv) => {
    onPrintDocument({
      type: 'invoice',
      data: inv
    });
  };

  return (
    <section id="patient-portal" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-app)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Patient Self-Service</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Digital Health Records & Reports</h2>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Enter your UHID or registered phone number to view prescriptions, bills, and test reports.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 portal-search-form" style={{ maxWidth: '520px', margin: '1.5rem auto 0', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter 10-digit mobile (e.g. 9811234501) or UHID"
              className="form-control"
              style={{ padding: '0.75rem 1rem', flex: '1 1 240px' }}
            />
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ whiteSpace: 'nowrap', flex: '1 1 120px' }}>
              {loading ? 'Searching...' : 'Access Records'}
            </button>
          </form>
        </div>

        {searched && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {patient ? (
              <>
                <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span className="badge badge-primary">{patient.uhid}</span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>{patient.name}</h3>
                    </div>
                    <button
                      onClick={handlePrintCard}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <IdCardIcon size={15} color="currentColor" />
                      <span>Print Patient ID Card</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div><strong>Age / Gender:</strong> {patient.age} yrs / {patient.gender}</div>
                    <div><strong>Blood Group:</strong> <span className="badge badge-danger">{patient.bloodGroup}</span></div>
                    <div><strong>Contact:</strong> {patient.phone}</div>
                    <div><strong>Allergies:</strong> <span style={{ color: 'var(--rose)', fontWeight: 600 }}>{patient.allergies || 'None'}</span></div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveTab('rx')}
                    className={`btn btn-sm ${activeTab === 'rx' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RecordsIcon size={14} color="currentColor" />
                    <span>Digital Prescriptions ({prescriptions.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('inv')}
                    className={`btn btn-sm ${activeTab === 'inv' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <RecordsIcon size={14} color="currentColor" />
                    <span>Invoices & Receipts ({invoices.length})</span>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'rx' && (
                  <div>
                    {prescriptions.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No prescriptions recorded.</p>
                    ) : (
                      prescriptions.map(rx => (
                        <div key={rx.id} className="card" style={{ marginBottom: '1rem' }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Prescription #{rx.id}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {rx.date} • Prescribed by <strong>{rx.doctorName}</strong> ({rx.doctorSpecialty})
                              </p>
                            </div>
                            <button
                              onClick={() => handlePrintRx(rx)}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <PrinterIcon size={14} color="#ffffff" />
                              <span>Print Formal Prescription</span>
                            </button>
                          </div>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                            <strong>Diagnosis:</strong> {rx.diagnosis}
                          </p>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>Medications:</strong> {rx.medicines?.map(m => m.name).join(', ')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'inv' && (
                  <div>
                    {invoices.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No invoices recorded.</p>
                    ) : (
                      invoices.map(inv => (
                        <div key={inv.id} className="card" style={{ marginBottom: '1rem' }}>
                          <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Invoice #{inv.id}</h4>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {inv.date} • {inv.category} • Mode: {inv.paymentMode}
                              </p>
                            </div>
                            <button
                              onClick={() => handlePrintInvoice(inv)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <PrinterIcon size={14} color="currentColor" />
                              <span>Print Formal Invoice</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="badge badge-success">{inv.status}</span>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {hospital?.currency || '₹'}{inv.totalAmount}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--rose)', marginBottom: '0.5rem' }}>No Patient Record Found</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  We could not find any records matching "{searchTerm}". Try sample UHID: <strong>PA-2026-0056</strong> or <strong>PA-2026-0012</strong>.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
