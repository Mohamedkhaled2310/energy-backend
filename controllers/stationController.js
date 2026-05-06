import Station from '../models/Station.js';
import Visit from '../models/Visit.js';
import * as xlsx from 'xlsx';
import { classify } from '../utils/classification.js';

// @desc    Get all stations
// @route   GET /api/stations
export const getStations = async (req, res, next) => {
  try {
    const { region, classification, q, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (region) query.region = region;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Filter by classification is handled after fetch for lean objects if needed, 
    // but better to do it in DB if possible. Since safetyScore is in DB, we could do range queries.
    // However, the classification logic is complex (0-45, 45-65, etc.)
    // Let's get total count first
    const total = await Station.countDocuments(query);
    
    let stations = await Station.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();
    
    // Filter by classification if provided
    if (classification && classification !== 'all') {
      stations = stations.filter(s => classify(s.safetyScore) === classification);
    }
    
    res.json({
      stations,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single station
// @route   GET /api/stations/:id
export const getStation = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    
    // Get recent visits for this station
    const visits = await Visit.find({ station: station._id })
      .sort({ date: -1 })
      .limit(10);
      
    res.json({ station, visits });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new station
// @route   POST /api/stations
export const createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    next(error);
  }
};

// @desc    Update station
// @route   PUT /api/stations/:id
export const updateStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    
    res.json(station);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete station
// @route   DELETE /api/stations/:id
export const deleteStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    
    // Optional: Delete associated visits
    // await Visit.deleteMany({ station: req.params.id });
    
    res.json({ success: true, message: 'Station removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk create stations from Excel
// @route   POST /api/stations/bulk
export const bulkImportStations = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an excel file' });
    }
    
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    // Map Excel headers to schema
    const stationsToInsert = data.map(row => ({
      code: row['رمز المنشأة'] || row.code,
      name: row['اسم المنشأة'] || row.name,
      region: row['المنطقة'] || row.region || 'غير محدد',
      lat: row['الإحداثي X'] || row.lat,
      lng: row['الإحداثي Y'] || row.lng,
      activity: row['النشاط'] || 'محطة وقود',
      safetyScore: 100 // default new station score
    })).filter(s => s.code && s.name); // basic validation
    
    const result = await Station.insertMany(stationsToInsert, { ordered: false });
    
    res.status(201).json({
      success: true,
      message: `Imported ${result.length} stations successfully`,
      count: result.length
    });
  } catch (error) {
    // ordered: false might throw if some duplicates exist, but it still inserts valid ones
    if (error.code === 11000) {
      return res.status(201).json({
        success: true,
        message: `Import completed with some duplicates skipped`,
        count: error.insertedDocs?.length || 0
      });
    }
    next(error);
  }
};
