import Inspector from '../models/Inspector.js';

// @desc    Get all inspectors
// @route   GET /api/inspectors
export const getInspectors = async (req, res, next) => {
  try {
    const inspectors = await Inspector.find({ active: true });
    res.json(inspectors);
  } catch (error) {
    next(error);
  }
};

// @desc    Create inspector
// @route   POST /api/inspectors
export const createInspector = async (req, res, next) => {
  try {
    const inspector = await Inspector.create(req.body);
    res.status(201).json(inspector);
  } catch (error) {
    next(error);
  }
};
