import mongoose from 'mongoose';

const staffUserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist'],
    default: 'Doctor'
  },
  pin: { type: String, required: true, default: '1234' },
  doctorId: { type: String, default: null },
  department: { type: String, default: 'Administration' },
  opdRoom: { type: String, default: 'Room 101' },
  phone: { type: String, default: '+91 98765-43210' },
  email: { type: String, default: 'staff@pulseaura.org' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export const StaffUser = mongoose.models.StaffUser || mongoose.model('StaffUser', staffUserSchema);
