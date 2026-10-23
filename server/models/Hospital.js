import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, default: 'PulseAura Super Specialty Hospital' },
  tagline: { type: String, default: 'Center for Advanced Medicine & Compassionate Care' },
  registrationNo: { type: String, default: 'NABH-HOSP-2024-9842' },
  nabhStatus: { type: String, default: 'NABH Fully Accredited (5th Edition)' },
  phone: { type: String, default: '+91 (11) 4980-2200' },
  emergencyPhone: { type: String, default: '1066 / +91 98100-99911' },
  email: { type: String, default: 'care@pulseaura-hospital.org' },
  address: { type: String, default: 'Plot 14, Health City Boulevard, Medical District, New Delhi - 110029' },
  currency: { type: String, default: '₹' },
  taxRate: { type: Number, default: 5 },
  theme: { type: String, default: 'light' }
}, { timestamps: true });

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
