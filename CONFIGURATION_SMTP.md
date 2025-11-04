# 📧 Configuration SMTP pour G-Survey

## ⚠️ IMPORTANT

Pour que les emails (bienvenue et réinitialisation de mot de passe) soient envoyés, vous devez configurer les variables d'environnement SMTP.

## 🔧 Variables d'environnement requises

Ajoutez ces variables dans votre fichier `.env` ou dans les variables d'environnement de votre plateforme de déploiement (Vercel, Render, etc.) :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com          # Pour Gmail
SMTP_PORT=587                      # Port pour TLS (587) ou SSL (465)
SMTP_SECURE=false                  # true pour port 465 (SSL), false pour port 587 (TLS)
SMTP_USER=votre-email@gmail.com   # Votre adresse email SMTP
SMTP_PASS=votre-mot-de-passe-app   # Mot de passe d'application (Gmail) ou mot de passe SMTP

# URL du client (pour les liens dans les emails)
CLIENT_URL=https://votre-domaine.com
```

## 📝 Configuration pour différents fournisseurs

### Gmail

1. Activez l'authentification à 2 facteurs sur votre compte Google
2. Générez un "Mot de passe d'application" :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et votre appareil
   - Copiez le mot de passe généré (16 caractères)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app-16-caracteres
```

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@outlook.com
SMTP_PASS=votre-mot-de-passe
```

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre-api-key-sendgrid
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre-mot-de-passe-mailgun
```

## 🔍 Vérification

### Vérifier si SMTP est configuré

Les emails ne seront envoyés que si `SMTP_USER` et `SMTP_PASS` sont définis. Si ces variables ne sont pas configurées :

- En **développement** : Les emails seront simulés dans la console
- En **production** : Une erreur sera loggée et les emails ne seront pas envoyés

### Logs

Vous verrez ces messages dans les logs :

**Si SMTP est configuré :**
```
✅ Email envoyé avec succès: { to: '...', subject: '...', messageId: '...' }
```

**Si SMTP n'est pas configuré :**
```
⚠️ SMTP non configuré : Les variables d'environnement SMTP_USER et SMTP_PASS sont requises
📧 Mode développement : Email non envoyé (SMTP non configuré)
```

**En cas d'erreur :**
```
❌ Erreur lors de l'envoi de l'email: [détails de l'erreur]
```

## 🚀 Déploiement sur Vercel/Render

### Vercel

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez toutes les variables SMTP_*
4. Déployez à nouveau

### Render

1. Allez dans votre service Render
2. Environment → Environment Variables
3. Ajoutez toutes les variables SMTP_*
4. Le service redémarrera automatiquement

## ✅ Test

Après configuration, testez :

1. **Inscription** : Créez un nouveau compte → Vérifiez la réception de l'email de bienvenue
2. **Réinitialisation** : Utilisez "Mot de passe oublié" → Vérifiez la réception de l'email de réinitialisation

## 🔒 Sécurité

- ❌ **NE COMMITEZ JAMAIS** vos variables SMTP dans le code
- ✅ Utilisez toujours les variables d'environnement
- ✅ Utilisez des mots de passe d'application (Gmail) plutôt que votre mot de passe principal
- ✅ Limitez les permissions de l'email SMTP si possible

---

**Note** : Si les emails ne sont toujours pas envoyés après configuration, vérifiez :
1. Les logs du serveur pour les erreurs SMTP
2. Que votre fournisseur SMTP autorise les connexions depuis votre serveur
3. Que les ports 587/465 ne sont pas bloqués par un firewall
4. Que les identifiants SMTP sont corrects

