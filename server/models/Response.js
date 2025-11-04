const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Answer = sequelize.define('Answer', {
  questionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  questionType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  value: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  geolocation: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  areaMeasurement: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'answers',
  timestamps: false
});

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  respondentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  answers: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  npsScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 10
    }
  },
  csatScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  cesScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 7
    }
  },
  status: {
    type: DataTypes.ENUM('completed', 'partial', 'synced', 'pending_sync'),
    defaultValue: 'completed'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'responses',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false,
  indexes: [
    {
      fields: ['surveyId']
    },
    {
      fields: ['respondentId']
    },
    {
      fields: ['location'],
      using: 'GIST'
    }
  ]
});

// Hook pour calculer les scores avant la sauvegarde
Response.beforeSave((response, options) => {
  if (response.answers && Array.isArray(response.answers)) {
    response.answers.forEach(answer => {
      if (answer.questionType === 'nps') {
        response.npsScore = Number(answer.value);
      } else if (answer.questionType === 'csat') {
        response.csatScore = Number(answer.value);
      } else if (answer.questionType === 'ces') {
        response.cesScore = Number(answer.value);
      }
    });
  }
});

module.exports = Response;
