import { Bed } from '../models/Bed.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get all IPD hospital beds
export const getBeds = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const beds = await Bed.find();
      return res.json(beds);
    }
    res.json(memoryStore.beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admit patient to specific bed
export const admitToBed = async (req, res) => {
  try {
    const { uhid, patientName, doctorName, diagnosis } = req.body;
    const update = {
      status: 'Occupied',
      patientUhid: uhid,
      patientName,
      doctorName: doctorName || 'Staff Physician',
      diagnosis: diagnosis || 'Observation',
      admittedOn: new Date().toISOString().split('T')[0]
    };

    if (getIsMongoLive()) {
      const updated = await Bed.findOneAndUpdate({ id: req.params.id }, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Bed not found' });
      return res.json(updated);
    }

    const bed = memoryStore.beds.find(b => b.id === req.params.id);
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    Object.assign(bed, update);
    res.json(bed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Discharge patient from bed (sets status to Cleaning / Sanitizing)
export const dischargeFromBed = async (req, res) => {
  try {
    const update = {
      status: 'Cleaning',
      patientUhid: null,
      patientName: null,
      doctorName: null,
      diagnosis: null,
      admittedOn: null
    };

    if (getIsMongoLive()) {
      const updated = await Bed.findOneAndUpdate({ id: req.params.id }, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Bed not found' });
      return res.json(updated);
    }

    const bed = memoryStore.beds.find(b => b.id === req.params.id);
    if (!bed) return res.status(404).json({ error: 'Bed not found' });
    Object.assign(bed, update);
    res.json(bed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
