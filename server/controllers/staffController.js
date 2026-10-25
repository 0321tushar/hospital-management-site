import bcrypt from 'bcryptjs';
import { StaffUser } from '../models/StaffUser.js';
import { Doctor } from '../models/Doctor.js';
import { memoryStore, getIsMongoLive } from '../config/store.js';
import { generateToken } from '../utils/jwt.js';

// Helper to check PIN against plain or bcrypt hash
const verifyPinMatch = async (storedPin, inputPin) => {
  if (!storedPin) return false;
  if (storedPin.startsWith('$2')) {
    return await bcrypt.compare(String(inputPin), storedPin);
  }
  return String(storedPin) === String(inputPin);
};

// Get all staff users
export const getStaffUsers = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const users = await StaffUser.find().select('-pin').sort({ createdAt: -1 });
      return res.json(users);
    }
    const safeUsers = (memoryStore.staffUsers || []).map(({ pin, ...rest }) => rest);
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new staff user with bcrypt hashed PIN
export const createStaffUser = async (req, res) => {
  try {
    const { name, role, username, pin } = req.body;
    if (!name || !username || !pin) {
      return res.status(400).json({ error: 'Name, username and 4-digit PIN are required' });
    }

    const count = getIsMongoLive() ? await StaffUser.countDocuments() : (memoryStore.staffUsers?.length || 0);
    const prefix = role === 'Admin' ? 'ADM' : (role === 'Doctor' ? 'DOC' : 'STF');
    const id = req.body.id || `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    // Hash PIN using bcrypt salt
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(String(pin), salt);

    const newUser = {
      id,
      name,
      username: username.toLowerCase().trim(),
      role: role || 'Doctor',
      pin: hashedPin,
      doctorId: req.body.doctorId || (role === 'Doctor' ? id : null),
      department: req.body.department || (role === 'Admin' ? 'Administration' : 'Clinical'),
      opdRoom: req.body.opdRoom || (role === 'Doctor' ? 'Room 101' : 'Admin Suite'),
      phone: req.body.phone || '+91 98765-43210',
      email: req.body.email || `${username.toLowerCase()}@pulseaura.org`,
      status: req.body.status || 'Active'
    };

    // If role is Doctor, also automatically create doctor in doctors roster
    if (role === 'Doctor') {
      const docExists = getIsMongoLive()
        ? await Doctor.findOne({ id: newUser.doctorId })
        : memoryStore.doctors.some(d => d.id === newUser.doctorId);

      if (!docExists) {
        const initials = name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
        const docRecord = {
          id: newUser.doctorId,
          name,
          qualifications: req.body.qualifications || 'MBBS, MD',
          departmentId: req.body.departmentId || 'general',
          departmentName: req.body.department || 'General Medicine',
          specialty: req.body.specialty || req.body.department || 'Consultant Specialist',
          experience: req.body.experience || '10+ Years',
          opdRoom: newUser.opdRoom,
          fee: Number(req.body.fee) || 800,
          rating: 4.9,
          reviewsCount: 150,
          schedule: 'Mon - Sat (09:00 AM - 02:00 PM)',
          availableSlots: ['09:30 AM', '10:30 AM', '11:30 AM', '01:30 PM'],
          avatarText: initials,
          imageBg: 'linear-gradient(135deg, #0284c7, #0369a1)'
        };
        if (getIsMongoLive()) {
          await Doctor.create(docRecord);
        } else {
          memoryStore.doctors.push(docRecord);
        }
      }
    }

    if (getIsMongoLive()) {
      // In Mongoose, pre-save will see hashed pin or we can assign directly
      const created = await StaffUser.create(newUser);
      const userObj = created.toObject();
      delete userObj.pin;
      return res.status(201).json(userObj);
    }

    if (!memoryStore.staffUsers) memoryStore.staffUsers = [];
    memoryStore.staffUsers.unshift(newUser);
    const { pin: _p, ...safeCreated } = newUser;
    res.status(201).json(safeCreated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete staff user account
export const deleteStaffUser = async (req, res) => {
  try {
    if (getIsMongoLive()) {
      const user = await StaffUser.findOne({ id: req.params.id });
      if (!user) return res.status(404).json({ error: 'Account not found' });
      if (user.doctorId) {
        await Doctor.findOneAndDelete({ id: user.doctorId });
      }
      await StaffUser.findOneAndDelete({ id: req.params.id });
      return res.json({ message: 'Account deleted successfully', id: req.params.id });
    }

    const user = (memoryStore.staffUsers || []).find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.doctorId) {
      memoryStore.doctors = memoryStore.doctors.filter(d => d.id !== user.doctorId);
    }
    memoryStore.staffUsers = (memoryStore.staffUsers || []).filter(u => u.id !== req.params.id);
    res.json({ message: 'Account deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Authenticate Staff / Doctor via PIN and issue JWT Token
export const authenticateStaff = async (req, res) => {
  try {
    const { pin, role, doctorId, username } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN is required' });

    let user = null;
    if (getIsMongoLive()) {
      let candidate = null;
      if (username) {
        candidate = await StaffUser.findOne({ username: username.toLowerCase().trim() });
      } else if (role === 'Doctor' && doctorId) {
        candidate = await StaffUser.findOne({ doctorId });
      } else if (role === 'Admin') {
        candidate = await StaffUser.findOne({ role: 'Admin' });
      }

      if (candidate) {
        const isMatch = await candidate.matchPin(pin);
        if (isMatch) user = candidate;
      }
    } else {
      const users = memoryStore.staffUsers || [];
      let candidate = null;
      if (username) {
        candidate = users.find(u => u.username === username.toLowerCase().trim());
      } else if (role === 'Doctor' && doctorId) {
        candidate = users.find(u => u.doctorId === doctorId);
      } else if (role === 'Admin') {
        candidate = users.find(u => u.role === 'Admin');
      }

      if (candidate) {
        const isMatch = await verifyPinMatch(candidate.pin, pin);
        if (isMatch) user = candidate;
      }
    }

    // Default emergency master fallback PIN: '1234'
    if (!user && pin === '1234') {
      if (role === 'Admin') {
        user = {
          id: 'ADM-001',
          name: 'Hospital Super Administrator',
          role: 'Admin',
          doctorId: 'ALL',
          department: 'Executive Hospital Management',
          opdRoom: 'Admin Suite'
        };
      } else {
        const doc = (getIsMongoLive() ? await Doctor.findOne({ id: doctorId }) : memoryStore.doctors.find(d => d.id === doctorId)) || memoryStore.doctors[0];
        user = {
          id: doc?.id || 'DOC-101',
          name: doc?.name || 'Dr. Arvind Mehta',
          role: 'Doctor',
          doctorId: doc?.id || 'DOC-101',
          department: doc?.departmentName || doc?.specialty || 'Cardiology',
          opdRoom: doc?.opdRoom || 'Room 102'
        };
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN or unauthorized credentials' });
    }

    // User session payload
    const sessionUser = {
      id: user.id,
      name: user.name,
      role: user.role,
      doctorId: user.doctorId || (user.role === 'Doctor' ? user.id : 'ALL'),
      doctorName: user.name,
      department: user.department,
      opdRoom: user.opdRoom,
      authenticatedAt: new Date().toISOString()
    };

    // ⚡ Generate Cryptographically Signed JWT Token (8h validity) ⚡
    const token = generateToken({
      id: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
      doctorId: sessionUser.doctorId
    });

    return res.json({
      success: true,
      token,
      user: sessionUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify active JWT token and return session info
export const getStaffMe = async (req, res) => {
  try {
    // req.user was populated by requireAuth middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
