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
    console.error('\n💡 Vérifications à faire:');
    console.error('   1. Le service PostgreSQL est-il démarré ? (services.msc sur Windows)');
    console.error('   2. Les variables d\'environnement sont-elles définies dans .env ?');
    console.error('   3. Le mot de passe dans .env correspond-il au mot de passe PostgreSQL ?');
    console.error('   4. La base de données "gsurvey" existe-t-elle ?');
    console.error('   5. L\'extension PostGIS est-elle activée ? (CREATE EXTENSION postgis;)');
    console.error(`\n   Configuration actuelle:`);
    console.error(`   - Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.error(`   - Port: ${process.env.POSTGRES_PORT || 5432}`);
    console.error(`   - Database: ${process.env.POSTGRES_DB || 'gsurvey'}`);
    console.error(`   - User: ${process.env.POSTGRES_USER || 'postgres'}`);
    console.error(`\n   Consultez INSTALL_WINDOWS.md pour un guide d'installation complet.`);
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
