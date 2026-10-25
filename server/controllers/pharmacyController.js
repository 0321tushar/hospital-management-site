import { Medicine } from '../models/Medicine.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get pharmacy stock inventory
export const getPharmacy = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const meds = await Medicine.find();
      return res.json(meds);
    }
    res.json(memoryStore.medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add medicine to stock inventory
export const createPharmacyItem = async (req, res) => {
  try {
    const { name, category, stock, unitPrice } = req.body;
    if (!name) return res.status(400).json({ error: 'Medicine name is required' });
    const count = getIsMongoLive() ? await Medicine.countDocuments() : memoryStore.medicines.length;
    const id = req.body.id || `MED-${(count + 1).toString().padStart(2, '0')}`;
    const newMed = {
      id,
      name,
      category: category || 'General Medicine',
      batch: req.body.batch || `BT-${Math.floor(2000 + Math.random() * 900)}`,
      expiry: req.body.expiry || '2028-06',
      stock: Number(stock) || 100,
      minStock: Number(req.body.minStock) || 50,
      unitPrice: Number(unitPrice) || 50,
      unit: req.body.unit || 'Strip of 10'
    };

    if (getIsMongoLive()) {
      const created = await Medicine.create(newMed);
      return res.status(201).json(created);
    }
    memoryStore.medicines.push(newMed);
    res.status(201).json(newMed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete medicine from pharmacy inventory
export const deletePharmacyItem = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const deleted = await Medicine.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Medicine not found' });
      return res.json({ message: 'Medicine item deleted', id: req.params.id });
    }
    const initialLen = memoryStore.medicines.length;
    memoryStore.medicines = memoryStore.medicines.filter(m => m.id !== req.params.id);
    if (memoryStore.medicines.length === initialLen) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    res.json({ message: 'Medicine item deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
