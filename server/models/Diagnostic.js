import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  testId: { type: String, required: true },
  testName: { type: String, required: true },
  uhid: { type: String, required: true },
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  patientGender: { type: String, required: true },
  referredBy: { type: String, default: 'OPD Consultant' },
  collectedOn: { type: String, default: () => new Date().toLocaleString() },
  reportedOn: { type: String, default: () => new Date().toLocaleString() },
  status: { type: String, default: 'Verified & Released' },
  results: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String, default: '' },
    normalRange: { type: String, default: '' },
    status: { type: String, default: 'NORMAL', enum: ['NORMAL', 'HIGH', 'LOW'] }
  }],
  pathologist: { type: String, default: 'Dr. Sandeep Oberoi, MD (Pathology)' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

export const LabReport = mongoose.models.LabReport || mongoose.model('LabReport', labReportSchema);
