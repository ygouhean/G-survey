# ⚡ Test Rapide : Notifications d'Inscription

## 🎯 Objectif
Vérifier que les administrateurs et superviseurs reçoivent une notification lors de chaque nouvelle inscription.

## ⏱️ Durée Estimée
4 minutes

## 🚀 Étape 1 : Appliquer la Migration (1 minute)

### Sur Windows (PowerShell)

```powershell
cd scripts
.\add-user-registered-notification.ps1
```

**Vérifier** :
```
✅ Migration appliquée avec succès !
```

### Sur Linux/Mac (Bash)

```bash
cd scripts
chmod +x add-user-registered-notification.sh
./add-user-registered-notification.sh
```

**Vérifier** :
```
✅ Migration appliquée avec succès !
```

## 🔄 Étape 2 : Redémarrer le Serveur (30 secondes)

```bash
cd server
npm start
```

**Vérifier** :
```
✅ Server running on port 5000
✅ Database connected
```

## 📝 Étape 3 : Créer un Nouveau Compte (1 minute)

1. **Ouvrir** http://localhost:5173/

2. **Cliquer** "S'inscrire"

3. **Remplir** le formulaire :
   ```
   Nom: Nouveau
   Prénoms: Testeur
   Genre: Homme
   Nom d'utilisateur: testeur2025
   Email: testeur2025@example.com
   Mot de passe: Test@123
   Confirmer: Test@123
   ☑ J'accepte les conditions
   ```

4. **Cliquer** "S'inscrire"

5. **Vérifier** :
   - ✅ Message "Inscription réussie !"
   - ✅ Auto-connexion
   - ✅ Redirection vers Dashboard
   - ✅ Bannière bleue "🎯 Compte créé avec succès !"

## 🔔 Étape 4 : Vérifier la Notification Admin (1 minute)

1. **Ouvrir** un onglet privé ou un autre navigateur

2. **Aller sur** http://localhost:5173/login

3. **Se connecter** en tant qu'admin :
   ```
   Email: admin@gsurvey.com
   Mot de passe: Admin@123
   ```

4. **Vérifier** :
   - ✅ Badge rouge sur l'icône 🔔 (en haut à droite)
   - ✅ Nombre affiché : 1

5. **Cliquer** sur l'icône 🔔

6. **Vérifier dans le dropdown** :
   ```
   ┌─────────────────────────────────────────┐
   │ 👤 Nouvelle inscription                 │
   │                                         │
   │ Nouveau Testeur vient de s'inscrire     │
   │ sur G-Survey (testeur2025@example.com). │
   │ Statut : Agent de terrain.              │
   │                                         │
   │ Il y a quelques instants               │
   └─────────────────────────────────────────┘
   ```

7. **Cliquer** sur la notification

8. **Vérifier** :
   - ✅ Redirection vers `/admin/users`
   - ✅ "Nouveau Testeur" visible dans la liste
   - ✅ Badge "👤 Agent" (vert)
   - ✅ Email : testeur2025@example.com

## 📊 Checklist Complète

### Migration
- [ ] Script exécuté sans erreur
- [ ] Message de succès affiché
- [ ] Base de données mise à jour

### Serveur
- [ ] Backend redémarré
- [ ] Aucune erreur dans les logs
- [ ] Port 5000 accessible

### Inscription
- [ ] Formulaire rempli correctement
- [ ] Validation réussie
- [ ] Auto-connexion fonctionne
- [ ] Redirection vers Dashboard
- [ ] Bannière bleue visible

### Notification
- [ ] Badge rouge visible sur 🔔
- [ ] Compteur affiche 1
- [ ] Dropdown s'ouvre au clic
- [ ] Notification visible dans la liste
- [ ] Titre : "👤 Nouvelle inscription"
- [ ] Message contient :
  - [ ] Prénom et nom du nouvel utilisateur
  - [ ] Email
  - [ ] "Statut : Agent de terrain."
- [ ] Horodatage : "Il y a quelques instants"

### Redirection
- [ ] Clic sur notification redirige vers `/admin/users`
- [ ] Nouvel utilisateur visible dans la liste
- [ ] Badge "👤 Agent" affiché
- [ ] Statut "Actif"

## 🧪 Tests Supplémentaires (Optionnel)

### Test A : Plusieurs Inscriptions

1. **Créer** 2 autres comptes (testeur2, testeur3)

2. **Admin rafraîchit** la page

3. **Vérifier** :
   - ✅ Badge affiche 3 (ou + selon les notifications existantes)
   - ✅ 3 notifications dans le dropdown
   - ✅ La plus récente en haut

### Test B : Superviseur Reçoit Aussi

1. **Se déconnecter** de l'admin

2. **Se connecter** en tant que superviseur (si vous en avez un)

3. **Vérifier** :
   - ✅ Badge rouge visible
   - ✅ Même notification que l'admin

### Test C : Agent Ne Reçoit Pas

1. **Se connecter** en tant qu'agent (le compte testeur2025 par exemple)

2. **Vérifier** :
   - ✅ Icône de notification visible
   - ✅ Mais badge = 0 (aucune notification d'inscription)

### Test D : Logs du Serveur

**Vérifier dans les logs** :
```
✅ X notification(s) créée(s) pour la nouvelle inscription de Nouveau Testeur
```

**X** = nombre d'admins + superviseurs actifs

## 🎨 Aperçu Visuel

### Badge de Notification

**Avant l'inscription** :
```
🔔 (pas de badge)
```

**Après l'inscription** :
```
🔔 🔴 1
```

### Dropdown de Notification

```
┌──────────────────────────────────────────────┐
│ 🔔 Notifications (1)         🗑️ Tout effacer │
├──────────────────────────────────────────────┤
│                                              │
│ 👤 Nouvelle inscription                      │
│ Nouveau Testeur vient de s'inscrire sur      │
│ G-Survey (testeur2025@example.com).          │
│ Statut : Agent de terrain.                   │
│                                              │
│ Il y a quelques instants                    │
│                                              │
├──────────────────────────────────────────────┤
│ 📝 Marquer tout comme lu                     │
└──────────────────────────────────────────────┘
```

### Page Utilisateurs (après clic)

```
┌─────────────────────────────────────────────────────────┐
│ 👥 Gestion des Utilisateurs            [+ Nouvel util.] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Nom              Email                    Rôle  Statut │
│ ─────────────────────────────────────────────────────── │
│ Nouveau Testeur  testeur2025@example.com 👤 Agent Actif │
│                                          (vert)  (✓)   │
│                                                    ✏️ 🗑️ │
└─────────────────────────────────────────────────────────┘
```

## 🐛 Problèmes Courants

### ❌ Erreur "Type user_registered does not exist"

**Cause** : Migration non appliquée

**Solution** :
1. Exécuter le script de migration
2. Redémarrer le serveur

### ❌ Badge ne s'affiche pas

**Cause** : Frontend non mis à jour

**Solution** :
1. Rafraîchir la page (F5)
2. Vider le cache : Ctrl+Shift+Delete
3. Redémarrer le serveur frontend (si nécessaire)

### ❌ "Cannot read property 'notifyUserRegistration' of undefined"

**Cause** : Import incorrect dans auth.js

**Solution** :
1. Vérifier la ligne 9 de `server/routes/auth.js`
2. Devrait être : `const { notifyUserRegistration } = require('./notifications');`
3. Redémarrer le serveur

### ❌ Notification sans contenu

**Cause** : Problème avec les données utilisateur

**Solution** :
1. Vérifier que tous les champs requis sont remplis
2. Vérifier les logs du serveur pour les erreurs
3. Vérifier la fonction `notifyUserRegistration` dans `notifications.js`

## ✅ Test Réussi Si...

**Tous ces points sont validés** :

1. ✅ Migration appliquée sans erreur
2. ✅ Serveur redémarré
3. ✅ Nouveau compte créé
4. ✅ Badge rouge visible pour l'admin
5. ✅ Notification dans le dropdown
6. ✅ Message complet et correct
7. ✅ Clic redirige vers `/admin/users`
8. ✅ Nouvel utilisateur visible dans la liste
9. ✅ Logs confirment la création de la notification

**Alors** :
```
🎉 Le système de notifications fonctionne parfaitement !
✅ Les admins sont informés en temps réel
✅ Les superviseurs reçoivent aussi les notifications
✅ Le workflow d'onboarding est complet
```

## 📚 Documentation Complète

Pour plus de détails : `NOTIFICATIONS_INSCRIPTION.md`

---

**Durée réelle** : 4 minutes  
**Difficulté** : Facile  
**Statut** : ✅ Prêt pour test

**Bon test ! 🚀**

