import { Patient } from '../models/Patient.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get all registered patients
export const getPatients = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return res.json(patients);
    }
    res.json(memoryStore.patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search patient by UHID, phone or name
export const searchPatients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const digitsOnly = q.replace(/\D/g, '');

    if (getIsMongoLive()) {
      const orConditions = [
        { uhid: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ];

      if (digitsOnly.length >= 6) {
        const flexibleRegex = digitsOnly.slice(-10).split('').join('[ -]?');
        orConditions.push({ phone: { $regex: flexibleRegex, $options: 'i' } });
      } else {
        orConditions.push({ phone: { $regex: q, $options: 'i' } });
      }

      const patient = await Patient.findOne({ $or: orConditions });
      return res.json(patient || null);
    }

    const query = q.toLowerCase().trim();
    const found = memoryStore.patients.find(p => {
      const pDigits = (p.phone || '').replace(/\D/g, '');
      const matchesPhone = digitsOnly.length >= 6 && (pDigits.includes(digitsOnly) || digitsOnly.includes(pDigits.slice(-10)));
      return (
        p.uhid.toLowerCase().includes(query) ||
        matchesPhone ||
        p.name.toLowerCase().includes(query)
      );
    });
    res.json(found || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Register a new patient and allocate UHID
export const registerPatient = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required fields' });
    }

    const digits = (phone || '').replace(/\D/g, '');
    let formattedPhone = phone;
    if (digits.length === 10) {
      formattedPhone = `+91 ${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 10 && digits.startsWith('91')) {
      const last10 = digits.slice(-10);
      formattedPhone = `+91 ${last10.slice(0, 5)}-${last10.slice(5)}`;
    }

    const count = getIsMongoLive() ? await Patient.countDocuments() : memoryStore.patients.length;
    const uhid = `PA-2026-${(count + 1).toString().padStart(4, '0')}`;
    const newPatient = { ...req.body, phone: formattedPhone, uhid };

    if (getIsMongoLive()) {
      const created = await Patient.create(newPatient);
      return res.status(201).json(created);
    }

    memoryStore.patients.unshift(newPatient);
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete patient record by UHID
export const deletePatient = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const deleted = await Patient.findOneAndDelete({ uhid: req.params.uhid });
      if (!deleted) return res.status(404).json({ error: 'Patient not found' });
      return res.json({ message: 'Patient record deleted', uhid: req.params.uhid });
    }
    const initialLen = memoryStore.patients.length;
    memoryStore.patients = memoryStore.patients.filter(p => p.uhid !== req.params.uhid);
    if (memoryStore.patients.length === initialLen) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient record deleted', uhid: req.params.uhid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
