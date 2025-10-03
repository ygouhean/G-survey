const express = require('express');
const router = express.Router();
const Response = require('../models/Response');
const Survey = require('../models/Survey');
const { protect, canAccessSurvey } = require('../middleware/auth');

// @route   GET /api/analytics/survey/:surveyId
// @desc    Get analytics for a survey
// @access  Private
router.get('/survey/:surveyId', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const { period } = req.query; // day, week, month, year
    
    const survey = await Survey.findById(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Get all responses for this survey
    const responses = await Response.find({ survey: req.params.surveyId });

    // Calculate NPS
    const npsResponses = responses.filter(r => r.npsScore !== undefined);
    const promoters = npsResponses.filter(r => r.npsScore >= 9).length;
    const detractors = npsResponses.filter(r => r.npsScore <= 6).length;
    const npsScore = npsResponses.length > 0 
      ? ((promoters - detractors) / npsResponses.length) * 100 
      : 0;

    // Calculate CSAT
    const csatResponses = responses.filter(r => r.csatScore !== undefined);
    const csatAverage = csatResponses.length > 0
      ? csatResponses.reduce((sum, r) => sum + r.csatScore, 0) / csatResponses.length
      : 0;

    // Calculate CES
    const cesResponses = responses.filter(r => r.cesScore !== undefined);
    const cesAverage = cesResponses.length > 0
      ? cesResponses.reduce((sum, r) => sum + r.cesScore, 0) / cesResponses.length
      : 0;

    // Response rate
    const responseRate = survey.targetResponses > 0
      ? (responses.length / survey.targetResponses) * 100
      : 0;

    // Completion rate
    const completedResponses = responses.filter(r => r.status === 'completed').length;
    const completionRate = responses.length > 0
      ? (completedResponses / responses.length) * 100
      : 0;

    // Time-based analytics
    let timeSeriesData = [];
    if (period) {
      timeSeriesData = await getTimeSeriesData(req.params.surveyId, period);
    }

    // Geographic distribution
    const geoResponses = responses.filter(r => r.location && r.location.coordinates);
    const geographicData = {
      total: geoResponses.length,
      percentage: responses.length > 0 ? (geoResponses.length / responses.length) * 100 : 0
    };

    res.json({
      success: true,
      data: {
        overview: {
          totalResponses: responses.length,
          targetResponses: survey.targetResponses,
          responseRate: Math.round(responseRate * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100
        },
        metrics: {
          nps: {
            score: Math.round(npsScore * 100) / 100,
            promoters,
            passives: npsResponses.length - promoters - detractors,
            detractors,
            total: npsResponses.length
          },
          csat: {
            average: Math.round(csatAverage * 100) / 100,
            total: csatResponses.length,
            distribution: calculateDistribution(csatResponses, 'csatScore', 5)
          },
          ces: {
            average: Math.round(cesAverage * 100) / 100,
            total: cesResponses.length,
            distribution: calculateDistribution(cesResponses, 'cesScore', 7)
          }
        },
        geographic: geographicData,
        timeSeries: timeSeriesData
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    let surveyQuery = {};

    // Filter surveys based on user role
    if (req.user.role === 'field_agent') {
      surveyQuery.assignedTo = req.user._id;
    } else if (req.user.role === 'supervisor') {
      const Team = require('../models/Team');
      const team = await Team.findOne({ supervisor: req.user._id });
      if (team) {
        surveyQuery.assignedTo = { $in: team.members };
      }
    }

    const surveys = await Survey.find(surveyQuery);
    const surveyIds = surveys.map(s => s._id);

    let responseQuery = { survey: { $in: surveyIds } };
    
    // Get responses
    const allResponses = await Response.find(responseQuery);
    
    // Today's responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResponses = allResponses.filter(r => r.submittedAt >= today);

    // This week's responses
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekResponses = allResponses.filter(r => r.submittedAt >= weekAgo);

    // This month's responses
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthResponses = allResponses.filter(r => r.submittedAt >= monthAgo);

    // Survey status breakdown
    const surveysByStatus = {
      draft: surveys.filter(s => s.status === 'draft').length,
      active: surveys.filter(s => s.status === 'active').length,
      paused: surveys.filter(s => s.status === 'paused').length,
      closed: surveys.filter(s => s.status === 'closed').length
    };

    // Average NPS
    const npsResponses = allResponses.filter(r => r.npsScore !== undefined);
    const avgNPS = npsResponses.length > 0
      ? npsResponses.reduce((sum, r) => sum + r.npsScore, 0) / npsResponses.length
      : 0;

    res.json({
      success: true,
      data: {
        totalSurveys: surveys.length,
        totalResponses: allResponses.length,
        responsesToday: todayResponses.length,
        responsesThisWeek: weekResponses.length,
        responsesThisMonth: monthResponses.length,
        surveysByStatus,
        averageNPS: Math.round(avgNPS * 100) / 100,
        recentActivity: await getRecentActivity(surveyIds, req.user)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/analytics/comparison
// @desc    Compare multiple surveys
// @access  Private
router.get('/comparison', protect, async (req, res, next) => {
  try {
    const { surveyIds } = req.query;
    
    if (!surveyIds) {
      return res.status(400).json({
        success: false,
        message: 'IDs de sondage requis'
      });
    }

    const ids = surveyIds.split(',');
    const comparisonData = [];

    for (const id of ids) {
      const survey = await Survey.findById(id);
      if (!survey) continue;

      const responses = await Response.find({ survey: id });
      
      const npsResponses = responses.filter(r => r.npsScore !== undefined);
      const avgNPS = npsResponses.length > 0
        ? npsResponses.reduce((sum, r) => sum + r.npsScore, 0) / npsResponses.length
        : 0;

      const csatResponses = responses.filter(r => r.csatScore !== undefined);
      const avgCSAT = csatResponses.length > 0
        ? csatResponses.reduce((sum, r) => sum + r.csatScore, 0) / csatResponses.length
        : 0;

      comparisonData.push({
        surveyId: id,
        title: survey.title,
        totalResponses: responses.length,
        avgNPS: Math.round(avgNPS * 100) / 100,
        avgCSAT: Math.round(avgCSAT * 100) / 100,
        responseRate: survey.targetResponses > 0 
          ? (responses.length / survey.targetResponses) * 100 
          : 0
      });
    }

    res.json({
      success: true,
      data: comparisonData
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get time series data
async function getTimeSeriesData(surveyId, period) {
  const now = new Date();
  let startDate;
  let groupBy;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      groupBy = { hour: { $hour: '$submittedAt' } };
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      groupBy = { day: { $dayOfMonth: '$submittedAt' } };
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      groupBy = { day: { $dayOfMonth: '$submittedAt' } };
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      groupBy = { month: { $month: '$submittedAt' } };
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      groupBy = { day: { $dayOfMonth: '$submittedAt' } };
  }

  const data = await Response.aggregate([
    {
      $match: {
        survey: surveyId,
        submittedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
        avgNPS: { $avg: '$npsScore' },
        avgCSAT: { $avg: '$csatScore' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return data;
}

// Helper function to calculate distribution
function calculateDistribution(responses, field, maxValue) {
  const distribution = {};
  for (let i = 1; i <= maxValue; i++) {
    distribution[i] = 0;
  }
  
  responses.forEach(r => {
    const value = Math.round(r[field]);
    if (value >= 1 && value <= maxValue) {
      distribution[value]++;
    }
  });
  
  return distribution;
}

// Helper function to get recent activity
async function getRecentActivity(surveyIds, user) {
  const recentResponses = await Response.find({ 
    survey: { $in: surveyIds } 
  })
    .sort('-submittedAt')
    .limit(10)
    .populate('survey', 'title')
    .populate('respondent', 'firstName lastName');

  return recentResponses.map(r => ({
    id: r._id,
    survey: r.survey.title,
    respondent: `${r.respondent.firstName} ${r.respondent.lastName}`,
    submittedAt: r.submittedAt,
    npsScore: r.npsScore
  }));
}

module.exports = router;
