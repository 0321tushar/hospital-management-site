import { Invoice } from '../models/Invoice.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get billing invoices (optional filter by patient UHID)
export const getInvoices = async (req, res) => {
  try {
    const { uhid } = req.query;
    if (getIsMongoLive()) {
      const filter = uhid ? { uhid } : {};
      const invs = await Invoice.find(filter).sort({ createdAt: -1 });
      return res.json(invs);
    }
    let list = memoryStore.invoices || [];
    if (uhid) list = list.filter(i => i.uhid === uhid);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate and record new billing invoice
export const createInvoice = async (req, res) => {
  try {
    const { uhid, totalAmount } = req.body;
    if (!uhid || totalAmount === undefined) {
      return res.status(400).json({ error: 'UHID and totalAmount are required' });
    }

    const id = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = { id, date: new Date().toISOString().split('T')[0], status: 'Settled', ...req.body };

    if (getIsMongoLive()) {
      const created = await Invoice.create(newInv);
      return res.status(201).json(created);
    }

    if (!memoryStore.invoices) memoryStore.invoices = [];
    memoryStore.invoices.unshift(newInv);
    res.status(201).json(newInv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
