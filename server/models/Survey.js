const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['text', 'email', 'phone', 'nps', 'csat', 'ces', 'multiple_choice', 'checkbox', 'scale', 'geolocation', 'area_measurement', 'date', 'time'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false
  },
  options: [String], // For multiple choice, checkbox
  validation: {
    min: Number,
    max: Number,
    pattern: String
  },
  conditionalLogic: {
    showIf: {
      questionId: String,
      operator: String, // equals, contains, greater_than, less_than
      value: mongoose.Schema.Types.Mixed
    }
  },
  order: Number
});

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed'],
    default: 'draft'
  },
  targetResponses: {
    type: Number,
    default: 0
  },
  responseCount: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    allowAnonymous: {
      type: Boolean,
      default: false
    },
    requireGeolocation: {
      type: Boolean,
      default: false
    },
    allowOfflineSubmission: {
      type: Boolean,
      default: true
    },
    showProgressBar: {
      type: Boolean,
      default: true
    },
    randomizeQuestions: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before save
surveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate active period
surveySchema.virtual('activePeriod').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diff = this.endDate - this.startDate;
  return Math.ceil(diff / (1000 * 60 * 60 * 24)); // days
});

module.exports = mongoose.model('Survey', surveySchema);
