# Gestion Avancée des Dates et Statuts des Sondages 📅🔒

## 📋 Vue d'Ensemble

Trois fonctionnalités essentielles ont été implémentées pour améliorer la gestion des sondages :

1. **Validation des dates** lors de la création et modification
2. **Fermeture automatique** des sondages expirés
3. **Restrictions de modification** selon le statut du sondage

---

## 1️⃣ Validation des Dates

### 🎯 Objectif
Empêcher les dates invalides et garantir la cohérence temporelle des sondages.

### ✅ Règles de Validation

#### Création de Sondage

**Date de début** :
- ❌ Ne peut PAS être antérieure à aujourd'hui
- ✅ Peut être aujourd'hui ou dans le futur
- 💡 Le champ date affiche la date minimum automatiquement

**Date de fin** :
- ❌ Ne peut PAS être antérieure à aujourd'hui
- ❌ Ne peut PAS être antérieure à la date de début
- ✅ Doit être égale ou postérieure à la date de début
- 💡 Le champ date s'adapte automatiquement à la date de début

#### Modification de Sondage

**Mêmes règles** que pour la création, PLUS :
- 🔒 Les champs sont désactivés si le sondage est **actif**
- ⚠️ Messages d'aide sous chaque champ de date

### 📱 Interface Utilisateur

#### Création

```
┌─────────────────────────────────────────┐
│ Date de début                           │
│ [2025-11-02___________]  ← min=today    │
│ Ne peut pas être antérieure à aujourd'hui│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Date de fin                             │
│ [2025-11-30___________]  ← min=startDate│
│ Doit être égale ou postérieure à la date│
│ de début                                │
└─────────────────────────────────────────┘
```

#### Messages d'Erreur

```
❌ La date de début ne peut pas être antérieure à aujourd'hui

❌ La date de fin ne peut pas être antérieure à aujourd'hui

❌ La date de fin doit être égale ou postérieure à la date de début
```

### 🔧 Implémentation Technique

#### Frontend (React)

**SurveyCreate.tsx** :
```typescript
// Validation dans handleSave
const today = new Date()
today.setHours(0, 0, 0, 0)

if (startDate) {
  const start = new Date(startDate)
  if (start < today) {
    alert('❌ La date de début ne peut pas être antérieure à aujourd\'hui')
    return
  }
}

if (endDate) {
  const end = new Date(endDate)
  if (end < today) {
    alert('❌ La date de fin ne peut pas être antérieure à aujourd\'hui')
    return
  }

  if (startDate && end < new Date(startDate)) {
    alert('❌ La date de fin doit être égale ou postérieure à la date de début')
    return
  }
}
```

**Champs HTML** :
```tsx
<input
  type="date"
  value={startDate}
  min={new Date().toISOString().split('T')[0]}
  className="input"
/>

<input
  type="date"
  value={endDate}
  min={startDate || new Date().toISOString().split('T')[0]}
  className="input"
/>
```

---

## 2️⃣ Fermeture Automatique des Sondages

### 🎯 Objectif
Fermer automatiquement les sondages à **23h59:59** de leur date de fin.

### ⏰ Moment de Fermeture

Les sondages se ferment automatiquement à **23:59:59** (dernière seconde de la journée) de la date de fin spécifiée, permettant ainsi aux répondants d'accéder au sondage durant toute la journée de la date de fin.

**Exemple** :
- Date de fin : 15 janvier 2025
- Le sondage reste ouvert jusqu'au : **15 janvier 2025 à 23:59:59**
- Fermeture automatique : Dès le **16 janvier 2025 à 00:00:00**

### ⚙️ Fonctionnement

#### Déclenchement Automatique

La fermeture automatique se déclenche :
- ✅ À chaque requête `findAll` sur les sondages (hook `beforeFind`)
- ✅ Lorsqu'un sondage est consulté
- ✅ Lors du chargement de la liste des sondages

#### Processus

```
1. Requête vers les sondages
   ↓
2. Hook beforeFind déclenché
   ↓
3. Pour chaque sondage actif :
   - Créer date de fin à 23:59:59
   - Comparer avec maintenant
   ↓
4. Pour chaque sondage expiré :
   - Statut → 'closed'
   - autoClosedAt → date/heure actuelle
   ↓
5. Log dans la console serveur
   ↓
6. Données mises à jour renvoyées
```

### 🔐 Restrictions de Réouverture

#### Pour les Utilisateurs Standard
```
🔒 Ce sondage a été fermé automatiquement car sa date de fin est dépassée.

Seul un administrateur peut le rouvrir.
```

#### Pour les Administrateurs
```
⚠️ Ce sondage a été fermé automatiquement car sa date de fin est dépassée.

Êtes-vous sûr de vouloir le rouvrir ?

[Oui] [Non]
```

### 📱 Interface Utilisateur

#### Message sur Page du Sondage (si fermé automatiquement)

```
┌─────────────────────────────────────────────┐
│ 🔒 Sondage fermé automatiquement            │
│                                             │
│ Ce sondage a été fermé automatiquement le   │
│ 02/11/2025 à 23:59 car sa date de fin a    │
│ été atteinte.                               │
│                                             │
│ 🔓 En tant qu'administrateur, vous pouvez   │
│ réactiver ce sondage en cliquant sur        │
│ "Activer" ci-dessous.                       │
└─────────────────────────────────────────────┘
```

#### Message si Date Dépassée (mais pas encore fermé)

```
┌─────────────────────────────────────────────┐
│ ⚠️ Date de fin dépassée                     │
│                                             │
│ La date de fin de ce sondage était le      │
│ 30/10/2025. Il devrait être fermé          │
│ automatiquement.                            │
│                                             │
│ 💡 Actualisez la page pour appliquer la    │
│ fermeture automatique.                      │
└─────────────────────────────────────────────┘
```

### 🔧 Implémentation Technique

#### Backend (Sequelize)

**Nouveau champ dans Survey.js** :
```javascript
autoClosedAt: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Date de fermeture automatique du sondage'
}
```

**Hook beforeFind** :
```javascript
hooks: {
  beforeFind: async (options) => {
    await Survey.closeExpiredSurveys();
  }
}
```

**Méthode statique** :
```javascript
Survey.closeExpiredSurveys = async function() {
  const now = new Date();
  
  const expiredSurveys = await Survey.findAll({
    where: {
      status: 'active',
      endDate: {
        [Op.ne]: null
      }
    }
  });

  // Filtrer manuellement pour vérifier la date avec 23:59:59
  const surveysToClose = expiredSurveys.filter(survey => {
    if (!survey.endDate) return false;
    
    // Créer une date à 23:59:59 du jour de fin
    const endDateTime = new Date(survey.endDate);
    endDateTime.setHours(23, 59, 59, 999);
    
    return endDateTime < now;
  });

  for (const survey of surveysToClose) {
    await survey.update({
      status: 'closed',
      autoClosedAt: now
    });
    console.log(`Sondage ${survey.id} fermé automatiquement`);
  }

  return surveysToClose.length;
};
```

#### Frontend (React)

**SurveyView.tsx - Vérification lors du changement de statut** :
```typescript
const handleStatusChange = async (newStatus: string) => {
  // Vérifier si fermé automatiquement
  if (survey.autoClosedAt && survey.status === 'closed' && newStatus === 'active') {
    if (user?.role !== 'admin') {
      alert('🔒 Ce sondage a été fermé automatiquement...')
      return
    }
    
    const confirmReopen = confirm('⚠️ Ce sondage a été fermé automatiquement...')
    if (!confirmReopen) return
  }

  await surveyService.updateSurveyStatus(id!, newStatus)
  setSurvey({ 
    ...survey, 
    status: newStatus, 
    autoClosedAt: newStatus === 'active' ? null : survey.autoClosedAt 
  })
}
```

### 📊 Migration Base de Données

**Fichier** : `server/migrations/add-auto-closed-field.sql`

```sql
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS "autoClosedAt" TIMESTAMP;

COMMENT ON COLUMN surveys."autoClosedAt" IS 
  'Date de fermeture automatique du sondage';
```

**Application** :
```bash
# PostgreSQL
psql -U your_user -d your_database -f server/migrations/add-auto-closed-field.sql

# Ou via script Node.js
node -e "require('./server/config/database').sequelize.sync({alter: true})"
```

---

## 3️⃣ Restrictions de Modification

### 🎯 Objectif
Empêcher la modification des sondages actifs pour préserver l'intégrité des données.

### 🔒 Règle Principale

```
✅ On peut modifier un sondage UNIQUEMENT s'il est :
   - En brouillon (draft)
   - En pause (paused)
   - Fermé (closed)

❌ On ne peut PAS modifier un sondage s'il est :
   - Actif (active)
```

### 📱 Interface Utilisateur

#### Page de Modification (sondage actif)

```
┌─────────────────────────────────────────────┐
│ 🔒 Modification impossible                  │
│                                             │
│ Ce sondage est actuellement actif. Vous    │
│ devez le mettre en pause ou le fermer avant│
│ de pouvoir le modifier.                     │
│                                             │
│ 💡 Retournez à la page du sondage pour     │
│ changer son statut.                         │
└─────────────────────────────────────────────┘

[Annuler] [💾 Enregistrer les modifications] ← Désactivé
```

#### Champs Désactivés

Lorsque le sondage est actif :
- ⚫ Tous les champs de saisie sont désactivés (opacity 50%)
- 🚫 Curseur "not-allowed"
- 🔒 Bouton "Enregistrer" désactivé avec tooltip

#### Message si Réponses Existantes (sondage en pause/fermé)

```
┌─────────────────────────────────────────────┐
│ ⚠️ Attention !                              │
│                                             │
│ Ce sondage a déjà reçu 45 réponses.        │
│ Modifier les questions peut affecter        │
│ l'analyse des données.                      │
└─────────────────────────────────────────────┘
```

### 🔧 Implémentation Technique

#### Frontend (React)

**SurveyEdit.tsx - Validation** :
```typescript
const handleSave = async () => {
  if (!title.trim()) {
    alert('Le titre est requis')
    return
  }

  // Vérifier que le sondage peut être modifié
  if (survey?.status === 'active') {
    alert('❌ Vous ne pouvez modifier que les sondages en pause ou fermés.\n\nMettez d\'abord le sondage en pause.')
    return
  }

  // ... validation des dates
  // ... sauvegarde
}
```

**Désactivation des champs** :
```tsx
<input
  type="date"
  value={startDate}
  disabled={survey?.status === 'active'}
  className="input disabled:opacity-50 disabled:cursor-not-allowed"
/>
```

**Bouton désactivé** :
```tsx
<button
  onClick={handleSave}
  disabled={saving || survey?.status === 'active'}
  title={survey?.status === 'active' ? 'Mettez le sondage en pause pour le modifier' : ''}
  className="btn btn-primary"
>
  💾 Enregistrer les modifications
</button>
```

---

## 📁 Fichiers Modifiés

### Frontend

**`src/pages/surveys/SurveyCreate.tsx`**
- Lignes 46-72 : Validation des dates
- Lignes 189-194 : Champ date de début avec min et aide
- Lignes 205-210 : Champ date de fin avec min et aide

**`src/pages/surveys/SurveyEdit.tsx`**
- Lignes 59-91 : Vérification statut + validation dates
- Lignes 151-183 : Messages d'avertissement selon statut
- Lignes 237-243 : Date de début désactivée si actif
- Lignes 254-260 : Date de fin désactivée si actif
- Lignes 143-145 : Bouton sauvegarde désactivé si actif

**`src/pages/surveys/SurveyView.tsx`**
- Lignes 37-58 : Vérification fermeture auto lors changement statut
- Lignes 133-176 : Messages avertissement fermeture auto et date dépassée

### Backend

**`server/models/Survey.js`**
- Lignes 75-79 : Nouveau champ `autoClosedAt`
- Lignes 119-124 : Hook `beforeFind`
- Lignes 128-154 : Méthode `closeExpiredSurveys`
- Lignes 157-169 : Méthode `checkAndCloseIfExpired`

### Migration

**`server/migrations/add-auto-closed-field.sql`**
- Script SQL pour ajouter le champ `autoClosedAt`

---

## 🎯 Cas d'Usage

### Scénario 1 : Création avec Dates Invalides

```
Utilisateur : Tente de créer un sondage
  Date début : 01/10/2025 (passée)
  Date fin : 30/11/2025

Système : ❌ Alerte
  "La date de début ne peut pas être antérieure à aujourd'hui"

Utilisateur : Corrige
  Date début : 05/11/2025
  Date fin : 30/11/2025

Système : ✅ Sondage créé
```

### Scénario 2 : Fermeture Automatique

```
Sondage : "Satisfaction Client Q4"
  Statut : Actif
  Date fin : 31/10/2025
  Le sondage reste ouvert jusqu'au : 31/10/2025 à 23:59:59
  Aujourd'hui : 02/11/2025 10:00

Utilisateur : Accède à la liste des sondages

Système (automatique) :
  1. Hook beforeFind déclenché
  2. Calcule date de fin à 23:59:59 (31/10/2025 23:59:59)
  3. Compare avec maintenant (02/11/2025 10:00)
  4. Détecte sondage expiré
  5. Ferme automatiquement
  6. autoClosedAt = 02/11/2025 10:00:00
  7. Statut → 'closed'
  8. Log : "Sondage ABC-123 fermé automatiquement"

Utilisateur : Voit le sondage fermé avec message
  "🔒 Sondage fermé automatiquement le 02/11/2025 à 10:00"

Note : Le sondage est resté ouvert toute la journée du 31/10/2025
```

### Scénario 3 : Tentative de Modification (Non-Admin)

```
Utilisateur (Agent) : Clique sur "Modifier" du sondage fermé auto

Page : Affiche message
  "🔒 Ce sondage a été fermé automatiquement..."

Utilisateur : Clique sur bouton "Activer"

Système : ❌ Alerte
  "Seul un administrateur peut le rouvrir"

Utilisateur : Ne peut pas réactiver
```

### Scénario 4 : Réouverture par Admin

```
Admin : Accède au sondage fermé automatiquement

Page : Message
  "🔓 En tant qu'administrateur, vous pouvez réactiver..."

Admin : Clique "Activer"

Système : ⚠️ Confirmation
  "Ce sondage a été fermé automatiquement car sa date de fin est dépassée.
   Êtes-vous sûr de vouloir le rouvrir ?"

Admin : Confirme

Système : ✅
  - Statut → 'active'
  - autoClosedAt → null
  - Sondage réactivé
```

### Scénario 5 : Tentative de Modification (Sondage Actif)

```
Superviseur : Accède à sondage actif
  Clique "Modifier"

Page : Message rouge
  "🔒 Modification impossible
   Ce sondage est actuellement actif..."

Superviseur : Tous les champs désactivés

Superviseur : Clique "Enregistrer" (désactivé)

Tooltip : "Mettez le sondage en pause pour le modifier"

Superviseur : Retourne à la page du sondage
  Clique "Pause"
  Statut → 'paused'
  Retourne à "Modifier"

Page : ✅ Champs actifs, peut modifier
```

---

## ⚡ Avantages

### Pour l'Organisation

✅ **Intégrité des données** : Empêche les modifications pendant la collecte  
✅ **Automatisation** : Fermeture des sondages sans intervention  
✅ **Cohérence temporelle** : Dates toujours valides  
✅ **Traçabilité** : Savoir quand et pourquoi un sondage a été fermé  
✅ **Contrôle** : Admin seul peut rouvrir les sondages expirés  

### Pour les Utilisateurs

✅ **Sécurité** : Impossible de créer des dates incohérentes  
✅ **Clarté** : Messages explicites sur les restrictions  
✅ **Guidage** : Champs de date avec min automatique  
✅ **Feedback** : Alertes claires et informatives  

### Pour l'Analyse

✅ **Fiabilité** : Données collectées dans la période prévue  
✅ **Historique** : `autoClosedAt` pour l'audit  
✅ **Cohérence** : Pas de dates illogiques dans la base  

---

## 🔐 Sécurité

### Validations Multiples

**Frontend** :
- ✅ Attribut `min` sur les champs date
- ✅ Validation JavaScript avant soumission
- ✅ Désactivation des champs si actif

**Backend** :
- ✅ Validation côté serveur (à implémenter si nécessaire)
- ✅ Vérification des permissions pour réouverture
- ✅ Hook automatique pour fermeture

### Permissions

| Action | Agent | Superviseur | Admin |
|--------|-------|-------------|-------|
| Créer sondage | ❌ | ✅ | ✅ |
| Modifier brouillon | ❌ | ✅ | ✅ |
| Modifier pause | ❌ | ✅ | ✅ |
| Modifier actif | ❌ | ❌ | ❌ |
| Rouvrir auto-fermé | ❌ | ❌ | ✅ |

---

## 📊 Base de Données

### Schéma Survey (mis à jour)

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  questions JSONB[] NOT NULL DEFAULT '{}',
  status survey_status DEFAULT 'draft',
  autoClosedAt TIMESTAMP,  -- ✨ NOUVEAU
  targetResponses INTEGER DEFAULT 0,
  responseCount INTEGER DEFAULT 0,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  createdById UUID NOT NULL,
  settings JSONB,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

COMMENT ON COLUMN surveys.autoClosedAt IS 
  'Date de fermeture automatique du sondage';
```

### Exemple de Données

```sql
-- Sondage actif normal
{
  "id": "abc-123",
  "title": "Satisfaction Client",
  "status": "active",
  "endDate": "2025-12-31T23:59:59Z",
  "autoClosedAt": null
}

-- Sondage fermé automatiquement
{
  "id": "def-456",
  "title": "Enquête Q3",
  "status": "closed",
  "endDate": "2025-10-31",  // Le sondage était ouvert jusqu'au 31/10/2025 à 23:59:59
  "autoClosedAt": "2025-11-01T00:00:15Z"  // Fermé automatiquement le lendemain
}

-- Sondage réouvert par admin
{
  "id": "ghi-789",
  "title": "Sondage prolongé",
  "status": "active",
  "endDate": "2025-11-30T23:59:59Z",
  "autoClosedAt": null  // ← Remis à null lors réouverture
}
```

---

## 🚀 Déploiement

### Étapes

1. **Migration Base de Données**
```bash
psql -U username -d database_name -f server/migrations/add-auto-closed-field.sql
```

2. **Déployer Backend**
```bash
cd server
npm install
npm start
```

3. **Déployer Frontend**
```bash
npm install
npm run build
```

4. **Vérifier**
- ✅ Tenter de créer un sondage avec date passée
- ✅ Créer un sondage avec date fin proche
- ✅ Attendre expiration et vérifier fermeture auto
- ✅ Tenter modification sondage actif
- ✅ Tester réouverture en tant qu'admin

---

## 📈 Améliorations Futures

### Possibles Extensions

- [ ] **Notification email** avant fermeture automatique
- [ ] **Historique des changements de statut** (audit log)
- [ ] **Prolongation automatique** si objectif non atteint
- [ ] **Planification différée** (activation automatique à date début)
- [ ] **Quotas de réouverture** (limiter les réouvertures)
- [ ] **Dashboard admin** avec sondages expirés
- [ ] **Rapport hebdomadaire** des fermetures automatiques
- [ ] **API webhook** lors fermeture automatique

---

## 🎉 Conclusion

Le système G-survey dispose maintenant d'une **gestion robuste et professionnelle** des dates et statuts :

✅ **Validation des dates** : Empêche les incohérences temporelles  
✅ **Fermeture automatique** : Automatisation du cycle de vie  
✅ **Restrictions de modification** : Préserve l'intégrité des données  
✅ **Contrôle administrateur** : Flexibilité pour cas exceptionnels  
✅ **Interface claire** : Messages explicites et guidage utilisateur  

**Résultat** : Plus de fiabilité, moins d'erreurs, meilleure expérience utilisateur ! 🚀

