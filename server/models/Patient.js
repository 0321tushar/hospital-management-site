import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  uhid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  bloodGroup: { type: String, required: true },
  address: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  allergies: { type: String, default: 'None declared' },
  chronicConditions: [{ type: String }],
  registrationDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
