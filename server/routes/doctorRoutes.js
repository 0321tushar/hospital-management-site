import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  deleteDoctor
} from '../controllers/doctorController.js';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', createDoctor);
router.delete('/:id', deleteDoctor);

export default router;
