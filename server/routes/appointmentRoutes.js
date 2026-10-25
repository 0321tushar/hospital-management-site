import { Router } from 'express';
import {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js';

const router = Router();

router.get('/', getAppointments);
router.post('/', bookAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;
