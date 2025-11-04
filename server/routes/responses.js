const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Response, Survey, User } = require('../models');
const { protect, canAccessSurvey } = require('../middleware/auth');
const { sequelize } = require('../config/database');
const { notifyResponseSubmitted } = require('./notifications');

// @route   GET /api/responses
// @desc    Get all responses (filtered by role and survey)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { surveyId, startDate, endDate } = req.query;
    
    let whereClause = {};

    // Filter by survey
    if (surveyId) {
      whereClause.surveyId = surveyId;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.submittedAt = {};
      if (startDate) whereClause.submittedAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.submittedAt[Op.lte] = new Date(endDate);
    }

    // Field agents only see their own responses
    if (req.user.role === 'field_agent') {
      whereClause.respondentId = req.user.id;
    }
    // Supervisors see responses from their team
    else if (req.user.role === 'supervisor') {
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
      }
    }

    const responses = await Response.findAll({
      where: whereClause,
      include: [
        {
          model: Survey,
          as: 'survey',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'respondent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.json({
      success: true,
      count: responses.length,
      data: responses
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/responses/map
// @desc    Get responses with geolocation for map view (with filters)
// @access  Private
router.get('/map', protect, async (req, res, next) => {
  try {
    const { surveyId, agentId, startDate, endDate } = req.query;
    
    console.log('📍 /api/responses/map - Params:', {
      surveyId,
      agentId,
      startDate,
      endDate,
      userRole: req.user.role,
      userId: req.user.id
    });
    
    let whereClause = {
      location: {
        [Op.ne]: null
      }
    };

    // Filter by survey
    if (surveyId) {
      whereClause.surveyId = surveyId;
    }

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

    console.log('📍 whereClause:', JSON.stringify(whereClause, null, 2));
    
    const responses = await Response.findAll({
      where: whereClause,
      attributes: [
        'id',
        'surveyId',
        'npsScore',
        'csatScore',
        'cesScore',
        'answers',
        'submittedAt',
        [sequelize.fn('ST_X', sequelize.col('location')), 'longitude'],
        [sequelize.fn('ST_Y', sequelize.col('location')), 'latitude']
      ],
      include: [
        {
          model: User,
          as: 'respondent',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Survey,
          as: 'survey',
          attributes: ['id', 'title']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });
    
    console.log('📍 Responses found:', responses.length);

    // Format for map display
    const mapData = responses.map(r => {
      const longitude = r.getDataValue('longitude');
      const latitude = r.getDataValue('latitude');
      
      // Vérifier que les coordonnées sont valides
      if (longitude === null || latitude === null || isNaN(longitude) || isNaN(latitude)) {
        return null;
      }
      
      return {
        id: r.id,
        surveyId: r.surveyId,
        survey: r.survey,
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        npsScore: r.npsScore,
        csatScore: r.csatScore,
        cesScore: r.cesScore,
        submittedAt: r.submittedAt,
        respondent: r.respondent
      };
    }).filter(r => r !== null); // Filtrer les réponses sans coordonnées valides

    res.json({
      success: true,
      count: mapData.length,
      data: mapData
    });
  } catch (error) {
    console.error('Error in /api/responses/map:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données cartographiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/responses/:id
// @desc    Get response by ID
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const response = await Response.findByPk(req.params.id, {
      include: [
        {
          model: Survey,
          as: 'survey',
          attributes: ['id', 'title', 'questions']
        },
        {
          model: User,
          as: 'respondent',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

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
    const surveyDoc = await Survey.findByPk(survey);
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

    // Nettoyer et valider les answers et extraire les scores
    let cleanedAnswers = [];
    let npsScore = null;
    let csatScore = null;
    let cesScore = null;
    
    if (answers && Array.isArray(answers)) {
      cleanedAnswers = answers.map(answer => {
        const cleaned = {};
        
        // Propriétés obligatoires
        if (answer.questionId) cleaned.questionId = String(answer.questionId);
        if (answer.questionType) cleaned.questionType = String(answer.questionType);
        if (answer.value !== undefined && answer.value !== null) {
          // Nettoyer la valeur selon son type
          if (typeof answer.value === 'string' || typeof answer.value === 'number' || typeof answer.value === 'boolean') {
            cleaned.value = answer.value;
          } else if (Array.isArray(answer.value)) {
            cleaned.value = answer.value;
          } else if (typeof answer.value === 'object') {
            cleaned.value = answer.value;
          } else {
            cleaned.value = String(answer.value);
          }
          
          // Extraire les scores pour les types spécifiques
          if (answer.questionType === 'nps' && typeof answer.value === 'number') {
            const score = Number(answer.value);
            if (score >= 0 && score <= 10) {
              npsScore = score;
            }
          } else if (answer.questionType === 'csat' && typeof answer.value === 'number') {
            const score = Number(answer.value);
            if (score >= 1 && score <= 5) {
              csatScore = score;
            }
          } else if (answer.questionType === 'ces' && typeof answer.value === 'number') {
            const score = Number(answer.value);
            if (score >= 1 && score <= 7) {
              cesScore = score;
            }
          }
        }
        
        // Propriétés optionnelles
        if (answer.geolocation && typeof answer.geolocation === 'object') {
          cleaned.geolocation = answer.geolocation;
        }
        if (answer.areaMeasurement && typeof answer.areaMeasurement === 'object') {
          cleaned.areaMeasurement = answer.areaMeasurement;
        }
        
        return cleaned;
      });
    }

    // Nettoyer deviceInfo
    let cleanedDeviceInfo = null;
    if (deviceInfo && typeof deviceInfo === 'object' && !Array.isArray(deviceInfo)) {
      cleanedDeviceInfo = {
        userAgent: deviceInfo.userAgent ? String(deviceInfo.userAgent) : null,
        platform: deviceInfo.platform ? String(deviceInfo.platform) : null,
        online: Boolean(deviceInfo.online !== false)
      };
    }

    // Nettoyer metadata
    let cleanedMetadata = null;
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
      cleanedMetadata = {};
      if (metadata.startTime) cleanedMetadata.startTime = String(metadata.startTime);
      if (metadata.endTime) cleanedMetadata.endTime = String(metadata.endTime);
      if (metadata.duration !== undefined) cleanedMetadata.duration = Number(metadata.duration) || 0;
    }

    // Format location for PostGIS if provided
    let responseData = {
      surveyId: survey,
      respondentId: req.user.id,
      answers: cleanedAnswers,
      deviceInfo: cleanedDeviceInfo,
      metadata: cleanedMetadata,
      npsScore: npsScore,
      csatScore: csatScore,
      cesScore: cesScore,
      status: 'completed'
    };

    if (location && location.coordinates && location.coordinates.length === 2) {
      // Sécuriser contre les injections SQL en validant et en utilisant des paramètres
      const longitude = parseFloat(location.coordinates[0])
      const latitude = parseFloat(location.coordinates[1])
      
      // Vérifier que les coordonnées sont des nombres valides
      if (isNaN(longitude) || isNaN(latitude)) {
        return res.status(400).json({
          success: false,
          message: 'Coordonnées géographiques invalides'
        })
      }
      
      // Vérifier que les coordonnées sont dans des plages valides
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Coordonnées géographiques hors limites'
        })
      }
      
      // Use raw SQL for PostGIS geometry avec des valeurs sécurisées
      responseData.location = sequelize.literal(
        `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
      );
    }

    // Create response
    const response = await Response.create(responseData);

    // Update survey response count
    surveyDoc.responseCount += 1;
    await surveyDoc.save();

    // Créer une notification pour le créateur du sondage et le superviseur
    await notifyResponseSubmitted(survey, req.user.id);

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('❌ Error creating response:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.name === 'SequelizeDatabaseError' && error.message && error.message.includes('json')) {
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Erreur de format JSON. Veuillez vérifier les données de la réponse (answers, deviceInfo, metadata).'
      });
    }
    next(error);
  }
});

// @route   GET /api/responses/survey/:surveyId
// @desc    Get all responses for a survey
// @access  Private
router.get('/survey/:surveyId', protect, canAccessSurvey, async (req, res, next) => {
  try {
    const responses = await Response.findAll({
      where: { surveyId: req.params.surveyId },
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['submittedAt', 'DESC']]
    });

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
    const { agentId, startDate, endDate } = req.query;
    
    console.log('📍 /api/responses/survey/:surveyId/map - Params:', {
      surveyId: req.params.surveyId,
      agentId,
      startDate,
      endDate,
      userRole: req.user.role,
      userId: req.user.id
    });
    
    let whereClause = {
      surveyId: req.params.surveyId,
      location: {
        [Op.ne]: null
      }
    };

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

    console.log('📍 whereClause:', JSON.stringify(whereClause, null, 2));
    
    const responses = await Response.findAll({
      where: whereClause,
      attributes: [
        'id',
        'npsScore',
        'csatScore',
        'cesScore',
        'answers',
        'submittedAt',
        [sequelize.fn('ST_X', sequelize.col('location')), 'longitude'],
        [sequelize.fn('ST_Y', sequelize.col('location')), 'latitude']
      ],
      include: [{
        model: User,
        as: 'respondent',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
    
    console.log('📍 Responses found:', responses.length);

    // Format for map display
    const mapData = responses.map(r => ({
      id: r.id,
      coordinates: [parseFloat(r.getDataValue('longitude')), parseFloat(r.getDataValue('latitude'))],
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
        const survey = await Survey.findByPk(responseData.survey);
        if (!survey) {
          errors.push({ 
            response: responseData, 
            error: 'Sondage non trouvé' 
          });
          continue;
        }

        // Format location for PostGIS if provided
        const bulkResponseData = {
          ...responseData,
          surveyId: responseData.survey,
          respondentId: req.user.id,
          status: 'synced'
        };

        if (responseData.location && responseData.location.coordinates && responseData.location.coordinates.length === 2) {
          // Sécuriser contre les injections SQL
          const longitude = parseFloat(responseData.location.coordinates[0])
          const latitude = parseFloat(responseData.location.coordinates[1])
          
          // Vérifier que les coordonnées sont des nombres valides
          if (!isNaN(longitude) && !isNaN(latitude)) {
            // Vérifier que les coordonnées sont dans des plages valides
            if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
              bulkResponseData.location = sequelize.literal(
                `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
              );
            }
          }
        }

        const response = await Response.create(bulkResponseData);

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
