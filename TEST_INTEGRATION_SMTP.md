# ⚡ Test Rapide : Intégration SMTP

## 🎯 Objectif
Vérifier que les emails de bienvenue et de réinitialisation de mot de passe fonctionnent correctement.

## ⏱️ Durée Estimée
5 minutes

---

## 🚀 Préparation

### Étape 1 : Installer Nodemailer (1 minute)

```bash
npm install
```

**Vérifier** :
```
✅ nodemailer@6.9.8 ajouté
```

### Étape 2 : Appliquer la Migration (1 minute)

**Windows** :
```powershell
cd scripts
.\add-reset-password-fields.ps1
```

**Linux/Mac** :
```bash
cd scripts
chmod +x add-reset-password-fields.sh
./add-reset-password-fields.sh
```

**Vérifier** :
```
✅ Migration appliquée avec succès !
```

### Étape 3 : Configurer SMTP (2 minutes)

1. **Créer** `server/.env` (ou modifier l'existant)

2. **Ajouter** les variables SMTP :

**Pour Gmail** :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
CLIENT_URL=http://localhost:5173
```

**Pour tester sans SMTP** (mode dev) :
```env
# Laissez SMTP_USER et SMTP_PASS vides
# Les emails seront simulés dans les logs
CLIENT_URL=http://localhost:5173
```

3. **Redémarrer le serveur** :
```bash
cd server
npm start
```

---

## 📧 Test 1 : Email de Bienvenue (2 minutes)

### Étape 1 : Créer un Nouveau Compte

1. **Aller sur** http://localhost:5173/register

2. **Remplir le formulaire** :
   ```
   Nom: Test
   Prénoms: Email
   Genre: Homme
   Nom d'utilisateur: testemail2025
   Email: votre-email-de-test@example.com
   Mot de passe: Test@123
   Confirmer: Test@123
   ☑ J'accepte les conditions
   ```

3. **Cliquer** "S'inscrire"

### Étape 2 : Vérifier les Résultats

**Dans le navigateur** :
- ✅ Message : "Inscription réussie ! Un email de confirmation a été envoyé."
- ✅ Auto-connexion fonctionne
- ✅ Redirection vers Dashboard

**Dans les logs du serveur** :
```
✅ Email envoyé avec succès: {
  to: 'votre-email-de-test@example.com',
  subject: '🎉 Bienvenue sur G-Survey !',
  messageId: '...'
}
```

**Dans la boîte email** :
- ✅ Email reçu (ou dans spam)
- ✅ Sujet : "🎉 Bienvenue sur G-Survey !"
- ✅ Contient :
  - Nom et prénom
  - Email
  - Statut (Agent de terrain)
  - Prochaines étapes
  - Bouton "Se connecter"

---

## 🔐 Test 2 : Email de Réinitialisation (3 minutes)

### Étape 1 : Demander la Réinitialisation

1. **Aller sur** http://localhost:5173/forgot-password

2. **Entrer un email existant** :
   ```
   Email: admin@gsurvey.com
   ```

3. **Cliquer** "Envoyer le lien de réinitialisation"

### Étape 2 : Vérifier l'Email

**Dans le navigateur** :
- ✅ Message : "Si un compte existe avec cet email, vous recevrez un lien..."

**Dans les logs du serveur** :
```
✅ Email envoyé avec succès: {
  to: 'admin@gsurvey.com',
  subject: '🔐 Réinitialisation de votre mot de passe G-Survey',
  messageId: '...'
}
```

**Dans la boîte email** :
- ✅ Email reçu
- ✅ Sujet : "🔐 Réinitialisation de votre mot de passe G-Survey"
- ✅ Contient :
  - Lien de réinitialisation (bouton)
  - Information : "Valide 10 minutes"
  - Lien de secours (texte)
  - Message de sécurité

### Étape 3 : Réinitialiser le Mot de Passe

1. **Cliquer** sur le lien dans l'email (ou copier-coller)

2. **Vérifier** :
   - ✅ Redirection vers `/reset-password?token=...`
   - ✅ Formulaire visible
   - ✅ Token présent dans l'URL

3. **Remplir le formulaire** :
   ```
   Nouveau mot de passe: Nouveau@123
   Confirmer: Nouveau@123
   ```

4. **Cliquer** "Réinitialiser le mot de passe"

5. **Vérifier** :
   - ✅ Message : "Réinitialisation réussie !"
   - ✅ Redirection vers `/login` après 3 secondes

### Étape 4 : Tester la Connexion

1. **Se connecter** avec :
   ```
   Email: admin@gsurvey.com
   Mot de passe: Nouveau@123
   ```

2. **Vérifier** :
   - ✅ Connexion réussie
   - ✅ Dashboard accessible

---

## 🧪 Test 3 : Token Expiré (Optionnel)

1. **Demander** une réinitialisation

2. **Attendre 11 minutes** (ou modifier le code temporairement)

3. **Essayer** de réinitialiser

4. **Vérifier** :
   - ✅ Message : "Token invalide ou expiré"
   - ✅ Suggestion de demander un nouveau lien

---

## 📊 Checklist Complète

### Configuration
- [ ] Nodemailer installé
- [ ] Migration appliquée
- [ ] Variables SMTP configurées dans `.env`
- [ ] Serveur redémarré

### Email de Bienvenue
- [ ] Inscription fonctionne
- [ ] Message mentionne l'email
- [ ] Email reçu dans la boîte
- [ ] Email contient toutes les informations
- [ ] Bouton "Se connecter" fonctionne
- [ ] Design professionnel

### Email de Réinitialisation
- [ ] Demande de réinitialisation fonctionne
- [ ] Email reçu avec lien
- [ ] Lien redirige vers `/reset-password`
- [ ] Formulaire de réinitialisation fonctionne
- [ ] Nouveau mot de passe sauvegardé
- [ ] Connexion avec nouveau mot de passe fonctionne

### Sécurité
- [ ] Token expire après 10 minutes
- [ ] Token ne peut être utilisé qu'une fois
- [ ] Token hashé en base de données
- [ ] Protection contre email enumeration

---

## 🐛 Problèmes Courants

### ❌ "SMTP_USER non configuré"

**Solution** :
- Vérifier que `.env` existe dans `server/`
- Vérifier que `SMTP_USER` est défini
- Redémarrer le serveur

### ❌ "Invalid login credentials"

**Pour Gmail** :
- Utiliser un mot de passe d'application (pas le mot de passe normal)
- Activer 2FA et créer un app password

**Pour autres** :
- Vérifier username/password
- Vérifier que le compte SMTP est activé

### ❌ Email dans Spam

**Solution** :
- Vérifier le dossier spam
- Ajouter l'expéditeur aux contacts
- Configurer un SPF/DKIM (production)

### ❌ Email Non Reçu

**Vérifications** :
1. Logs du serveur (erreur ?)
2. Dossier spam
3. Email correct dans le formulaire
4. Config SMTP valide

---

## ✅ Test Réussi Si...

**Tous ces points sont validés** :

1. ✅ Email de bienvenue reçu après inscription
2. ✅ Email de réinitialisation reçu
3. ✅ Lien de réinitialisation fonctionne
4. ✅ Nouveau mot de passe sauvegardé
5. ✅ Connexion avec nouveau mot de passe fonctionne
6. ✅ Tokens expirés rejetés
7. ✅ Logs informatifs dans la console

**Alors** :
```
🎉 Le système SMTP fonctionne parfaitement !
✅ Emails envoyés avec succès
✅ Sécurité respectée
✅ UX optimale
```

---

## 📚 Documentation Complète

Pour plus de détails : `INTEGRATION_SMTP.md`

---

**Durée réelle** : 5 minutes  
**Difficulté** : Moyenne (nécessite config SMTP)  
**Statut** : ✅ Prêt pour test

**Bon test ! 🚀**

