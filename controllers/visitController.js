import Visit from '../models/Visit.js';
import Station from '../models/Station.js';
import { computeSafetyScore } from '../utils/safetyCalc.js';
import { saveBase64Image } from '../utils/fileUtils.js';

// @desc    Get all visits
// @route   GET /api/visits
export const getVisits = async (req, res, next) => {
  try {
    const { station, type, severity, q } = req.query;
    
    let query = {};
    if (station) query.station = station;
    if (type && type !== 'all') query.type = type;
    
    if (q) {
      query.$or = [
        { stationName: { $regex: q, $options: 'i' } },
        { inspectors: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (severity && severity !== 'all') {
      query['notes.severity'] = severity;
    }
    
    const visits = await Visit.find(query).sort({ date: -1 });
    res.json(visits);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single visit
// @route   GET /api/visits/:id
export const getVisit = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id).populate('station', 'name code region');
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }
    res.json(visit);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new visit
// @route   POST /api/visits
export const createVisit = async (req, res, next) => {
  try {
    const { station, notes, ...visitData } = req.body;
    const targetStationId = station || req.body.stationId;
    
    if (!targetStationId) {
      return res.status(400).json({ success: false, message: 'Station ID is required' });
    }

    // Validate station exists
    const dbStation = await Station.findById(targetStationId);
    if (!dbStation) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    
    // Process notes: Save Base64 images to disk if present
    const processedNotes = (notes || []).map(n => {
      let imageUrl = n.imageUrl;
      
      // If there's a base64 image string, save it to disk
      if (n.image && n.image.startsWith('data:image')) {
        const savedPath = saveBase64Image(n.image);
        if (savedPath) imageUrl = savedPath;
      }

      return {
        ...n,
        imageUrl
      };
    });

    // Compute score based on notes if not provided
    const safetyScore = req.body.safetyScore ?? computeSafetyScore(processedNotes);
    
    const visit = await Visit.create({
      ...visitData,
      station: targetStationId,
      stationName: dbStation.name,
      stationCode: dbStation.code,
      region: dbStation.region,
      notes: processedNotes,
      safetyScore
    });
    
    // Update station's cumulative safety score
    const allVisits = await Visit.find({ station: targetStationId }).select('safetyScore');
    const newStationScore = Math.round(
      allVisits.reduce((acc, v) => acc + v.safetyScore, 0) / allVisits.length
    );
    
    dbStation.safetyScore = newStationScore;
    dbStation.visitCount += 1;
    await dbStation.save();
    
    res.status(201).json(visit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get visit stats for dashboard
// @route   GET /api/visits/stats
export const getVisitStats = async (req, res, next) => {
  try {
    // Top Violations (element level)
    const topViolations = await Visit.aggregate([
      { $unwind: "$notes" },
      { $group: { _id: "$notes.element", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);
    
    // Severity Distribution
    const severityDist = await Visit.aggregate([
      { $unwind: "$notes" },
      { $group: { _id: "$notes.severity", value: { $sum: 1 } } },
      { $project: { label: "$_id", value: 1, _id: 0 } }
    ]);
    
    res.json({
      topViolations,
      severityDist
    });
  } catch (error) {
    next(error);
  }
};
