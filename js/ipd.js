/**
 * PulseAura Health OS - Inpatient (IPD) & Visual Bed Board
 * Zero External APIs. Real-time visual ward occupancy matrix.
 */

const IPDModule = {
  activeBedId: null,

  init() {
    this.renderBedMatrix();
    this.renderBedStats();

    window.HospitalDB.subscribe(() => {
      this.renderBedMatrix();
      this.renderBedStats();
    });
  },

  renderBedStats() {
    const beds = window.HospitalDB.state.beds;
    const total = beds.length;
    const occupied = beds.filter(b => b.status === 'Occupied').length;
    const available = beds.filter(b => b.status === 'Available').length;
    const cleaning = beds.filter(b => b.status === 'Cleaning' || b.status === 'Reserved').length;
    const occupancyRate = ((occupied / total) * 100).toFixed(1);

    const statsContainer = document.getElementById('ipd-stats-summary-bar');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="metrics-row" style="margin-bottom: 1.5rem;">
          <div class="metric-card">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">TOTAL BEDS</span>
              <div class="metric-number">${total}</div>
            </div>
            <div class="metric-icon-box" style="background-color: var(--primary-light); color: var(--primary);">🛏️</div>
          </div>
          <div class="metric-card">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">AVAILABLE BEDS</span>
              <div class="metric-number" style="color: var(--emerald);">${available}</div>
            </div>
            <div class="metric-icon-box" style="background-color: var(--emerald-light); color: var(--emerald);">✓</div>
          </div>
          <div class="metric-card">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">OCCUPIED BEDS</span>
              <div class="metric-number" style="color: var(--rose);">${occupied}</div>
            </div>
            <div class="metric-icon-box" style="background-color: var(--rose-light); color: var(--rose);">👥</div>
          </div>
          <div class="metric-card">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">BED OCCUPANCY RATE</span>
              <div class="metric-number" style="color: var(--accent);">${occupancyRate}%</div>
            </div>
            <div class="metric-icon-box" style="background-color: var(--accent-light); color: var(--accent);">📊</div>
          </div>
        </div>
      `;
    }
  },

  renderBedMatrix() {
    const container = document.getElementById('ipd-wards-matrix-container');
    if (!container) return;

    const beds = window.HospitalDB.state.beds;
    const curr = window.HospitalDB.state.hospital.currency;

    // Group beds by ward
    const wards = {};
    beds.forEach(bed => {
      if (!wards[bed.ward]) {
        wards[bed.ward] = [];
      }
      wards[bed.ward].push(bed);
    });

    container.innerHTML = Object.keys(wards).map(wardName => {
      const wardBeds = wards[wardName];
      const wardOccupied = wardBeds.filter(b => b.status === 'Occupied').length;

      return `
        <div class="ward-block">
          <div class="ward-header">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700;">${wardName}</h3>
              <p style="font-size: 0.8rem; color: var(--text-muted);">${wardBeds[0].floor} • Tariff: ${curr}${wardBeds[0].rate}/day</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${wardOccupied === wardBeds.length ? 'badge-danger' : 'badge-primary'}">
                ${wardOccupied}/${wardBeds.length} Occupied
              </span>
            </div>
          </div>

          <div class="beds-grid">
            ${wardBeds.map(bed => `
              <div class="bed-tile status-${bed.status.toLowerCase()}" onclick="IPDModule.handleBedClick('${bed.id}')">
                <div class="flex items-center justify-between">
                  <span class="bed-number">${bed.id}</span>
                  <span class="badge ${bed.status === 'Occupied' ? 'badge-danger' : (bed.status === 'Available' ? 'badge-success' : 'badge-warning')}" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">
                    ${bed.status}
                  </span>
                </div>
                ${bed.status === 'Occupied' ? `
                  <div class="bed-patient-name" title="${bed.patientName}">👤 ${bed.patientName}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Admitted: ${bed.admittedOn}</div>
                  <div style="font-size: 0.72rem; color: var(--primary); font-weight: 600;">${bed.doctorName}</div>
                ` : `
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.4rem;">
                    ${bed.status === 'Cleaning' ? '🧹 Sanitizing in progress' : (bed.status === 'Reserved' ? '🔒 Reserved' : '✨ Ready for Admission')}
                  </div>
                `}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  handleBedClick(bedId) {
    const bed = window.HospitalDB.state.beds.find(b => b.id === bedId);
    if (!bed) return;

    this.activeBedId = bedId;
    const curr = window.HospitalDB.state.hospital.currency;

    const modalBody = document.getElementById('bed-details-modal-content');
    if (!modalBody) return;

    if (bed.status === 'Available') {
      const patients = window.HospitalDB.state.patients;
      const docs = window.HospitalDB.state.doctors;

      modalBody.innerHTML = `
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.25rem;">Admit Patient to ${bed.id}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">${bed.ward} (${bed.floor}) • Daily Tariff: ${curr}${bed.rate}/day</p>

          <form id="bed-admit-form" onsubmit="IPDModule.submitAdmission(event)">
            <div class="form-group">
              <label class="form-label">Select Patient</label>
              <select id="admit-patient-select" class="form-control" required>
                <option value="">-- Choose Registered Patient --</option>
                ${patients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid} - ${p.bloodGroup})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Attending Doctor</label>
              <select id="admit-doctor-select" class="form-control" required>
                <option value="">-- Choose Attending Consultant --</option>
                ${docs.map(d => `<option value="${d.name}">${d.name} (${d.specialty})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Admission Diagnosis / Reason</label>
              <input type="text" id="admit-diagnosis" class="form-control" placeholder="e.g. Acute appendicitis, Pneumonia, Post-operative observation" required />
            </div>

            <div class="flex items-center justify-end gap-3" style="margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="window.App.closeModal('bed-details-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary">Confirm Admission</button>
            </div>
          </form>
        </div>
      `;
    } else if (bed.status === 'Occupied') {
      modalBody.innerHTML = `
        <div>
          <div class="flex items-center justify-between" style="margin-bottom: 1rem;">
            <div>
              <span class="badge badge-danger">Occupied</span>
              <h3 style="font-size: 1.35rem; font-weight: 800; margin-top: 0.35rem;">${bed.patientName}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${bed.id} • ${bed.ward}</p>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${curr}${bed.rate}<span style="font-size: 0.75rem; color: var(--text-muted);">/day</span></div>
          </div>

          <div style="background-color: var(--bg-muted); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; font-size: 0.875rem;">
            <div style="margin-bottom: 0.5rem;"><strong>UHID:</strong> <span class="badge badge-neutral">${bed.patientUhid}</span></div>
            <div style="margin-bottom: 0.5rem;"><strong>Admitted On:</strong> ${bed.admittedOn}</div>
            <div style="margin-bottom: 0.5rem;"><strong>Attending Physician:</strong> ${bed.doctorName}</div>
            <div><strong>Clinical Diagnosis:</strong> ${bed.diagnosis || 'Observation'}</div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <button class="btn btn-secondary" onclick="IPDModule.markCleaning('${bed.id}')">Sanitize / Cleaning</button>
            <button class="btn btn-danger" onclick="IPDModule.initiateDischarge('${bed.id}')">Discharge Patient & Generate Final Bill</button>
          </div>
        </div>
      `;
    } else {
      modalBody.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 0;">
          <h3 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem;">Bed ${bed.id} Status: ${bed.status}</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">Housekeeping is sanitizing this bed unit.</p>
          <button class="btn btn-primary" onclick="IPDModule.markAvailable('${bed.id}')">Mark Ready & Available</button>
        </div>
      `;
    }

    window.App.openModal('bed-details-modal');
  },

  submitAdmission(e) {
    e.preventDefault();
    const uhid = document.getElementById('admit-patient-select').value;
    const doctorName = document.getElementById('admit-doctor-select').value;
    const diagnosis = document.getElementById('admit-diagnosis').value;

    const patient = window.HospitalDB.findPatient(uhid);
    if (!patient) return;

    window.HospitalDB.admitPatientToBed(this.activeBedId, {
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName,
      diagnosis
    });

    window.App.closeModal('bed-details-modal');
    window.App.showToast(`Patient ${patient.name} admitted to ${this.activeBedId}`, 'success');
  },

  initiateDischarge(bedId) {
    const bed = window.HospitalDB.state.beds.find(b => b.id === bedId);
    if (!bed) return;

    const uhid = bed.patientUhid;
    const patientName = bed.patientName;
    const dailyRate = bed.rate;

    window.HospitalDB.dischargeBed(bedId);
    window.App.closeModal('bed-details-modal');

    // Automatically navigate to Billing Desk with pre-calculated IPD charges
    window.App.switchERPView('billing');
    window.BillingModule.prepareDischargeBill({
      uhid,
      patientName,
      bedId,
      ward: bed.ward,
      dailyRate,
      days: 3 // Estimated 3 days stay
    });

    window.App.showToast(`Discharged ${patientName} from ${bedId}. Final bill prepared.`, 'info');
  },

  markCleaning(bedId) {
    window.HospitalDB.updateBedStatus(bedId, { status: "Cleaning" });
    window.App.closeModal('bed-details-modal');
    window.App.showToast(`Bed ${bedId} marked for Housekeeping & Cleaning`, 'info');
  },

  markAvailable(bedId) {
    window.HospitalDB.updateBedStatus(bedId, { status: "Available" });
    window.App.closeModal('bed-details-modal');
    window.App.showToast(`Bed ${bedId} is now sanitized and available for admission!`, 'success');
  }
};

window.IPDModule = IPDModule;
