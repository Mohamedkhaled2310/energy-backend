import express from 'express';
import {
  getVisits,
  getVisit,
  createVisit,
  getVisitStats,
} from '../controllers/visitController.js';

const router = express.Router();

router.route('/')
  .get(getVisits)
  .post(createVisit);

router.get('/stats', getVisitStats);

router.route('/:id')
  .get(getVisit);

export default router;
