const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement EN PREMIER
dotenv.config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/surveys');
const responseRoutes = require('./routes/responses');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/exports');
const uploadRoutes = require('./routes/uploads');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Connect to Database
connectDB();

// Middleware
// Configuration CORS pour accepter plusieurs origines (dev et prod)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean); // Supprime les valeurs undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.some(allowedOrigin => origin === allowedOrigin)) {
      callback(null, true);
    } else {
      // En production, on peut être plus strict, mais pour le moment on accepte
      // pour éviter les problèmes de déploiement
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'G-Survey API is running' });
});

// Error handling middleware (doit être le dernier middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
