const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Response, Survey, User } = require('../models');
const { protect, canAccessSurvey } = require('../middleware/auth');
const { sequelize } = require('../config/database');

// @route   GET /api/analytics/survey/:surveyId
// @desc    Get analytics for a survey
// @access  Private
router.get('/survey/:surveyId', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const { period, agentId, startDate, endDate } = req.query; // day, week, month, year
    
    console.log('📊 /api/analytics/survey/:surveyId - Params:', {
      surveyId: req.params.surveyId,
      period,
      agentId,
      startDate,
      endDate,
      userRole: req.user.role,
      userId: req.user.id
    });
    
    const survey = await Survey.findByPk(req.params.surveyId);
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Build where clause for filtering responses
    let whereClause = { surveyId: req.params.surveyId };
    
    // Filter by date range
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.submittedAt[Op.gte] = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.submittedAt[Op.lte] = end;
      }
    }
    
    // Gestion des permissions et filtres par agent
    if (req.user.role === 'field_agent') {
      // Les field agents ne voient que leurs propres réponses
      whereClause.respondentId = req.user.id;
    } else if (req.user.role === 'supervisor') {
      // Les superviseurs peuvent filtrer par agent ou voir toute leur équipe
      if (agentId) {
        // Vérifier que l'agent fait partie de l'équipe du superviseur
        const Team = require('../models/Team');
        const team = await Team.findOne({ 
          where: { supervisorId: req.user.id },
          include: [{
            model: User,
            as: 'members',
            attributes: ['id']
          }]
        });
        
        if (team && team.members.length > 0) {
          const memberIds = team.members.map(m => m.id);
          console.log('👥 IDs des membres de l\'équipe:', memberIds);
          console.log('🔍 Agent recherché:', agentId, '(Type:', typeof agentId, ')');
          
          // Convertir les IDs en string pour la comparaison
          const memberIdsStr = memberIds.map(id => String(id));
          const agentIdStr = String(agentId);
          
          // Vérifier que l'agent sélectionné fait partie de l'équipe
          if (memberIdsStr.includes(agentIdStr)) {
            console.log('✅ Agent trouvé dans l\'équipe');
            whereClause.respondentId = agentId;
          } else {
            console.log('❌ Agent NON trouvé dans l\'équipe');
            // L'agent ne fait pas partie de l'équipe, ne rien retourner
            whereClause.respondentId = null;
          }
        } else {
          whereClause.respondentId = null;
        }
      } else {
        // Pas d'agent spécifié, montrer toute l'équipe
        const Team = require('../models/Team');
        const team = await Team.findOne({ 
          where: { supervisorId: req.user.id },
          include: [{
            model: User,
            as: 'members',
            attributes: ['id']
          }]
        });
        
        if (team && team.members.length > 0) {
          const memberIds = team.members.map(m => m.id);
          whereClause.respondentId = { [Op.in]: memberIds };
        } else {
          whereClause.respondentId = null;
        }
      }
    } else if (req.user.role === 'admin') {
      // Les admins peuvent filtrer par agent ou tout voir
      if (agentId) {
        whereClause.respondentId = agentId;
      }
      // Sinon, pas de filtre sur respondentId (voir toutes les réponses)
    }

    console.log('📊 Analytics whereClause:', JSON.stringify(whereClause, null, 2));

    // Get all responses for this survey with filters
    const responses = await Response.findAll({
      where: whereClause
    });
    
    console.log('📊 Responses found for analytics:', responses.length);

    // Calculate NPS
    const npsResponses = responses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
    const promoters = npsResponses.filter(r => r.npsScore >= 9).length;
    const detractors = npsResponses.filter(r => r.npsScore <= 6).length;
    const npsScore = npsResponses.length > 0 
      ? ((promoters - detractors) / npsResponses.length) * 100 
      : 0;

    // Calculate CSAT
    const csatResponses = responses.filter(r => r.csatScore !== null && r.csatScore !== undefined);
    const csatAverage = csatResponses.length > 0
      ? csatResponses.reduce((sum, r) => sum + r.csatScore, 0) / csatResponses.length
      : 0;

    // Calculate CES
    const cesResponses = responses.filter(r => r.cesScore !== null && r.cesScore !== undefined);
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
    const geoResponses = responses.filter(r => r.location !== null);
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
    const { SurveyAssignee } = require('../models');
    let surveyWhereClause = {};

    // Filter surveys based on user role
    if (req.user.role === 'field_agent') {
      const assignedSurveys = await SurveyAssignee.findAll({
        where: { userId: req.user.id },
        attributes: ['surveyId']
      });
      surveyWhereClause.id = {
        [Op.in]: assignedSurveys.map(s => s.surveyId)
      };
    } else if (req.user.role === 'supervisor') {
      const Team = require('../models/Team');
      const team = await Team.findOne({ 
        where: { supervisorId: req.user.id },
        include: [{
          model: User,
          as: 'members',
          attributes: ['id']
        }]
      });
      if (team && team.members.length > 0) {
        const memberIds = team.members.map(m => m.id);
        const assignedSurveys = await SurveyAssignee.findAll({
          where: { userId: { [Op.in]: memberIds } },
          attributes: ['surveyId']
        });
        surveyWhereClause.id = {
          [Op.in]: [...new Set(assignedSurveys.map(s => s.surveyId))]
        };
      }
    }

    const surveys = await Survey.findAll({ where: surveyWhereClause });
    const surveyIds = surveys.map(s => s.id);

    let responseQuery = { surveyId: { [Op.in]: surveyIds } };
    
    // Get responses
    const allResponses = await Response.findAll({ where: responseQuery });
    
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
    const npsResponses = allResponses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
    const avgNPS = npsResponses.length > 0
      ? npsResponses.reduce((sum, r) => sum + r.npsScore, 0) / npsResponses.length
      : 0;

    // Calculate changes (comparison with previous period)
    const changes = await calculateChanges(surveys, allResponses, surveyIds, npsResponses);

    // Weekly activity (last 7 days)
    const weeklyActivity = await getWeeklyActivity(surveyIds);

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
        recentActivity: await getRecentActivity(surveyIds, req.user),
        weeklyActivity,
        changes
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
      const survey = await Survey.findByPk(id);
      if (!survey) continue;

      const responses = await Response.findAll({ where: { surveyId: id } });
      
      const npsResponses = responses.filter(r => r.npsScore !== null && r.npsScore !== undefined);
      const avgNPS = npsResponses.length > 0
        ? npsResponses.reduce((sum, r) => sum + r.npsScore, 0) / npsResponses.length
        : 0;

      const csatResponses = responses.filter(r => r.csatScore !== null && r.csatScore !== undefined);
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
  let dateFormat;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      dateFormat = 'YYYY-MM-DD HH24';
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      dateFormat = 'YYYY-MM';
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 30));
      dateFormat = 'YYYY-MM-DD';
  }

  const [results] = await sequelize.query(`
    SELECT 
      TO_CHAR("submittedAt", :dateFormat) as period,
      COUNT(*) as count,
      AVG("npsScore") as "avgNPS",
      AVG("csatScore") as "avgCSAT"
    FROM responses
    WHERE "surveyId" = :surveyId
      AND "submittedAt" >= :startDate
    GROUP BY TO_CHAR("submittedAt", :dateFormat)
    ORDER BY period
  `, {
    replacements: {
      surveyId,
      startDate,
      dateFormat
    }
  });

  return results.map(r => ({
    _id: r.period,
    count: parseInt(r.count),
    avgNPS: parseFloat(r.avgNPS) || 0,
    avgCSAT: parseFloat(r.avgCSAT) || 0
  }));
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

// Helper function to calculate changes from previous periods
async function calculateChanges(surveys, allResponses, surveyIds, npsResponses) {
  const now = new Date();
  
  // This month period
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  thisMonthStart.setHours(0, 0, 0, 0);
  
  // Last month period
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  lastMonthStart.setHours(0, 0, 0, 0);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
  // Today period
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  // Yesterday period
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);
  
  // Calculate percentage change helper
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  // 1. Total Surveys - Compare surveys created this month vs last month
  const surveysThisMonth = surveys.filter(s => {
    const createdAt = new Date(s.createdAt);
    return createdAt >= thisMonthStart;
  }).length;
  
  const surveysLastMonth = await Survey.count({
    where: {
      id: { [Op.in]: surveyIds },
      createdAt: {
        [Op.gte]: lastMonthStart,
        [Op.lte]: lastMonthEnd
      }
    }
  });
  
  const surveysChange = calculatePercentageChange(surveysThisMonth, surveysLastMonth);
  
  // 2. Total Responses - Compare responses this month vs last month
  const responsesThisMonth = allResponses.filter(r => {
    if (!r.submittedAt) return false;
    const submittedAt = new Date(r.submittedAt);
    return submittedAt >= thisMonthStart;
  }).length;
  
  const responsesLastMonth = await Response.count({
    where: {
      surveyId: { [Op.in]: surveyIds },
      submittedAt: {
        [Op.gte]: lastMonthStart,
        [Op.lte]: lastMonthEnd
      }
    }
  });
  
  const responsesChange = calculatePercentageChange(responsesThisMonth, responsesLastMonth);
  
  // 3. Today - Compare today vs yesterday
  const todayCount = allResponses.filter(r => {
    if (!r.submittedAt) return false;
    const submittedAt = new Date(r.submittedAt);
    return submittedAt >= todayStart;
  }).length;
  
  const yesterdayCount = await Response.count({
    where: {
      surveyId: { [Op.in]: surveyIds },
      submittedAt: {
        [Op.gte]: yesterdayStart,
        [Op.lte]: yesterdayEnd
      }
    }
  });
  
  const todayChange = calculatePercentageChange(todayCount, yesterdayCount);
  
  // 4. NPS Average - Compare this month vs last month
  const npsThisMonth = allResponses.filter(r => {
    if (!r.submittedAt || r.npsScore === null || r.npsScore === undefined) return false;
    const submittedAt = new Date(r.submittedAt);
    return submittedAt >= thisMonthStart;
  });
  
  const avgNPSThisMonth = npsThisMonth.length > 0
    ? npsThisMonth.reduce((sum, r) => sum + r.npsScore, 0) / npsThisMonth.length
    : 0;
  
  const npsLastMonth = await Response.findAll({
    where: {
      surveyId: { [Op.in]: surveyIds },
      submittedAt: {
        [Op.gte]: lastMonthStart,
        [Op.lte]: lastMonthEnd
      },
      npsScore: { [Op.ne]: null }
    }
  });
  
  const avgNPSLastMonth = npsLastMonth.length > 0
    ? npsLastMonth.reduce((sum, r) => sum + r.npsScore, 0) / npsLastMonth.length
    : 0;
  
  // For NPS, use absolute difference (not percentage) as it's a score, then convert to percentage for display
  const npsDifference = avgNPSThisMonth - avgNPSLastMonth;
  const npsChange = avgNPSLastMonth > 0
    ? Math.round((npsDifference / avgNPSLastMonth) * 100 * 10) / 10
    : (avgNPSThisMonth > 0 ? 100 : 0);
  
  return {
    totalSurveys: surveysChange,
    totalResponses: responsesChange,
    responsesToday: todayChange,
    averageNPS: npsChange
  };
}

// Helper function to get weekly activity (last 7 days)
async function getWeeklyActivity(surveyIds) {
  // Get date range for last 7 days
  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  sixDaysAgo.setHours(0, 0, 0, 0);

  // Get all responses from the last 7 days
  const responses = await Response.findAll({
    where: {
      surveyId: { [Op.in]: surveyIds },
      submittedAt: { [Op.gte]: sixDaysAgo }
    }
  });

  // Initialize array for 7 days with 0, one for each of the last 7 days
  const activityByDay = {};
  const dayLabels = [];
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  
  // Initialize each of the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(sixDaysAgo);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    activityByDay[dateKey] = 0;
    
    // Get day name for label
    const dayOfWeek = date.getDay();
    dayLabels.push(dayNames[dayOfWeek]);
  }

  // Group responses by actual date (not day of week)
  responses.forEach(response => {
    if (response.submittedAt) {
      const responseDate = new Date(response.submittedAt);
      responseDate.setHours(0, 0, 0, 0);
      const dateKey = responseDate.toISOString().split('T')[0];
      
      if (activityByDay.hasOwnProperty(dateKey)) {
        activityByDay[dateKey]++;
      }
    }
  });

  // Convert to array in chronological order
  const data = [];
  const labels = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sixDaysAgo);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    data.push(activityByDay[dateKey] || 0);
    labels.push(dayLabels[i]);
  }

  return {
    labels: labels,
    data: data
  };
}

// Helper function to get recent activity
async function getRecentActivity(surveyIds, user) {
  const recentResponses = await Response.findAll({
    where: {
      surveyId: { [Op.in]: surveyIds }
    },
    include: [
      {
        model: Survey,
        as: 'survey',
        attributes: ['id', 'title']
      },
      {
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    order: [['submittedAt', 'DESC']],
    limit: 10
  });

  return recentResponses.map(r => ({
    id: r.id,
    survey: r.survey.title,
    respondent: `${r.respondent.firstName} ${r.respondent.lastName}`,
    submittedAt: r.submittedAt,
    npsScore: r.npsScore
  }));
}

module.exports = router;
