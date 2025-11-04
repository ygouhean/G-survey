const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM(
      'text', 'email', 'phone', 'nps', 'csat', 'ces',
      'multiple_choice', 'checkbox', 'scale', 'geolocation',
      'area_measurement', 'date', 'time'
    ),
    allowNull: false
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  placeholder: {
    type: DataTypes.STRING,
    allowNull: true
  },
  required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  options: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  },
  validation: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  conditionalLogic: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'questions',
  timestamps: false
});

const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    trim: true
  },
  questions: {
    type: DataTypes.ARRAY(DataTypes.JSONB),
    allowNull: false,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed'),
    defaultValue: 'draft'
  },
  autoClosedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de fermeture automatique du sondage'
  },
  targetResponses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  responseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  originalEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de fin originale du sondage (pour historique)'
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allowAnonymous: false,
      requireGeolocation: false,
      allowOfflineSubmission: true,
      showProgressBar: true,
      randomizeQuestions: false
    }
  }
}, {
  tableName: 'surveys',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  hooks: {
    // Hook pour vérifier et fermer automatiquement les sondages expirés
    beforeFind: async (options) => {
      // Éviter la récursion : ne pas appeler closeExpiredSurveys si les hooks sont désactivés
      // ou si on est déjà en train de fermer des sondages
      if (options.hooks !== false && !options._closingExpiredSurveys) {
        // Marquer pour éviter la récursion
        options._closingExpiredSurveys = true;
        try {
          await Survey.closeExpiredSurveys();
        } catch (error) {
          console.error('Erreur lors de la fermeture automatique des sondages:', error);
        } finally {
          delete options._closingExpiredSurveys;
        }
      }
    }
  }
});

// Méthode statique pour fermer automatiquement les sondages expirés
Survey.closeExpiredSurveys = async function() {
  const now = new Date();
  
  try {
    // Utiliser hooks: false pour éviter la récursion infinie
    // car cette méthode est appelée depuis beforeFind
    const expiredSurveys = await Survey.findAll({
      where: {
        status: 'active',
        endDate: {
          [require('sequelize').Op.ne]: null
        }
      },
      hooks: false // IMPORTANT : désactiver les hooks pour éviter la récursion
    });

    // Filtrer manuellement pour vérifier la date avec 23:59:59
    const surveysToClose = expiredSurveys.filter(survey => {
      if (!survey.endDate) return false;
      
      // Créer une date à 23:59:59 du jour de fin
      const endDateTime = new Date(survey.endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      return endDateTime < now;
    });

    for (const survey of surveysToClose) {
      await survey.update({
        status: 'closed',
        autoClosedAt: now
      });
      console.log(`Sondage ${survey.id} fermé automatiquement (date de fin dépassée)`);
    }

    return surveysToClose.length;
  } catch (error) {
    console.error('Erreur lors de la fermeture automatique des sondages:', error);
    return 0;
  }
};

// Méthode d'instance pour vérifier si le sondage est expiré
Survey.prototype.checkAndCloseIfExpired = async function() {
  const now = new Date();
  
  if (this.status === 'active' && this.endDate) {
    // Créer une date à 23:59:59 du jour de fin
    const endDateTime = new Date(this.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    
    if (endDateTime < now) {
      await this.update({
        status: 'closed',
        autoClosedAt: now
      });
      return true;
    }
  }
  
  return false;
};

// Association pour assignedTo (Many-to-Many)
const SurveyAssignee = sequelize.define('SurveyAssignee', {
  surveyId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'survey_assignees',
  timestamps: false
});

module.exports = { Survey, Question, SurveyAssignee };
