import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  floor: { type: String, required: true },
  type: { type: String, default: 'Standard' },
  rate: { type: Number, required: true },
  status: { type: String, default: 'Available', enum: ['Available', 'Occupied', 'Cleaning', 'Reserved'] },
  patientUhid: { type: String, default: null },
  patientName: { type: String, default: null },
  doctorName: { type: String, default: null },
  admittedOn: { type: String, default: null },
  diagnosis: { type: String, default: null }
}, { timestamps: true });

export const Bed = mongoose.models.Bed || mongoose.model('Bed', bedSchema);
