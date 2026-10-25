import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Pre-save hook: Hash staff PIN using bcrypt before saving to MongoDB
staffUserSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare entered plain PIN with hashed PIN (supports plain text migration/fallback)
staffUserSchema.methods.matchPin = async function (enteredPin) {
  if (!this.pin.startsWith('$2')) {
    return String(this.pin) === String(enteredPin);
  }
  return await bcrypt.compare(String(enteredPin), this.pin);
};

export const StaffUser = mongoose.models.StaffUser || mongoose.model('StaffUser', staffUserSchema);
