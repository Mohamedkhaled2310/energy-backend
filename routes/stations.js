import express from 'express';
import {
  getStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
  bulkImportStations,
} from '../controllers/stationController.js';
import { uploadExcel } from '../controllers/uploadController.js';

const router = express.Router();

router.route('/')
  .get(getStations)
  .post(createStation);

router.post('/bulk', uploadExcel.single('file'), bulkImportStations);

router.route('/:id')
  .get(getStation)
  .put(updateStation)
  .delete(deleteStation);

export default router;
