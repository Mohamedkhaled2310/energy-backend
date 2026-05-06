import express from 'express';
import {
  getInspectors,
  createInspector,
} from '../controllers/inspectorController.js';

const router = express.Router();

router.route('/')
  .get(getInspectors)
  .post(createInspector);

export default router;
