import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ConfirmModal, ToastContainer } from './AlertConfirmModal';
import {
  SearchIcon,
  CalendarIcon,
  StethoscopeIcon,
  RecordsIcon,
  PillIcon,
  BedIcon,
  UsersIcon,
  SettingsIcon,
  IdCardIcon,
  TrashIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  PlusIcon,
  LockIcon,
  ShieldCheckIcon,
  BellIcon,
  ClockIcon,
  ActivityIcon,
  PhoneIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  GlobeIcon,
  XIcon
} from './Icons';

export default function StaffERP({
  hospital,
  onUpdateHospital,
  onPrintDocument,
  setActiveMode,
  staffSession,
  onUpdateStaffSession,
  onLogout,
  onRequestSwitchDoctor
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Role Enforcement
  const isDoctorRole = staffSession?.role === 'Doctor';
  const sessionDoctorId = staffSession?.doctorId || 'DOC-101';

  // If Doctor role, selectedDoctorId is LOCKED to their own doctor ID!
  const [selectedDoctorId, setSelectedDoctorId] = useState(sessionDoctorId);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueFilterStatus, setQueueFilterStatus] = useState('ALL');

  // Registration Form
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    bloodGroup: 'B+',
    allergies: 'None declared',
    emergencyContact: ''
  });

  // Doctor EMR State
  const [selectedPatientUhid, setSelectedPatientUhid] = useState('');
  const [vitals, setVitals] = useState({ bp: '120/80', pulse: '74', spo2: '98%', temp: '98.6', weight: '70', height: '172' });
  const [diagnosis, setDiagnosis] = useState('');
  const [complaint, setComplaint] = useState('');
  const [advice, setAdvice] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState([
    { name: 'Tab. Paracetamol 650mg', dosage: '1 - 0 - 1 (After food)', duration: '5 Days', instruction: 'For fever/body ache' }
  ]);
  const [newMed, setNewMed] = useState({ name: '', dosage: '1 - 0 - 1 (After food)', duration: '5 Days', instruction: '' });

  // Bed Admission Form
  const [admitBedId, setAdmitBedId] = useState('');
  const [admitPatientUhid, setAdmitPatientUhid] = useState('');
  const [admitDoctorName, setAdmitDoctorName] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');

  // Hospital Configurator Form
  const [hospForm, setHospForm] = useState({
    name: hospital?.name || '',
    tagline: hospital?.tagline || '',
    emergencyPhone: hospital?.emergencyPhone || '',
    currency: hospital?.currency || '₹',
    address: hospital?.address || ''
  });

  // Admin Account & Staff Management State
  const [staffUsers, setStaffUsers] = useState([]);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    role: 'Doctor',
    username: '',
    pin: '1234',
    department: 'Cardiology',
    opdRoom: 'Room 101',
    fee: 800,
    qualifications: 'MBBS, MD',
    phone: '',
    email: ''
  });
  const [showPins, setShowPins] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    category: 'General Medicine',
    batch: 'BT-2501',
    expiry: '2028-06',
    stock: 200,
    minStock: 50,
    unitPrice: 65,
    unit: 'Strip of 10'
  });

  // Attractive Custom Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: 'Confirm Action',
    message: '',
    itemName: '',
    itemId: '',
    warningNote: '',
    confirmText: 'Yes, Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    onConfirm: () => {}
  });

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Toast Notifications System (Replaces harsh browser alert popups)
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };
  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (staffSession?.doctorId) {
      setSelectedDoctorId(staffSession.doctorId);
    }
  }, [staffSession?.doctorId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [p, d, a, b, ph, u] = await Promise.all([
        api.getPatients(),
        api.getDoctors(),
        api.getAppointments(),
        api.getBeds(),
        api.getPharmacy(),
        api.getStaffUsers()
      ]);
      setPatients(p);
      setDoctors(d);
      setAppointments(a);
      setBeds(b);
      setPharmacy(ph);
      setStaffUsers(u || []);

      if (!selectedDoctorId) {
        setSelectedDoctorId(staffSession?.doctorId || d[0]?.id || 'DOC-101');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Find active doctor record (reactive to selectedDoctorId or sessionDoctorId)
  const effectiveDoctorId = selectedDoctorId || sessionDoctorId || 'DOC-101';
  const currentDoctor = doctors.find(d => d.id === effectiveDoctorId) || doctors[0] || {
    id: effectiveDoctorId,
    name: staffSession?.doctorName || 'Consultant Specialist',
    specialty: staffSession?.department || 'Specialist OPD',
    opdRoom: staffSession?.opdRoom || 'Chamber'
  };

  // Instant Doctor Switch Handler (Doctor-Wise View)
  const handleSwitchDoctor = (newDocId) => {
    setSelectedDoctorId(newDocId);
    const doc = doctors.find(d => d.id === newDocId);
    const newSession = {
      role: newDocId === 'ALL' ? 'Admin' : 'Doctor',
      doctorId: newDocId,
      doctorName: doc ? doc.name : 'Hospital Administrator',
      department: doc ? (doc.departmentName || doc.specialty) : 'All Departments',
      opdRoom: doc ? doc.opdRoom : 'Room 101',
      authenticatedAt: new Date().toISOString()
    };
    sessionStorage.setItem('pulseaura_staff_session', JSON.stringify(newSession));
    if (onUpdateStaffSession) {
      onUpdateStaffSession(newSession);
    }
    setSelectedPatientUhid('');
  };

  // STRICT DOCTOR FILTERING:
  // Whichever doctor's cases are assigned, ONLY show those cases to that doctor!
  const doctorAppointments = (effectiveDoctorId !== 'ALL')
    ? appointments.filter(a => a.doctorId === effectiveDoctorId)
    : appointments;

  // Search & Status filtering inside this doctor's cases
  const displayedAppointments = doctorAppointments.filter(a => {
    if (queueFilterStatus === 'CONSULTING' && a.status !== 'In Consultation') return false;
    if (queueFilterStatus === 'CALLING' && a.status !== 'Calling Next') return false;
    if (queueFilterStatus === 'WAITING' && a.status !== 'Waiting') return false;
    if (queueFilterStatus === 'COMPLETED' && a.status !== 'Completed') return false;

    if (!queueSearch) return true;
    const q = queueSearch.toLowerCase();
    return (
      a.patientName?.toLowerCase().includes(q) ||
      a.tokenNumber?.toLowerCase().includes(q) ||
      a.uhid?.toLowerCase().includes(q) ||
      a.patientPhone?.includes(q) ||
      a.chiefComplaint?.toLowerCase().includes(q)
    );
  });

  // Doctor-specific metrics
  const activeInChamber = doctorAppointments.find(a => a.status === 'In Consultation');
  const callingNow = doctorAppointments.find(a => a.status === 'Calling Next');
  const waitingPatients = doctorAppointments.filter(a => a.status === 'Waiting');
  const completedPatients = doctorAppointments.filter(a => a.status === 'Completed');

  // Live Queue Status Handlers
  const handleUpdateAptStatus = async (aptId, newStatus) => {
    try {
      await api.updateAppointmentStatus(aptId, newStatus);
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: newStatus } : a));
      showToast(`Appointment status changed to "${newStatus}"`, 'success', 'Status Updated');
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'danger', 'Update Error');
    }
  };

  // 1-Click Call Next Patient for this Doctor
  const handleCallNextTurn = async () => {
    const inProgress = doctorAppointments.find(a => a.status === 'In Consultation' || a.status === 'Calling Next');
    const nextInLine = doctorAppointments.find(a => a.status === 'Waiting');

    if (inProgress) {
      await api.updateAppointmentStatus(inProgress.id, 'Completed');
    }
    if (nextInLine) {
      await api.updateAppointmentStatus(nextInLine.id, 'Calling Next');
      showToast(`Calling next patient: ${nextInLine.patientName} (${nextInLine.tokenNumber || nextInLine.uhid})`, 'info', 'Patient Called');
    } else {
      showToast(`No more waiting patients in queue for ${currentDoctor?.name || 'this doctor'}.`, 'warning', 'Queue Empty');
    }
    loadAllData();
  };

  // Open Rx Pad directly for a patient
  const handleOpenRxForPatient = (a) => {
    setSelectedPatientUhid(a.uhid);
    setComplaint(a.chiefComplaint || '');
    setActiveTab('emr');
  };

  // Patient Registration
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      return showToast('Full name and phone number are required', 'warning', 'Missing Information');
    }

    try {
      const created = await api.registerPatient({
        ...newPatient,
        age: parseInt(newPatient.age) || 30
      });
      showToast(`Patient registered successfully! UHID: ${created.uhid}`, 'success', 'Registration Completed');
      setNewPatient({ name: '', age: '', gender: 'Male', phone: '', bloodGroup: 'B+', allergies: 'None declared', emergencyContact: '' });
      loadAllData();
      setActiveTab('emr');
    } catch (err) {
      showToast('Error registering patient: ' + err.message, 'danger', 'Registration Failed');
    }
  };

  // Bed Admission / Discharge
  const handleAdmitBed = async (e) => {
    e.preventDefault();
    const pat = patients.find(p => p.uhid === admitPatientUhid);
    if (!pat) {
      return showToast('Please select a valid registered patient', 'warning', 'Admission Error');
    }

    await api.admitBed(admitBedId, {
      uhid: pat.uhid,
      patientName: pat.name,
      doctorName: admitDoctorName || currentDoctor?.name || 'Duty Medical Officer',
      diagnosis: admitDiagnosis || 'Inpatient Observation'
    });
    showToast(`Patient ${pat.name} admitted to Bed ${admitBedId}`, 'success', 'Patient Admitted');
    setAdmitBedId('');
    loadAllData();
  };

  const handleDischargeBed = (bedId) => {
    const bed = beds.find(b => b.id === bedId);
    setConfirmModal({
      isOpen: true,
      title: 'Discharge Patient & Free Bed?',
      message: `Are you sure you want to discharge patient from bed ${bedId}? This will free the bed and mark it for housekeeping sanitation.`,
      itemName: bed?.patientName ? `Patient: ${bed.patientName}` : `Bed ${bedId}`,
      itemId: bedId,
      warningNote: 'Ensure patient billing and discharge summaries are cleared before releasing the bed.',
      confirmText: 'Discharge & Free Bed',
      cancelText: 'Keep Bed Admitted',
      type: 'warning',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await api.dischargeBed(bedId);
          showToast(`Bed ${bedId} discharged and queued for Housekeeping & Cleaning`, 'success', 'Bed Released');
          loadAllData();
        } catch (err) {
          showToast('Error discharging bed: ' + err.message, 'danger', 'Discharge Failed');
        }
      }
    });
  };

  // EMR Prescription Creation
  const handleAddMedToRx = () => {
    if (!newMed.name) return showToast('Please specify medicine name', 'warning', 'Incomplete Prescription');
    setPrescribedMeds([...prescribedMeds, { ...newMed }]);
    setNewMed({ name: '', dosage: '1 - 0 - 1 (After food)', duration: '5 Days', instruction: '' });
  };

  const handleSavePrescription = async () => {
    const pat = patients.find(p => p.uhid === selectedPatientUhid) ||
                doctorAppointments.find(a => a.uhid === selectedPatientUhid);
    if (!pat) return showToast('Select a patient from your assigned cases', 'warning', 'No Patient Selected');
    if (!diagnosis) return showToast('Diagnosis is required to generate Rx', 'warning', 'Diagnosis Required');

    try {
      const rx = await api.savePrescription({
        uhid: pat.uhid,
        patientName: pat.patientName || pat.name,
        patientAge: pat.age || 35,
        patientGender: pat.gender || 'Male',
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialty,
        doctorRegNo: 'MCI-REG-VALID',
        vitals,
        diagnosis,
        complaints: complaint,
        medicines: prescribedMeds,
        advice: advice || 'Follow prescribed medication and review if symptoms persist.'
      });

      showToast(`Prescription #${rx.id} generated for ${pat.patientName || pat.name}!`, 'success', 'Rx Generated');
      onPrintDocument({ type: 'prescription', data: rx });
    } catch (err) {
      showToast('Error generating prescription: ' + err.message, 'danger', 'Prescription Failed');
    }
  };

  // Update Hospital Settings
  const handleSaveHospitalSettings = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateHospital(hospForm);
      onUpdateHospital(updated);
      showToast('Hospital branding profile updated live across portals!', 'success', 'Settings Saved');
    } catch (err) {
      showToast('Error updating hospital settings: ' + err.message, 'danger', 'Update Failed');
    }
  };

  // --- Admin Access Control Handlers ---

  // Admin: Create new Staff / Doctor Account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.username || !newUserForm.pin) {
      return showToast('Full name, username and 4-digit PIN are required', 'warning', 'Missing Required Fields');
    }
    try {
      const created = await api.createStaffUser(newUserForm);
      showToast(`Account created for ${created.name} (${created.role}) with PIN: ${created.pin}!`, 'success', 'Account Created');
      setNewUserForm({
        name: '',
        role: 'Doctor',
        username: '',
        pin: '1234',
        department: 'Cardiology',
        opdRoom: 'Room 101',
        fee: 800,
        qualifications: 'MBBS, MD',
        phone: '',
        email: ''
      });
      loadAllData();
    } catch (err) {
      showToast('Error creating account: ' + err.message, 'danger', 'Creation Failed');
    }
  };

  // Admin: Delete Staff / Doctor Account
  const handleDeleteAccount = (userId, userName) => {
    if (userId === 'ADM-001') {
      return showToast('Root Super Administrator account (ADM-001) cannot be deleted.', 'danger', 'Action Not Permitted');
    }

    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Staff Account?',
      message: `Are you sure you want to delete account "${userName}" (${userId})? This will permanently revoke their access.`,
      itemName: userName,
      itemId: userId,
      warningNote: 'This action cannot be undone. All role credentials, login PIN, and doctor chamber links will be revoked.',
      confirmText: 'Yes, Delete Account',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await api.deleteStaffUser(userId);
          setStaffUsers(prev => prev.filter(u => u.id !== userId));
          showToast(`Account "${userName}" (${userId}) deleted successfully.`, 'success', 'Account Deleted');
          loadAllData();
        } catch (err) {
          showToast('Error deleting account: ' + err.message, 'danger', 'Deletion Failed');
        }
      }
    });
  };

  // Admin: Delete Appointment / Token Case
  const handleDeleteAppointment = (aptId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel & Delete Appointment?',
      message: `Are you sure you want to cancel and delete appointment token #${aptId}?`,
      itemName: `Appointment #${aptId}`,
      itemId: `APT-${aptId}`,
      warningNote: 'This appointment slot will be removed from the active OPD queue.',
      confirmText: 'Yes, Cancel Appointment',
      cancelText: 'Keep Appointment',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await api.deleteAppointment(aptId);
          setAppointments(prev => prev.filter(a => a.id !== aptId));
          showToast(`Appointment token #${aptId} has been cancelled and removed.`, 'success', 'Appointment Cancelled');
        } catch (err) {
          showToast('Error deleting appointment: ' + err.message, 'danger', 'Deletion Failed');
        }
      }
    });
  };

  // Admin: Delete Patient Record
  const handleDeletePatient = (uhid, patName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Permanently Delete Patient Record?',
      message: `Are you sure you want to delete patient record for "${patName}" (UHID: ${uhid})?`,
      itemName: patName,
      itemId: uhid,
      warningNote: 'Patient clinical files, prescriptions, and case records will be permanently removed.',
      confirmText: 'Yes, Delete Patient Record',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await api.deletePatient(uhid);
          setPatients(prev => prev.filter(p => p.uhid !== uhid));
          showToast(`Patient record for "${patName}" (${uhid}) removed.`, 'success', 'Patient Record Removed');
        } catch (err) {
          showToast('Error deleting patient: ' + err.message, 'danger', 'Deletion Failed');
        }
      }
    });
  };

  // Admin: Add Pharmacy Medicine Stock
  const handleAddPharmacyMedicine = async (e) => {
    e.preventDefault();
    if (!newMedForm.name) {
      return showToast('Medicine name is required', 'warning', 'Missing Name');
    }
    try {
      const created = await api.addPharmacyItem(newMedForm);
      setPharmacy(prev => [...prev, created]);
      setShowAddMedModal(false);
      setNewMedForm({
        name: '',
        category: 'General Medicine',
        batch: `BT-${Math.floor(2000 + Math.random() * 900)}`,
        expiry: '2028-06',
        stock: 200,
        minStock: 50,
        unitPrice: 65,
        unit: 'Strip of 10'
      });
      showToast(`Medicine "${created.name}" added to stock inventory!`, 'success', 'Medicine Added');
    } catch (err) {
      showToast('Error adding medicine: ' + err.message, 'danger', 'Stock Failed');
    }
  };

  // Admin: Delete Pharmacy Medicine
  const handleDeletePharmacyMedicine = (medId, medName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Medicine from Inventory?',
      message: `Are you sure you want to delete medicine "${medName}" (${medId}) from inventory?`,
      itemName: medName,
      itemId: medId,
      warningNote: 'Stock count and batch data will be permanently removed from pharmacy records.',
      confirmText: 'Yes, Delete Medicine',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await api.deletePharmacyItem(medId);
          setPharmacy(prev => prev.filter(m => m.id !== medId));
          showToast(`Medicine "${medName}" (${medId}) deleted from inventory.`, 'success', 'Medicine Removed');
        } catch (err) {
          showToast('Error deleting medicine: ' + err.message, 'danger', 'Deletion Failed');
        }
      }
    });
  };

  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const curr = hospital?.currency || '₹';

  return (
    <div style={{
      display: 'flex',
      flex: 1,
      minHeight: 0,
      height: 'calc(100vh - 60px)',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-app)'
    }}>
      {/* Fixed Left Sidebar Navigation (Flush to left edge, zero gap, locked in place) */}
      <aside style={{
        width: '270px',
        flexShrink: 0,
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.25rem 0.85rem',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 20
      }}>
        {/* Doctor Identity Card in Sidebar */}
        <div style={{
          padding: '0.85rem',
          backgroundColor: isDoctorRole ? 'rgba(2, 132, 199, 0.08)' : 'var(--primary-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          border: isDoctorRole ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)'
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', color: isDoctorRole ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {isDoctorRole ? <LockIcon size={12} color="var(--primary)" /> : <ShieldCheckIcon size={12} color="var(--text-muted)" />}
              <span>{isDoctorRole ? 'Doctor Private Desk' : 'Hospital Super Admin'}</span>
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
              {isDoctorRole ? (currentDoctor?.opdRoom || 'Chamber') : 'Admin Desk'}
            </span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isDoctorRole ? currentDoctor?.name : (selectedDoctorId === 'ALL' ? 'Hospital Super Admin' : currentDoctor?.name)}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isDoctorRole ? currentDoctor?.specialty : (selectedDoctorId === 'ALL' ? 'All Hospital Departments' : currentDoctor?.specialty)}
          </p>
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
            Cases Assigned: {doctorAppointments.length} Patients
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
          >
            <RecordsIcon size={16} color="currentColor" />
            <span>{isDoctorRole ? 'My OPD Cases' : 'Doctor OPD Cases'} ({doctorAppointments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('emr')}
            className={`btn btn-sm ${activeTab === 'emr' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
          >
            <StethoscopeIcon size={16} color="currentColor" />
            <span>{isDoctorRole ? 'My EMR & Rx Writer' : 'Doctor EMR & Rx Writer'}</span>
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`btn btn-sm ${activeTab === 'registration' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
          >
            <IdCardIcon size={16} color="currentColor" />
            <span>Patient Registration (UHID)</span>
          </button>
          <button
            onClick={() => setActiveTab('ipd')}
            className={`btn btn-sm ${activeTab === 'ipd' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
          >
            <BedIcon size={16} color="currentColor" />
            <span>IPD Bed Matrix ({occupiedBeds}/{beds.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`btn btn-sm ${activeTab === 'pharmacy' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
          >
            <PillIcon size={16} color="currentColor" />
            <span>Pharmacy & Stock</span>
          </button>
          {!isDoctorRole && (
            <>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`btn btn-sm ${activeTab === 'accounts' ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.9rem',
                  gap: '0.6rem',
                  border: activeTab === 'accounts' ? undefined : '1px solid rgba(99, 102, 241, 0.35)',
                  backgroundColor: activeTab === 'accounts' ? undefined : 'rgba(99, 102, 241, 0.08)',
                  color: activeTab === 'accounts' ? '#fff' : '#6366f1',
                  fontWeight: 700
                }}
              >
                <UsersIcon size={16} color="currentColor" />
                <span>Accounts & Staff ({staffUsers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', gap: '0.6rem' }}
              >
                <SettingsIcon size={16} color="currentColor" />
                <span>Live Hospital Settings</span>
              </button>
            </>
          )}
        </nav>

        {/* Lock & Logout */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={onRequestSwitchDoctor}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
            title="Switch to another Doctor profile using PIN"
          >
            <RefreshCwIcon size={13} />
            <span>Switch Doctor Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="btn btn-danger btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
          >
            <LockIcon size={14} />
            <span>Lock & Logout Dashboard</span>
          </button>
          <button
            onClick={() => setActiveMode('public')}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
          >
            <GlobeIcon size={14} color="var(--primary)" />
            <span>View Patient Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace (The ONLY section that scrolls) */}
      <main style={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        padding: '1.75rem 2rem',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* DOCTOR-WISE WORKSPACE BANNER WITH INSTANT DOCTOR SELECTOR */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--primary-light)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, var(--bg-surface) 100%)'
        }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="flex items-center gap-3">
              <div style={{
                width: '3.2rem',
                height: '3.2rem',
                borderRadius: '50%',
                background: currentDoctor?.imageBg || 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}>
                {currentDoctor?.avatarText || 'DR'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                    <StethoscopeIcon size={18} color="var(--primary)" />
                    <span>{effectiveDoctorId === 'ALL' ? 'Hospital Super Admin' : currentDoctor?.name}</span>
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                    {effectiveDoctorId === 'ALL' ? 'All Rooms' : currentDoctor?.opdRoom} • {effectiveDoctorId === 'ALL' ? 'Master Overview' : currentDoctor?.specialty}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircleIcon size={14} color="var(--primary)" />
                  <span>Doctor-Wise Isolation Active: Showing ONLY cases for {effectiveDoctorId === 'ALL' ? 'all doctors' : currentDoctor?.name} ({doctorAppointments.length} Assigned Patients)</span>
                </div>
              </div>
            </div>

            {/* Direct Doctor Selection Dropdown */}
            <div style={{ minWidth: '320px', maxWidth: '440px', flex: '1' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>
                Select Doctor Profile (Switch Case View):
              </label>
              <select
                value={effectiveDoctorId}
                onChange={(e) => handleSwitchDoctor(e.target.value)}
                className="form-control"
                style={{
                  fontSize: '0.88rem',
                  padding: '0.65rem 0.85rem',
                  fontWeight: 700,
                  borderColor: 'var(--primary)',
                  backgroundColor: 'var(--bg-app)',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
                }}
              >
                {effectiveDoctorId === 'ALL' && (
                  <option value="ALL">All Doctors (Master Admin Overview)</option>
                )}
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty} • {d.opdRoom})
                  </option>
                ))}
                {effectiveDoctorId !== 'ALL' && (
                  <option value="ALL">All Doctors (Master Admin Overview)</option>
                )}
              </select>
            </div>
          </div>

          {/* Quick Doctor Pills Navigation */}
          <div className="flex gap-2" style={{ overflowX: 'auto', paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid rgba(2, 132, 199, 0.15)' }}>
            {doctors.map(d => {
              const count = appointments.filter(a => a.doctorId === d.id).length;
              const isSelected = effectiveDoctorId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => handleSwitchDoctor(d.id)}
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.75rem',
                    whiteSpace: 'nowrap',
                    fontWeight: isSelected ? 800 : 500,
                    boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <StethoscopeIcon size={13} color={isSelected ? '#ffffff' : 'var(--primary)'} />
                    <span>{d.name}</span>
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--bg-muted)',
                    marginLeft: '0.3rem',
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => handleSwitchDoctor('ALL')}
              className={`btn btn-sm ${effectiveDoctorId === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', whiteSpace: 'nowrap' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <UsersIcon size={13} color={effectiveDoctorId === 'ALL' ? '#ffffff' : 'var(--primary)'} />
                <span>All Doctors ({appointments.length})</span>
              </span>
            </button>
          </div>
        </div>

        {/* TAB 1: DOCTOR-WISE CASES & QUEUE */}
        {activeTab === 'overview' && (
          <div>
            {/* Doctor Chamber Profile Card */}
            <div
              className="card card-static"
              style={{
                marginBottom: '1.5rem',
                borderLeft: '5px solid var(--primary)',
                background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-subtle) 100%)',
                transform: 'none',
                cursor: 'default',
                transition: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div className="flex items-center gap-4">
                  <div style={{
                    width: '3.8rem',
                    height: '3.8rem',
                    borderRadius: '50%',
                    background: currentDoctor?.imageBg || 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    {currentDoctor?.avatarText || 'DR'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentDoctor?.name}'s Case Files</h2>
                      <span className="badge badge-primary">{currentDoctor?.opdRoom}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {currentDoctor?.specialty} • {currentDoctor?.departmentName}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Schedule: {currentDoctor?.schedule} • Consultation Fee: {curr}{currentDoctor?.fee}
                    </p>
                  </div>
                </div>

                {/* Fast Next Call Button for This Doctor */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCallNextTurn}
                    className="btn btn-primary"
                    style={{
                      padding: '0.75rem 1.4rem',
                      fontSize: '0.925rem',
                      fontWeight: 800,
                      boxShadow: '0 6px 18px rgba(2, 132, 199, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <BellIcon size={16} />
                    <span>Call Next Patient</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Specific to This Doctor */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>MY TOTAL CASES TODAY</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  {doctorAppointments.length}
                </div>
              </div>
              <div className="card">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>IN CONSULTATION (CHAMBER)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald)', marginTop: '0.25rem' }}>
                  {activeInChamber ? `${activeInChamber.tokenNumber} (${activeInChamber.patientName})` : 'Chamber Idle'}
                </div>
              </div>
              <div className="card">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>CALLING NEXT</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
                  {callingNow ? `${callingNow.tokenNumber} (${callingNow.patientName})` : 'None'}
                </div>
              </div>
              <div className="card">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WAITING IN LOUNGE</span>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.25rem' }}>
                  {waitingPatients.length}
                </div>
              </div>
            </div>

            {/* Doctor's Own Patient Appointments Table */}
            <div
              className="card card-static"
              style={{
                transform: 'none',
                cursor: 'default',
                transition: 'none',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    Patient Consultation Queue for {currentDoctor?.name}
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheckIcon size={14} color="#0284c7" />
                    <span>Strict Privacy: Displaying ONLY patients booked under {currentDoctor?.name}.</span>
                  </p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {doctorAppointments.length} Total Cases Assigned
                </span>
              </div>

              {/* Live Search & Status Filters */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ flex: '1', minWidth: '240px', maxWidth: '380px' }}>
                  <input
                    type="text"
                    value={queueSearch}
                    onChange={(e) => setQueueSearch(e.target.value)}
                    placeholder="Search my patients by name, token, UHID..."
                    className="form-control"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                  />
                </div>

                <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setQueueFilterStatus('ALL')}
                    className={`btn btn-sm ${queueFilterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  >
                    All ({doctorAppointments.length})
                  </button>
                  <button
                    onClick={() => setQueueFilterStatus('CONSULTING')}
                    className={`btn btn-sm ${queueFilterStatus === 'CONSULTING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: queueFilterStatus === 'CONSULTING' ? '#fff' : 'var(--emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ActivityIcon size={12} color={queueFilterStatus === 'CONSULTING' ? '#fff' : 'var(--emerald)'} />
                    <span>In Chamber ({activeInChamber ? 1 : 0})</span>
                  </button>
                  <button
                    onClick={() => setQueueFilterStatus('CALLING')}
                    className={`btn btn-sm ${queueFilterStatus === 'CALLING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: queueFilterStatus === 'CALLING' ? '#fff' : '#d97706', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <BellIcon size={12} color={queueFilterStatus === 'CALLING' ? '#fff' : '#d97706'} />
                    <span>Calling ({callingNow ? 1 : 0})</span>
                  </button>
                  <button
                    onClick={() => setQueueFilterStatus('WAITING')}
                    className={`btn btn-sm ${queueFilterStatus === 'WAITING' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <ClockIcon size={12} />
                    <span>Waiting ({waitingPatients.length})</span>
                  </button>
                  <button
                    onClick={() => setQueueFilterStatus('COMPLETED')}
                    className={`btn btn-sm ${queueFilterStatus === 'COMPLETED' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircleIcon size={12} color={queueFilterStatus === 'COMPLETED' ? '#fff' : 'var(--emerald)'} />
                    <span>Done ({completedPatients.length})</span>
                  </button>
                </div>
              </div>

              {doctorAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <StethoscopeIcon size={28} color="var(--primary)" />
                    </div>
                  </div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    No patient cases currently scheduled for {currentDoctor?.name}
                  </p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    When a patient books an appointment for this doctor, it will appear here in real-time.
                  </p>
                </div>
              ) : displayedAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>No cases match your filter criteria.</p>
                  <button
                    onClick={() => { setQueueSearch(''); setQueueFilterStatus('ALL'); }}
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>Token</th>
                        <th style={{ padding: '0.75rem' }}>Patient Name & UHID</th>
                        <th style={{ padding: '0.75rem' }}>Slot Time</th>
                        <th style={{ padding: '0.75rem' }}>Chief Complaint</th>
                        <th style={{ padding: '0.75rem' }}>Current Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Doctor Chamber Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAppointments.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>
                            {a.tokenNumber}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{a.patientName}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{a.uhid}</span>
                              <span>•</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <PhoneIcon size={11} color="var(--text-muted)" />
                                <span>{a.patientPhone}</span>
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {a.timeSlot}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)', maxWidth: '260px' }}>
                            {a.chiefComplaint || 'General checkup'}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={`badge ${
                              a.status === 'Calling Next'
                                ? 'badge-warning'
                                : (a.status === 'In Consultation' ? 'badge-success' : (a.status === 'Completed' ? 'badge-neutral' : 'badge-primary'))
                            }`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                              {a.status === 'Calling Next' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <BellIcon size={12} color="#d97706" />
                                  <span>Calling Next</span>
                                </span>
                              ) : a.status === 'In Consultation' ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <ActivityIcon size={12} color="var(--emerald)" />
                                  <span>In Consultation</span>
                                </span>
                              ) : (
                                <span>{a.status}</span>
                              )}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <div className="flex justify-end gap-1">
                              {a.status !== 'Calling Next' && a.status !== 'Completed' && (
                                <button
                                  onClick={() => handleUpdateAptStatus(a.id, 'Calling Next')}
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: '#d97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Call patient into chamber"
                                >
                                  <BellIcon size={12} color="#d97706" />
                                  <span>Call Next</span>
                                </button>
                              )}
                              {a.status !== 'In Consultation' && a.status !== 'Completed' && (
                                <button
                                  onClick={() => handleUpdateAptStatus(a.id, 'In Consultation')}
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Start consultation"
                                >
                                  <StethoscopeIcon size={13} color="#ffffff" />
                                  <span>Start Consult</span>
                                </button>
                              )}
                              {a.status !== 'Completed' && (
                                <button
                                  onClick={() => handleUpdateAptStatus(a.id, 'Completed')}
                                  className="btn btn-sm btn-secondary"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', color: 'var(--emerald)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  title="Mark completed"
                                >
                                  <CheckCircleIcon size={13} color="var(--emerald)" />
                                  <span>Done</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenRxForPatient(a)}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', fontWeight: 700, borderColor: 'var(--primary)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                title="Write digital prescription for this patient"
                              >
                                <RecordsIcon size={13} color="var(--primary)" />
                                <span>Rx Pad</span>
                              </button>
                              {!isDoctorRole && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAppointment(a.id)}
                                  className="btn btn-sm btn-danger"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                  title="Admin cancel & delete appointment case"
                                >
                                  <TrashIcon size={13} color="#ffffff" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DOCTOR EMR & RX WRITER (Strictly for this doctor's patients) */}
        {activeTab === 'emr' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Clinical Vitals</h3>
                <span className="badge badge-primary">{currentDoctor?.name}</span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Select Patient from My Assigned Queue:
                </label>
                <select
                  value={selectedPatientUhid}
                  onChange={(e) => {
                    const uhid = e.target.value;
                    setSelectedPatientUhid(uhid);
                    const foundApt = doctorAppointments.find(a => a.uhid === uhid);
                    if (foundApt && foundApt.chiefComplaint) {
                      setComplaint(foundApt.chiefComplaint);
                    }
                  }}
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">-- Choose Patient from My Queue --</option>
                  {doctorAppointments.map(a => (
                    <option key={a.uhid} value={a.uhid}>
                      {a.tokenNumber} - {a.patientName} ({a.uhid}) [{a.status}]
                    </option>
                  ))}
                  {doctorAppointments.length === 0 && (
                    <option value="" disabled>No patients assigned in your queue</option>
                  )}
                </select>
              </div>

              {/* Patient Quick Info Card */}
              {selectedPatientUhid && (() => {
                const pat = patients.find(p => p.uhid === selectedPatientUhid) ||
                            doctorAppointments.find(a => a.uhid === selectedPatientUhid);
                return pat ? (
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--primary-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--primary-light)',
                    marginBottom: '1rem',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      👤 {pat.patientName || pat.name}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      UHID: <strong style={{ color: 'var(--primary)' }}>{pat.uhid}</strong> • Age/Gender: {pat.age || 35} / {pat.gender || 'Male'}
                    </div>
                    {pat.chiefComplaint && (
                      <div style={{ marginTop: '0.3rem', color: '#b45309' }}>
                        Chief Complaint: <em>"{pat.chiefComplaint}"</em>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>BP (mmHg)</label>
                  <input
                    type="text"
                    value={vitals.bp}
                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Pulse (bpm)</label>
                  <input
                    type="text"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>SpO2 (%)</label>
                  <input
                    type="text"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Temp (°F)</label>
                  <input
                    type="text"
                    value={vitals.temp}
                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Doctor EMR & Prescription Pad ({currentDoctor?.name})
                </h3>
                <span className="badge badge-neutral">{currentDoctor?.specialty}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Diagnosis / ICD-10</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension, Acute Bronchitis, Type-2 Diabetes"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Chief Complaints</label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Patient reported symptoms..."
                  className="form-control"
                  rows="2"
                />
              </div>

              <div style={{ margin: '1.25rem 0', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>℞ Prescribed Medications</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    placeholder="Medicine Name (e.g. Tab. Atorvastatin 20mg)"
                    className="form-control"
                  />
                  <select
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="form-control"
                  >
                    <option value="1 - 0 - 0 (Morning)">1 - 0 - 0 (Morning)</option>
                    <option value="1 - 0 - 1 (After food)">1 - 0 - 1 (After food)</option>
                    <option value="1 - 1 - 1 (Thrice daily)">1 - 1 - 1 (Thrice daily)</option>
                    <option value="0 - 0 - 1 (Bedtime)">0 - 0 - 1 (Bedtime)</option>
                    <option value="SOS (As needed)">SOS (As needed)</option>
                  </select>
                  <input
                    type="text"
                    value={newMed.duration}
                    onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                    placeholder="Duration (e.g. 10 Days)"
                    className="form-control"
                  />
                  <button type="button" onClick={handleAddMedToRx} className="btn btn-secondary btn-sm">+ Add</button>
                </div>

                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                  <tbody>
                    {prescribedMeds.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.4rem 0', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '0.4rem 0', color: 'var(--primary)' }}>{m.dosage}</td>
                        <td style={{ padding: '0.4rem 0' }}>{m.duration}</td>
                        <td style={{ padding: '0.4rem 0', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setPrescribedMeds(prescribedMeds.filter((_, i) => i !== idx))}
                            style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor Advice & Dietary Guidelines</label>
                <input
                  type="text"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="e.g. Low salt diet, brisk walk 30 mins, review in OPD after 2 weeks"
                  className="form-control"
                />
              </div>

              <button onClick={handleSavePrescription} className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', marginTop: '0.5rem' }}>
                Save & Print Official Prescription
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PATIENT REGISTRATION */}
        {activeTab === 'registration' && (
          <div style={{ maxWidth: '700px' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>New Patient Registration (UHID)</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Generates a permanent Unique Health Identification Number (UHID)
            </p>

            <form onSubmit={handleRegisterPatient} className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Patient Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="e.g. 9811234501"
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    placeholder="Age"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="form-control"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    value={newPatient.bloodGroup}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                    className="form-control"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Known Drug Allergies</label>
                <input
                  type="text"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa drugs, None"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact (Name & Phone)</label>
                <input
                  type="text"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  placeholder="e.g. Sunita (Wife) - 9811234502"
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                Complete Registration & Issue UHID
              </button>
            </form>

            {/* Registered Patients Directory with Admin Delete Privileges */}
            <div className="card" style={{ marginTop: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                    Registered Patients Database ({patients.length})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Master UHID registry with direct record management
                  </p>
                </div>
                <div style={{ minWidth: '220px' }}>
                  <input
                    type="text"
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    placeholder="Search UHID, name, phone..."
                    className="form-control"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-muted)', textAlign: 'left' }}>
                      <th style={{ padding: '0.65rem' }}>UHID</th>
                      <th style={{ padding: '0.65rem' }}>Patient Name</th>
                      <th style={{ padding: '0.65rem' }}>Age / Gender</th>
                      <th style={{ padding: '0.65rem' }}>Phone</th>
                      <th style={{ padding: '0.65rem' }}>Blood Group</th>
                      <th style={{ padding: '0.65rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients
                      .filter(p => {
                        if (!patientSearchQuery) return true;
                        const q = patientSearchQuery.toLowerCase();
                        return (
                          p.name?.toLowerCase().includes(q) ||
                          p.uhid?.toLowerCase().includes(q) ||
                          p.phone?.includes(q)
                        );
                      })
                      .map(p => (
                        <tr key={p.uhid} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)' }}>
                            {p.uhid}
                          </td>
                          <td style={{ padding: '0.65rem', fontWeight: 700 }}>
                            {p.name}
                          </td>
                          <td style={{ padding: '0.65rem', color: 'var(--text-muted)' }}>
                            {p.age || '35'} / {p.gender || 'Male'}
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            {p.phone}
                          </td>
                          <td style={{ padding: '0.65rem' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{p.bloodGroup || 'B+'}</span>
                          </td>
                          <td style={{ padding: '0.65rem', textAlign: 'right' }}>
                            {!isDoctorRole && (
                              <button
                                type="button"
                                onClick={() => handleDeletePatient(p.uhid, p.name)}
                                className="btn btn-sm btn-danger"
                                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                title="Admin delete patient record"
                              >
                                <TrashIcon size={12} color="#ffffff" />
                                <span>Delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IPD VISUAL BED MATRIX */}
        {activeTab === 'ipd' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Inpatient (IPD) Visual Bed Matrix</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Real-time ward occupancy, admissions, and discharges</p>
              </div>
            </div>

            {admitBedId && (
              <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary)', backgroundColor: 'var(--primary-subtle)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem' }}>Admit Patient to Bed {admitBedId}</h3>
                <form onSubmit={handleAdmitBed} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto', gap: '0.75rem', alignItems: 'end' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Select Patient</label>
                    <select
                      value={admitPatientUhid}
                      onChange={(e) => setAdmitPatientUhid(e.target.value)}
                      className="form-control"
                      required
                    >
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.uhid} value={p.uhid}>{p.name} ({p.uhid})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Attending Doctor</label>
                    <input
                      type="text"
                      value={admitDoctorName}
                      onChange={(e) => setAdmitDoctorName(e.target.value)}
                      placeholder="e.g. Dr. Arvind Mehta"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Diagnosis</label>
                    <input
                      type="text"
                      value={admitDiagnosis}
                      onChange={(e) => setAdmitDiagnosis(e.target.value)}
                      placeholder="e.g. Acute observation"
                      className="form-control"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm">Confirm Admission</button>
                    <button type="button" onClick={() => setAdmitBedId('')} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {beds.map(bed => (
                <div
                  key={bed.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    border: `2px solid ${bed.status === 'Occupied' ? 'rgba(244, 63, 94, 0.4)' : (bed.status === 'Available' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)')}`,
                    backgroundColor: bed.status === 'Occupied' ? 'rgba(244, 63, 94, 0.03)' : (bed.status === 'Available' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(245, 158, 11, 0.03)')
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{bed.id}</span>
                    <span className={`badge ${bed.status === 'Occupied' ? 'badge-danger' : (bed.status === 'Available' ? 'badge-success' : 'badge-warning')}`} style={{ fontSize: '0.65rem' }}>
                      {bed.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bed.ward}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>{curr}{bed.rate}/day</p>

                  {bed.status === 'Occupied' ? (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>👤 {bed.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admitted: {bed.admittedOn}</div>
                      <button
                        onClick={() => handleDischargeBed(bed.id)}
                        className="btn btn-danger btn-sm"
                        style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.3rem' }}
                      >
                        Discharge Patient
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAdmitBedId(bed.id)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.3rem' }}
                    >
                      Admit Patient
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PHARMACY */}
        {activeTab === 'pharmacy' && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Pharmacy & Medical Store Inventory</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Real-time stock monitoring with low stock threshold alerts</p>
              </div>
              {!isDoctorRole && (
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(!showAddMedModal)}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {showAddMedModal ? <XIcon size={14} /> : <PlusIcon size={14} />}
                  <span>{showAddMedModal ? 'Cancel' : 'Add Medicine Stock'}</span>
                </button>
              )}
            </div>

            {/* Admin Add Medicine Quick Form */}
            {showAddMedModal && !isDoctorRole && (
              <form onSubmit={handleAddPharmacyMedicine} className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary-light)', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                  <PlusIcon size={16} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Add New Medicine Item to Pharmacy</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Medicine Name & Strength</label>
                    <input
                      type="text"
                      value={newMedForm.name}
                      onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                      placeholder="e.g. Paracetamol 650mg"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Category</label>
                    <input
                      type="text"
                      value={newMedForm.category}
                      onChange={(e) => setNewMedForm({ ...newMedForm, category: e.target.value })}
                      placeholder="e.g. Antibiotic"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Stock Count</label>
                    <input
                      type="number"
                      value={newMedForm.stock}
                      onChange={(e) => setNewMedForm({ ...newMedForm, stock: Number(e.target.value) })}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Unit Price ({curr})</label>
                    <input
                      type="number"
                      value={newMedForm.unitPrice}
                      onChange={(e) => setNewMedForm({ ...newMedForm, unitPrice: Number(e.target.value) })}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddMedModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save to Inventory</button>
                </div>
              </form>
            )}

            <div className="card">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Medicine Name</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Batch No</th>
                    <th style={{ padding: '0.75rem' }}>Expiry</th>
                    <th style={{ padding: '0.75rem' }}>Stock Available</th>
                    <th style={{ padding: '0.75rem' }}>Unit Price</th>
                    {!isDoctorRole && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {pharmacy.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{m.id}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.name}</td>
                      <td style={{ padding: '0.75rem' }}><span className="badge badge-neutral">{m.category}</span></td>
                      <td style={{ padding: '0.75rem' }}>{m.batch}</td>
                      <td style={{ padding: '0.75rem' }}>{m.expiry}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge ${m.stock <= m.minStock ? 'badge-danger' : 'badge-success'}`}>
                          {m.stock} Units {m.stock <= m.minStock ? '(Low Stock!)' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{curr}{m.unitPrice}</td>
                      {!isDoctorRole && (
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeletePharmacyMedicine(m.id, m.name)}
                            className="btn btn-sm btn-danger"
                            style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            title="Admin delete medicine item"
                          >
                            <TrashIcon size={12} color="#ffffff" />
                            <span>Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS / LIVE REBRANDING */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.35rem' }}>Live Hospital Configurator</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Rebrand this system live for any hospital client (updates headers, invoices, and prescriptions immediately).
            </p>

            <form onSubmit={handleSaveHospitalSettings} className="card">
              <div className="form-group">
                <label className="form-label">Hospital Brand Name</label>
                <input
                  type="text"
                  value={hospForm.name}
                  onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital Tagline</label>
                <input
                  type="text"
                  value={hospForm.tagline}
                  onChange={(e) => setHospForm({ ...hospForm, tagline: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Emergency Phone</label>
                  <input
                    type="text"
                    value={hospForm.emergencyPhone}
                    onChange={(e) => setHospForm({ ...hospForm, emergencyPhone: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency Symbol</label>
                  <select
                    value={hospForm.currency}
                    onChange={(e) => setHospForm({ ...hospForm, currency: e.target.value })}
                    className="form-control"
                  >
                    <option value="₹">₹ (INR Rupee)</option>
                    <option value="$">$ (USD Dollar)</option>
                    <option value="€">€ (Euro)</option>
                    <option value="£">£ (British Pound)</option>
                    <option value="AED">AED (Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address & District</label>
                <input
                  type="text"
                  value={hospForm.address}
                  onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                Save & Apply Live Branding
              </button>
            </form>
          </div>
        )}

        {/* TAB 7: ACCOUNTS & STAFF ACCESS CONTROL (ADMIN ONLY) */}
        {activeTab === 'accounts' && !isDoctorRole && (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>👥 Hospital Accounts & Staff Access Control</h2>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                    Super Admin Privileges
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Create new Doctor and Staff accounts with custom 4-digit PINs, assign OPD chambers, and manage account credentials.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPins(!showPins)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  {showPins ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                  <span>{showPins ? 'Hide Access PINs' : 'Reveal Access PINs'}</span>
                </button>
                <button
                  type="button"
                  onClick={loadAllData}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <RefreshCwIcon size={14} />
                  <span>Refresh Accounts</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.75rem', alignItems: 'start' }}>
              {/* Left Column: Create New Account Form */}
              <div className="card" style={{ border: '2px solid var(--primary-light)', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '2.4rem', height: '2.4rem', borderRadius: '8px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlusIcon size={18} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Create New Account</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Instantly provision doctor or staff credentials</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {/* Account Role Selector */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                      Account Type / Role:
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => {
                        const r = e.target.value;
                        setNewUserForm({
                          ...newUserForm,
                          role: r,
                          department: r === 'Admin' ? 'Administration' : (r === 'Nurse' ? 'Nursing & Critical Care' : (r === 'Pharmacist' ? 'Pharmacy & Stock' : 'Cardiology')),
                          opdRoom: r === 'Doctor' ? 'Room 101' : (r === 'Nurse' ? 'Station 1' : 'Admin Suite')
                        });
                      }}
                      className="form-control"
                      style={{ fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      <option value="Doctor">Specialist Doctor (EMR + OPD Desk)</option>
                      <option value="Admin">Hospital Administrator (Full Control)</option>
                      <option value="Nurse">Clinical Nurse (IPD Ward)</option>
                      <option value="Pharmacist">Pharmacist (Medicine Dispensing)</option>
                      <option value="Receptionist">Desk Receptionist (OPD Booking)</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                      Full Name:
                    </label>
                    <input
                      type="text"
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder={newUserForm.role === 'Doctor' ? 'e.g. Dr. Kabir Malhotra' : 'e.g. Sneha Patel'}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  {/* Username & PIN */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.65rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Username / ID:
                      </label>
                      <input
                        type="text"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        placeholder="e.g. dr.kabir"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                        4-Digit PIN:
                      </label>
                      <input
                        type="text"
                        maxLength="4"
                        value={newUserForm.pin}
                        onChange={(e) => setNewUserForm({ ...newUserForm, pin: e.target.value.replace(/\D/g, '') })}
                        placeholder="1234"
                        className="form-control"
                        style={{ fontSize: '0.85rem', fontWeight: 800, textAlign: 'center', letterSpacing: '2px' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Department & OPD Room */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.65rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Department / Specialty:
                      </label>
                      <input
                        type="text"
                        value={newUserForm.department}
                        onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                        placeholder="e.g. Cardiology"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Chamber / Room:
                      </label>
                      <input
                        type="text"
                        value={newUserForm.opdRoom}
                        onChange={(e) => setNewUserForm({ ...newUserForm, opdRoom: e.target.value })}
                        placeholder="Room 101"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Doctor specific fields: Consultation fee */}
                  {newUserForm.role === 'Doctor' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Consultation Fee ({curr}):
                        </label>
                        <input
                          type="number"
                          value={newUserForm.fee}
                          onChange={(e) => setNewUserForm({ ...newUserForm, fee: e.target.value })}
                          placeholder="800"
                          className="form-control"
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                          Qualifications:
                        </label>
                        <input
                          type="text"
                          value={newUserForm.qualifications}
                          onChange={(e) => setNewUserForm({ ...newUserForm, qualifications: e.target.value })}
                          placeholder="MBBS, MD"
                          className="form-control"
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Contact Phone & Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Phone:
                      </label>
                      <input
                        type="tel"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                        placeholder="+91 98111-00000"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        Email:
                      </label>
                      <input
                        type="email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        placeholder="staff@pulseaura.org"
                        className="form-control"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', padding: '0.65rem', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
                  >
                    <PlusIcon size={16} color="#ffffff" />
                    <span>Create Account & Grant Access</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Existing Staff Accounts Roster */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                      Active Staff & Doctor Credentials ({staffUsers.length})
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      Authorized personnel eligible for login and dashboard management
                    </p>
                  </div>

                  {/* Role Filter Buttons */}
                  <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
                    {['ALL', 'Doctor', 'Admin', 'Nurse', 'Pharmacist'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setUserRoleFilter(r)}
                        className={`btn btn-sm ${userRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', fontWeight: 700 }}
                      >
                        {r === 'ALL' ? `All (${staffUsers.length})` : r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search accounts by name, username, ID, or department..."
                    className="form-control"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                  />
                </div>

                {/* Accounts Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '0.75rem' }}>User / ID</th>
                        <th style={{ padding: '0.75rem' }}>Role</th>
                        <th style={{ padding: '0.75rem' }}>Department & Room</th>
                        <th style={{ padding: '0.75rem' }}>Login PIN</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers
                        .filter(u => {
                          if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
                          if (!userSearch) return true;
                          const q = userSearch.toLowerCase();
                          return (
                            u.name?.toLowerCase().includes(q) ||
                            u.username?.toLowerCase().includes(q) ||
                            u.id?.toLowerCase().includes(q) ||
                            u.department?.toLowerCase().includes(q)
                          );
                        })
                        .map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {u.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 700 }}>{u.id}</span> • @{u.username}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className={`badge ${
                                u.role === 'Admin'
                                  ? 'badge-warning'
                                  : (u.role === 'Doctor' ? 'badge-primary' : 'badge-neutral')
                              }`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                {u.role === 'Admin' ? (
                                  <>
                                    <ShieldCheckIcon size={12} />
                                    <span>Super Admin</span>
                                  </>
                                ) : u.role === 'Doctor' ? (
                                  <>
                                    <StethoscopeIcon size={12} />
                                    <span>Specialist Doctor</span>
                                  </>
                                ) : (
                                  <span>{u.role}</span>
                                )}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>{u.department || 'Clinical'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.opdRoom || 'Chamber'}</div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                letterSpacing: showPins ? '1px' : '3px',
                                color: showPins ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: 'var(--bg-muted)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px'
                              }}>
                                {showPins ? u.pin : '••••'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: '#10b981',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                              {u.id !== 'ADM-001' ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAccount(u.id, u.name)}
                                  className="btn btn-sm btn-danger"
                                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  title={`Permanently delete ${u.name}'s account and credentials`}
                                >
                                  <TrashIcon size={13} color="#ffffff" />
                                  <span>Delete Account</span>
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  Root Admin
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Attractive Themed Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        itemName={confirmModal.itemName}
        itemId={confirmModal.itemId}
        warningNote={confirmModal.warningNote}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

      {/* Modern Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
