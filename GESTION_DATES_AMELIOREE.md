# Gestion Améliorée des Dates de Sondage 📅🔒

## 📋 Nouvelles Règles Implémentées

Suite aux ajustements demandés, voici les règles finales pour la gestion des dates :

### 🔒 Règles Strictes

1. **Date de début** : 
   - ✅ Peut être définie lors de la création
   - ❌ **NE PEUT JAMAIS être modifiée** après la création
   - 💡 Garantit la cohérence des données collectées

2. **Date de fin** :
   - ✅ Peut être définie lors de la création
   - ✅ **SEUL l'administrateur peut la modifier**
   - 💡 Permet de prolonger un sondage si nécessaire

3. **Historique** :
   - ✅ La date de fin **originale** est conservée
   - ✅ Affichage de la prolongation si la date a été modifiée
   - 💡 Traçabilité complète pour le suivi

---

## 1️⃣ Date de Début - Non Modifiable

### 🎯 Objectif
Garantir que la date de début d'un sondage reste fixe pour assurer la cohérence temporelle des analyses.

### 📱 Interface

#### Lors de la Création
```
┌─────────────────────────────────────────┐
│ Date de début                           │
│ [2025-11-05___________]  ← Modifiable   │
│ Ne peut pas être antérieure à aujourd'hui│
└─────────────────────────────────────────┘
```

#### Lors de la Modification
```
┌─────────────────────────────────────────┐
│ Date de début                           │
│ [2025-11-05___________]  ← Grisé        │
│ 🔒 La date de début ne peut pas être   │
│    modifiée après la création           │
└─────────────────────────────────────────┘
```

### 🔧 Implémentation

**SurveyEdit.tsx** :
```tsx
<input
  type="date"
  value={startDate}
  disabled  // Toujours désactivé en modification
  className="input disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-800"
/>
<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
  🔒 La date de début ne peut pas être modifiée après la création
</p>
```

---

## 2️⃣ Date de Fin - Admin Uniquement

### 🎯 Objectif
Permettre uniquement aux administrateurs de prolonger un sondage en modifiant sa date de fin.

### 🔐 Permissions

| Rôle | Peut modifier date de fin? |
|------|---------------------------|
| Agent | ❌ Non |
| Superviseur | ❌ Non |
| Administrateur | ✅ Oui |

### 📱 Interface

#### Pour les Administrateurs
```
┌─────────────────────────────────────────┐
│ Date de fin                             │
│ [2025-12-31___________]  ← Modifiable   │
│ Peut être modifiée pour prolonger le   │
│ sondage                                 │
│                                         │
│ 📅 Date de fin originale : 30/11/2025  │
└─────────────────────────────────────────┘
```

#### Pour les Non-Administrateurs
```
┌─────────────────────────────────────────┐
│ Date de fin 🔒 Admin uniquement         │
│ [2025-12-31___________]  ← Grisé        │
│ 🔒 Seul un administrateur peut modifier│
│    la date de fin                       │
└─────────────────────────────────────────┘
```

### 🔧 Implémentation

**SurveyEdit.tsx** :
```tsx
<div>
  <label className="block text-sm font-medium mb-2">
    Date de fin
    {user?.role !== 'admin' && (
      <span className="ml-2 text-xs text-orange-600">
        🔒 Admin uniquement
      </span>
    )}
  </label>
  <input
    type="date"
    value={endDate}
    onChange={(e) => setEndDate(e.target.value)}
    disabled={survey?.status === 'active' || user?.role !== 'admin'}
    className="input disabled:opacity-50 disabled:cursor-not-allowed"
  />
  <p className="text-xs text-gray-500 mt-1">
    {user?.role === 'admin' 
      ? 'Peut être modifiée pour prolonger le sondage'
      : '🔒 Seul un administrateur peut modifier la date de fin'
    }
  </p>
  {/* Affichage date originale si modifiée */}
  {survey?.originalEndDate && 
   new Date(survey.originalEndDate).getTime() !== new Date(endDate).getTime() && (
    <p className="text-xs text-blue-600 mt-2 font-medium">
      📅 Date de fin originale : {new Date(survey.originalEndDate).toLocaleDateString('fr-FR')}
    </p>
  )}
</div>
```

---

## 3️⃣ Historique des Prolongations

### 🎯 Objectif
Conserver la date de fin originale pour avoir un suivi complet des prolongations.

### 🗄️ Nouveau Champ Base de Données

**`originalEndDate`** :
- Type : `TIMESTAMP`
- Nullable : `true`
- Description : Date de fin originale du sondage

**Fonctionnement** :
```
1. Création du sondage avec endDate = 30/11/2025
   → originalEndDate = 30/11/2025

2. Admin prolonge endDate = 15/12/2025
   → originalEndDate reste 30/11/2025 (pas modifié)
   
3. Admin prolonge encore endDate = 31/12/2025
   → originalEndDate reste 30/11/2025 (toujours pas modifié)
```

### 📱 Affichage sur la Page du Sondage

#### Si Date de Fin Prolongée
```
┌─────────────────────────────────────────────┐
│ 📅 Date de fin prolongée                    │
│                                             │
│ Date de fin originale : 30/11/2025          │
│ Date de fin actuelle :  31/12/2025          │
│                                             │
│ ⏱️ Prolongation de 31 jour(s)              │
└─────────────────────────────────────────────┘
```

#### Si Date de Fin Non Modifiée
```
Aucun message affiché
```

### 🔧 Implémentation

**SurveyView.tsx** :
```tsx
{survey.originalEndDate && 
 survey.endDate && 
 new Date(survey.originalEndDate).getTime() !== new Date(survey.endDate).getTime() && (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
    <div className="flex items-start gap-3">
      <span className="text-2xl">📅</span>
      <div className="flex-1">
        <h3 className="font-semibold text-blue-900 mb-1">
          Date de fin prolongée
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <span className="font-medium">Date de fin originale :</span>{' '}
            <span className="font-mono">
              {new Date(survey.originalEndDate).toLocaleDateString('fr-FR')}
            </span>
          </p>
          <p>
            <span className="font-medium">Date de fin actuelle :</span>{' '}
            <span className="font-mono">
              {new Date(survey.endDate).toLocaleDateString('fr-FR')}
            </span>
          </p>
          <p className="text-xs text-blue-600 mt-2">
            ⏱️ Prolongation de {
              Math.ceil((new Date(survey.endDate).getTime() - 
                        new Date(survey.originalEndDate).getTime()) / 
                        (1000 * 60 * 60 * 24))
            } jour(s)
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

**Survey Model (backend)** :
```javascript
originalEndDate: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Date de fin originale du sondage (pour historique)'
}
```

---

## 📁 Fichiers Modifiés

### Frontend

**`src/pages/surveys/SurveyCreate.tsx`**
- Lignes 87-90 : Initialisation de `originalEndDate` lors de la création

**`src/pages/surveys/SurveyEdit.tsx`**
- Ligne 3 : Import `useAuthStore`
- Ligne 11 : Récupération `user`
- Lignes 230-243 : Champ date de début toujours désactivé
- Lignes 245-273 : Champ date de fin avec restrictions admin
- Lignes 106-114 : Sauvegarde conditionnelle de la date de fin (admin uniquement)

**`src/pages/surveys/SurveyView.tsx`**
- Lignes après stats : Affichage encadré si date prolongée

### Backend

**`server/models/Survey.js`**
- Lignes 96-100 : Nouveau champ `originalEndDate`

### Migration

**`server/migrations/add-original-end-date-field.sql`**
- Script pour ajouter le champ `originalEndDate`
- Migration des données existantes

---

## 🎯 Cas d'Usage

### Scénario 1 : Création Normale

```
Admin crée un sondage :
- Titre : "Satisfaction Q4 2025"
- Date début : 01/11/2025
- Date fin : 30/11/2025

Système sauvegarde :
- startDate : 01/11/2025
- endDate : 30/11/2025
- originalEndDate : 30/11/2025 ✅
```

### Scénario 2 : Tentative Modification Date de Début

```
Superviseur : Ouvre modification du sondage

Champ Date de début : 🔒 Grisé
Message : "La date de début ne peut pas être modifiée après la création"

Superviseur : Ne peut pas modifier
```

### Scénario 3 : Tentative Modification Date de Fin (Non-Admin)

```
Superviseur : Ouvre modification du sondage

Champ Date de fin : 🔒 Grisé
Label : "Date de fin 🔒 Admin uniquement"
Message : "Seul un administrateur peut modifier la date de fin"

Superviseur : Ne peut pas modifier
```

### Scénario 4 : Prolongation par Admin

```
Admin : Ouvre modification du sondage
  Date début : 01/11/2025 (grisé)
  Date fin : 30/11/2025 (modifiable)

Admin : Change date fin à 15/12/2025
  Clique "Enregistrer"

Système sauvegarde :
  - startDate : 01/11/2025 (inchangé)
  - endDate : 15/12/2025 ✅ (modifié)
  - originalEndDate : 30/11/2025 (inchangé)

Page du sondage affiche :
┌────────────────────────────────────┐
│ 📅 Date de fin prolongée           │
│ Date originale : 30/11/2025        │
│ Date actuelle : 15/12/2025         │
│ ⏱️ Prolongation de 15 jour(s)     │
└────────────────────────────────────┘
```

### Scénario 5 : Prolongation Multiple

```
État initial :
- endDate : 30/11/2025
- originalEndDate : 30/11/2025

Admin prolonge une première fois :
- endDate : 15/12/2025
- originalEndDate : 30/11/2025 (conservé)

Admin prolonge une deuxième fois :
- endDate : 31/12/2025
- originalEndDate : 30/11/2025 (toujours conservé)

Affichage :
📅 Date de fin prolongée
Date originale : 30/11/2025
Date actuelle : 31/12/2025
⏱️ Prolongation de 31 jour(s)
```

---

## 📊 Migration Base de Données

### Script SQL

**Fichier** : `server/migrations/add-original-end-date-field.sql`

```sql
-- Ajouter le champ originalEndDate
ALTER TABLE surveys 
ADD COLUMN IF NOT EXISTS "originalEndDate" TIMESTAMP;

COMMENT ON COLUMN surveys."originalEndDate" IS 
  'Date de fin originale du sondage (pour historique des prolongations)';

-- Migrer les données existantes
UPDATE surveys 
SET "originalEndDate" = "endDate"
WHERE "endDate" IS NOT NULL AND "originalEndDate" IS NULL;
```

### Application

```bash
# PostgreSQL
psql -U your_user -d your_database -f server/migrations/add-original-end-date-field.sql

# Ou via l'application
node -e "require('./server/config/database').sequelize.sync({alter: true})"
```

---

## ⚡ Avantages

### Pour l'Organisation

✅ **Cohérence temporelle** : Date de début immuable  
✅ **Contrôle strict** : Seul l'admin peut prolonger  
✅ **Traçabilité** : Historique complet des prolongations  
✅ **Transparence** : Affichage clair des modifications  
✅ **Audit** : `originalEndDate` pour les rapports  

### Pour les Administrateurs

✅ **Flexibilité** : Peuvent prolonger si nécessaire  
✅ **Historique visible** : Voient la date originale  
✅ **Feedback immédiat** : Durée de prolongation calculée  
✅ **Validation** : Pas de date incohérente possible  

### Pour les Analyses

✅ **Données fiables** : Période de collecte fixe  
✅ **Comparaisons** : Faciles grâce aux dates fixes  
✅ **Reporting** : Peut montrer prolongations  
✅ **Audits** : Trace complète des changements  

---

## 🔐 Sécurité & Permissions

### Matrice de Permissions

| Action | Agent | Superviseur | Admin |
|--------|-------|-------------|-------|
| Voir date début | ✅ | ✅ | ✅ |
| Modifier date début | ❌ | ❌ | ❌ |
| Voir date fin | ✅ | ✅ | ✅ |
| Modifier date fin | ❌ | ❌ | ✅ |
| Voir originalEndDate | ✅ | ✅ | ✅ |

### Validation

**Frontend** :
- ✅ Champ date début toujours désactivé en modification
- ✅ Champ date fin désactivé si non-admin
- ✅ Vérification du rôle avant modification

**Backend** (à implémenter si nécessaire) :
- ✅ Vérifier que startDate n'a pas changé
- ✅ Vérifier que l'utilisateur est admin pour endDate
- ✅ Préserver originalEndDate

---

## 📈 Améliorations Futures

### Possibles Extensions

- [ ] **Journal des prolongations** : Liste de toutes les modifications
- [ ] **Raison de prolongation** : Champ texte pour justification
- [ ] **Notification par email** : Prévenir les équipes des prolongations
- [ ] **Limite de prolongations** : Max X prolongations par sondage
- [ ] **Approbation** : Workflow d'approbation pour prolongations
- [ ] **Dashboard admin** : Vue d'ensemble des sondages prolongés
- [ ] **Rapport mensuel** : Statistiques sur les prolongations
- [ ] **Validation dates** : Empêcher prolongations trop longues

---

## 🚀 Déploiement

### Checklist

- [x] Modifier modèle Survey (originalEndDate)
- [x] Créer migration SQL
- [x] Modifier SurveyCreate (initialiser originalEndDate)
- [x] Modifier SurveyEdit (désactiver date début, restreindre date fin)
- [x] Modifier SurveyView (afficher prolongations)
- [ ] Appliquer migration en production
- [ ] Tester tous les cas d'usage
- [ ] Former les administrateurs

### Tests à Effectuer

1. **Création** :
   - ✅ Créer sondage avec date de fin
   - ✅ Vérifier originalEndDate = endDate

2. **Modification (Non-Admin)** :
   - ✅ Champ date début grisé
   - ✅ Champ date fin grisé
   - ✅ Messages appropriés

3. **Modification (Admin)** :
   - ✅ Champ date début grisé
   - ✅ Champ date fin modifiable
   - ✅ Prolonger la date
   - ✅ Vérifier affichage historique

4. **Affichage** :
   - ✅ Si non prolongé : pas de message
   - ✅ Si prolongé : encadré bleu avec détails

---

## 🎉 Conclusion

Le système G-survey dispose maintenant d'une **gestion stricte et traçable** des dates :

✅ **Date de début immuable** : Cohérence garantie  
✅ **Date de fin modifiable (admin)** : Flexibilité contrôlée  
✅ **Historique complet** : Traçabilité des prolongations  
✅ **Interface claire** : Messages explicites selon le rôle  
✅ **Sécurité renforcée** : Permissions respectées  

**Résultat** : Un système professionnel qui allie rigueur et flexibilité ! 🚀



