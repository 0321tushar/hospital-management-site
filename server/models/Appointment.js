import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tokenNumber: { type: String, required: true },
  uhid: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  doctorId: { type: String, required: true },
  doctorName: { type: String, required: true },
  department: { type: String, required: true },
  opdRoom: { type: String, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, default: 'General Consultation' },
  status: { type: String, default: 'Waiting', enum: ['Waiting', 'Calling Next', 'In Consultation', 'Completed', 'Cancelled'] },
  priority: { type: String, default: 'Normal', enum: ['Normal', 'Urgent', 'Emergency'] },
  chiefComplaint: { type: String, default: '' },
  fee: { type: Number, required: true },
  paymentStatus: { type: String, default: 'Paid', enum: ['Paid', 'Pending'] }
}, { timestamps: true });

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
