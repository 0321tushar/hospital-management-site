import { Router } from 'express';
import {
  getBeds,
  admitToBed,
  dischargeFromBed
} from '../controllers/bedController.js';

const router = Router();

router.get('/', getBeds);
router.post('/:id/admit', admitToBed);
router.post('/:id/discharge', dischargeFromBed);

export default router;
