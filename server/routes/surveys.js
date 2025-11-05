const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Survey, User, SurveyAssignee } = require('../models');
const { protect, authorize, canAccessSurvey } = require('../middleware/auth');
const { notifySurveyAssignment, notifyTeamJoined, notifySurveyCreated } = require('./notifications');

// @route   GET /api/surveys
// @desc    Get all surveys (filtered by role)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    // Vérifier et fermer automatiquement tous les sondages expirés
    await Survey.closeExpiredSurveys();
    
    let whereClause = {};

    // Field agents only see assigned surveys
    if (req.user.role === 'field_agent') {
      const assignedSurveys = await SurveyAssignee.findAll({
        where: { userId: req.user.id },
        attributes: ['surveyId']
      });
      whereClause.id = {
        [Op.in]: assignedSurveys.map(s => s.surveyId)
      };
    }
    // Supervisors see surveys assigned to them + surveys they created
    else if (req.user.role === 'supervisor') {
      // Get surveys assigned to the supervisor
      const assignedSurveys = await SurveyAssignee.findAll({
        where: { userId: req.user.id },
        attributes: ['surveyId']
      });
      const assignedSurveyIds = assignedSurveys.map(s => s.surveyId);

      // Combine: surveys assigned to supervisor OR created by supervisor
      whereClause[Op.or] = [
        { id: { [Op.in]: assignedSurveyIds } },
        { createdById: req.user.id }
      ];
    }
    // Admins see all surveys

    const surveys = await Survey.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

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
    // Vérifier et fermer automatiquement tous les sondages expirés
    await Survey.closeExpiredSurveys();
    
    const survey = await Survey.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ],
      hooks: false // Désactiver les hooks pour éviter la récursion
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Vérifier et fermer ce sondage spécifique s'il est expiré
    const wasClosed = await survey.checkAndCloseIfExpired();
    if (wasClosed) {
      // Recharger le sondage pour avoir le statut mis à jour
      await survey.reload();
      console.log(`✅ Sondage ${survey.id} fermé automatiquement lors de la récupération`);
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
    // Nettoyer et valider les questions
    let questions = req.body.questions;
    if (!Array.isArray(questions)) {
      questions = [];
    }
    
    // Nettoyer chaque question pour ne garder que les propriétés sérialisables
    questions = questions.map(q => {
      const cleaned = {
        id: q.id || `question_${Date.now()}_${Math.random()}`,
        type: q.type || 'text',
        label: q.label || '',
        required: Boolean(q.required),
        order: Number(q.order) || 0
      };
      
      // Ajouter les propriétés optionnelles seulement si elles existent et sont valides
      if (q.placeholder && typeof q.placeholder === 'string') cleaned.placeholder = q.placeholder;
      if (q.options && Array.isArray(q.options)) cleaned.options = q.options;
      if (q.validation && typeof q.validation === 'object' && !Array.isArray(q.validation)) {
        cleaned.validation = q.validation;
      }
      if (q.conditionalLogic && typeof q.conditionalLogic === 'object' && !Array.isArray(q.conditionalLogic)) {
        cleaned.conditionalLogic = q.conditionalLogic;
      }
      if (q.csatConfig && typeof q.csatConfig === 'object' && !Array.isArray(q.csatConfig)) {
        cleaned.csatConfig = q.csatConfig;
      }
      if (q.maxSelections) cleaned.maxSelections = Number(q.maxSelections);
      if (q.demographicType && typeof q.demographicType === 'string') cleaned.demographicType = q.demographicType;
      if (q.matrixRows && Array.isArray(q.matrixRows)) cleaned.matrixRows = q.matrixRows;
      if (q.matrixColumns && Array.isArray(q.matrixColumns)) cleaned.matrixColumns = q.matrixColumns;
      if (q.images && Array.isArray(q.images)) cleaned.images = q.images;
      if (q.sliderConfig && typeof q.sliderConfig === 'object' && !Array.isArray(q.sliderConfig)) {
        cleaned.sliderConfig = q.sliderConfig;
      }
      if (q.fileConfig && typeof q.fileConfig === 'object' && !Array.isArray(q.fileConfig)) {
        cleaned.fileConfig = q.fileConfig;
      }
      if (q.phoneConfig && typeof q.phoneConfig === 'object' && !Array.isArray(q.phoneConfig)) {
        cleaned.phoneConfig = q.phoneConfig;
      }
      
      return cleaned;
    });
    
    // Nettoyer et valider les settings
    let settings = req.body.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      settings = {
        allowAnonymous: false,
        requireGeolocation: false,
        allowOfflineSubmission: true,
        showProgressBar: true,
        randomizeQuestions: false
      };
    } else {
      // Nettoyer les settings pour ne garder que les valeurs booléennes valides
      settings = {
        allowAnonymous: Boolean(settings.allowAnonymous),
        requireGeolocation: Boolean(settings.requireGeolocation),
        allowOfflineSubmission: settings.allowOfflineSubmission !== false,
        showProgressBar: settings.showProgressBar !== false,
        randomizeQuestions: Boolean(settings.randomizeQuestions)
      };
    }

    const surveyData = {
      title: req.body.title?.trim() || '',
      description: req.body.description?.trim() || null,
      questions: questions,
      status: req.body.status || 'draft',
      targetResponses: Number(req.body.targetResponses) || 0,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      originalEndDate: req.body.originalEndDate || null,
      settings: settings,
      createdById: req.user.id
    };

    const survey = await Survey.create(surveyData);

    // Handle assignedTo if provided
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      await survey.setAssignedTo(req.body.assignedTo);
    }

    // Notify admins if created by supervisor
    await notifySurveyCreated(survey.id, req.user.id);

    // Reload with associations
    await survey.reload({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('❌ Error creating survey:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.name === 'SequelizeDatabaseError' && error.message && error.message.includes('json')) {
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Erreur de format JSON. Veuillez vérifier les données du sondage (questions et settings).'
      });
    }
    next(error);
  }
});

// @route   PUT /api/surveys/:id
// @desc    Update survey
// @access  Private (Admin/Supervisor)
router.put('/:id', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Supervisors can only update surveys they created
    if (req.user.role === 'supervisor' && survey.createdById !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce sondage'
      });
    }

    // Nettoyer et valider les questions si elles sont présentes
    let updateData = { ...req.body };
    if (updateData.questions !== undefined) {
      if (!Array.isArray(updateData.questions)) {
        updateData.questions = [];
      } else {
        updateData.questions = updateData.questions.map(q => {
          const cleaned = {
            id: q.id || `question_${Date.now()}_${Math.random()}`,
            type: q.type || 'text',
            label: q.label || '',
            required: Boolean(q.required),
            order: Number(q.order) || 0
          };
          
          if (q.placeholder && typeof q.placeholder === 'string') cleaned.placeholder = q.placeholder;
          if (q.options && Array.isArray(q.options)) cleaned.options = q.options;
          if (q.validation && typeof q.validation === 'object' && !Array.isArray(q.validation)) cleaned.validation = q.validation;
          if (q.conditionalLogic && typeof q.conditionalLogic === 'object' && !Array.isArray(q.conditionalLogic)) cleaned.conditionalLogic = q.conditionalLogic;
          if (q.csatConfig && typeof q.csatConfig === 'object' && !Array.isArray(q.csatConfig)) cleaned.csatConfig = q.csatConfig;
          if (q.maxSelections) cleaned.maxSelections = Number(q.maxSelections);
          if (q.demographicType && typeof q.demographicType === 'string') cleaned.demographicType = q.demographicType;
          if (q.matrixRows && Array.isArray(q.matrixRows)) cleaned.matrixRows = q.matrixRows;
          if (q.matrixColumns && Array.isArray(q.matrixColumns)) cleaned.matrixColumns = q.matrixColumns;
          if (q.images && Array.isArray(q.images)) cleaned.images = q.images;
          if (q.sliderConfig && typeof q.sliderConfig === 'object' && !Array.isArray(q.sliderConfig)) cleaned.sliderConfig = q.sliderConfig;
          if (q.fileConfig && typeof q.fileConfig === 'object' && !Array.isArray(q.fileConfig)) cleaned.fileConfig = q.fileConfig;
          if (q.phoneConfig && typeof q.phoneConfig === 'object' && !Array.isArray(q.phoneConfig)) cleaned.phoneConfig = q.phoneConfig;
          
          return cleaned;
        });
      }
    }

    // Nettoyer et valider les settings si présents
    if (updateData.settings !== undefined) {
      if (!updateData.settings || typeof updateData.settings !== 'object' || Array.isArray(updateData.settings)) {
        updateData.settings = {
          allowAnonymous: false,
          requireGeolocation: false,
          allowOfflineSubmission: true,
          showProgressBar: true,
          randomizeQuestions: false
        };
      } else {
        updateData.settings = {
          allowAnonymous: Boolean(updateData.settings.allowAnonymous),
          requireGeolocation: Boolean(updateData.settings.requireGeolocation),
          allowOfflineSubmission: updateData.settings.allowOfflineSubmission !== false,
          showProgressBar: updateData.settings.showProgressBar !== false,
          randomizeQuestions: Boolean(updateData.settings.randomizeQuestions)
        };
      }
    }

    // Update survey
    await survey.update(updateData);

    // Handle assignedTo if provided
    if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
      await survey.setAssignedTo(req.body.assignedTo);
    }

    // Reload with associations
    await survey.reload({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    console.error('❌ Error updating survey:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.name === 'SequelizeDatabaseError' && error.message && error.message.includes('json')) {
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: 'Erreur de format JSON. Veuillez vérifier les données du sondage (questions et settings).'
      });
    }
    next(error);
  }
});

// @route   DELETE /api/surveys/:id
// @desc    Delete survey
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    await survey.destroy();

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

    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    survey.status = status;
    await survey.save();

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

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir une liste d\'utilisateurs à assigner'
      });
    }

    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Verify that all users exist
    const usersToAssign = await User.findAll({
      where: { id: { [Op.in]: userIds } }
    });

    if (usersToAssign.length !== userIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Certains utilisateurs n\'existent pas'
      });
    }

    // Check permissions based on role
    if (req.user.role === 'supervisor') {
      // Supervisors can assign field_agents
      const Team = require('../models/Team');
      let team = await Team.findOne({
        where: { supervisorId: req.user.id }
      });

      // If supervisor doesn't have a team, create one automatically
      if (!team) {
        console.log('🔧 Création automatique d\'une équipe pour le superviseur');
        const supervisor = await User.findByPk(req.user.id);
        team = await Team.create({
          name: `Équipe de ${supervisor.firstName} ${supervisor.lastName}`,
          description: 'Équipe créée automatiquement',
          supervisorId: req.user.id,
          isActive: true
        });
        console.log('✅ Équipe créée:', team.id);
      }

      // Verify all users are field_agents
      const invalidUsers = usersToAssign.filter(u => u.role !== 'field_agent');
      if (invalidUsers.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez assigner que des agents de terrain'
        });
      }

      // Add agents to supervisor's team if they don't have one
      for (const user of usersToAssign) {
        if (!user.teamId) {
          console.log(`👥 Ajout de l'agent ${user.firstName} ${user.lastName} à l'équipe ${team.name}`);
          await User.update(
            { teamId: team.id },
            { where: { id: user.id } }
          );
          // Notifier l'agent qu'il a rejoint une équipe
          await notifyTeamJoined(user.id, team.id, req.user.id);
        } else if (user.teamId !== team.id) {
          // Agent belongs to another team
          return res.status(403).json({
            success: false,
            message: `L'agent ${user.firstName} ${user.lastName} appartient déjà à une autre équipe`
          });
        }
      }
    } else if (req.user.role === 'admin') {
      // Admins can assign to field_agents AND supervisors
      const invalidUsers = usersToAssign.filter(
        u => !['field_agent', 'supervisor'].includes(u.role)
      );

      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Vous ne pouvez assigner ce sondage qu\'aux agents de terrain et superviseurs'
        });
      }
    }

    // Get current assigned users
    const currentAssigned = await survey.getAssignedTo();
    const currentIds = currentAssigned.map(u => u.id);
    
    // Merge with new user IDs (avoid duplicates)
    const allUserIds = [...new Set([...currentIds, ...userIds])];
    await survey.setAssignedTo(allUserIds);

    // Créer des notifications pour les nouveaux utilisateurs assignés
    const newlyAssignedIds = userIds.filter(id => !currentIds.includes(id));
    if (newlyAssignedIds.length > 0) {
      await notifySurveyAssignment(survey.id, newlyAssignedIds, req.user.id);
    }

    // Reload with associations
    await survey.reload({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      message: `Sondage assigné avec succès à ${userIds.length} utilisateur(s)`,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/surveys/:id/unassign
// @desc    Unassign users from survey
// @access  Private (Admin/Supervisor)
router.delete('/:id/unassign', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir une liste d\'utilisateurs à retirer'
      });
    }

    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Supervisors cannot remove themselves from surveys they didn't create
    if (req.user.role === 'supervisor') {
      // Check if supervisor is trying to remove himself from a survey he didn't create
      if (userIds.includes(req.user.id) && survey.createdById !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Vous ne pouvez pas vous retirer d\'un sondage qui vous a été assigné par un administrateur'
        });
      }
    }

    // Get current assigned users
    const currentAssigned = await survey.getAssignedTo();
    const currentIds = currentAssigned.map(u => u.id);
    
    // Remove specified user IDs
    const newUserIds = currentIds.filter(id => !userIds.includes(id));
    await survey.setAssignedTo(newUserIds);

    // Reload with associations
    await survey.reload({
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      message: `${userIds.length} utilisateur(s) retiré(s) avec succès`,
      data: survey
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/surveys/:id/assignable-users
// @desc    Get list of users that can be assigned to this survey
// @access  Private (Admin/Supervisor)
router.get('/:id/assignable-users', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const survey = await Survey.findByPk(req.params.id);

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    let whereClause = { isActive: true };

    if (req.user.role === 'supervisor') {
      // Supervisors can see:
      // 1. Field agents from their team (if they have one)
      // 2. All field agents without a team (available to recruit)
      const Team = require('../models/Team');
      const team = await Team.findOne({
        where: { supervisorId: req.user.id }
      });

      console.log('🔍 DEBUG - Superviseur:', req.user.id);
      console.log('🔍 DEBUG - Équipe trouvée:', team ? `Oui (ID: ${team.id}, Nom: ${team.name})` : 'Non');
      
      if (!team) {
        console.log('⚠️ Ce superviseur n\'a pas d\'équipe assignée - Affichage des agents disponibles');
        // Show all field_agents without a team (available to recruit)
        whereClause.teamId = null;
        whereClause.role = 'field_agent';
      } else {
        // Show field_agents from supervisor's team OR without any team
        whereClause[Op.or] = [
          { teamId: team.id },
          { teamId: null }
        ];
        whereClause.role = 'field_agent';
      }
      
      console.log('🔍 DEBUG - whereClause pour superviseur:', whereClause);
    } else if (req.user.role === 'admin') {
      // Admins can see field_agents and supervisors
      whereClause.role = { [Op.in]: ['field_agent', 'supervisor'] };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'teamId'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    console.log('✅ DEBUG - Utilisateurs trouvés:', users.length);
    if (users.length > 0) {
      console.log('✅ DEBUG - Liste des utilisateurs:', users.map(u => ({
        nom: `${u.firstName} ${u.lastName}`,
        role: u.role
      })));
    }

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/surveys/close-expired
// @desc    Force close all expired surveys (can be called manually or by cron)
// @access  Private (Admin only)
router.post('/close-expired', protect, authorize('admin'), async (req, res, next) => {
  try {
    const closedCount = await Survey.closeExpiredSurveys();
    res.json({
      success: true,
      message: `${closedCount} sondage(s) fermé(s) automatiquement`,
      closedCount
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
    const originalSurvey = await Survey.findByPk(req.params.id);

    if (!originalSurvey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    const duplicatedSurvey = await Survey.create({
      title: `${originalSurvey.title} (Copie)`,
      description: originalSurvey.description,
      questions: originalSurvey.questions,
      settings: originalSurvey.settings,
      createdById: req.user.id,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      data: duplicatedSurvey
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
