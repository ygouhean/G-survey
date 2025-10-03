const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionType: String,
  value: mongoose.Schema.Types.Mixed, // Can be string, number, array, object
  geolocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  areaMeasurement: {
    polygon: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: [[[Number]]] // Array of coordinate arrays
    },
    hectares: Number
  }
});

const responseSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  answers: [answerSchema],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    online: Boolean
  },
  metadata: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    ipAddress: String
  },
  npsScore: Number, // Calculated NPS score (0-10)
  csatScore: Number, // Calculated CSAT score (1-5)
  cesScore: Number, // Calculated CES score (1-7)
  status: {
    type: String,
    enum: ['completed', 'partial', 'synced', 'pending_sync'],
    default: 'completed'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
responseSchema.index({ location: '2dsphere' });

// Calculate scores before save
responseSchema.pre('save', function(next) {
  this.answers.forEach(answer => {
    if (answer.questionType === 'nps') {
      this.npsScore = Number(answer.value);
    } else if (answer.questionType === 'csat') {
      this.csatScore = Number(answer.value);
    } else if (answer.questionType === 'ces') {
      this.cesScore = Number(answer.value);
    }
  });
  next();
});

module.exports = mongoose.model('Response', responseSchema);
