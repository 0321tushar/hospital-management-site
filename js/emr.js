/**
 * PulseAura Health OS - Doctor EMR & Clinical Desk
 * Zero External APIs. Realistic Clinical Workflows & Printable Prescriptions.
 */

const EMRModule = {
  currentPatient: null,
  prescribedMeds: [],

  init() {
    this.renderDoctorSelect();
    this.renderOPDAppointmentList();
    this.renderMedicineOptions();
    this.bindEvents();

    window.HospitalDB.subscribe(() => {
      this.renderOPDAppointmentList();
    });
  },

  renderDoctorSelect() {
    const select = document.getElementById('emr-doctor-filter');
    if (!select) return;

    const docs = window.HospitalDB.state.doctors;
    select.innerHTML = `<option value="ALL">All Doctors OPD</option>` +
      docs.map(d => `<option value="${d.id}">${d.name} (${d.specialty})</option>`).join('');
  },

  renderOPDAppointmentList() {
    const container = document.getElementById('emr-patient-queue-list');
    if (!container) return;

    const docFilter = document.getElementById('emr-doctor-filter')?.value || 'ALL';
    let apts = window.HospitalDB.state.appointments;

    if (docFilter !== 'ALL') {
      apts = apts.filter(a => a.doctorId === docFilter);
    }

    if (apts.length === 0) {
      container.innerHTML = `<p style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No appointments in queue.</p>`;
      return;
    }

    container.innerHTML = apts.map(apt => `
      <div class="card" style="padding: 0.85rem; margin-bottom: 0.65rem; border-left: 3px solid ${apt.status === 'In Consultation' ? 'var(--emerald)' : (apt.status === 'Completed' ? 'var(--text-light)' : 'var(--amber)')}; cursor: pointer;" onclick="EMRModule.loadPatientToDesk('${apt.uhid}', '${apt.id}')">
        <div class="flex items-center justify-between" style="margin-bottom: 0.35rem;">
          <span style="font-weight: 800; font-family: var(--font-mono); font-size: 0.95rem; color: var(--primary);">${apt.tokenNumber}</span>
          <span class="badge ${apt.status === 'In Consultation' ? 'badge-success' : (apt.status === 'Completed' ? 'badge-neutral' : 'badge-warning')}" style="font-size: 0.68rem;">
            ${apt.status}
          </span>
        </div>
        <div style="font-weight: 700; font-size: 0.9rem;">${apt.patientName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
          UHID: ${apt.uhid} • Slot: ${apt.timeSlot}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-light); margin-top: 0.2rem;">
          Doc: <strong>${apt.doctorName}</strong>
        </div>
      </div>
    `).join('');
  },

  loadPatientToDesk(uhid, aptId) {
    const patient = window.HospitalDB.findPatient(uhid);
    if (!patient) return;

    this.currentPatient = patient;
    const apt = window.HospitalDB.state.appointments.find(a => a.id === aptId);

    // Update Banner Info
    const banner = document.getElementById('emr-active-patient-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-primary">${patient.uhid}</span>
              <h3 style="font-size: 1.25rem; font-weight: 800;">${patient.name}</h3>
              <span class="badge badge-danger">Blood: ${patient.bloodGroup}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
              ${patient.age} yrs • ${patient.gender} • Phone: ${patient.phone} • Allergies: <strong style="color: var(--rose);">${patient.allergies || 'None'}</strong>
            </p>
          </div>
          <div class="flex items-center gap-2">
            ${apt ? `<button class="btn btn-sm btn-primary" onclick="EMRModule.setConsultationStatus('${apt.id}', 'In Consultation')">Call into Chamber</button>` : ''}
            ${apt ? `<button class="btn btn-sm btn-secondary" onclick="EMRModule.setConsultationStatus('${apt.id}', 'Completed')">Mark Completed</button>` : ''}
          </div>
        </div>
      `;
    }

    // Prefill Complaints if available
    const complaintsInput = document.getElementById('emr-complaints');
    if (complaintsInput && apt) {
      complaintsInput.value = apt.chiefComplaint || '';
    }

    // Clear previous medicines composer
    this.prescribedMeds = [];
    this.renderPrescribedMedsTable();

    window.App.showToast(`Loaded ${patient.name} into Clinical Desk`, 'info');
  },

  setConsultationStatus(aptId, status) {
    window.HospitalDB.updateAppointmentStatus(aptId, status);
    this.renderOPDAppointmentList();
    window.App.showToast(`Appointment status updated to ${status}`, 'success');
  },

  calculateBMI() {
    const h = parseFloat(document.getElementById('emr-vital-height')?.value) || 0;
    const w = parseFloat(document.getElementById('emr-vital-weight')?.value) || 0;
    const bmiDisplay = document.getElementById('emr-vital-bmi');
    if (!bmiDisplay) return;

    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const bmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
      let cat = 'Normal';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
      else if (bmi >= 30) cat = 'Obese';

      bmiDisplay.value = `${bmi} (${cat})`;
    } else {
      bmiDisplay.value = '';
    }
  },

  renderMedicineOptions() {
    const datalist = document.getElementById('pharmacy-med-datalist');
    if (!datalist) return;

    const meds = window.HospitalDB.state.pharmacy;
    datalist.innerHTML = meds.map(m => `<option value="${m.name}">${m.category} (Stock: ${m.stock})</option>`).join('');
  },

  addMedicineToRx() {
    const medName = document.getElementById('rx-med-name')?.value.trim();
    const dosage = document.getElementById('rx-med-dosage')?.value;
    const timing = document.getElementById('rx-med-timing')?.value;
    const duration = document.getElementById('rx-med-duration')?.value.trim();
    const instruction = document.getElementById('rx-med-instruction')?.value.trim();

    if (!medName) {
      window.App.showToast('Please specify medicine name.', 'warning');
      return;
    }

    this.prescribedMeds.push({
      name: medName,
      dosage: `${dosage} (${timing})`,
      duration: duration || '5 Days',
      instruction: instruction || 'As directed by physician'
    });

    // Reset input
    document.getElementById('rx-med-name').value = '';
    this.renderPrescribedMedsTable();
  },

  removeMedicineFromRx(index) {
    this.prescribedMeds.splice(index, 1);
    this.renderPrescribedMedsTable();
  },

  renderPrescribedMedsTable() {
    const container = document.getElementById('emr-rx-table-body');
    if (!container) return;

    if (this.prescribedMeds.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 1.5rem;">No medicines added yet. Select a medicine and click "+ Add to Rx".</td></tr>`;
      return;
    }

    container.innerHTML = this.prescribedMeds.map((m, idx) => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td><span class="badge badge-primary">${m.dosage}</span></td>
        <td>${m.duration}</td>
        <td><span style="font-size: 0.8rem; color: var(--text-muted);">${m.instruction}</span></td>
        <td>
          <button class="btn btn-sm btn-danger btn-icon" onclick="EMRModule.removeMedicineFromRx(${idx})" title="Remove">✕</button>
        </td>
      </tr>
    `).join('');
  },

  savePrescription() {
    if (!this.currentPatient) {
      window.App.showToast('Please select a patient from the queue first.', 'warning');
      return;
    }

    const docSelect = document.getElementById('emr-active-doctor');
    const doctorId = docSelect ? docSelect.value : 'DOC-101';
    const doctor = window.HospitalDB.state.doctors.find(d => d.id === doctorId) || window.HospitalDB.state.doctors[0];

    const diagnosis = document.getElementById('emr-diagnosis')?.value.trim();
    const complaints = document.getElementById('emr-complaints')?.value.trim();
    const advice = document.getElementById('emr-advice')?.value.trim();
    const investigations = document.getElementById('emr-investigations')?.value.trim();

    if (!diagnosis) {
      window.App.showToast('Please enter clinical diagnosis.', 'warning');
      return;
    }

    const vitals = {
      bp: document.getElementById('emr-vital-bp')?.value.trim() || '120/80 mmHg',
      pulse: document.getElementById('emr-vital-pulse')?.value.trim() || '72 bpm',
      spo2: document.getElementById('emr-vital-spo2')?.value.trim() || '99%',
      temp: document.getElementById('emr-vital-temp')?.value.trim() || '98.6 °F',
      weight: document.getElementById('emr-vital-weight')?.value.trim() ? `${document.getElementById('emr-vital-weight').value} kg` : '--',
      bmi: document.getElementById('emr-vital-bmi')?.value || '--'
    };

    const newRx = window.HospitalDB.savePrescription({
      uhid: this.currentPatient.uhid,
      patientName: this.currentPatient.name,
      patientAge: this.currentPatient.age,
      patientGender: this.currentPatient.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorRegNo: "MCI-" + Math.floor(10000 + Math.random() * 90000) + "-REG",
      vitals,
      diagnosis,
      complaints: complaints || "None recorded",
      medicines: this.prescribedMeds.length > 0 ? this.prescribedMeds : [{ name: "Tab. Paracetamol 650mg", dosage: "1 - 0 - 1 (After food)", duration: "3 Days", instruction: "For fever/pain as needed" }],
      investigationsOrdered: investigations ? investigations.split(',').map(s => s.trim()) : [],
      advice: advice || "Adequate rest, hydration, and review if symptoms persist."
    });

    window.App.showToast(`Prescription #${newRx.id} saved successfully!`, 'success');
    this.previewPrescription(newRx.id);
  },

  previewPrescription(rxId) {
    const rx = window.HospitalDB.state.prescriptions.find(r => r.id === rxId);
    if (!rx) return;
    const hosp = window.HospitalDB.state.hospital;

    const modalBody = document.getElementById('print-modal-content');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="print-document-sheet">
        <div class="letterhead-header">
          <div>
            <div class="hospital-print-name">${hosp.name}</div>
            <div class="hospital-print-meta">${hosp.address}</div>
            <div class="hospital-print-meta">Phone: ${hosp.phone} • Emergency: ${hosp.emergencyPhone}</div>
            <div class="hospital-print-meta" style="color: #0284c7; font-weight: 700;">Accreditation: ${hosp.registrationNo} (${hosp.nabhStatus})</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a;">${rx.doctorName}</div>
            <div style="font-size: 0.825rem; color: #0284c7; font-weight: 600;">${rx.doctorSpecialty}</div>
            <div style="font-size: 0.75rem; color: #64748b;">Reg No: ${rx.doctorRegNo}</div>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem;">Date: <strong>${rx.date}</strong></div>
          </div>
        </div>

        <div class="patient-info-banner">
          <div class="patient-info-item">
            <strong>Patient Name</strong>
            <span>${rx.patientName}</span>
          </div>
          <div class="patient-info-item">
            <strong>UHID</strong>
            <span style="color: #0284c7; font-weight: 700;">${rx.uhid}</span>
          </div>
          <div class="patient-info-item">
            <strong>Age / Gender</strong>
            <span>${rx.patientAge} Yrs / ${rx.patientGender}</span>
          </div>
          <div class="patient-info-item">
            <strong>Vitals (BP/SpO2)</strong>
            <span>${rx.vitals.bp} • ${rx.vitals.spo2}</span>
          </div>
        </div>

        <div style="margin-bottom: 1.25rem; font-size: 0.875rem;">
          <div><strong>Chief Complaints:</strong> ${rx.complaints}</div>
          <div style="margin-top: 0.35rem;"><strong>Clinical Diagnosis:</strong> <span style="color: #0369a1; font-weight: 700;">${rx.diagnosis}</span></div>
        </div>

        <div class="rx-symbol">℞</div>

        <table class="print-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Medication & Strength</th>
              <th>Dosage Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${rx.medicines.map((m, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${m.name}</strong></td>
                <td>${m.dosage}</td>
                <td>${m.duration}</td>
                <td>${m.instruction}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${rx.investigationsOrdered && rx.investigationsOrdered.length > 0 ? `
          <div style="margin-top: 1rem; font-size: 0.85rem; padding: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <strong>Lab / Diagnostic Investigations Advised:</strong>
            <ul style="margin: 0.35rem 0 0 1.25rem; padding: 0;">
              ${rx.investigationsOrdered.map(inv => `<li>${inv}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div style="margin-top: 1.25rem; font-size: 0.85rem;">
          <strong>Dietary & General Advice:</strong>
          <p style="margin-top: 0.25rem; color: #475569;">${rx.advice}</p>
        </div>

        <div class="doctor-sign-block">
          <div class="qr-code-placeholder">
            <span>[ QR SCAN ]</span>
            <span>Rx Verified</span>
          </div>
          <div class="signature-line">
            <div style="color: #64748b; font-style: italic; margin-bottom: 0.5rem;">Electronically signed by</div>
            <div class="signature-name">${rx.doctorName}</div>
            <div style="font-size: 0.75rem; color: #64748b;">${rx.doctorSpecialty}</div>
          </div>
        </div>
      </div>
    `;

    window.App.openModal('print-modal');
  },

  bindEvents() {
    const docFilter = document.getElementById('emr-doctor-filter');
    if (docFilter) {
      docFilter.addEventListener('change', () => this.renderOPDAppointmentList());
    }

    const heightInput = document.getElementById('emr-vital-height');
    const weightInput = document.getElementById('emr-vital-weight');
    if (heightInput && weightInput) {
      heightInput.addEventListener('input', () => this.calculateBMI());
      weightInput.addEventListener('input', () => this.calculateBMI());
    }

    const addMedBtn = document.getElementById('rx-add-med-btn');
    if (addMedBtn) {
      addMedBtn.addEventListener('click', () => this.addMedicineToRx());
    }

    const saveRxBtn = document.getElementById('emr-save-rx-btn');
    if (saveRxBtn) {
      saveRxBtn.addEventListener('click', () => this.savePrescription());
    }
  }
};

window.EMRModule = EMRModule;
