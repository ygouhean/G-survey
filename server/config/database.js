const { Sequelize } = require('sequelize');
const dns = require('dns').promises;

// Fonction pour résoudre le hostname en IPv4
async function resolveHostToIPv4(hostname) {
  if (!hostname || hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    return hostname;
  }
  
  try {
    // Résoudre uniquement en IPv4
    const addresses = await dns.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      console.log(`   → Host résolu en IPv4: ${addresses[0]}`);
      return addresses[0];
    }
    return hostname;
  } catch (error) {
    console.warn(`   ⚠️  Impossible de résoudre ${hostname} en IPv4, utilisation du hostname original`);
    return hostname;
  }
}

// Configuration de la base de données
// Note: Pour Supabase sur Render, utilisez le Session Pooler (IPv4) au lieu de la connexion directe

function createSequelizeInstance(hostOverride = null) {
  const host = hostOverride || process.env.POSTGRES_HOST || 'localhost';
  
  return new Sequelize(
    process.env.POSTGRES_DB || 'gsurvey',
    process.env.POSTGRES_USER || 'postgres',
    process.env.POSTGRES_PASSWORD || 'postgres',
    {
      host: host,
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
}

// Créer une instance par défaut (sera remplacée lors de connectDB si nécessaire)
let sequelize = createSequelizeInstance();

const connectDB = async () => {
  try {
    let host = process.env.POSTGRES_HOST || 'localhost';
    
    // Pour Supabase, résoudre en IPv4 pour éviter les problèmes IPv6 sur Render
    if (host.includes('supabase') && !host.includes('pooler')) {
      try {
        host = await resolveHostToIPv4(host);
      } catch (dnsError) {
        console.warn(`   ⚠️  Résolution DNS IPv4 échouée, utilisation du hostname original`);
      }
    }
    
    // Créer une nouvelle instance avec le host résolu
    const newSequelize = createSequelizeInstance(host);
    
    // Afficher la configuration de connexion (sans le mot de passe)
    console.log(`🔌 Tentative de connexion PostgreSQL:`);
    console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    if (host !== (process.env.POSTGRES_HOST || 'localhost')) {
      console.log(`   Host résolu: ${host}`);
    }
    console.log(`   Port: ${process.env.POSTGRES_PORT || 5432}`);
    console.log(`   Database: ${process.env.POSTGRES_DB || 'gsurvey'}`);
    console.log(`   User: ${process.env.POSTGRES_USER || 'postgres'}`);
    
    // Tester la connexion
    await newSequelize.authenticate();
    
    // Remplacer l'instance globale
    sequelize = newSequelize;
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
        console.error('   → ⚠️  PROBLÈME IPv6/IPv4 : Supabase utilise IPv6, Render ne supporte que IPv4');
        console.error('   → 💡 SOLUTION : Utilisez le Session Pooler de Supabase (compatible IPv4)');
        console.error('     1. Allez dans Supabase → Settings → Database → Connection Pooling');
        console.error('     2. Utilisez le mode "Session"');
        console.error('     3. Copiez l\'URI du pooler (format: db.xxx.pooler.supabase.com)');
        console.error('     4. Mettez à jour POSTGRES_HOST dans Render avec cette URI');
        console.error('     5. Le port du pooler est généralement 6543 (pas 5432)');
        console.error('   → SSL devrait être activé automatiquement');
        console.error('   → Vérifiez que toutes les variables POSTGRES_* sont correctement définies');
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
