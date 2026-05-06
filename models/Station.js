import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    activity: {
      type: String,
      default: 'محطة وقود',
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    lat: {
      type: String,
      trim: true,
    },
    lng: {
      type: String,
      trim: true,
    },
    safetyScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    visitCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Station = mongoose.model('Station', stationSchema);

export default Station;
