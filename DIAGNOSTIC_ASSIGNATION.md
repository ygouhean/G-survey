# 🔍 Diagnostic - Problème d'Assignation pour Superviseurs

## ⚠️ Problème : "Aucun utilisateur disponible pour l'assignation"

Lorsqu'un superviseur ouvre le modal d'assignation, il ne voit aucun agent de terrain disponible.

---

## 📋 Causes Possibles

### 1. Le superviseur n'a pas d'équipe assignée
**Symptôme :** Le superviseur n'est pas défini comme superviseur d'une équipe

**Vérification :**
```sql
-- Vérifier si le superviseur a une équipe
SELECT 
  t.id as team_id,
  t.name as team_name,
  u.id as supervisor_id,
  u.firstName || ' ' || u.lastName as supervisor_name
FROM teams t
JOIN users u ON t.supervisorId = u.id
WHERE u.role = 'supervisor';
```

**Solution :** Créer ou assigner une équipe au superviseur

---

### 2. Les agents de terrain ne sont pas membres de l'équipe
**Symptôme :** Les agents existent mais ne sont pas liés à l'équipe du superviseur

**Vérification :**
```sql
-- Vérifier les agents de terrain et leur équipe
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as agent_name,
  u.email,
  u.teamId,
  t.name as team_name,
  t.supervisorId
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.role = 'field_agent';
```

**Solution :** Assigner les agents de terrain à une équipe

---

### 3. Les agents ne sont pas actifs
**Symptôme :** Les agents existent mais sont désactivés

**Vérification :**
```sql
-- Vérifier le statut des agents de terrain
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as agent_name,
  u.email,
  u.isActive,
  u.teamId
FROM users u
WHERE u.role = 'field_agent';
```

**Solution :** Activer les agents

---

## 🔧 Solutions Étape par Étape

### Solution 1 : Créer une équipe et assigner un superviseur

```sql
-- 1. Créer une équipe
INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
VALUES (
  gen_random_uuid(),
  'Équipe Terrain 1',
  'Équipe principale des agents de terrain',
  'ID_DU_SUPERVISEUR',  -- Remplacer par l'ID réel du superviseur
  true,
  NOW(),
  NOW()
);

-- 2. Vérifier que l'équipe a été créée
SELECT * FROM teams WHERE supervisorId = 'ID_DU_SUPERVISEUR';
```

---

### Solution 2 : Assigner des agents de terrain à l'équipe

```sql
-- Récupérer l'ID de l'équipe
SELECT id, name FROM teams WHERE supervisorId = 'ID_DU_SUPERVISEUR';

-- Assigner les agents de terrain à cette équipe
UPDATE users
SET teamId = 'ID_DE_L_EQUIPE',  -- Remplacer par l'ID réel de l'équipe
    updatedAt = NOW()
WHERE role = 'field_agent'
  AND id IN ('ID_AGENT_1', 'ID_AGENT_2', 'ID_AGENT_3');  -- IDs des agents

-- Vérifier l'assignation
SELECT 
  u.firstName || ' ' || u.lastName as agent_name,
  u.teamId,
  t.name as team_name
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.role = 'field_agent';
```

---

### Solution 3 : Activer les agents de terrain

```sql
-- Activer tous les agents de terrain
UPDATE users
SET isActive = true,
    updatedAt = NOW()
WHERE role = 'field_agent';

-- Vérifier
SELECT 
  firstName || ' ' || lastName as name,
  email,
  isActive
FROM users
WHERE role = 'field_agent';
```

---

## 🧪 Test avec les Logs de Débogage

1. **Redémarrez votre serveur** pour activer les nouveaux logs
2. **Connectez-vous en tant que superviseur**
3. **Ouvrez le modal d'assignation**
4. **Regardez la console du serveur**

Vous devriez voir des logs comme :
```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Oui (ID: xyz-789)
🔍 DEBUG - Membres de l'équipe: 3
🔍 DEBUG - Détails membres: [
  { id: 'agent1-id', role: 'field_agent' },
  { id: 'agent2-id', role: 'field_agent' },
  { id: 'agent3-id', role: 'field_agent' }
]
```

### Cas 1 : Aucune équipe trouvée
```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Non
⚠️ Ce superviseur n'a pas d'équipe assignée
```
➡️ **Solution** : Créer une équipe avec ce superviseur

### Cas 2 : Équipe trouvée mais aucun membre
```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Oui (ID: xyz-789)
🔍 DEBUG - Membres de l'équipe: 0
```
➡️ **Solution** : Assigner des agents à cette équipe

---

## 📝 Script Complet de Configuration

Voici un script SQL complet pour configurer un superviseur avec son équipe :

```sql
-- ==================================================
-- CONFIGURATION SUPERVISEUR + ÉQUIPE + AGENTS
-- ==================================================

-- 1. Vérifier les utilisateurs existants
SELECT id, firstName, lastName, email, role FROM users;

-- 2. Créer une équipe (si elle n'existe pas)
INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
VALUES (
  gen_random_uuid(),
  'Équipe Alpha',
  'Équipe principale des agents de terrain',
  (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1),  -- Premier superviseur
  true,
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- 3. Récupérer l'ID de l'équipe
SELECT id as team_id, name FROM teams LIMIT 1;

-- 4. Assigner TOUS les agents de terrain à cette équipe
UPDATE users
SET teamId = (SELECT id FROM teams LIMIT 1),
    isActive = true,
    updatedAt = NOW()
WHERE role = 'field_agent';

-- 5. Vérification finale
SELECT 
  'Superviseur' as type,
  u.firstName || ' ' || u.lastName as name,
  u.email,
  t.name as team_name,
  (SELECT COUNT(*) FROM users WHERE teamId = t.id AND role = 'field_agent') as nb_agents
FROM users u
JOIN teams t ON t.supervisorId = u.id
WHERE u.role = 'supervisor'

UNION ALL

SELECT 
  'Agent' as type,
  u.firstName || ' ' || u.lastName as name,
  u.email,
  COALESCE(t.name, 'Aucune équipe') as team_name,
  NULL
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.role = 'field_agent'
ORDER BY type, name;
```

---

## 🎯 Checklist de Vérification

Avant de tester, assurez-vous que :

- [ ] ✅ Le superviseur existe et a le rôle 'supervisor'
- [ ] ✅ Une équipe existe avec supervisorId = ID du superviseur
- [ ] ✅ Les agents de terrain existent et ont le rôle 'field_agent'
- [ ] ✅ Les agents de terrain ont teamId = ID de l'équipe du superviseur
- [ ] ✅ Les agents de terrain sont actifs (isActive = true)
- [ ] ✅ Le serveur est redémarré pour voir les logs

---

## 🚀 Test Rapide via l'Interface

1. **En tant qu'admin** :
   - Allez dans "Gestion des utilisateurs"
   - Vérifiez que les agents de terrain sont assignés à une équipe
   - Vérifiez que le superviseur est bien superviseur de cette équipe

2. **En tant que superviseur** :
   - Créez ou ouvrez un sondage
   - Cliquez sur "Assigner le sondage"
   - Vous devriez maintenant voir vos agents

---

## 📞 Si le Problème Persiste

1. **Copiez les logs de la console serveur** et partagez-les
2. **Exécutez ce SQL** et partagez les résultats :
```sql
SELECT 
  'Superviseurs' as category,
  COUNT(*) as count
FROM users WHERE role = 'supervisor'

UNION ALL

SELECT 'Équipes', COUNT(*) FROM teams

UNION ALL

SELECT 'Agents de terrain', COUNT(*) FROM users WHERE role = 'field_agent'

UNION ALL

SELECT 'Agents assignés à une équipe', COUNT(*) 
FROM users WHERE role = 'field_agent' AND teamId IS NOT NULL;
```

---

**Date** : 2 novembre 2025  
**Version** : 1.0



