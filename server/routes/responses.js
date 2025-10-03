const express = require('express');
const router = express.Router();
const Response = require('../models/Response');
const Survey = require('../models/Survey');
const { protect, canAccessSurvey } = require('../middleware/auth');

// @route   GET /api/responses
// @desc    Get all responses (filtered by role and survey)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { surveyId, startDate, endDate } = req.query;
    
    let query = {};

    // Filter by survey
    if (surveyId) {
      query.survey = surveyId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    // Field agents only see their own responses
    if (req.user.role === 'field_agent') {
      query.respondent = req.user._id;
    }
    // Supervisors see responses from their team
    else if (req.user.role === 'supervisor') {
      const Team = require('../models/Team');
      const team = await Team.findOne({ supervisor: req.user._id });
      if (team) {
        query.respondent = { $in: team.members };
      }
    }

    const responses = await Response.find(query)
      .populate('survey', 'title')
      .populate('respondent', 'firstName lastName email')
      .sort('-submittedAt');

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/responses/:id
// @desc    Get response by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate('survey', 'title questions')
      .populate('respondent', 'firstName lastName email');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Réponse non trouvée'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/responses
// @desc    Submit a response
// @access  Private
router.post('/', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const { survey, answers, location, deviceInfo, metadata } = req.body;

    // Check if survey exists and is active
    const surveyDoc = await Survey.findById(survey);
    if (!surveyDoc) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    if (surveyDoc.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Ce sondage n\'est pas actif'
      });
    }

    // Create response
    const response = await Response.create({
      survey,
      respondent: req.user._id,
      answers,
      location,
      deviceInfo,
      metadata,
      status: 'completed'
    });

    // Update survey response count
    surveyDoc.responseCount += 1;
    await surveyDoc.save();

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/responses/survey/:surveyId
// @desc    Get all responses for a survey
// @access  Private
router.get('/survey/:surveyId', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const responses = await Response.find({ survey: req.params.surveyId })
      .populate('respondent', 'firstName lastName email')
      .sort('-submittedAt');

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/responses/survey/:surveyId/map
// @desc    Get responses with geolocation for map view
// @access  Private
router.get('/survey/:surveyId/map', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const responses = await Response.find({ 
      survey: req.params.surveyId,
      'location.coordinates': { $exists: true }
    })
    .select('location npsScore csatScore cesScore answers submittedAt')
    .populate('respondent', 'firstName lastName');

    // Format for map display
    const mapData = responses.map(r => ({
      id: r._id,
      coordinates: r.location.coordinates,
      npsScore: r.npsScore,
      csatScore: r.csatScore,
      cesScore: r.cesScore,
      submittedAt: r.submittedAt,
      respondent: r.respondent
    }));

    res.json({
      success: true,
      count: mapData.length,
      data: mapData
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/responses/bulk
// @desc    Submit multiple responses (offline sync)
// @access  Private
router.post('/bulk', protect, async (req, res, next) => {
  try {
    const { responses } = req.body;

    if (!Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune réponse à synchroniser'
      });
    }

    const createdResponses = [];
    const errors = [];

    for (const responseData of responses) {
      try {
        const survey = await Survey.findById(responseData.survey);
        if (!survey) {
          errors.push({ 
            response: responseData, 
            error: 'Sondage non trouvé' 
          });
          continue;
        }

        const response = await Response.create({
          ...responseData,
          respondent: req.user._id,
          status: 'synced'
        });

        survey.responseCount += 1;
        await survey.save();

        createdResponses.push(response);
      } catch (error) {
        errors.push({ 
          response: responseData, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      synced: createdResponses.length,
      failed: errors.length,
      data: createdResponses,
      errors
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
