# ⚡ Test Rapide : Gestion des Utilisateurs Admin

## 🎯 Objectif
Tester toutes les fonctionnalités de gestion des utilisateurs par l'administrateur.

## ⏱️ Durée Estimée
5 minutes

## 🚀 Préparation

1. **Redémarrer le serveur backend** (pour charger les nouvelles routes)
   ```bash
   cd server
   npm start
   ```

2. **Se connecter en tant qu'admin**
   ```
   http://localhost:5173/login
   Email: admin@gsurvey.com
   Mot de passe: Admin@123
   ```

3. **Aller dans Utilisateurs** (👥 dans le menu latéral)

## ✅ Tests à Effectuer

### Test 1 : Créer un Utilisateur (2 minutes)

1. **Cliquer** sur "➕ Nouvel Utilisateur"

2. **Vérifier** que le formulaire a **4 sections** :
   - ✅ Informations de base
   - ✅ Informations de contact
   - ✅ Informations professionnelles
   - ✅ Accès et Sécurité

3. **Remplir** tous les champs :
   ```
   Nom: Test
   Prénoms: Utilisateur 2025
   Genre: Homme
   Nom d'utilisateur: testuser2025
   Email: test2025@example.com
   Téléphone: +33612345678
   Pays: France
   Secteur: Technologie
   Type d'organisation: Startup
   Rôle: Agent de terrain
   Mot de passe: Test@123
   ```

4. **Cliquer** "Créer"

5. **Vérifier** :
   - ✅ Message "✅ Utilisateur créé avec succès"
   - ✅ Utilisateur apparaît dans la liste
   - ✅ Toutes les informations sont correctes

### Test 2 : Modifier un Utilisateur (1 minute)

1. **Trouver** l'utilisateur "Test Utilisateur 2025"

2. **Cliquer** sur ✏️ (bouton bleu "Modifier")

3. **Vérifier** que TOUS les champs sont pré-remplis

4. **Modifier** :
   - Rôle → Superviseur
   - Pays → Bénin
   - Secteur → Santé

5. **Cliquer** "Mettre à jour"

6. **Vérifier** :
   - ✅ Message "✅ Utilisateur mis à jour avec succès"
   - ✅ Badge rôle changé (👔 Superviseur au lieu de 👤 Agent)
   - ✅ Modifications visibles

### Test 3 : Désactiver un Utilisateur (30 secondes)

1. **Cliquer** sur 🔒 (bouton orange "Désactiver")

2. **Confirmer** l'action

3. **Vérifier** :
   - ✅ Message "✅ Utilisateur désactivé avec succès"
   - ✅ Badge statut passe à "Inactif" (rouge)
   - ✅ Bouton change en ✅ (vert "Activer")

### Test 4 : Réactiver un Utilisateur (30 secondes)

1. **Cliquer** sur ✅ (bouton vert "Activer")

2. **Confirmer** l'action

3. **Vérifier** :
   - ✅ Message "✅ Utilisateur activé avec succès"
   - ✅ Badge statut passe à "Actif" (vert)
   - ✅ Bouton redevient 🔒 (orange "Désactiver")

### Test 5 : Tenter de Se Désactiver Soi-Même (30 secondes)

1. **Trouver** votre propre compte (Admin User)

2. **Cliquer** sur 🔒

3. **Vérifier** :
   - ❌ Message d'erreur "Vous ne pouvez pas modifier votre propre statut"
   - ✅ Votre compte reste actif

### Test 6 : Supprimer un Utilisateur (1 minute)

1. **Cliquer** sur 🗑️ (bouton rouge "Supprimer") pour "Test Utilisateur 2025"

2. **Lire** le message d'avertissement :
   ```
   ⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement
   l'utilisateur "Test Utilisateur 2025" ?
   
   Cette action est irréversible !
   ```

3. **Cliquer** OK pour confirmer

4. **Vérifier** :
   - ✅ Message "✅ Utilisateur supprimé avec succès"
   - ✅ Utilisateur n'apparaît plus dans la liste
   - ✅ Le total diminue de 1

## 📊 Checklist Complète

### Interface
- [ ] Page Gestion des Utilisateurs accessible
- [ ] 4 statistiques affichées en haut
- [ ] Bouton "Nouvel Utilisateur" visible
- [ ] Tableau des utilisateurs avec colonnes :
  - [ ] Utilisateur (avatar + nom + email)
  - [ ] Rôle (badge coloré)
  - [ ] Statut (badge coloré)
  - [ ] Dernière connexion
  - [ ] Actions (3 boutons : ✏️ 🔒 🗑️)

### Création
- [ ] Modal s'ouvre avec 4 sections
- [ ] Tous les champs sont présents
- [ ] Sélecteurs fonctionnent (pays, secteur, org)
- [ ] Validation fonctionne
- [ ] Création réussie avec message
- [ ] Utilisateur apparaît dans la liste

### Modification
- [ ] Modal s'ouvre avec données pré-remplies
- [ ] Tous les champs modifiables (sauf email)
- [ ] Note "L'email ne peut pas être modifié"
- [ ] Pas de champ mot de passe (sécurité)
- [ ] Modification réussie avec message
- [ ] Changements visibles immédiatement

### Activation/Désactivation
- [ ] Confirmation demandée
- [ ] Statut change correctement
- [ ] Bouton change d'icône et de couleur
- [ ] Message de succès affiché
- [ ] Impossible de désactiver son propre compte

### Suppression
- [ ] Double confirmation avec avertissement
- [ ] Nom d'utilisateur affiché dans la confirmation
- [ ] Suppression réussie avec message
- [ ] Utilisateur disparaît de la liste
- [ ] Impossible de supprimer son propre compte

## 🎨 Vérifications Visuelles

### Boutons d'Actions
- ✏️ **Modifier** : Bleu
- 🔒 **Désactiver** : Orange
- ✅ **Activer** : Vert
- 🗑️ **Supprimer** : Rouge

### Badges de Rôle
- 👑 **Admin** : Rouge
- 👔 **Superviseur** : Bleu
- 👤 **Agent** : Vert

### Badges de Statut
- **Actif** : Vert
- **Inactif** : Rouge

## ⚠️ Erreurs à Tester

### Test Username Unique
1. Créer utilisateur avec username "unique123"
2. Créer/modifier un autre avec le même username
3. **Attendre** : ❌ "Ce nom d'utilisateur est déjà utilisé"

### Test Email Unique
1. Créer utilisateur avec un email existant
2. **Attendre** : ❌ "Un utilisateur avec cet email existe déjà"

### Test Protection Auto-Modification
1. Tenter de désactiver son propre compte
2. **Attendre** : ❌ "Vous ne pouvez pas modifier votre propre statut"
3. Tenter de supprimer son propre compte
4. **Attendre** : ❌ "Vous ne pouvez pas supprimer votre propre compte"

## 🐛 En Cas de Problème

### Erreur "404 Not Found" lors de la modification
**Solution :** Redémarrer le serveur backend
```bash
cd server
npm start
```

### Erreur "403 Accès non autorisé"
**Solution :** Vous n'êtes pas connecté en tant qu'admin
```bash
# Se reconnecter avec admin@gsurvey.com
```

### Le formulaire ne s'ouvre pas
**Solution :**
1. Ouvrir la console (F12)
2. Vérifier s'il y a des erreurs
3. Rafraîchir la page

### Les modifications ne sont pas sauvegardées
**Solution :**
1. Vérifier les logs du serveur backend
2. Vérifier que PostgreSQL est démarré
3. Vérifier que la migration add-profile-fields a été appliquée

## ✅ Si Tous les Tests Passent

**Félicitations ! 🎉**

La gestion des utilisateurs fonctionne parfaitement :
- ✅ Création avec tous les champs
- ✅ Modification complète
- ✅ Activation/désactivation
- ✅ Suppression sécurisée
- ✅ Protections en place
- ✅ Interface professionnelle

## 📚 Documentation Complète

Pour plus de détails : `GESTION_UTILISATEURS_ADMIN.md`

---

**Durée réelle** : 5 minutes  
**Difficulté** : Facile  
**Statut** : ✅ Prêt pour la production

**Bon test ! 🚀**


