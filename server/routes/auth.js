const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { protect } = require('../middleware/auth');
const { notifyUserRegistration } = require('./notifications');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Public user registration (self-signup)
// @access  Public
router.post('/register',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('firstName').notEmpty().withMessage('Le nom est requis'),
    body('lastName').notEmpty().withMessage('Les prénoms sont requis'),
    body('username').notEmpty().withMessage('Le nom d\'utilisateur est requis'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg,
          errors: errors.array() 
        });
      }

      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        username,
        gender,
        country,
        sector,
        organizationType
      } = req.body;

      // Check if user exists with email
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Check if username exists (if you have username field in your model)
      // For now, we'll use email as unique identifier

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with field_agent role by default
      // They need to contact admin/supervisor to be assigned to surveys
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        gender,
        country,
        sector,
        organizationType,
        role: 'field_agent', // New signups become field agents
        isActive: true
      });

      // Generate token for auto-login after registration
      // Vérifier que JWT_SECRET est défini
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET n\'est pas défini dans les variables d\'environnement');
        return res.status(500).json({
          success: false,
          message: 'Erreur de configuration serveur. Veuillez contacter l\'administrateur.'
        });
      }

      const token = generateToken(user.id);

      // Récupérer l'utilisateur complet sans le mot de passe
      const userWithoutPassword = await User.findByPk(user.id);
      
      if (!userWithoutPassword) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'utilisateur'
        });
      }

      // Notify all admins and supervisors about the new registration
      // This runs asynchronously without blocking the response
      notifyUserRegistration(user.id).catch(err => {
        console.error('Erreur lors de l\'envoi des notifications d\'inscription:', err);
      });

      // Envoyer l'email de bienvenue (asynchrone, non bloquant)
      const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
      sendWelcomeEmail(user, loginUrl).catch(err => {
        console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', err.message || err);
        // Ne pas bloquer l'inscription si l'email échoue, mais logger l'erreur
        if (process.env.NODE_ENV === 'production') {
          console.error('📧 Email de bienvenue non envoyé. Vérifiez la configuration SMTP.');
        }
      });

      res.status(201).json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        },
        message: 'Inscription réussie ! Bienvenue sur G-Survey. Un email de confirmation a été envoyé.'
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      // Log les détails de l'erreur pour le débogage
      if (error.name) {
        console.error('Nom de l\'erreur:', error.name);
      }
      if (error.message) {
        console.error('Message de l\'erreur:', error.message);
      }
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      next(error);
    }
  }
);

// @route   POST /api/auth/create-user
// @desc    Create a new user (Admin only - for creating team members)
// @access  Private (Admin only)
router.post('/create-user', 
  protect,
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Only admins can create users
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Seuls les administrateurs peuvent créer des utilisateurs'
        });
      }

      const { email, password, firstName, lastName, phone, role, teamId } = req.body;

      // Check if user exists
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'field_agent',
        teamId
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Email invalide'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg
        });
      }

      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ where: { email } });
      
      // Always return success to prevent email enumeration
      if (user) {
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Save token and expiration (10 minutes)
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Generate reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        // Send reset password email (asynchrone, non bloquant)
        sendResetPasswordEmail(user, resetUrl, 10).catch(err => {
          console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', err.message || err);
          // Ne pas bloquer la réponse si l'email échoue, mais logger l'erreur
          if (process.env.NODE_ENV === 'production') {
            console.error('📧 Email de réinitialisation non envoyé. Vérifiez la configuration SMTP.');
          }
        });
      }

      res.json({
        success: true,
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Le token est requis'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: errors.array()[0].msg
        });
      }

      const { token, password } = req.body;

      // Hash the token to compare with stored hash
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        where: {
          resetPasswordToken: resetTokenHash,
          resetPasswordExpire: {
            [Op.gt]: new Date() // Token must not be expired
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      res.json({
        success: true,
        message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = await User.scope('withPassword').findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été désactivé'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Vérifier que JWT_SECRET est défini
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET n\'est pas défini dans les variables d\'environnement');
        return res.status(500).json({
          success: false,
          message: 'Erreur de configuration serveur. Veuillez contacter l\'administrateur.'
        });
      }

      // Generate token
      const token = generateToken(user.id);

      // Récupérer l'utilisateur complet sans le mot de passe
      const userWithoutPassword = await User.findByPk(user.id, {
        include: [{
          model: require('../models/Team'),
          as: 'team',
          attributes: ['id', 'name']
        }]
      });

      if (!userWithoutPassword) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la récupération de l\'utilisateur'
        });
      }

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      // Log les détails de l'erreur pour le débogage
      if (error.name) {
        console.error('Nom de l\'erreur:', error.name);
      }
      if (error.message) {
        console.error('Message de l\'erreur:', error.message);
      }
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: require('../models/Team'),
        as: 'team',
        attributes: ['id', 'name']
      }]
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
  try {
    const { 
      firstName, 
      lastName, 
      phone, 
      username,
      gender,
      country,
      sector,
      organizationType
    } = req.body;

    // Vérifier si le username est déjà pris par un autre utilisateur
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà utilisé'
        });
      }
    }

    await req.user.update({ 
      firstName, 
      lastName, 
      phone,
      username,
      gender,
      country,
      sector,
      organizationType
    });

    const updatedUser = await User.findByPk(req.user.id);

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Le mot de passe actuel est requis'),
    body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.scope('withPassword').findByPk(req.user.id);

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const users = await User.findAll({
      include: [{
        model: require('../models/Team'),
        as: 'team',
        attributes: ['id', 'name']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/supervisors
// @desc    Get all supervisors (for admins only)
// @access  Private/Admin
router.get('/supervisors', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const supervisors = await User.findAll({
      where: {
        role: 'supervisor',
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      order: [['firstName', 'ASC']]
    });

    res.json({
      success: true,
      count: supervisors.length,
      data: supervisors
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/users/:id
// @desc    Update user (Admin only)
// @access  Private/Admin
router.put('/users/:id', protect, async (req, res, next) => {
  try {
    // Only admins can update users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      phone, 
      role,
      username,
      gender,
      country,
      sector,
      organizationType
    } = req.body;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si le username est déjà pris par un autre utilisateur
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== id) {
        return res.status(400).json({
          success: false,
          message: 'Ce nom d\'utilisateur est déjà utilisé'
        });
      }
    }

    // Update user
    await user.update({
      firstName,
      lastName,
      phone,
      role,
      username,
      gender,
      country,
      sector,
      organizationType
    });

    const updatedUser = await User.findByPk(id);

    res.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/auth/users/:id/toggle-status
// @desc    Toggle user active status (Admin only)
// @access  Private/Admin
router.patch('/users/:id/toggle-status', protect, async (req, res, next) => {
  try {
    // Only admins can toggle user status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Don't allow admin to deactivate themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas modifier votre propre statut'
      });
    }

    // Toggle status
    await user.update({
      isActive: !user.isActive
    });

    res.json({
      success: true,
      data: user,
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/users/:id', protect, async (req, res, next) => {
  try {
    // Only admins can delete users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Don't allow admin to delete themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Import models needed for cleanup
    const { Team, Survey, Response, Notification, SurveyAssignee } = require('../models');
    const { sequelize } = require('../config/database');

    // Start transaction to ensure data consistency
    const transaction = await sequelize.transaction();

    try {
      // 1. Remove user from teams (if supervisor)
      await Team.update(
        { supervisorId: null },
        { 
          where: { supervisorId: id },
          transaction
        }
      );

      // 2. Remove survey assignments (many-to-many)
      await SurveyAssignee.destroy({
        where: { userId: id },
        transaction
      });

      // 3. Handle surveys created by this user
      // Option 1: Transfer ownership to admin (recommended)
      const admin = await User.findOne({
        where: { role: 'admin', id: { [Op.ne]: id } },
        transaction
      });

      if (admin) {
        // Transfer surveys to another admin
        await Survey.update(
          { createdById: admin.id },
          { 
            where: { createdById: id },
            transaction
          }
        );
      } else {
        // If no other admin, set createdById to null (will need to be handled by app)
        await Survey.update(
          { createdById: null },
          { 
            where: { createdById: id },
            transaction
          }
        );
      }

      // 4. Handle responses - anonymize them (keep data but remove user reference)
      await Response.update(
        { respondentId: null },
        { 
          where: { respondentId: id },
          transaction
        }
      );

      // 5. Delete notifications related to this user
      await Notification.destroy({
        where: {
          [Op.or]: [
            { userId: id },
            { relatedUserId: id }
          ]
        },
        transaction
      });

      // 6. Remove user from team (if member)
      await User.update(
        { teamId: null },
        { 
          where: { id },
          transaction
        }
      );

      // 7. Finally, delete the user
      await user.destroy({ transaction });

      // Commit transaction
      await transaction.commit();

      res.json({
        success: true,
        message: 'Utilisateur supprimé avec succès. Les sondages créés ont été transférés à un administrateur.'
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/agents
// @desc    Get all field agents (for supervisors and admins), or field agents + supervisors (for admins)
// @access  Private
router.get('/agents', protect, async (req, res, next) => {
  try {
    let whereClause = {
      isActive: true
    };

    // Admins can see field_agents and supervisors
    if (req.user.role === 'admin') {
      whereClause.role = { [Op.in]: ['field_agent', 'supervisor'] };
    } else {
      // Supervisors only see field_agents from their team
      whereClause.role = 'field_agent';
    }

    // Supervisors only see agents from their team
    if (req.user.role === 'supervisor') {
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
        whereClause.id = { [Op.in]: memberIds };
      } else {
        // No team members, return empty
        return res.json({
          success: true,
          count: 0,
          data: []
        });
      }
    }
    // Field agents can only see themselves
    else if (req.user.role === 'field_agent') {
      whereClause.id = req.user.id;
    }

    const agents = await User.findAll({
      where: whereClause,
      attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
