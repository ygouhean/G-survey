const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const { protect, authorize, canAccessSurvey } = require('../middleware/auth');

// @route   GET /api/surveys
// @desc    Get all surveys (filtered by role)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    // Field agents only see assigned surveys
    if (req.user.role === 'field_agent') {
      query.assignedTo = req.user._id;
    }
    // Supervisors see surveys assigned to their team
    else if (req.user.role === 'supervisor') {
      const Team = require('../models/Team');
      const team = await Team.findOne({ supervisor: req.user._id });
      if (team) {
        query.assignedTo = { $in: team.members };
      }
    }
    // Admins see all surveys

    const surveys = await Survey.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role')
      .sort('-createdAt');

    res.json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/surveys/:id
// @desc    Get survey by ID
// @access  Private
router.get('/:id', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email role');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/surveys
// @desc    Create new survey
// @access  Private (Admin/Supervisor)
router.post('/', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const surveyData = {
      ...req.body,
      createdBy: req.user._id
    };

    const survey = await Survey.create(surveyData);

    res.status(201).json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/surveys/:id
// @desc    Update survey
// @access  Private (Admin/Supervisor)
router.put('/:id', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    let survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Supervisors can only update surveys they created
    if (req.user.role === 'supervisor' && survey.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce sondage'
      });
    }

    survey = await Survey.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/surveys/:id
// @desc    Delete survey
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    await survey.deleteOne();

    res.json({
      success: true,
      message: 'Sondage supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/surveys/:id/status
// @desc    Update survey status
// @access  Private (Admin/Supervisor)
router.put('/:id/status', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['draft', 'active', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/surveys/:id/assign
// @desc    Assign survey to users
// @access  Private (Admin/Supervisor)
router.post('/:id/assign', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { userIds } = req.body;

    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    survey.assignedTo = [...new Set([...survey.assignedTo, ...userIds])];
    await survey.save();

    // Update user assignedSurveys
    const User = require('../models/User');
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { assignedSurveys: survey._id } }
    );

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/surveys/:id/duplicate
// @desc    Duplicate a survey
// @access  Private (Admin/Supervisor)
router.post('/:id/duplicate', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const originalSurvey = await Survey.findById(req.params.id);

    if (!originalSurvey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    const duplicatedSurvey = new Survey({
      title: `${originalSurvey.title} (Copie)`,
      description: originalSurvey.description,
      questions: originalSurvey.questions,
      settings: originalSurvey.settings,
      createdBy: req.user._id,
      status: 'draft'
    });

    await duplicatedSurvey.save();

    res.status(201).json({
      success: true,
      data: duplicatedSurvey
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
