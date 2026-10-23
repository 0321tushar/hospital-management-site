import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  uhid: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String, default: '' },
  doctorRegNo: { type: String, default: 'MCI-REG-VALID' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  vitals: {
    bp: { type: String, default: '120/80 mmHg' },
    pulse: { type: String, default: '72 bpm' },
    spo2: { type: String, default: '98%' },
    temp: { type: String, default: '98.6 °F' },
    weight: { type: String, default: '--' },
    bmi: { type: String, default: '--' }
  },
  diagnosis: { type: String, required: true },
  complaints: { type: String, default: '' },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
    instruction: { type: String, default: '' }
  }],
  investigationsOrdered: [{ type: String }],
  advice: { type: String, default: '' }
}, { timestamps: true });

export const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
