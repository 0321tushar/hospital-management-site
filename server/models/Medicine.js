import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  batch: { type: String, required: true },
  expiry: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, default: 50 },
  unitPrice: { type: Number, required: true },
  unit: { type: String, default: 'Strip' }
}, { timestamps: true });

export const Medicine = mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema);
