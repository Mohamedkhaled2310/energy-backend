import express from 'express';
import {
  getSettings,
  updateSetting,
} from '../controllers/settingsController.js';

const router = express.Router();

router.route('/')
  .get(getSettings);

router.route('/:key')
  .put(updateSetting);

export default router;
