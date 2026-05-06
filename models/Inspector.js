import mongoose from 'mongoose';

const inspectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: 'inspector',
      enum: ['inspector', 'admin'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Inspector = mongoose.model('Inspector', inspectorSchema);

export default Inspector;
