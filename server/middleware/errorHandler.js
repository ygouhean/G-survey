/**
 * Middleware de gestion d'erreurs avec traduction en français
 */

// Traduction des erreurs Sequelize courantes
const translateSequelizeError = (error) => {
  if (!error.name) return null;

  // Erreurs de validation Sequelize
  if (error.name === 'SequelizeValidationError') {
    const messages = error.errors.map(err => {
      switch (err.validatorKey) {
        case 'is_null':
          return `Le champ ${err.path} est requis`;
        case 'notEmpty':
          return `Le champ ${err.path} ne peut pas être vide`;
        case 'isEmail':
          return 'L\'adresse email n\'est pas valide';
        case 'len':
          return `Le champ ${err.path} doit avoir entre ${err.validatorArgs[0]} et ${err.validatorArgs[1]} caractères`;
        case 'isUnique':
          return `Cette valeur existe déjà`;
        default:
          return err.message;
      }
    });
    return messages[0] || 'Erreur de validation';
  }

  // Erreurs de contraintes uniques
  if (error.name === 'SequelizeUniqueConstraintError') {
    if (error.fields?.email) {
      return 'Un utilisateur avec cet email existe déjà';
    }
    if (error.fields?.username) {
      return 'Ce nom d\'utilisateur est déjà utilisé';
    }
    return 'Cette valeur existe déjà dans la base de données';
  }

  // Erreur de clé étrangère
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return 'Référence invalide. L\'élément lié n\'existe pas';
  }

  // Erreur de connexion à la base de données
  if (error.name === 'SequelizeConnectionError') {
    return 'Erreur de connexion à la base de données';
  }

  // Erreur de timeout
  if (error.name === 'SequelizeConnectionTimedOutError') {
    return 'La connexion à la base de données a expiré';
  }

  // Erreur d'hôte non trouvé
  if (error.name === 'SequelizeHostNotFoundError') {
    return 'Serveur de base de données non trouvé';
  }

  // Erreur d'accès refusé
  if (error.name === 'SequelizeAccessDeniedError') {
    return 'Accès à la base de données refusé';
  }

  return null;
};

// Traduction des erreurs JWT courantes
const translateJWTError = (error) => {
  if (!error.name) return null;

  if (error.name === 'JsonWebTokenError') {
    return 'Token d\'authentification invalide';
  }

  if (error.name === 'TokenExpiredError') {
    return 'Votre session a expiré. Veuillez vous reconnecter';
  }

  if (error.name === 'NotBeforeError') {
    return 'Token d\'authentification pas encore valide';
  }

  return null;
};

// Traduction des erreurs génériques
const translateGenericError = (message) => {
  const translations = {
    // Erreurs d'authentification
    'Invalid credentials': 'Identifiants invalides',
    'User not found': 'Utilisateur non trouvé',
    'Invalid token': 'Token invalide',
    'No token provided': 'Aucun token fourni',
    'Token expired': 'Token expiré',
    'Unauthorized': 'Non autorisé',
    'Forbidden': 'Accès interdit',
    'Access denied': 'Accès refusé',

    // Erreurs de validation
    'Validation error': 'Erreur de validation',
    'Invalid email': 'Email invalide',
    'Invalid password': 'Mot de passe invalide',
    'Password too short': 'Mot de passe trop court',
    'Passwords do not match': 'Les mots de passe ne correspondent pas',
    'Email already exists': 'Cet email existe déjà',
    'Username already exists': 'Ce nom d\'utilisateur existe déjà',

    // Erreurs de ressources
    'Not found': 'Non trouvé',
    'Resource not found': 'Ressource non trouvée',
    'Already exists': 'Existe déjà',

    // Erreurs serveur
    'Internal Server Error': 'Erreur interne du serveur',
    'Server Error': 'Erreur du serveur',
    'Database error': 'Erreur de base de données',
    'Connection error': 'Erreur de connexion',

    // Erreurs de requête
    'Bad Request': 'Requête invalide',
    'Invalid request': 'Requête invalide',
    'Missing required fields': 'Champs requis manquants',
    'Invalid parameters': 'Paramètres invalides',

    // Autres erreurs courantes
    'Something went wrong': 'Une erreur est survenue',
    'Operation failed': 'L\'opération a échoué',
    'Unable to process request': 'Impossible de traiter la requête'
  };

  // Recherche exacte
  if (translations[message]) {
    return translations[message];
  }

  // Recherche partielle (insensible à la casse)
  const lowerMessage = message.toLowerCase();
  for (const [english, french] of Object.entries(translations)) {
    if (lowerMessage.includes(english.toLowerCase())) {
      return french;
    }
  }

  return null;
};

// Middleware principal de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Traduction des erreurs Sequelize
  const sequelizeMessage = translateSequelizeError(err);
  if (sequelizeMessage) {
    message = sequelizeMessage;
    statusCode = 400;
  }

  // Traduction des erreurs JWT
  const jwtMessage = translateJWTError(err);
  if (jwtMessage) {
    message = jwtMessage;
    statusCode = 401;
  }

  // Traduction des erreurs génériques
  const translatedMessage = translateGenericError(message);
  if (translatedMessage) {
    message = translatedMessage;
  }

  // Cas spéciaux
  if (err.code === 'ECONNREFUSED') {
    message = 'Impossible de se connecter au serveur';
    statusCode = 503;
  }

  if (err.code === 'ETIMEDOUT') {
    message = 'La requête a expiré';
    statusCode = 504;
  }

  // Erreur de fichier trop volumineux
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'Le fichier est trop volumineux';
    statusCode = 413;
  }

  // Erreur de type de fichier invalide
  if (err.code === 'INVALID_FILE_TYPE') {
    message = 'Type de fichier non autorisé';
    statusCode = 400;
  }

  // Construire la réponse
  const response = {
    success: false,
    message
  };

  // En développement, inclure les détails de l'erreur
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      stack: err.stack,
      originalMessage: err.message
    };
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;


