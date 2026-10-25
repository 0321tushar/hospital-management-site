import { Router } from 'express';
import {
  getPharmacy,
  createPharmacyItem,
  deletePharmacyItem
} from '../controllers/pharmacyController.js';

const router = Router();

router.get('/', getPharmacy);
router.post('/', createPharmacyItem);
router.delete('/:id', deletePharmacyItem);

export default router;
