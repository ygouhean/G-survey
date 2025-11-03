# 👥 Recrutement d'Agents par les Superviseurs

## 🎯 Vue d'ensemble

Cette fonctionnalité permet aux **superviseurs** de **recruter et gérer** leurs agents de terrain **directement depuis l'interface**, sans intervention d'un administrateur.

---

## ✨ Nouvelles Fonctionnalités

### 1. 🔍 Visualisation des Agents Disponibles

Les superviseurs peuvent maintenant voir :
- ✅ **Leurs agents actuels** (déjà dans leur équipe)
- ✅ **Tous les agents disponibles** (sans équipe = `teamId = null`)

### 2. 🏢 Création Automatique d'Équipe

- Si un superviseur n'a **pas encore d'équipe**, elle sera **créée automatiquement** lors de sa première assignation
- Nom de l'équipe : `Équipe de [Prénom] [Nom]`
- Plus besoin de passer par SQL !

### 3. 👥 Recrutement Automatique

Quand un superviseur assigne un agent disponible :
- ✅ L'agent est **automatiquement ajouté** à l'équipe du superviseur
- ✅ L'agent reçoit `teamId` = ID de l'équipe du superviseur
- ✅ L'agent peut maintenant répondre aux sondages assignés

---

## 🚀 Comment Ça Marche ?

### Scénario 1 : Superviseur Sans Équipe

1. **Le superviseur se connecte**
2. **Il crée ou ouvre un sondage**
3. **Il clique sur "Assigner le sondage" (👥)**
4. **Il voit tous les agents de terrain disponibles** avec le badge "Disponible"
5. **Il sélectionne les agents qu'il veut**
6. **Il clique sur "Assigner"**

**Ce qui se passe en coulisses :**
```
1. Le système crée automatiquement une équipe pour lui
2. Les agents sélectionnés sont ajoutés à cette équipe
3. Les agents peuvent maintenant voir ce sondage
```

### Scénario 2 : Superviseur Avec Équipe

1. **Le superviseur ouvre le modal d'assignation**
2. **Il voit :**
   - Ses agents actuels (sans badge spécial)
   - Les agents disponibles (badge "Disponible")
3. **Il peut recruter de nouveaux agents** en les sélectionnant et les assignant

**Ce qui se passe en coulisses :**
```
1. Les agents sans équipe sont automatiquement ajoutés à son équipe
2. Les agents déjà dans son équipe restent inchangés
```

### Scénario 3 : Protection des Équipes

Si un superviseur essaie d'assigner un agent qui appartient **déjà à une autre équipe** :
- ❌ **Erreur** : "L'agent [Nom] appartient déjà à une autre équipe"
- 🔒 **Protection** : Un agent ne peut pas être volé à une autre équipe

---

## 🎨 Interface Utilisateur

### Badge "Disponible"
Les agents sans équipe affichent un **badge orange "Disponible"** :

```
👤 Jean Dupont                    🟠 Disponible  🟢 Agent de terrain
   jean.dupont@example.com
```

### Message Informatif
Le superviseur voit ce message dans le modal :
> 💡 *Les agents sans équipe que vous assignez seront automatiquement ajoutés à votre équipe.*

---

## 📊 Flux de Données

### Avant l'Assignation
```
Superviseur (ID: supervisor-123)
  └─ teamId: null  ❌ Pas d'équipe

Agent 1 (ID: agent-456)
  └─ teamId: null  ⚠️ Disponible

Agent 2 (ID: agent-789)
  └─ teamId: null  ⚠️ Disponible
```

### Après l'Assignation
```
Superviseur (ID: supervisor-123)
  └─ Équipe créée ✅

Équipe (ID: team-abc)
  ├─ name: "Équipe de Jean Dupont"
  └─ supervisorId: supervisor-123

Agent 1 (ID: agent-456)
  └─ teamId: team-abc  ✅ Recruté

Agent 2 (ID: agent-789)
  └─ teamId: team-abc  ✅ Recruté
```

---

## 🔒 Règles de Sécurité

### ✅ Ce qu'un Superviseur PEUT Faire

1. **Voir** tous les agents de terrain disponibles (sans équipe)
2. **Voir** ses propres agents (de son équipe)
3. **Recruter** des agents disponibles
4. **Assigner** des sondages à ses agents

### ❌ Ce qu'un Superviseur NE PEUT PAS Faire

1. **Voir** les agents d'autres équipes
2. **Recruter** des agents qui ont déjà une équipe
3. **Voler** des agents à d'autres superviseurs
4. **Assigner** à des utilisateurs qui ne sont pas des agents de terrain

---

## 🧪 Tests

### Test 1 : Premier Superviseur (Sans Équipe)

**Pré-requis :**
- Superviseur sans équipe
- Au moins 1 agent sans équipe

**Étapes :**
1. Connectez-vous comme superviseur
2. Ouvrez un sondage
3. Cliquez sur "Assigner le sondage"
4. Vous devez voir les agents avec badge "Disponible"
5. Sélectionnez un ou plusieurs agents
6. Cliquez sur "Assigner"

**Résultat attendu :**
- ✅ Équipe créée automatiquement
- ✅ Agents ajoutés à l'équipe
- ✅ Sondage assigné aux agents

**Logs serveur :**
```
🔧 Création automatique d'une équipe pour le superviseur
✅ Équipe créée: team-abc-123
👥 Ajout de l'agent Jean Dupont à l'équipe Équipe de Marie Martin
```

---

### Test 2 : Superviseur Avec Équipe

**Pré-requis :**
- Superviseur avec équipe existante
- Agents dans son équipe + agents disponibles

**Étapes :**
1. Connectez-vous comme superviseur
2. Ouvrez le modal d'assignation
3. Vous devez voir :
   - Vos agents (sans badge "Disponible")
   - Agents disponibles (avec badge "Disponible")
4. Sélectionnez un agent disponible
5. Assignez

**Résultat attendu :**
- ✅ Agent disponible ajouté à votre équipe
- ✅ Vos agents existants inchangés

---

### Test 3 : Protection des Équipes

**Pré-requis :**
- 2 superviseurs avec équipes
- Agent appartenant à l'équipe du superviseur 1

**Étapes :**
1. Connectez-vous comme superviseur 2
2. Ouvrez le modal d'assignation
3. Vous ne devez PAS voir l'agent du superviseur 1

**Résultat attendu :**
- ✅ Agent protégé (non visible)
- ✅ Impossible de voler des agents

---

## 📋 SQL de Vérification

### Voir la Structure Complète

```sql
-- Vue d'ensemble
SELECT 
  'Superviseur' as type,
  u.firstName || ' ' || u.lastName as nom,
  t.name as equipe,
  (SELECT COUNT(*) FROM users WHERE teamId = t.id AND role = 'field_agent') as nb_agents
FROM users u
LEFT JOIN teams t ON t.supervisorId = u.id
WHERE u.role = 'supervisor'

UNION ALL

SELECT 
  'Agent' as type,
  u.firstName || ' ' || u.lastName as nom,
  COALESCE(t.name, '⚠️ Disponible') as equipe,
  NULL
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.role = 'field_agent'
ORDER BY type DESC, nom;
```

### Agents Disponibles (Sans Équipe)

```sql
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as nom_agent,
  u.email,
  u.teamId,
  CASE 
    WHEN u.teamId IS NULL THEN '✅ Disponible'
    ELSE '❌ Déjà assigné'
  END as statut
FROM users u
WHERE u.role = 'field_agent'
ORDER BY u.teamId NULLS FIRST, u.firstName;
```

---

## 🔄 Migration depuis l'Ancien Système

Si vous aviez des agents assignés manuellement via SQL :

```sql
-- Vérifier les agents sans équipe
SELECT COUNT(*) as agents_disponibles
FROM users
WHERE role = 'field_agent' AND teamId IS NULL;

-- Si vous voulez assigner manuellement tous les agents à un superviseur
UPDATE users
SET teamId = (
  SELECT id FROM teams 
  WHERE supervisorId = 'ID_DU_SUPERVISEUR' 
  LIMIT 1
)
WHERE role = 'field_agent' AND teamId IS NULL;
```

---

## 📞 Dépannage

### Problème : "Aucun utilisateur disponible"

**Cause :** Aucun agent sans équipe dans la base

**Solution :**
```sql
-- Voir les agents et leurs équipes
SELECT 
  firstName || ' ' || lastName as agent,
  teamId,
  CASE WHEN teamId IS NULL THEN 'Disponible' ELSE 'Assigné' END as statut
FROM users
WHERE role = 'field_agent';
```

---

### Problème : "L'agent appartient déjà à une autre équipe"

**Cause :** Vous essayez d'assigner un agent d'une autre équipe

**Solution :** C'est normal ! La protection fonctionne. Seuls les administrateurs peuvent réassigner des agents entre équipes.

---

## ✅ Avantages de Cette Approche

1. **🚀 Autonomie** : Les superviseurs gèrent leurs équipes
2. **⚡ Simplicité** : Pas besoin de SQL ou d'admin
3. **🔒 Sécurité** : Protection des équipes existantes
4. **🎯 Clarté** : Badge "Disponible" = agents recrutables
5. **🤖 Automatisation** : Création d'équipe automatique

---

## 📝 Résumé des Changements

### Backend (`server/routes/surveys.js`)

1. **Route `GET /api/surveys/:id/assignable-users`**
   - Superviseurs voient agents de leur équipe + agents disponibles
   - Retourne `teamId` pour afficher le statut

2. **Route `POST /api/surveys/:id/assign`**
   - Création automatique d'équipe si nécessaire
   - Ajout automatique des agents disponibles à l'équipe
   - Protection contre le vol d'agents

### Frontend (`src/components/SurveyAssignModal.tsx`)

1. **Badge "Disponible"** pour agents sans équipe
2. **Message informatif** pour superviseurs
3. **Interface `User`** étendue avec `teamId`

---

**Date** : 2 novembre 2025  
**Version** : 3.0  
**Statut** : ✅ Fonctionnel et Testé



