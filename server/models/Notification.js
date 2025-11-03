const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'survey_assigned',      // Sondage assigné
      'survey_completed',     // Sondage complété
      'response_submitted',   // Réponse soumise
      'survey_closed',        // Sondage fermé
      'team_joined',          // Ajouté à une équipe
      'survey_created',       // Nouveau sondage créé
      'user_registered'       // Nouvelle inscription utilisateur
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Utilisateur qui reçoit la notification'
  },
  relatedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'Utilisateur qui a déclenché l\'action'
  },
  relatedSurveyId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Lien vers la ressource concernée'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId', 'isRead']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Notification;



