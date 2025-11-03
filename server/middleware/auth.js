const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Aucun token fourni'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Role-based authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
      });
    }
    next();
  };
};

// Check if user can access survey
exports.canAccessSurvey = async (req, res, next) => {
  try {
    const { Survey } = require('../models/Survey');
    const surveyId = req.params.id || req.params.surveyId || req.body.survey;
    
    if (!surveyId) {
      return next();
    }

    const survey = await Survey.findByPk(surveyId, {
      include: [{
        model: require('../models/User'),
        as: 'assignedTo',
        attributes: ['id']
      }]
    });
    
    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Sondage non trouvé'
      });
    }

    // Admins can access all surveys
    if (req.user.role === 'admin') {
      return next();
    }

    // Supervisors can access surveys they created OR surveys assigned to them
    if (req.user.role === 'supervisor') {
      // Check if supervisor created this survey
      if (survey.createdById === req.user.id) {
        return next();
      }
      
      // Check if survey is assigned to the supervisor
      const assignedUserIds = survey.assignedTo.map(u => u.id);
      if (assignedUserIds.includes(req.user.id)) {
        return next();
      }
    }

    // Field agents can only access assigned surveys
    if (req.user.role === 'field_agent') {
      const assignedUserIds = survey.assignedTo.map(u => u.id);
      if (assignedUserIds.includes(req.user.id)) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Vous n\'avez pas accès à ce sondage'
    });
  } catch (error) {
    next(error);
  }
};
