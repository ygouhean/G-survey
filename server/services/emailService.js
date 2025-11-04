const nodemailer = require('nodemailer');

// Configuration du transporteur SMTP
const createTransporter = () => {
  // Vérifier que les variables SMTP sont configurées
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  // Configuration depuis les variables d'environnement
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    // Configuration pour éviter les timeouts
    connectionTimeout: 30000, // 30 secondes pour établir la connexion
    greetingTimeout: 30000, // 30 secondes pour la réponse du serveur
    socketTimeout: 30000, // 30 secondes pour les opérations socket
    // Retry configuration
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
    // TLS options pour améliorer la compatibilité
    tls: {
      rejectUnauthorized: false, // Accepter les certificats auto-signés
      ciphers: 'SSLv3'
    }
  };

  try {
    const transporter = nodemailer.createTransport(config);
    
    // Vérifier la connexion (optionnel, peut être commenté si trop lent)
    // transporter.verify((error, success) => {
    //   if (error) {
    //     console.error('❌ Erreur de vérification SMTP:', error);
    //   } else {
    //     console.log('✅ Serveur SMTP prêt à envoyer des emails');
    //   }
    // });
    
    return transporter;
  } catch (error) {
    console.error('❌ Erreur lors de la création du transporteur SMTP:', error);
    return null;
  }
};

// Template d'email de bienvenue
const welcomeEmailTemplate = (user, loginUrl) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur G-Survey</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📍 G-Survey</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #667eea; margin-top: 0;">Bienvenue ${user.firstName} ! 👋</h2>
    
    <p style="font-size: 16px;">
      Votre compte a été créé avec succès sur <strong>G-Survey</strong>, la plateforme de collecte de données géolocalisées.
    </p>
    
    <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #667eea; margin-top: 0;">📋 Informations de votre compte :</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 10px 0;"><strong>Nom :</strong> ${user.firstName} ${user.lastName}</li>
        <li style="margin: 10px 0;"><strong>Email :</strong> ${user.email}</li>
        <li style="margin: 10px 0;"><strong>Nom d'utilisateur :</strong> ${user.username || user.email}</li>
        <li style="margin: 10px 0;"><strong>Statut :</strong> Agent de terrain</li>
      </ul>
    </div>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="color: #856404; margin-top: 0;">🎯 Prochaines étapes :</h3>
      <ol style="color: #856404; padding-left: 20px;">
        <li style="margin: 8px 0;">Contactez votre administrateur ou superviseur</li>
        <li style="margin: 8px 0;">Ils vous assigneront à une équipe</li>
        <li style="margin: 8px 0;">Vous pourrez alors accéder aux sondages assignés</li>
        <li style="margin: 8px 0;">Complétez votre profil dans les paramètres</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; padding: 15px 30px; text-decoration: none; 
                border-radius: 5px; font-weight: bold; font-size: 16px;">
        Se connecter maintenant →
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Si vous avez des questions, n'hésitez pas à contacter votre administrateur ou visiter notre centre d'aide.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
      © ${new Date().getFullYear()} G-Survey - Tous droits réservés
    </p>
  </div>
</body>
</html>
  `.trim();
};

// Template d'email de réinitialisation de mot de passe
const resetPasswordEmailTemplate = (user, resetUrl, expirationMinutes = 10) => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe - G-Survey</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Réinitialisation</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #667eea; margin-top: 0;">Bonjour ${user.firstName},</h2>
    
    <p style="font-size: 16px;">
      Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>G-Survey</strong>.
    </p>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        <strong>⏰ Attention :</strong> Ce lien est valide pendant <strong>${expirationMinutes} minutes</strong> seulement.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; padding: 15px 30px; text-decoration: none; 
                border-radius: 5px; font-weight: bold; font-size: 16px;">
        Réinitialiser mon mot de passe →
      </a>
    </div>
    
    <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #333;">
        <strong>💡 Astuce :</strong> Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #666; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
    
    <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
      <p style="margin: 0; font-size: 14px; color: #721c24;">
        <strong>⚠️ Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999; text-align: center;">
      Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
      © ${new Date().getFullYear()} G-Survey - Tous droits réservés
    </p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Envoie un email
 * @param {Object} options - Options d'envoi
 * @param {string} options.to - Destinataire
 * @param {string} options.subject - Sujet
 * @param {string} options.html - Contenu HTML
 * @param {string} options.text - Contenu texte (optionnel)
 */
const sendEmail = async ({ to, subject, html, text }, retries = 2) => {
  try {
    // Vérifier d'abord si SMTP est configuré
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const errorMsg = '⚠️ SMTP non configuré : Les variables d\'environnement SMTP_USER et SMTP_PASS sont requises pour envoyer des emails';
      console.error(errorMsg);
      
      // En production, lever une erreur pour que ce soit visible
      if (process.env.NODE_ENV === 'production') {
        throw new Error(errorMsg);
      }
      
      // En développement, seulement logger et simuler
      console.log('📧 Mode développement : Email non envoyé (SMTP non configuré)');
      console.log('📋 Email qui aurait été envoyé :');
      console.log('   À:', to);
      console.log('   Sujet:', subject);
      console.log('');
      return { success: false, message: 'Email non envoyé - SMTP non configuré' };
    }

    let transporter = createTransporter();

    // Vérifier que le transporter a été créé
    if (!transporter) {
      throw new Error('Impossible de créer le transporteur SMTP. Vérifiez votre configuration SMTP.');
    }

    const mailOptions = {
      from: `"G-Survey" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Extraire le texte brut du HTML
    };

    // Tentative d'envoi avec retry en cas d'échec
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email envoyé avec succès:', {
          to,
          subject,
          messageId: info.messageId,
          attempt: attempt + 1
        });

        return {
          success: true,
          messageId: info.messageId
        };
      } catch (error) {
        lastError = error;
        
        // Si c'est une erreur de timeout ou de connexion, réessayer
        if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ESOCKET') && attempt < retries) {
          const waitTime = (attempt + 1) * 2000; // Attendre 2s, 4s, etc.
          console.warn(`⚠️ Tentative ${attempt + 1}/${retries + 1} échouée. Réessai dans ${waitTime}ms...`, error.message);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Sinon, propager l'erreur
        throw error;
      }
    }
    
    // Si toutes les tentatives ont échoué
    throw lastError;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    console.error('   SMTP Host:', process.env.SMTP_HOST || 'non défini');
    console.error('   SMTP Port:', process.env.SMTP_PORT || 'non défini');
    console.error('   SMTP User:', process.env.SMTP_USER ? 'défini' : 'non défini');
    throw error;
  }
};

/**
 * Envoie un email de bienvenue
 * @param {Object} user - Utilisateur
 * @param {string} loginUrl - URL de connexion
 */
const sendWelcomeEmail = async (user, loginUrl) => {
  const html = welcomeEmailTemplate(user, loginUrl);
  
  return await sendEmail({
    to: user.email,
    subject: '🎉 Bienvenue sur G-Survey !',
    html
  });
};

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {Object} user - Utilisateur
 * @param {string} resetUrl - URL de réinitialisation
 * @param {number} expirationMinutes - Durée de validité en minutes
 */
const sendResetPasswordEmail = async (user, resetUrl, expirationMinutes = 10) => {
  const html = resetPasswordEmailTemplate(user, resetUrl, expirationMinutes);
  
  return await sendEmail({
    to: user.email,
    subject: '🔐 Réinitialisation de votre mot de passe G-Survey',
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail
};


