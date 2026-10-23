/**
 * PulseAura Health OS - Appointment Booking & Public Patient Experience
 * Zero External APIs. Fully Interactive.
 */

const BookingModule = {
  currentStep: 1,
  formData: {
    departmentId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'B+',
    chiefComplaint: '',
    priority: 'Normal'
  },

  init() {
    this.renderDepartmentSelects();
    this.renderDoctorDirectory();
    this.renderPublicSpecialties();
    this.renderLiveQueueBoard();
    this.bindEvents();

    // Re-render when database updates
    window.HospitalDB.subscribe(() => {
      this.renderLiveQueueBoard();
      this.renderDoctorDirectory();
    });

    // Simulate real-time queue progression every 20 seconds
    setInterval(() => {
      this.simulateQueuePing();
    }, 20000);
  },

  renderDepartmentSelects() {
    const deptSelect = document.getElementById('booking-dept-select');
    if (!deptSelect) return;

    const depts = window.HospitalDB.state.departments;
    deptSelect.innerHTML = `<option value="">-- Choose Clinical Department --</option>` +
      depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  },

  renderDoctorDirectory(selectedDeptId = '') {
    const container = document.getElementById('doctors-list-container');
    if (!container) return;

    let docs = window.HospitalDB.state.doctors;
    if (selectedDeptId) {
      docs = docs.filter(d => d.departmentId === selectedDeptId);
    }

    const curr = window.HospitalDB.state.hospital.currency;

    container.innerHTML = docs.map(doc => {
      const dept = window.HospitalDB.state.departments.find(d => d.id === doc.departmentId);
      return `
        <div class="doctor-card">
          <div class="flex items-center gap-4" style="margin-bottom: 1rem;">
            <div class="doc-avatar-circle" style="background: ${doc.imageBg};">${doc.avatarText}</div>
            <div>
              <h4 style="font-size: 1.1rem; font-weight: 700;">${doc.name}</h4>
              <p style="font-size: 0.85rem; color: var(--primary); font-weight: 600;">${doc.specialty}</p>
              <span class="badge badge-neutral" style="font-size: 0.7rem; margin-top: 0.25rem;">${dept ? dept.name : ''}</span>
            </div>
          </div>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            <strong>Qualifications:</strong> ${doc.qualifications}
          </p>
          <div class="flex items-center justify-between" style="font-size: 0.825rem; margin-bottom: 1rem; padding: 0.5rem 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
            <span><strong>Experience:</strong> ${doc.experience}</span>
            <span><strong>Chamber:</strong> ${doc.opdRoom}</span>
            <span><strong>Fee:</strong> <span style="color: var(--primary); font-weight: 700;">${curr}${doc.fee}</span></span>
          </div>
          <div class="flex items-center justify-between" style="margin-top: auto;">
            <div class="flex items-center gap-1" style="color: #eab308; font-weight: 700; font-size: 0.85rem;">
              <span>★</span> <span>${doc.rating}</span> <span style="color: var(--text-light); font-weight: 400;">(${doc.reviewsCount})</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="BookingModule.selectDoctorForBooking('${doc.id}')">
              Book Appointment
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderPublicSpecialties() {
    const container = document.getElementById('specialties-list-container');
    if (!container) return;

    const depts = window.HospitalDB.state.departments;
    container.innerHTML = depts.map(d => {
      const docCount = window.HospitalDB.state.doctors.filter(doc => doc.departmentId === d.id).length;
      return `
        <div class="specialty-card" onclick="BookingModule.filterBySpecialty('${d.id}')">
          <div class="specialty-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem;">${d.name}</h4>
          <p style="font-size: 0.825rem; line-height: 1.4; margin-bottom: 0.75rem;">${d.description}</p>
          <div class="flex items-center justify-between" style="font-size: 0.75rem; color: var(--text-muted);">
            <span>Head: <strong>${d.head}</strong></span>
            <span class="badge badge-primary">${docCount} Specialists</span>
          </div>
        </div>
      `;
    }).join('');
  },

  filterBySpecialty(deptId) {
    const deptSelect = document.getElementById('booking-dept-select');
    if (deptSelect) {
      deptSelect.value = deptId;
      this.handleDepartmentChange(deptId);
    }
    this.renderDoctorDirectory(deptId);
    const docSection = document.getElementById('section-doctors');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  handleDepartmentChange(deptId) {
    this.formData.departmentId = deptId;
    const docSelect = document.getElementById('booking-doc-select');
    if (!docSelect) return;

    const docs = window.HospitalDB.state.doctors.filter(d => !deptId || d.departmentId === deptId);
    docSelect.innerHTML = `<option value="">-- Choose Specialist Doctor --</option>` +
      docs.map(d => `<option value="${d.id}">${d.name} (${d.specialty})</option>`).join('');

    docSelect.disabled = docs.length === 0;
  },

  handleDoctorChange(docId) {
    this.formData.doctorId = docId;
    const doc = window.HospitalDB.state.doctors.find(d => d.id === docId);
    const slotsContainer = document.getElementById('booking-slots-container');
    if (!slotsContainer) return;

    if (!doc) {
      slotsContainer.innerHTML = `<p style="font-size: 0.8rem; color: var(--text-muted);">Please select a doctor to view time slots.</p>`;
      return;
    }

    slotsContainer.innerHTML = doc.availableSlots.map(slot => `
      <button type="button" class="slot-btn ${this.formData.timeSlot === slot ? 'selected' : ''}" onclick="BookingModule.selectSlot('${slot}')">
        ${slot}
      </button>
    `).join('');
  },

  selectSlot(slot) {
    this.formData.timeSlot = slot;
    const buttons = document.querySelectorAll('.slot-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('selected', btn.innerText.trim() === slot);
    });
  },

  selectDoctorForBooking(docId) {
    const doc = window.HospitalDB.state.doctors.find(d => d.id === docId);
    if (!doc) return;

    this.formData.departmentId = doc.departmentId;
    this.formData.doctorId = doc.id;

    const deptSelect = document.getElementById('booking-dept-select');
    if (deptSelect) deptSelect.value = doc.departmentId;

    this.handleDepartmentChange(doc.departmentId);

    const docSelect = document.getElementById('booking-doc-select');
    if (docSelect) docSelect.value = doc.id;

    this.handleDoctorChange(doc.id);

    // Scroll smoothly to the booking card in the hero
    const heroCard = document.querySelector('.booking-widget-card');
    if (heroCard) {
      heroCard.scrollIntoView({ behavior: 'smooth' });
    }
  },

  submitBookingForm(e) {
    e.preventDefault();

    if (!this.formData.doctorId) {
      window.App.showToast('Please select a doctor for your appointment.', 'warning');
      return;
    }
    if (!this.formData.timeSlot) {
      window.App.showToast('Please pick an available time slot.', 'warning');
      return;
    }

    const patientName = document.getElementById('book-patient-name').value.trim();
    const patientPhone = document.getElementById('book-patient-phone').value.trim();
    const patientAge = document.getElementById('book-patient-age').value.trim();
    const patientGender = document.getElementById('book-patient-gender').value;
    const chiefComplaint = document.getElementById('book-complaint').value.trim();

    if (!patientName || !patientPhone) {
      window.App.showToast('Please provide patient name and contact phone number.', 'warning');
      return;
    }

    const doc = window.HospitalDB.state.doctors.find(d => d.id === this.formData.doctorId);
    const dept = window.HospitalDB.state.departments.find(d => d.id === (doc ? doc.departmentId : ''));

    // Check if patient already exists or auto-register them
    let patient = window.HospitalDB.findPatient(patientPhone);
    if (!patient) {
      patient = window.HospitalDB.registerPatient({
        name: patientName,
        phone: patientPhone,
        age: parseInt(patientAge) || 30,
        gender: patientGender,
        bloodGroup: "B+",
        allergies: "None declared",
        chronicConditions: []
      });
    }

    // Book the appointment
    const newApt = window.HospitalDB.bookAppointment({
      uhid: patient.uhid,
      patientName: patient.name,
      patientPhone: patient.phone,
      doctorId: doc.id,
      doctorName: doc.name,
      department: dept ? dept.name : "OPD",
      opdRoom: doc.opdRoom,
      date: this.formData.date,
      timeSlot: this.formData.timeSlot,
      chiefComplaint: chiefComplaint || "General consultation",
      fee: doc.fee,
      paymentStatus: "Paid"
    });

    // Show Confirmation Modal
    this.showConfirmationModal(newApt, doc);

    // Reset Form
    e.target.reset();
    this.formData.timeSlot = '';
    const slotsContainer = document.getElementById('booking-slots-container');
    if (slotsContainer) slotsContainer.innerHTML = '';
  },

  showConfirmationModal(appointment, doctor) {
    const modalBody = document.getElementById('booking-success-modal-content');
    const curr = window.HospitalDB.state.hospital.currency;

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 1rem 0;">
          <div style="width: 4rem; height: 4rem; border-radius: 50%; background-color: var(--emerald-light); color: var(--emerald); display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 1rem;">
            ✓
          </div>
          <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.5rem;">Appointment Confirmed!</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted);">An SMS & WhatsApp confirmation has been simulated.</p>

          <div style="background-color: var(--bg-muted); border: 2px dashed var(--primary); border-radius: var(--radius-lg); padding: 1.5rem; margin: 1.5rem 0; text-align: left;">
            <div class="flex items-center justify-between" style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
              <div>
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Live OPD Token</span>
                <div style="font-size: 1.85rem; font-weight: 800; color: var(--primary); font-family: var(--font-mono);">${appointment.tokenNumber}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">UHID (Patient ID)</span>
                <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); font-family: var(--font-mono);">${appointment.uhid}</div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
              <div><strong>Patient:</strong> ${appointment.patientName}</div>
              <div><strong>Doctor:</strong> ${doctor.name}</div>
              <div><strong>Department:</strong> ${appointment.department}</div>
              <div><strong>Chamber Room:</strong> <span class="badge badge-primary">${doctor.opdRoom}</span></div>
              <div><strong>Slot Time:</strong> ${appointment.timeSlot}</div>
              <div><strong>Consultation Fee:</strong> ${curr}${appointment.fee} (Paid)</div>
            </div>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button class="btn btn-secondary" onclick="window.App.closeModal('booking-success-modal')">Close</button>
            <button class="btn btn-primary" onclick="window.print()">Print Token Slip</button>
          </div>
        </div>
      `;
    }

    window.App.openModal('booking-success-modal');
    window.App.showToast(`Token ${appointment.tokenNumber} issued successfully!`, 'success');
  },

  renderLiveQueueBoard() {
    const container = document.getElementById('live-queue-board-grid');
    if (!container) return;

    const apts = window.HospitalDB.state.appointments;
    const docs = window.HospitalDB.state.doctors;

    // Display active room tokens for doctors
    container.innerHTML = docs.slice(0, 4).map(doc => {
      const activeApt = apts.find(a => a.doctorId === doc.id && a.status === 'In Consultation');
      const waitingList = apts.filter(a => a.doctorId === doc.id && a.status === 'Waiting');

      return `
        <div class="queue-card ${activeApt ? 'active-calling' : ''}">
          <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
            <span class="badge ${activeApt ? 'badge-success' : 'badge-neutral'}">
              <span class="pulse-dot ${activeApt ? 'pulse-emerald' : 'pulse-amber'}"></span>
              ${activeApt ? 'Serving Now' : 'Doctor Idle'}
            </span>
            <span style="font-weight: 700; font-size: 0.85rem; color: #94a3b8;">${doc.opdRoom}</span>
          </div>
          <div style="margin-bottom: 0.75rem;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 600;">Current Token</div>
            <div class="queue-token-pill">${activeApt ? activeApt.tokenNumber : '--'}</div>
            <div style="font-size: 0.85rem; color: #e2e8f0; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${activeApt ? activeApt.patientName : 'No patient in chamber'}
            </div>
          </div>
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 0.65rem; font-size: 0.75rem; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>${doc.name}</span>
            <span style="color: #38bdf8;">${waitingList.length} in queue</span>
          </div>
        </div>
      `;
    }).join('');
  },

  simulateQueuePing() {
    // Randomly advance an appointment state to demonstrate live queue board
    const waitingApts = window.HospitalDB.state.appointments.filter(a => a.status === 'Waiting');
    if (waitingApts.length > 0) {
      const luckyApt = waitingApts[0];
      // Set previous in-consultation for this doctor to completed
      const previousInConsult = window.HospitalDB.state.appointments.find(a => a.doctorId === luckyApt.doctorId && a.status === 'In Consultation');
      if (previousInConsult) {
        window.HospitalDB.updateAppointmentStatus(previousInConsult.id, 'Completed');
      }
      window.HospitalDB.updateAppointmentStatus(luckyApt.id, 'In Consultation');
      this.renderLiveQueueBoard();
    }
  },

  // Patient Self-Service Lookup
  searchPatientPortal() {
    const query = document.getElementById('portal-search-input').value.trim();
    if (!query) {
      window.App.showToast('Please enter your UHID or Registered Mobile Number.', 'warning');
      return;
    }

    const patient = window.HospitalDB.findPatient(query);
    const resultsContainer = document.getElementById('portal-results-wrapper');
    if (!resultsContainer) return;

    if (!patient) {
      resultsContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem 1rem;">
          <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--rose);">No Patient Record Found</h4>
          <p style="font-size: 0.875rem;">No record matched "${query}". Please check your UHID (e.g. PA-2026-0012) or phone number.</p>
        </div>
      `;
      return;
    }

    // Find related prescriptions, reports, invoices
    const rxList = window.HospitalDB.state.prescriptions.filter(r => r.uhid === patient.uhid);
    const labList = window.HospitalDB.state.labReports.filter(l => l.uhid === patient.uhid);
    const invList = window.HospitalDB.state.invoices.filter(i => i.uhid === patient.uhid);
    const curr = window.HospitalDB.state.hospital.currency;

    resultsContainer.innerHTML = `
      <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
        <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
          <div>
            <span class="badge badge-primary">${patient.uhid}</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; margin-top: 0.35rem;">${patient.name}</h3>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="BookingModule.printPatientCard('${patient.uhid}')">
            🪪 Print Patient ID Card
          </button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-size: 0.875rem;">
          <div><strong>Age / Gender:</strong> ${patient.age} yrs / ${patient.gender}</div>
          <div><strong>Blood Group:</strong> <span class="badge badge-danger">${patient.bloodGroup}</span></div>
          <div><strong>Phone:</strong> ${patient.phone}</div>
          <div><strong>Allergies:</strong> <span style="color: var(--rose); font-weight: 600;">${patient.allergies || 'None'}</span></div>
        </div>
      </div>

      <div class="portal-tabs">
        <button class="portal-tab-btn active" onclick="BookingModule.switchPortalTab('prescriptions')">
          Digital Prescriptions (${rxList.length})
        </button>
        <button class="portal-tab-btn" onclick="BookingModule.switchPortalTab('reports')">
          Lab Test Reports (${labList.length})
        </button>
        <button class="portal-tab-btn" onclick="BookingModule.switchPortalTab('invoices')">
          Invoices & Receipts (${invList.length})
        </button>
      </div>

      <div id="portal-tab-content">
        ${this.renderPrescriptionsTab(rxList)}
      </div>
    `;
  },

  switchPortalTab(tab) {
    const tabs = document.querySelectorAll('.portal-tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const container = document.getElementById('portal-tab-content');
    const query = document.getElementById('portal-search-input').value.trim();
    const patient = window.HospitalDB.findPatient(query);
    if (!patient || !container) return;

    if (tab === 'prescriptions') {
      const rxList = window.HospitalDB.state.prescriptions.filter(r => r.uhid === patient.uhid);
      container.innerHTML = this.renderPrescriptionsTab(rxList);
    } else if (tab === 'reports') {
      const labList = window.HospitalDB.state.labReports.filter(l => l.uhid === patient.uhid);
      container.innerHTML = this.renderReportsTab(labList);
    } else if (tab === 'invoices') {
      const invList = window.HospitalDB.state.invoices.filter(i => i.uhid === patient.uhid);
      container.innerHTML = this.renderInvoicesTab(invList);
    }
  },

  renderPrescriptionsTab(rxList) {
    if (rxList.length === 0) {
      return `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No prescriptions found for this patient.</p>`;
    }

    return rxList.map(rx => `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1.05rem;">Prescription #${rx.id}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${rx.date} • Prescribed by <strong>${rx.doctorName}</strong> (${rx.doctorSpecialty})</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="EMRModule.previewPrescription('${rx.id}')">
            View / Print Prescription
          </button>
        </div>
        <p style="font-size: 0.875rem; margin-bottom: 0.75rem;"><strong>Diagnosis:</strong> ${rx.diagnosis}</p>
        <div style="font-size: 0.85rem; color: var(--text-muted);">
          <strong>Medications:</strong> ${rx.medicines.map(m => m.name).join(', ')}
        </div>
      </div>
    `).join('');
  },

  renderReportsTab(labList) {
    if (labList.length === 0) {
      return `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No diagnostic reports found for this patient.</p>`;
    }

    return labList.map(rep => `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1.05rem;">${rep.testName}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Reported: ${rep.reportedOn} • Ref: <strong>${rep.referredBy}</strong></p>
          </div>
          <button class="btn btn-accent btn-sm" onclick="DiagnosticsModule.previewLabReport('${rep.id}')">
            View / Print Report
          </button>
        </div>
        <div class="flex items-center gap-3">
          <span class="badge badge-success">${rep.status}</span>
          <span style="font-size: 0.825rem; color: var(--text-muted);">Pathologist: ${rep.pathologist}</span>
        </div>
      </div>
    `).join('');
  },

  renderInvoicesTab(invList) {
    const curr = window.HospitalDB.state.hospital.currency;
    if (invList.length === 0) {
      return `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No invoices recorded for this patient.</p>`;
    }

    return invList.map(inv => `
      <div class="card" style="margin-bottom: 1rem;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.75rem;">
          <div>
            <h4 style="font-size: 1.05rem;">Invoice #${inv.id}</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${inv.date} • ${inv.category} • Mode: ${inv.paymentMode}</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="BillingModule.previewInvoice('${inv.id}')">
            View / Print Invoice
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="badge badge-success">${inv.status}</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">
            ${curr}${inv.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
    `).join('');
  },

  printPatientCard(uhid) {
    const p = window.HospitalDB.findPatient(uhid);
    if (!p) return;
    const hosp = window.HospitalDB.state.hospital;

    const modalBody = document.getElementById('print-modal-content');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="print-document-sheet" style="max-width: 450px; border: 2px solid #0284c7; border-radius: 12px; padding: 1.5rem; background: linear-gradient(135deg, #ffffff, #f0f9ff);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 0.75rem; margin-bottom: 1rem;">
          <div>
            <h4 style="color: #0369a1; font-weight: 800; font-size: 1rem;">${hosp.name}</h4>
            <div style="font-size: 0.65rem; color: #64748b;">PATIENT HEALTH IDENTIFICATION CARD</div>
          </div>
          <span style="font-size: 0.75rem; font-weight: 800; color: #0284c7;">NABH</span>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <div style="width: 70px; height: 80px; background: #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #64748b;">
            👤
          </div>
          <div style="font-size: 0.85rem; line-height: 1.4;">
            <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">${p.name}</div>
            <div><strong>UHID:</strong> <span style="color: #0284c7; font-weight: 700;">${p.uhid}</span></div>
            <div><strong>Age / Gender:</strong> ${p.age} yrs / ${p.gender}</div>
            <div><strong>Blood Group:</strong> <strong style="color: #e11d48;">${p.bloodGroup}</strong></div>
          </div>
        </div>

        <div style="font-size: 0.75rem; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 0.5rem; margin-top: 0.5rem;">
          <div><strong>Emergency Contact:</strong> ${p.emergencyContact || p.phone}</div>
          <div><strong>Allergies:</strong> ${p.allergies || 'None'}</div>
        </div>

        <div style="margin-top: 1rem; text-align: center; font-family: monospace; font-size: 0.7rem; letter-spacing: 4px; color: #64748b;">
          ||||| | |||| ||| |||||| ||||| ||||
        </div>
      </div>
    `;

    window.App.openModal('print-modal');
  },

  bindEvents() {
    const deptSelect = document.getElementById('booking-dept-select');
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => this.handleDepartmentChange(e.target.value));
    }

    const docSelect = document.getElementById('booking-doc-select');
    if (docSelect) {
      docSelect.addEventListener('change', (e) => this.handleDoctorChange(e.target.value));
    }

    const bookingForm = document.getElementById('hero-booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => this.submitBookingForm(e));
    }

    const portalSearchBtn = document.getElementById('portal-search-btn');
    if (portalSearchBtn) {
      portalSearchBtn.addEventListener('click', () => this.searchPatientPortal());
    }
  }
};

window.BookingModule = BookingModule;
