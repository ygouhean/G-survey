const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'gsurvey',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || 'postgres',
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // SSL requis pour Supabase et autres services cloud
      ssl: process.env.POSTGRES_HOST && process.env.POSTGRES_HOST.includes('supabase') 
        ? {
            require: true,
            rejectUnauthorized: false // Accepte les certificats auto-signés (Supabase)
          }
        : false,
      // Timeout de connexion
      connectTimeout: 10000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    // Afficher la configuration de connexion (sans le mot de passe)
    console.log(`🔌 Tentative de connexion PostgreSQL:`);
    console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.POSTGRES_PORT || 5432}`);
    console.log(`   Database: ${process.env.POSTGRES_DB || 'gsurvey'}`);
    console.log(`   User: ${process.env.POSTGRES_USER || 'postgres'}`);
    
    // Tester la connexion
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected: ${process.env.POSTGRES_HOST || 'localhost'}`);

    // Activer PostGIS extension
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS extension activated');

    // Charger les modèles et associations avant la synchronisation
    require('../models/index');

    // Synchroniser les modèles avec la base de données
    // En production, utilisez les migrations au lieu de sync
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synchronized');
    }

    // Créer l'utilisateur admin par défaut
    await createDefaultAdmin();
  } catch (error) {
    console.error(`❌ Error connecting to PostgreSQL: ${error.message}`);
    
    // Messages d'aide spécifiques selon le type d'erreur
    if (error.message.includes('ENETUNREACH') || error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Erreur de connexion réseau détectée');
      if (process.env.POSTGRES_HOST && process.env.POSTGRES_HOST.includes('supabase')) {
        console.error('   → Connexion Supabase détectée');
        console.error('   → SSL devrait être activé automatiquement');
        console.error('   → Vérifiez que toutes les variables POSTGRES_* sont correctement définies');
        console.error('   → Vérifiez que le mot de passe Supabase est correct');
        console.error('   → Vérifiez que PostGIS est activé dans Supabase (SQL Editor)');
      } else {
        console.error('   → Pour Supabase, assurez-vous que POSTGRES_HOST contient "supabase"');
      }
    } else if (error.message.includes('password') || error.message.includes('authentication')) {
      console.error('\n⚠️  Erreur d\'authentification');
      console.error('   → Vérifiez POSTGRES_USER et POSTGRES_PASSWORD');
      console.error('   → Pour Supabase, régénérez le mot de passe si nécessaire');
    } else if (error.message.includes('database') || error.message.includes('does not exist')) {
      console.error('\n⚠️  Erreur de base de données');
      console.error('   → Vérifiez POSTGRES_DB');
      console.error('   → Pour Supabase, utilisez généralement "postgres" (base par défaut)');
    }
    
    console.error('\n💡 Vérifications générales:');
    console.error('   1. Les variables d\'environnement sont-elles définies ?');
    console.error('   2. Le service PostgreSQL est-il démarré ? (local uniquement)');
    console.error('   3. La base de données existe-t-elle ?');
    console.error('   4. L\'extension PostGIS est-elle activée ? (CREATE EXTENSION postgis;)');
    console.error(`\n   Configuration actuelle:`);
    console.error(`   - Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.error(`   - Port: ${process.env.POSTGRES_PORT || 5432}`);
    console.error(`   - Database: ${process.env.POSTGRES_DB || 'gsurvey'}`);
    console.error(`   - User: ${process.env.POSTGRES_USER || 'postgres'}`);
    console.error(`   - SSL: ${process.env.POSTGRES_HOST && process.env.POSTGRES_HOST.includes('supabase') ? 'Activé (auto)' : 'Désactivé'}`);
    console.error(`\n   Consultez DEPLOIEMENT_VERCEL_RENDER.md pour la configuration Supabase.`);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gsurvey.com';
    
    const adminExists = await User.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'System',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log(`👤 Default admin created: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`Error creating default admin: ${error.message}`);
  }
};

module.exports = { sequelize, connectDB };
