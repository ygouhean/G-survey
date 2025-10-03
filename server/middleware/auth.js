const jwt = require('jsonwebtoken');
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
      req.user = await User.findById(decoded.id).select('-password');
      
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
    const Survey = require('../models/Survey');
    const surveyId = req.params.id || req.body.survey;
    
    if (!surveyId) {
      return next();
    }

    const survey = await Survey.findById(surveyId);
    
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

    // Supervisors can access surveys of their team
    if (req.user.role === 'supervisor') {
      // Check if any assigned user is in supervisor's team
      const Team = require('../models/Team');
      const team = await Team.findOne({ supervisor: req.user._id });
      
      if (team && survey.assignedTo.some(id => team.members.includes(id))) {
        return next();
      }
    }

    // Field agents can only access assigned surveys
    if (req.user.role === 'field_agent') {
      if (survey.assignedTo.includes(req.user._id)) {
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
