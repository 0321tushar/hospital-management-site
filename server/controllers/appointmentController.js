import { Appointment } from '../models/Appointment.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';

// Get appointments (optional filter by doctorId)
export const getAppointments = async (req, res) => {
  try {
    const { doctorId } = req.query;
    if (getIsMongoLive()) {
      const filter = doctorId && doctorId !== 'ALL' ? { doctorId } : {};
      const apts = await Appointment.find(filter).sort({ createdAt: -1 });
      return res.json(apts);
    }
    let apts = memoryStore.appointments || [];
    if (doctorId && doctorId !== 'ALL') {
      apts = apts.filter(a => a.doctorId === doctorId);
    }
    res.json(apts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Book appointment and generate live OPD Token
export const bookAppointment = async (req, res) => {
  try {
    const { uhid, doctorId, timeSlot } = req.body;
    if (!uhid || !doctorId || !timeSlot) {
      return res.status(400).json({ error: 'UHID, doctorId and timeSlot are required' });
    }

    const count = getIsMongoLive() ? await Appointment.countDocuments() : (memoryStore.appointments?.length || 0);
    const tokenNumber = `TK-${(count + 1).toString().padStart(2, '0')}`;
    const id = `APT-${Math.floor(100 + Math.random() * 900)}`;

    const date = req.body.date || new Date().toISOString().split('T')[0];
    const newApt = { id, tokenNumber, date, ...req.body, status: 'Waiting' };

    if (getIsMongoLive()) {
      const created = await Appointment.create(newApt);
      return res.status(201).json(created);
    }

    if (!memoryStore.appointments) memoryStore.appointments = [];
    memoryStore.appointments.unshift(newApt);
    res.status(201).json(newApt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update appointment token status (Waiting, Consulting, Completed, Cancelled)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    if (getIsMongoLive()) {
      const updated = await Appointment.findOneAndUpdate({ id: req.params.id }, { status }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Appointment not found' });
      return res.json(updated);
    }

    const apt = memoryStore.appointments?.find(a => a.id === req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    apt.status = status;
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete / Cancel appointment by ID
export const deleteAppointment = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const deleted = await Appointment.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'Appointment not found' });
      return res.json({ message: 'Appointment cancelled and deleted', id: req.params.id });
    }
    const initialLen = (memoryStore.appointments || []).length;
    memoryStore.appointments = (memoryStore.appointments || []).filter(a => a.id !== req.params.id);
    if ((memoryStore.appointments || []).length === initialLen) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled and deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
