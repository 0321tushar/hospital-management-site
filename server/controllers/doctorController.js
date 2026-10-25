import { Doctor } from '../models/Doctor.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get all doctors (optional filter by departmentId)
export const getDoctors = async (req, res) => {
  try {
    const { departmentId } = req.query;
    if (getIsMongoLive()) {
      const filter = departmentId ? { departmentId } : {};
      const docs = await Doctor.find(filter);
      return res.json(docs);
    }
    let docs = memoryStore.doctors;
    if (departmentId) docs = docs.filter(d => d.departmentId === departmentId);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const doc = await Doctor.findOne({ id: req.params.id });
      if (!doc) return res.status(404).json({ error: 'Doctor not found' });
      return res.json(doc);
    }
    const doc = memoryStore.doctors.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new doctor
export const createDoctor = async (req, res) => {
  try {
    const { name, specialty, opdRoom, fee } = req.body;
    if (!name || !specialty) {
      return res.status(400).json({ error: 'Doctor name and specialty are required' });
    }
    const count = getIsMongoLive() ? await Doctor.countDocuments() : memoryStore.doctors.length;
    const id = req.body.id || `DOC-${101 + count}`;
    const initials = name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
    const newDoc = {
      id,
      name,
      qualifications: req.body.qualifications || 'MBBS, MD',
      departmentId: req.body.departmentId || 'general',
      departmentName: req.body.departmentName || specialty,
      specialty,
      experience: req.body.experience || '8+ Years',
      opdRoom: opdRoom || 'Room 101',
      fee: Number(fee) || 800,
      rating: 4.8,
      reviewsCount: 120,
      schedule: req.body.schedule || 'Mon - Sat (09:00 AM - 02:00 PM)',
      availableSlots: req.body.availableSlots || ['09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM'],
      avatarText: initials,
      imageBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
      ...req.body
    };

    if (getIsMongoLive()) {
      const created = await Doctor.create(newDoc);
      return res.status(201).json(created);
    }
    memoryStore.doctors.push(newDoc);
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete doctor by ID
export const deleteDoctor = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const deleted = await Doctor.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Doctor not found' });
      return res.json({ message: 'Doctor deleted successfully', id: req.params.id });
    }
    const initialLen = memoryStore.doctors.length;
    memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== req.params.id);
    if (memoryStore.doctors.length === initialLen) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
