import { Router } from 'express';
import {
  getPatients,
  searchPatients,
  registerPatient,
  deletePatient
} from '../controllers/patientController.js';

const router = Router();

router.get('/', getPatients);
router.get('/search', searchPatients);
router.post('/', registerPatient);
router.delete('/:uhid', deletePatient);

export default router;
