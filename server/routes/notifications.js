const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Notification, User, Survey, Team } = require('../models');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications (filtered by role)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let notifications;

    if (req.user.role === 'admin') {
      // Admin reçoit les notifications des agents et superviseurs
      notifications = await Notification.findAll({
        where: { 
          userId: req.user.id 
        },
        include: [
          {
            model: User,
            as: 'actor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          },
          {
            model: Survey,
            as: 'survey',
            attributes: ['id', 'title']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    } else if (req.user.role === 'supervisor') {
      // Superviseur reçoit ses propres notifications
      notifications = await Notification.findAll({
        where: { 
          userId: req.user.id 
        },
        include: [
          {
            model: User,
            as: 'actor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          },
          {
            model: Survey,
            as: 'survey',
            attributes: ['id', 'title']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    } else {
      // Agent de terrain reçoit ses propres notifications
      notifications = await Notification.findAll({
        where: { 
          userId: req.user.id 
        },
        include: [
          {
            model: User,
            as: 'actor',
            attributes: ['id', 'firstName', 'lastName', 'email', 'role']
          },
          {
            model: Survey,
            as: 'survey',
            attributes: ['id', 'title']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', protect, async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', protect, async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to create notifications
async function createNotification(data) {
  try {
    return await Notification.create(data);
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
  }
}

// Helper function to notify users when survey is assigned
async function notifySurveyAssignment(surveyId, userIds, assignedBy) {
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return;

    const assignor = await User.findByPk(assignedBy);
    if (!assignor) return;

    const notifications = [];
    const notifiedUserIds = new Set();

    // Notify assigned users
    for (const userId of userIds) {
      notifications.push({
        type: 'survey_assigned',
        title: 'Nouveau sondage assigné',
        message: `${assignor.firstName} ${assignor.lastName} vous a assigné le sondage "${survey.title}"`,
        userId,
        relatedUserId: assignedBy,
        relatedSurveyId: surveyId,
        link: `/surveys/${surveyId}`,
        isRead: false
      });
      notifiedUserIds.add(userId);
    }

    // If assignor is a supervisor (not admin), notify all admins
    if (assignor.role === 'supervisor') {
      const admins = await User.findAll({
        where: { 
          role: 'admin',
          isActive: true
        }
      });

      for (const admin of admins) {
        if (!notifiedUserIds.has(admin.id)) {
          notifications.push({
            type: 'survey_assigned',
            title: 'Assignation par un superviseur',
            message: `${assignor.firstName} ${assignor.lastName} a assigné le sondage "${survey.title}" à ${userIds.length} agent(s)`,
            userId: admin.id,
            relatedUserId: assignedBy,
            relatedSurveyId: surveyId,
            link: `/surveys/${surveyId}`,
            isRead: false
          });
        }
      }
    }

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour l'assignation du sondage`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification d\'assignation:', error);
  }
}

// Helper function to notify when response is submitted
async function notifyResponseSubmitted(surveyId, respondentId) {
  try {
    const survey = await Survey.findByPk(surveyId, {
      include: [{ model: User, as: 'createdBy' }]
    });
    if (!survey) return;

    const respondent = await User.findByPk(respondentId);
    if (!respondent) return;

    const notifications = [];
    const notifiedUserIds = new Set(); // Pour éviter les doublons

    // Notify survey creator (if not admin)
    if (survey.createdById && survey.createdBy.role !== 'admin') {
      notifications.push({
        type: 'response_submitted',
        title: 'Nouvelle réponse',
        message: `${respondent.firstName} ${respondent.lastName} a répondu au sondage "${survey.title}"`,
        userId: survey.createdById,
        relatedUserId: respondentId,
        relatedSurveyId: surveyId,
        link: `/surveys/${surveyId}/analytics`,
        isRead: false
      });
      notifiedUserIds.add(survey.createdById);
    }

    // If respondent is a field_agent, notify their supervisor
    if (respondent.role === 'field_agent' && respondent.teamId) {
      const team = await Team.findByPk(respondent.teamId);
      if (team && team.supervisorId && !notifiedUserIds.has(team.supervisorId)) {
        notifications.push({
          type: 'response_submitted',
          title: 'Réponse d\'un agent de votre équipe',
          message: `${respondent.firstName} ${respondent.lastName} a répondu au sondage "${survey.title}"`,
          userId: team.supervisorId,
          relatedUserId: respondentId,
          relatedSurveyId: surveyId,
          link: `/surveys/${surveyId}/analytics`,
          isRead: false
        });
        notifiedUserIds.add(team.supervisorId);
      }
    }

    // Notify ALL admins (they receive all notifications)
    const admins = await User.findAll({
      where: { 
        role: 'admin',
        isActive: true
      }
    });

    for (const admin of admins) {
      if (!notifiedUserIds.has(admin.id)) {
        notifications.push({
          type: 'response_submitted',
          title: `Nouvelle réponse - ${respondent.role === 'supervisor' ? 'Superviseur' : 'Agent'}`,
          message: `${respondent.firstName} ${respondent.lastName} a répondu au sondage "${survey.title}"`,
          userId: admin.id,
          relatedUserId: respondentId,
          relatedSurveyId: surveyId,
          link: `/surveys/${surveyId}/analytics`,
          isRead: false
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour la soumission de réponse`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification de réponse:', error);
  }
}

// Helper function to notify when team is joined
async function notifyTeamJoined(userId, teamId, addedBy) {
  try {
    const team = await Team.findByPk(teamId, {
      include: [{ model: User, as: 'supervisor' }]
    });
    if (!team) return;

    const addedByUser = await User.findByPk(addedBy);
    if (!addedByUser) return;

    const addedUser = await User.findByPk(userId);
    if (!addedUser) return;

    const notifications = [];

    // Notify the agent who joined
    notifications.push({
      type: 'team_joined',
      title: 'Ajouté à une équipe',
      message: `Vous avez été ajouté à l'équipe "${team.name}" par ${addedByUser.firstName} ${addedByUser.lastName}`,
      userId,
      relatedUserId: addedBy,
      link: `/settings`,
      isRead: false
    });

    // If added by supervisor, notify all admins
    if (addedByUser.role === 'supervisor') {
      const admins = await User.findAll({
        where: { 
          role: 'admin',
          isActive: true
        }
      });

      for (const admin of admins) {
        notifications.push({
          type: 'team_joined',
          title: 'Agent ajouté à une équipe',
          message: `${addedByUser.firstName} ${addedByUser.lastName} a ajouté ${addedUser.firstName} ${addedUser.lastName} à l'équipe "${team.name}"`,
          userId: admin.id,
          relatedUserId: addedBy,
          link: `/settings`,
          isRead: false
        });
      }
    }

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour l'ajout à l'équipe`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification d\'ajout à l\'équipe:', error);
  }
}

// Helper function to notify admins when supervisor creates survey
async function notifySurveyCreated(surveyId, createdBy) {
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return;

    const creator = await User.findByPk(createdBy);
    if (!creator) return;

    // Only notify admins if creator is a supervisor
    if (creator.role !== 'supervisor') return;

    const admins = await User.findAll({
      where: { 
        role: 'admin',
        isActive: true
      }
    });

    const notifications = admins.map(admin => ({
      type: 'survey_created',
      title: 'Nouveau sondage créé',
      message: `${creator.firstName} ${creator.lastName} (superviseur) a créé le sondage "${survey.title}"`,
      userId: admin.id,
      relatedUserId: createdBy,
      relatedSurveyId: surveyId,
      link: `/surveys/${surveyId}`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour la création du sondage`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification de création de sondage:', error);
  }
}

// Helper function to notify admins and supervisors when new user registers
async function notifyUserRegistration(newUserId) {
  try {
    const newUser = await User.findByPk(newUserId);
    if (!newUser) return;

    // Get all active admins and supervisors
    const recipients = await User.findAll({
      where: { 
        role: {
          [Op.in]: ['admin', 'supervisor']
        },
        isActive: true,
        id: {
          [Op.ne]: newUserId // Exclude the new user themselves
        }
      }
    });

    if (recipients.length === 0) return;

    const notifications = recipients.map(recipient => ({
      type: 'user_registered',
      title: '👤 Nouvelle inscription',
      message: `${newUser.firstName} ${newUser.lastName} vient de s'inscrire sur G-Survey (${newUser.email}). Statut : Agent de terrain.`,
      userId: recipient.id,
      relatedUserId: newUserId,
      link: `/admin/users`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour la nouvelle inscription de ${newUser.firstName} ${newUser.lastName}`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification de nouvelle inscription:', error);
  }
}

module.exports = router;
module.exports.notifySurveyAssignment = notifySurveyAssignment;
module.exports.notifyResponseSubmitted = notifyResponseSubmitted;
module.exports.notifyTeamJoined = notifyTeamJoined;
module.exports.notifySurveyCreated = notifySurveyCreated;
module.exports.notifyUserRegistration = notifyUserRegistration;

