import { Router } from 'express';
import {
  getStaffUsers,
  createStaffUser,
  deleteStaffUser,
  authenticateStaff,
  getStaffMe
} from '../controllers/staffController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Staff authentication
router.post('/staff-auth', authenticateStaff);
router.get('/staff-me', requireAuth, getStaffMe);

// Staff user management (Protected with JWT & Admin role)
router.get('/staff-users', requireAuth, getStaffUsers);
router.post('/staff-users', requireAuth, requireRole('Admin'), createStaffUser);
router.delete('/staff-users/:id', requireAuth, requireRole('Admin'), deleteStaffUser);

export default router;
