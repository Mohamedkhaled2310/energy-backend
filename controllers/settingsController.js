import Settings from '../models/Settings.js';

// @desc    Get all settings
// @route   GET /api/settings
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find();
    // Convert array of {key, value} to single object map
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
};

// @desc    Update setting
// @route   PUT /api/settings/:key
export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true } // Create if doesn't exist
    );
    
    res.json(setting);
  } catch (error) {
    next(error);
  }
};
