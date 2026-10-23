/**
 * Automated Test Suite for Hospital Management MERN Backend API
 * Tests every endpoint: Health, Hospital, Doctors, Patients, Appointments, Beds, EMR, Pharmacy, Invoices.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('  RUNNING MERN HOSPITAL API VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health (API Health & DB status)', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ONLINE') throw new Error('Health check returned offline status');
  });

  // 2. Hospital info
  await test('GET /hospital (Hospital branding details)', async () => {
    const res = await fetch(`${BASE_URL}/hospital`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.name) throw new Error('Missing hospital name');
  });

  // 3. Doctors list
  await test('GET /doctors (Specialist consultants list)', async () => {
    const res = await fetch(`${BASE_URL}/doctors`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No doctors returned');
  });

  // 4. Patients list
  await test('GET /patients (Registered patient records)', async () => {
    const res = await fetch(`${BASE_URL}/patients`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Expected array of patients');
  });

  // 5. Patient Registration
  let testPatientUhid = '';
  await test('POST /patients (Register new patient with auto UHID)', async () => {
    const res = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Patient',
        age: 45,
        gender: 'Male',
        phone: '+91 99999-88888',
        bloodGroup: 'O+',
        allergies: 'None'
      })
    });
    if (res.status !== 201) throw new Error(`Expected HTTP 201, got ${res.status}`);
    const data = await res.json();
    if (!data.uhid || !data.uhid.startsWith('PA-2026-')) throw new Error('Failed to generate UHID');
    testPatientUhid = data.uhid;
  });

  // 6. Patient Search
  await test('GET /patients/search?q=... (Lookup patient by UHID)', async () => {
    const res = await fetch(`${BASE_URL}/patients/search?q=${testPatientUhid}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || data.uhid !== testPatientUhid) throw new Error('Searched patient mismatch');
  });

  // 7. Book Appointment
  let testAptId = '';
  await test('POST /appointments (Book appointment & issue Token)', async () => {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uhid: testPatientUhid,
        patientName: 'Automated Test Patient',
        patientPhone: '+91 99999-88888',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Arvind Mehta',
        department: 'Cardiology',
        opdRoom: 'Room 102',
        timeSlot: '11:15 AM',
        fee: 1000
      })
    });
    if (res.status !== 201) throw new Error(`Expected HTTP 201, got ${res.status}`);
    const data = await res.json();
    if (!data.tokenNumber) throw new Error('Token number not generated');
    testAptId = data.id;
  });

  // 8. Update Appointment Status
  await test('PATCH /appointments/:id/status (Change status to In Consultation)', async () => {
    const res = await fetch(`${BASE_URL}/appointments/${testAptId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'In Consultation' })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'In Consultation') throw new Error('Status not updated');
  });

  // 9. Beds List
  await test('GET /beds (Visual bed matrix list)', async () => {
    const res = await fetch(`${BASE_URL}/beds`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No beds found');
  });

  // 10. Bed Admission
  await test('POST /beds/:id/admit (Admit patient to bed)', async () => {
    const res = await fetch(`${BASE_URL}/beds/BED-GW-M02/admit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uhid: testPatientUhid,
        patientName: 'Automated Test Patient',
        doctorName: 'Dr. Arvind Mehta',
        diagnosis: 'Cardiology Observation'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'Occupied') throw new Error('Bed status not marked Occupied');
  });

  // 11. Prescriptions (EMR)
  await test('POST /prescriptions (Generate digital EMR prescription)', async () => {
    const res = await fetch(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uhid: testPatientUhid,
        patientName: 'Automated Test Patient',
        patientAge: 45,
        patientGender: 'Male',
        doctorId: 'DOC-101',
        doctorName: 'Dr. Arvind Mehta',
        doctorSpecialty: 'Cardiology',
        diagnosis: 'Hypertension Stage 1',
        medicines: [{ name: 'Tab. Amlodipine 5mg', dosage: '1-0-0', duration: '30 Days' }]
      })
    });
    if (res.status !== 201) throw new Error(`Expected HTTP 201, got ${res.status}`);
  });

  // 12. Pharmacy
  await test('GET /pharmacy (Medicine catalog & stock alerts)', async () => {
    const res = await fetch(`${BASE_URL}/pharmacy`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No pharmacy items found');
  });

  // 13. Invoices
  await test('POST /invoices (Generate hospital invoice & receipt)', async () => {
    const res = await fetch(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uhid: testPatientUhid,
        patientName: 'Automated Test Patient',
        category: 'OPD Consultation Bill',
        items: [{ description: 'Cardiology Consultation', qty: 1, rate: 1000, amount: 1000 }],
        subtotal: 1000,
        taxPercent: 5,
        taxAmount: 50,
        totalAmount: 1050,
        paidAmount: 1050,
        paymentMode: 'Cash'
      })
    });
    if (res.status !== 201) throw new Error(`Expected HTTP 201, got ${res.status}`);
  });

  console.log('\n======================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite();
