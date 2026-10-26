import { Router } from 'express';
import { getHealthCheck, getHospital, updateHospital } from '../controllers/hospitalController.js';

const router = Router();

router.get('/health', getHealthCheck);
router.get('/hospital', getHospital);
router.put('/hospital', updateHospital);
router.get('/', getHospital);
router.put('/', updateHospital);

export default router;
