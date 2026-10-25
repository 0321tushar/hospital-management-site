import { Router } from 'express';
import {
  getPrescriptions,
  createPrescription,
  deletePrescription
} from '../controllers/prescriptionController.js';

const router = Router();

router.get('/', getPrescriptions);
router.post('/', createPrescription);
router.delete('/:id', deletePrescription);

export default router;
