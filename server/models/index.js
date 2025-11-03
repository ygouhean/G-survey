const User = require('./User');
const Team = require('./Team');
const { Survey, SurveyAssignee } = require('./Survey');
const Response = require('./Response');
const Notification = require('./Notification');

// Associations User - Team
User.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(User, { foreignKey: 'teamId', as: 'members' });
Team.belongsTo(User, { foreignKey: 'supervisorId', as: 'supervisor' });

// Associations Survey - User (createdBy)
Survey.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
User.hasMany(Survey, { foreignKey: 'createdById', as: 'createdSurveys' });

// Associations Survey - User (assignedTo - Many-to-Many)
Survey.belongsToMany(User, {
  through: SurveyAssignee,
  foreignKey: 'surveyId',
  otherKey: 'userId',
  as: 'assignedTo'
});
User.belongsToMany(Survey, {
  through: SurveyAssignee,
  foreignKey: 'userId',
  otherKey: 'surveyId',
  as: 'assignedSurveys'
});

// Associations Response - Survey
Response.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });
Survey.hasMany(Response, { foreignKey: 'surveyId', as: 'responses' });

// Associations Response - User (respondent)
Response.belongsTo(User, { foreignKey: 'respondentId', as: 'respondent' });
User.hasMany(Response, { foreignKey: 'respondentId', as: 'responses' });

// Associations Notification - User
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });

Notification.belongsTo(User, { foreignKey: 'relatedUserId', as: 'actor' });

Notification.belongsTo(Survey, { foreignKey: 'relatedSurveyId', as: 'survey' });

module.exports = {
  User,
  Team,
  Survey,
  SurveyAssignee,
  Response,
  Notification
};


