import { Hospital } from '../models/Hospital.js';
import { seedHospitalData } from '../seeder.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Health & Database Status Check
export const getHealthCheck = (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PulseAura MERN Hospital Management API',
    database: getIsMongoLive() ? 'MongoDB Active' : 'In-Memory / Local Seed Mode',
    mongoUri: process.env.MONGO_URI ? 'Configured' : 'mongodb://127.0.0.1:27017/hospital_management',
    timestamp: new Date().toISOString()
  });
};

// 1. Hospital Profile & Settings
export const getHospital = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      let hosp = await Hospital.findOne();
      if (!hosp) hosp = await Hospital.create(seedHospitalData.hospital);
      return res.json(hosp);
    }
    res.json(memoryStore.hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHospital = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const updated = await Hospital.findOneAndUpdate({}, req.body, { new: true, upsert: true });
      return res.json(updated);
    }
    memoryStore.hospital = { ...memoryStore.hospital, ...req.body };
    res.json(memoryStore.hospital);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
