import { Prescription } from '../models/Prescription.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get prescriptions (optional filter by patient UHID)
export const getPrescriptions = async (req, res) => {
  try {
    const { uhid } = req.query;
    if (getIsMongoLive()) {
      const filter = uhid ? { uhid } : {};
      const rx = await Prescription.find(filter).sort({ createdAt: -1 });
      return res.json(rx);
    }
    let list = memoryStore.prescriptions || [];
    if (uhid) list = list.filter(r => r.uhid === uhid);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new e-Prescription
export const createPrescription = async (req, res) => {
  try {
    const { uhid, diagnosis } = req.body;
    if (!uhid || !diagnosis) {
      return res.status(400).json({ error: 'UHID and diagnosis are required' });
    }

    const id = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx = { id, date: new Date().toISOString().split('T')[0], ...req.body };

    if (getIsMongoLive()) {
      const created = await Prescription.create(newRx);
      return res.status(201).json(created);
    }

    if (!memoryStore.prescriptions) memoryStore.prescriptions = [];
    memoryStore.prescriptions.unshift(newRx);
    res.status(201).json(newRx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete prescription by ID
export const deletePrescription = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const deleted = await Prescription.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Prescription not found' });
      return res.json({ message: 'Prescription deleted', id: req.params.id });
    }
    const initialLen = (memoryStore.prescriptions || []).length;
    memoryStore.prescriptions = (memoryStore.prescriptions || []).filter(r => r.id !== req.params.id);
    if ((memoryStore.prescriptions || []).length === initialLen) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    res.json({ message: 'Prescription deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
