import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Hospital } from './models/Hospital.js';
import { Doctor } from './models/Doctor.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { Bed } from './models/Bed.js';
import { Prescription } from './models/Prescription.js';
import { Medicine } from './models/Medicine.js';
import { LabReport } from './models/Diagnostic.js';
import { Invoice } from './models/Invoice.js';
import { StaffUser } from './models/StaffUser.js';
import { seedHospitalData } from './seeder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory dataset fallback store if local MongoDB is offline
let memoryStore = JSON.parse(JSON.stringify(seedHospitalData));
let isMongoLive = false;

// Auto-seed MongoDB on initial successful connection
const autoSeedIfEmpty = async () => {
  try {
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      console.log('[MongoDB Auto-Seed]: Populating initial healthcare records...');
      await Hospital.create(seedHospitalData.hospital);
      await Doctor.insertMany(seedHospitalData.doctors);
      await Patient.insertMany(seedHospitalData.patients);
      await Bed.insertMany(seedHospitalData.beds);
      await Medicine.insertMany(seedHospitalData.medicines);
      await Appointment.insertMany(seedHospitalData.appointments);
      if (seedHospitalData.staffUsers) {
        await StaffUser.insertMany(seedHospitalData.staffUsers);
      }
      console.log('[MongoDB Auto-Seed]: Finished seeding initial documents!');
    }
  } catch (err) {
    console.warn('[MongoDB Auto-Seed Warning]:', err.message);
  }
};

// Connect to MongoDB
connectDB().then(async connected => {
  isMongoLive = connected;
  if (connected) {
    await autoSeedIfEmpty();
  }
});

// --- API Routes ---

// Health & Database Status Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PulseAura MERN Hospital Management API',
    database: isMongoLive ? 'MongoDB Active' : 'In-Memory / Local Seed Mode',
    mongoUri: process.env.MONGO_URI ? 'Configured' : 'mongodb://127.0.0.1:27017/hospital_management',
    timestamp: new Date().toISOString()
  });
});

// 1. Hospital Profile & Settings
app.get('/api/hospital', async (req, res) => {
  try {
    if (isMongoLive) {
      let hosp = await Hospital.findOne();
      if (!hosp) hosp = await Hospital.create(seedHospitalData.hospital);
      return res.json(hosp);
    }
    res.json(memoryStore.hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hospital', async (req, res) => {
  try {
    if (isMongoLive) {
      const updated = await Hospital.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      return res.json(updated);
    }
    memoryStore.hospital = { ...memoryStore.hospital, ...req.body };
    res.json(memoryStore.hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Doctors Directory
app.get('/api/doctors', async (req, res) => {
  try {
    const { departmentId } = req.query;
    if (isMongoLive) {
      const filter = departmentId ? { departmentId } : {};
      const docs = await Doctor.find(filter);
      return res.json(docs);
    }
    let docs = memoryStore.doctors;
    if (departmentId) docs = docs.filter(d => d.departmentId === departmentId);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/doctors/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const doc = await Doctor.findOne({ id: req.params.id });
      if (!doc) return res.status(404).json({ error: 'Doctor not found' });
      return res.json(doc);
    }
    const doc = memoryStore.doctors.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { name, specialty, opdRoom, fee } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: 'Doctor name and specialty are required' });
    }
    const count = isMongoLive ? await Doctor.countDocuments() : memoryStore.doctors.length;
    const id = req.body.id || `DOC-${101 + count}`;
    const initials = name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
    const newDoc = {
      id,
      name,
      qualifications: req.body.qualifications || 'MBBS, MD',
      departmentId: req.body.departmentId || 'general',
      departmentName: req.body.departmentName || specialty,
      specialty,
      experience: req.body.experience || '8+ Years',
      opdRoom: opdRoom || 'Room 101',
      fee: Number(fee) || 800,
      rating: 4.8,
      reviewsCount: 120,
      schedule: req.body.schedule || 'Mon - Sat (09:00 AM - 02:00 PM)',
      availableSlots: req.body.availableSlots || ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM'],
      avatarText: initials,
      imageBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
      ...req.body
    };

    if (isMongoLive) {
      const created = await Doctor.create(newDoc);
      return res.status(201).json(created);
    }
    memoryStore.doctors.push(newDoc);
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/doctors/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const deleted = await Doctor.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Doctor not found' });
      return res.json({ message: 'Doctor deleted successfully', id: req.params.id });
    }
    const initialLen = memoryStore.doctors.length;
    memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== req.params.id);
    if (memoryStore.doctors.length === initialLen) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Patients (Registration & UHID)
app.get('/api/patients', async (req, res) => {
  try {
    if (isMongoLive) {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return res.json(patients);
    }
    res.json(memoryStore.patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    if (isMongoLive) {
      const patient = await Patient.findOne({
        $or: [
          { uhid: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } }
        ]
      });
      return res.json(patient || null);
    }

    const query = q.toLowerCase();
    const found = memoryStore.patients.find(p =>
      p.uhid.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.name.toLowerCase().includes(query)
    );
    res.json(found || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required fields' });
    }

    const count = isMongoLive ? await Patient.countDocuments() : memoryStore.patients.length;
    const uhid = `PA-2026-${(count + 1).toString().padStart(4, '0')}`;
    const newPatient = { uhid, ...req.body };

    if (isMongoLive) {
      const created = await Patient.create(newPatient);
      return res.status(201).json(created);
    }

    memoryStore.patients.unshift(newPatient);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/patients/:uhid', async (req, res) => {
  try {
    if (isMongoLive) {
      const deleted = await Patient.findOneAndDelete({ uhid: req.params.uhid });
      if (!deleted) return res.status(404).json({ error: 'Patient not found' });
      return res.json({ message: 'Patient record deleted', uhid: req.params.uhid });
    }
    const initialLen = memoryStore.patients.length;
    memoryStore.patients = memoryStore.patients.filter(p => p.uhid !== req.params.uhid);
    if (memoryStore.patients.length === initialLen) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient record deleted', uhid: req.params.uhid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Appointments & Live Token Queue
app.get('/api/appointments', async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (isMongoLive) {
      const filter = doctorId && doctorId !== 'ALL' ? { doctorId } : {};
      const apts = await Appointment.find(filter).sort({ createdAt: -1 });
      return res.json(apts);
    }
    let apts = memoryStore.appointments || [];
    if (doctorId && doctorId !== 'ALL') {
      apts = apts.filter(a => a.doctorId === doctorId);
    }
    res.json(apts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { uhid, doctorId, timeSlot } = req.body;
    if (!uhid || !doctorId || !timeSlot) {
      return res.status(400).json({ error: 'UHID, doctorId and timeSlot are required' });
    }

    const count = isMongoLive ? await Appointment.countDocuments() : (memoryStore.appointments?.length || 0);
    const tokenNumber = `TK-${(count + 1).toString().padStart(2, '0')}`;
    const id = `APT-${Math.floor(100 + Math.random() * 900)}`;

    const newApt = { id, tokenNumber, ...req.body, status: 'Waiting' };

    if (isMongoLive) {
      const created = await Appointment.create(newApt);
      return res.status(201).json(created);
    }

    if (!memoryStore.appointments) memoryStore.appointments = [];
    memoryStore.appointments.unshift(newApt);
    res.status(201).json(newApt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    if (isMongoLive) {
      const updated = await Appointment.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Appointment not found' });
      return res.json(updated);
    }

    const apt = memoryStore.appointments?.find(a => a.id === req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    apt.status = status;
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const deleted = await Appointment.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
      return res.json({ message: 'Appointment cancelled and deleted', id: req.params.id });
    }
    const initialLen = (memoryStore.appointments || []).length;
    memoryStore.appointments = (memoryStore.appointments || []).filter(a => a.id !== req.params.id);
    if ((memoryStore.appointments || []).length === initialLen) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled and deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Inpatient Beds (IPD)
app.get('/api/beds', async (req, res) => {
  try {
    if (isMongoLive) {
      const beds = await Bed.find();
      return res.json(beds);
    }
    res.json(memoryStore.beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/beds/:id/admit', async (req, res) => {
  try {
    const { uhid, patientName, doctorName, diagnosis } = req.body;
    const update = {
      status: 'Occupied',
      patientUhid: uhid,
      patientName,
      doctorName: doctorName || 'Staff Physician',
      diagnosis: diagnosis || 'Observation',
      admittedOn: new Date().toISOString().split('T')[0]
    };

    if (isMongoLive) {
      const updated = await Bed.findOneAndUpdate({ id: req.params.id }, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Bed not found' });
      return res.json(updated);
    }

    const bed = memoryStore.beds.find(b => b.id === req.params.id);
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    Object.assign(bed, update);
    res.json(bed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/beds/:id/discharge', async (req, res) => {
  try {
    const update = {
      status: 'Cleaning',
      patientUhid: null,
      patientName: null,
      doctorName: null,
      diagnosis: null,
      admittedOn: null
    };

    if (isMongoLive) {
      const updated = await Bed.findOneAndUpdate({ id: req.params.id }, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Bed not found' });
      return res.json(updated);
    }

    const bed = memoryStore.beds.find(b => b.id === req.params.id);
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    Object.assign(bed, update);
    res.json(bed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Prescriptions (EMR)
app.get('/api/prescriptions', async (req, res) => {
  try {
    const { uhid } = req.query;
    if (isMongoLive) {
      const filter = uhid ? { uhid } : {};
      const rx = await Prescription.find(filter).sort({ createdAt: -1 });
      return res.json(rx);
    }
    let list = memoryStore.prescriptions || [];
    if (uhid) list = list.filter(r => r.uhid === uhid);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prescriptions', async (req, res) => {
  try {
    const { uhid, diagnosis } = req.body;
    if (!uhid || !diagnosis) {
      return res.status(400).json({ error: 'UHID and diagnosis are required' });
    }

    const id = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx = { id, date: new Date().toISOString().split('T')[0], ...req.body };

    if (isMongoLive) {
      const created = await Prescription.create(newRx);
      return res.status(201).json(created);
    }

    if (!memoryStore.prescriptions) memoryStore.prescriptions = [];
    memoryStore.prescriptions.unshift(newRx);
    res.status(201).json(newRx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prescriptions/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const deleted = await Prescription.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Prescription not found' });
      return res.json({ message: 'Prescription deleted', id: req.params.id });
    }
    const initialLen = (memoryStore.prescriptions || []).length;
    memoryStore.prescriptions = (memoryStore.prescriptions || []).filter(r => r.id !== req.params.id);
    if ((memoryStore.prescriptions || []).length === initialLen) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Pharmacy Inventory
app.get('/api/pharmacy', async (req, res) => {
  try {
    if (isMongoLive) {
      const meds = await Medicine.find();
      return res.json(meds);
    }
    res.json(memoryStore.medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pharmacy', async (req, res) => {
  try {
    const { name, category, stock, unitPrice } = req.body;
    if (!name) return res.status(400).json({ error: 'Medicine name is required' });
    const count = isMongoLive ? await Medicine.countDocuments() : memoryStore.medicines.length;
    const id = req.body.id || `MED-${(count + 1).toString().padStart(2, '0')}`;
    const newMed = {
      id,
      name,
      category: category || 'General Medicine',
      batch: req.body.batch || `BT-${Math.floor(2000 + Math.random() * 900)}`,
      expiry: req.body.expiry || '2028-06',
      stock: Number(stock) || 100,
      minStock: Number(req.body.minStock) || 50,
      unitPrice: Number(unitPrice) || 50,
      unit: req.body.unit || 'Strip of 10'
    };

    if (isMongoLive) {
      const created = await Medicine.create(newMed);
      return res.status(201).json(created);
    }
    memoryStore.medicines.push(newMed);
    res.status(201).json(newMed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pharmacy/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const deleted = await Medicine.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Medicine not found' });
      return res.json({ message: 'Medicine item deleted', id: req.params.id });
    }
    const initialLen = memoryStore.medicines.length;
    memoryStore.medicines = memoryStore.medicines.filter(m => m.id !== req.params.id);
    if (memoryStore.medicines.length === initialLen) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json({ message: 'Medicine item deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Invoices & Billing
app.get('/api/invoices', async (req, res) => {
  try {
    const { uhid } = req.query;
    if (isMongoLive) {
      const filter = uhid ? { uhid } : {};
      const invs = await Invoice.find(filter).sort({ createdAt: -1 });
      return res.json(invs);
    }
    let list = memoryStore.invoices || [];
    if (uhid) list = list.filter(i => i.uhid === uhid);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { uhid, totalAmount } = req.body;
    if (!uhid || totalAmount === undefined) {
      return res.status(400).json({ error: 'UHID and totalAmount are required' });
    }

    const id = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = { id, date: new Date().toISOString().split('T')[0], status: 'Settled', ...req.body };

    if (isMongoLive) {
      const created = await Invoice.create(newInv);
      return res.status(201).json(created);
    }

    if (!memoryStore.invoices) memoryStore.invoices = [];
    memoryStore.invoices.unshift(newInv);
    res.status(201).json(newInv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Staff & Account Management (Admin Access Control)
app.get('/api/staff-users', async (req, res) => {
  try {
    if (isMongoLive) {
      const users = await StaffUser.find().sort({ createdAt: -1 });
      return res.json(users);
    }
    res.json(memoryStore.staffUsers || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff-users', async (req, res) => {
  try {
    const { name, role, username, pin } = req.body;
    if (!name || !username || !pin) {
      return res.status(400).json({ error: 'Name, username and 4-digit PIN are required' });
    }

    const count = isMongoLive ? await StaffUser.countDocuments() : (memoryStore.staffUsers?.length || 0);
    const prefix = role === 'Admin' ? 'ADM' : (role === 'Doctor' ? 'DOC' : 'STF');
    const id = req.body.id || `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    const newUser = {
      id,
      name,
      username: username.toLowerCase().trim(),
      role: role || 'Doctor',
      pin: String(pin),
      doctorId: req.body.doctorId || (role === 'Doctor' ? id : null),
      department: req.body.department || (role === 'Admin' ? 'Administration' : 'Clinical'),
      opdRoom: req.body.opdRoom || (role === 'Doctor' ? 'Room 101' : 'Admin Suite'),
      phone: req.body.phone || '+91 98765-43210',
      email: req.body.email || `${username.toLowerCase()}@pulseaura.org`,
      status: req.body.status || 'Active'
    };

    // If role is Doctor, also automatically create doctor in doctors roster!
    if (role === 'Doctor') {
      const docExists = isMongoLive
        ? await Doctor.findOne({ id: newUser.doctorId })
        : memoryStore.doctors.some(d => d.id === newUser.doctorId);

      if (!docExists) {
        const initials = name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
        const docRecord = {
          id: newUser.doctorId,
          name,
          qualifications: req.body.qualifications || 'MBBS, MD',
          departmentId: req.body.departmentId || 'general',
          departmentName: req.body.department || 'General Medicine',
          specialty: req.body.specialty || req.body.department || 'Consultant Specialist',
          experience: req.body.experience || '10+ Years',
          opdRoom: newUser.opdRoom,
          fee: Number(req.body.fee) || 800,
          rating: 4.9,
          reviewsCount: 150,
          schedule: 'Mon - Sat (09:00 AM - 02:00 PM)',
          availableSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '01:30 PM'],
          avatarText: initials,
          imageBg: 'linear-gradient(135deg, #0284c7, #0369a1)'
        };
        if (isMongoLive) {
          await Doctor.create(docRecord);
        } else {
          memoryStore.doctors.push(docRecord);
        }
      }
    }

    if (isMongoLive) {
      const created = await StaffUser.create(newUser);
      return res.status(201).json(created);
    }

    if (!memoryStore.staffUsers) memoryStore.staffUsers = [];
    memoryStore.staffUsers.unshift(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff-users/:id', async (req, res) => {
  try {
    if (isMongoLive) {
      const user = await StaffUser.findOne({ id: req.params.id });
      if (!user) return res.status(404).json({ error: 'Account not found' });
      if (user.doctorId) {
        await Doctor.findOneAndDelete({ id: user.doctorId });
      }
      await StaffUser.findOneAndDelete({ id: req.params.id });
      return res.json({ message: 'Account deleted successfully', id: req.params.id });
    }

    const user = (memoryStore.staffUsers || []).find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.doctorId) {
      memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== user.doctorId);
    }
    memoryStore.staffUsers = (memoryStore.staffUsers || []).filter(u => u.id !== req.params.id);
    res.json({ message: 'Account deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Staff Authentication & PIN Verification
app.post('/api/staff-auth', async (req, res) => {
  try {
    const { pin, role, doctorId, username } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN is required' });

    let user = null;
    if (isMongoLive) {
      if (username) {
        user = await StaffUser.findOne({ username: username.toLowerCase().trim(), pin: String(pin) });
      } else if (role === 'Doctor' && doctorId) {
        user = await StaffUser.findOne({ doctorId, pin: String(pin) });
      } else if (role === 'Admin') {
        user = await StaffUser.findOne({ role: 'Admin', pin: String(pin) });
      }
    } else {
      const users = memoryStore.staffUsers || [];
      if (username) {
        user = users.find(u => u.username === username.toLowerCase().trim() && String(u.pin) === String(pin));
      } else if (role === 'Doctor' && doctorId) {
        user = users.find(u => u.doctorId === doctorId && String(u.pin) === String(pin));
      } else if (role === 'Admin') {
        user = users.find(u => u.role === 'Admin' && String(u.pin) === String(pin));
      }
    }

    // Default emergency master fallback PIN: '1234'
    if (!user && pin === '1234') {
      if (role === 'Admin') {
        user = {
          id: 'ADM-001',
          name: 'Hospital Super Administrator',
          role: 'Admin',
          doctorId: 'ALL',
          department: 'Executive Hospital Management',
          opdRoom: 'Admin Suite'
        };
      } else {
        const doc = (isMongoLive ? await Doctor.findOne({ id: doctorId }) : memoryStore.doctors.find(d => d.id === doctorId)) || memoryStore.doctors[0];
        user = {
          id: doc?.id || 'DOC-101',
          name: doc?.name || 'Dr. Arvind Mehta',
          role: 'Doctor',
          doctorId: doc?.id || 'DOC-101',
          department: doc?.departmentName || doc?.specialty || 'Cardiology',
          opdRoom: doc?.opdRoom || 'Room 102'
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN or unauthorized credentials' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        doctorId: user.doctorId || (user.role === 'Doctor' ? user.id : 'ALL'),
        doctorName: user.name,
        department: user.department,
        opdRoom: user.opdRoom,
        authenticatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Central 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Exception]:', err.stack || err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[PulseAura MERN Server] Running on http://localhost:${PORT}`);
  console.log(`[Database Status]: ${isMongoLive ? 'Connected to MongoDB' : 'In-Memory / Auto-Seed Mode'}`);
  console.log(`======================================================\n`);
});
