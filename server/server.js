import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { setMongoLive, getIsMongoLive } from './config/store.js';
import { seedHospitalData } from './seeder.js';
import { Hospital } from './models/Hospital.js';
import { Doctor } from './models/Doctor.js';
import { Patient } from './models/Patient.js';
import { Bed } from './models/Bed.js';
import { Medicine } from './models/Medicine.js';
import { Appointment } from './models/Appointment.js';
import { StaffUser } from './models/StaffUser.js';

// Modular Route Handlers (MVC)
import hospitalRoutes from './routes/hospitalRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import bedRoutes from './routes/bedRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import pharmacyRoutes from './routes/pharmacyRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Auto-seed MongoDB on initial successful connection if database is empty
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

// Connect to Database
connectDB().then(async (connected) => {
  setMongoLive(connected);
  if (connected) {
    await autoSeedIfEmpty();
  }
});

// Mount Modular API Routes
app.use('/api', hospitalRoutes); // /api/health, /api/hospital
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/beds', bedRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api', staffRoutes); // /api/staff-users, /api/staff-auth

// Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[PulseAura MERN Server] Running on http://localhost:${PORT}`);
  console.log(`[Database Status]: ${getIsMongoLive() ? 'Connected to MongoDB' : 'In-Memory / Auto-Seed Mode'}`);
  console.log(`[Architecture]: Modular MVC (Routes, Controllers & Models)`);
  console.log(`======================================================\n`);
});
