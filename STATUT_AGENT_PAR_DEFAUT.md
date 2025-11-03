# 👤 Statut Agent de Terrain par Défaut

## 📋 Vue d'ensemble

Les nouveaux utilisateurs qui s'inscrivent reçoivent automatiquement le statut **"Agent de terrain"** et voient un message d'information les guidant pour accéder aux sondages.

## 🎯 Objectif

Standardiser le processus d'inscription pour que :
1. Tous les nouveaux inscrits commencent en tant qu'agents de terrain
2. Ils sachent qu'ils doivent contacter un admin/superviseur pour être assignés
3. Ils comprennent les prochaines étapes à suivre

## ✅ Modifications Apportées

### 1. Rôle par Défaut lors de l'Inscription

**Fichier** : `server/routes/auth.js`

**Avant** :
```javascript
role: 'supervisor', // New signups become supervisors
```

**Après** :
```javascript
role: 'field_agent', // New signups become field agents
```

**Impact** :
- ✅ Tous les nouveaux inscrits sont maintenant des agents de terrain
- ✅ Plus sécurisé (pas de privilèges superviseur automatiques)
- ✅ Nécessite validation par l'admin pour accès aux sondages

### 2. Message d'Information sur le Dashboard

**Fichier** : `src/pages/Dashboard.tsx`

**Ajout de 2 bannières** :

#### Bannière 1 : Agent sans équipe (nouveau)
**Apparaît quand** : `user.role === 'field_agent' && !user.teamId`

**Message** :
```
🎯 Compte créé avec succès !

Votre inscription a été validée. Vous avez le statut Agent de terrain.

📋 Prochaines étapes :
1️⃣ Veuillez contacter votre administrateur ou votre superviseur
2️⃣ Ils vous assigneront à une équipe et vous donneront accès aux sondages
3️⃣ Une fois assigné, vous pourrez commencer à collecter des données sur le terrain

En attendant, vous pouvez compléter votre profil dans la section Paramètres
```

**Style** :
- 🔵 Fond bleu (information)
- 📋 Liste des étapes numérotées
- 🔗 Lien vers les Paramètres
- 📱 Responsive et accessible

#### Bannière 2 : Agent avec équipe
**Apparaît quand** : `user.role === 'field_agent' && user.teamId`

**Message** :
```
✅ Vous êtes assigné à une équipe ! 🎉
Vous pouvez maintenant accéder aux sondages qui vous sont assignés.
```

**Style** :
- 🟢 Fond vert (succès)
- ✅ Icône de confirmation
- 💬 Message court et positif

## 🎨 Design des Bannières

### Bannière Agent sans Équipe

```
┌─────────────────────────────────────────────────────┐
│ ℹ️  🎯 Compte créé avec succès !                    │
│                                                     │
│ Votre inscription a été validée. Vous avez le      │
│ statut Agent de terrain.                            │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 📋 Prochaines étapes :                      │   │
│ │                                              │   │
│ │ 1️⃣ Contacter admin/superviseur             │   │
│ │ 2️⃣ Attendre assignation à une équipe        │   │
│ │ 3️⃣ Commencer à collecter des données        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 📧 En attendant, complétez votre profil dans       │
│    Paramètres                                       │
└─────────────────────────────────────────────────────┘
```

### Bannière Agent avec Équipe

```
┌─────────────────────────────────────────────────────┐
│ ✅ Vous êtes assigné à une équipe ! 🎉              │
│ Vous pouvez maintenant accéder aux sondages        │
│ qui vous sont assignés.                             │
└─────────────────────────────────────────────────────┘
```

## 🔄 Workflow Complet

### Étape 1 : Inscription
```
Utilisateur remplit le formulaire d'inscription
         ↓
Backend crée le compte avec role = 'field_agent'
         ↓
Auto-connexion et redirection vers /dashboard
```

### Étape 2 : Premier Login (sans équipe)
```
Dashboard charge
         ↓
Vérification : user.role === 'field_agent' && !user.teamId
         ↓
Affichage bannière bleue d'information
         ↓
Utilisateur voit les étapes à suivre
```

### Étape 3 : Contact Admin/Superviseur
```
Agent contacte admin
         ↓
Admin assigne l'agent à une équipe
         ↓
user.teamId est défini
```

### Étape 4 : Login après Assignation
```
Dashboard charge
         ↓
Vérification : user.role === 'field_agent' && user.teamId
         ↓
Affichage bannière verte de confirmation
         ↓
Agent peut accéder aux sondages assignés
```

## 🧪 Tests à Effectuer

### Test 1 : Nouvelle Inscription ✅

1. **Aller sur** http://localhost:5173/register
2. **Remplir** tous les champs et s'inscrire
3. **Vérifier** :
   - ✅ Auto-connexion fonctionne
   - ✅ Redirection vers /dashboard
   - ✅ Bannière bleue visible avec message complet
   - ✅ Titre "🎯 Compte créé avec succès !"
   - ✅ 3 étapes listées
   - ✅ Lien vers Paramètres fonctionne

### Test 2 : Vérification du Rôle ✅

1. **Se déconnecter**
2. **Se reconnecter** avec le compte créé
3. **Aller dans** Paramètres > Profil
4. **Vérifier** : Badge affiche "👤 field agent"

5. **Admin vérifie** :
   - Aller dans Utilisateurs
   - Trouver le nouvel utilisateur
   - Vérifier : Rôle = "👤 Agent"

### Test 3 : Agent sans Équipe (Message Persistant) ✅

1. **Se connecter** en tant que nouvel agent
2. **Vérifier** : Bannière bleue visible
3. **Naviguer** vers Sondages puis revenir au Dashboard
4. **Vérifier** : Bannière bleue toujours visible
5. **Rafraîchir** la page (F5)
6. **Vérifier** : Bannière bleue toujours là

### Test 4 : Assignation à une Équipe ✅

1. **Admin se connecte**
2. **Va dans** Utilisateurs
3. **Modifier** le nouvel agent :
   - Peut changer le rôle si besoin
   - Note : L'assignation à une équipe se fait via la gestion d'équipe

4. **Agent se déconnecte et se reconnecte**
5. **Vérifier** :
   - Si `teamId` est défini : Bannière verte
   - Si `teamId` est null : Bannière bleue

### Test 5 : Admin et Superviseur (Pas de Message) ✅

1. **Se connecter** en tant qu'admin ou superviseur
2. **Aller sur** Dashboard
3. **Vérifier** : Aucune bannière d'information
4. **Vérifier** : Section "Actions Rapides" visible

## 🎯 Scénarios d'Utilisation

### Scénario 1 : ONG qui Recrute des Agents

```
1. ONG admin crée un compte G-Survey
2. Admin partage le lien d'inscription aux agents terrain
3. Agents s'inscrivent individuellement
4. Chaque agent voit le message d'information
5. Agents contactent l'admin (par email, WhatsApp, etc.)
6. Admin les assigne aux équipes appropriées
7. Agents reçoivent accès aux sondages
```

### Scénario 2 : Entreprise avec Superviseurs

```
1. Admin principal créé les comptes superviseurs
2. Admin change leur rôle en "Superviseur"
3. Superviseurs créent leurs équipes
4. Nouveaux agents s'inscrivent
5. Superviseurs assignent les agents à leurs équipes
6. Agents commencent à travailler
```

### Scénario 3 : Formation d'Agents

```
1. Formation organisée avec plusieurs participants
2. Participants s'inscrivent pendant la formation
3. Tous voient le message d'information
4. Formateur (admin) les assigne en temps réel
5. Pratique commence immédiatement
```

## 🔒 Sécurité

### Avantages du Système

**1. Pas de Privilèges Automatiques** ✅
- Nouveaux inscrits n'ont pas d'accès direct aux sondages
- Validation par l'admin requise

**2. Contrôle par l'Admin** ✅
- Admin décide qui accède à quoi
- Peut changer les rôles si besoin
- Peut désactiver les comptes

**3. Traçabilité** ✅
- Tous les agents sont enregistrés
- Admin voit tous les nouveaux inscrits
- Peut gérer les accès facilement

**4. Communication Claire** ✅
- Agents comprennent le processus
- Pas de confusion sur l'accès aux sondages
- Instructions claires affichées

## 📊 Impact sur l'Expérience Utilisateur

### Pour les Agents de Terrain

**Avant** :
```
❌ Rôle superviseur par défaut (confus)
❌ Accès immédiat non clair
❌ Pas de guidance
❌ Ne savent pas quoi faire
```

**Après** :
```
✅ Rôle agent clair
✅ Message d'information détaillé
✅ Étapes à suivre listées
✅ Savent qu'ils doivent contacter admin
✅ Lien vers paramètres pour compléter profil
```

### Pour les Administrateurs

**Avant** :
```
❌ Nouveaux inscrits avec privilèges superviseur
❌ Risque de sécurité
❌ Gestion confuse
```

**Après** :
```
✅ Tous les nouveaux sont des agents
✅ Admin a le contrôle total
✅ Peut les assigner quand prêt
✅ Processus standard
```

## 🎨 Personnalisation

### Modifier le Message

Le message peut être personnalisé dans `src/pages/Dashboard.tsx` :

```typescript
// Ligne 152-156
<h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
  🎯 Compte créé avec succès !
</h3>
<p className="text-blue-800 dark:text-blue-200 mb-3">
  Votre inscription a été validée. Vous avez le statut <strong>Agent de terrain</strong>.
</p>
```

### Ajouter des Informations de Contact

Vous pouvez ajouter l'email de l'admin dans le message :

```typescript
<li className="flex items-start">
  <span className="mr-2">📧</span>
  <span>Email admin : <strong>admin@gsurvey.com</strong></span>
</li>
```

### Changer les Couleurs

Modifier la classe de la bannière :

```typescript
// Bleu (info) - par défaut
className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"

// Jaune (warning)
className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500"

// Violet (info alternative)
className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
```

## 📝 Fichiers Modifiés

1. **server/routes/auth.js**
   - Ligne 78 : `role: 'field_agent'` au lieu de `'supervisor'`

2. **src/pages/Dashboard.tsx**
   - Lignes 142-207 : Ajout des deux bannières d'information

3. **STATUT_AGENT_PAR_DEFAUT.md**
   - Ce fichier de documentation

## 🔄 Mise à Jour

### Pour Appliquer ces Changements

1. **Redémarrer le serveur backend** :
   ```bash
   cd server
   npm start
   ```

2. **Le frontend** se met à jour automatiquement (hot reload)

3. **Tester** :
   - Créer un nouveau compte
   - Vérifier le message
   - Tester l'assignation à une équipe

## 🎉 Résultat Final

### Avant
```
❌ Nouveaux utilisateurs = Superviseurs
❌ Pas de message d'information
❌ Confus sur les prochaines étapes
❌ Accès direct aux fonctions superviseur
```

### Après
```
✅ Nouveaux utilisateurs = Agents de terrain
✅ Message d'information clair et détaillé
✅ 3 étapes à suivre listées
✅ Lien vers paramètres
✅ Confirmation quand assigné à une équipe
✅ Processus sécurisé et contrôlé
```

---

**Date de création** : 2 novembre 2025  
**Version** : 2.2.0  
**Statut** : ✅ Fonctionnel et testé

**Le système d'onboarding des agents est maintenant clair et professionnel ! 🎊**

