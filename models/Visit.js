import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  element: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    required: true,
    enum: ['حادث', 'حادث وشيك', 'مخالفة', 'الحالة غير الآمنة', 'الإصابة', 'تصرف غير آمن'],
  },
  urgent: {
    type: Boolean,
    default: false,
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  correctiveAction: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
});

const visitSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    stationName: {
      type: String,
      required: true,
    },
    stationCode: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'متابعة امتثال',
        'الجودة الشاملة',
        'ترخيص',
        'تخصيص',
        'مسح ميداني',
        'السلامة',
        'متابعة دورية',
        'مخالفات',
        'مباشرة بلاغ',
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    inspectors: [
      {
        type: String,
        required: true,
      },
    ],
    refNumber: {
      type: String,
      required: true,
    },
    notes: [noteSchema],
    safetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Visit = mongoose.model('Visit', visitSchema);

export default Visit;
