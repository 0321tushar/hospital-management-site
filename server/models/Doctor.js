import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  qualifications: { type: String, required: true },
  departmentId: { type: String, required: true },
  departmentName: { type: String, default: '' },
  specialty: { type: String, required: true },
  experience: { type: String, required: true },
  opdRoom: { type: String, required: true },
  fee: { type: Number, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 150 },
  schedule: { type: String, default: 'Mon - Sat (09:00 AM - 02:00 PM)' },
  availableSlots: [{ type: String }],
  avatarText: { type: String, default: 'DR' },
  imageBg: { type: String, default: 'linear-gradient(135deg, #0284c7, #0369a1)' }
}, { timestamps: true });

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);
