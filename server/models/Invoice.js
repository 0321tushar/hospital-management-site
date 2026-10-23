import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  uhid: { type: String, required: true },
  patientName: { type: String, required: true },
  patientPhone: { type: String, default: '' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  category: { type: String, default: 'General Hospital Bill' },
  items: [{
    description: { type: String, required: true },
    qty: { type: Number, default: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 5 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  balanceDue: { type: Number, default: 0 },
  paymentMode: { type: String, default: 'Cash', enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI / QR Code', 'TPA / Insurance'] },
  status: { type: String, default: 'Settled', enum: ['Settled', 'Pending', 'Partially Paid'] },
  cashier: { type: String, default: 'Central Billing Desk' }
}, { timestamps: true });

export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
