-- ==================================================
-- Script de Correction : Superviseur + Équipe + Agents
-- ==================================================
-- Ce script configure automatiquement les relations
-- entre superviseurs, équipes et agents de terrain
-- ==================================================

-- 1. DIAGNOSTIC : Afficher la situation actuelle
-- ==================================================

SELECT '=== SITUATION ACTUELLE ===' as info;

SELECT 
  'Superviseurs' as type,
  COUNT(*) as total,
  SUM(CASE WHEN id IN (SELECT supervisorId FROM teams WHERE supervisorId IS NOT NULL) THEN 1 ELSE 0 END) as avec_equipe
FROM users 
WHERE role = 'supervisor';

SELECT 
  'Agents de terrain' as type,
  COUNT(*) as total,
  SUM(CASE WHEN teamId IS NOT NULL THEN 1 ELSE 0 END) as avec_equipe,
  SUM(CASE WHEN isActive = true THEN 1 ELSE 0 END) as actifs
FROM users 
WHERE role = 'field_agent';

SELECT 'Équipes' as type, COUNT(*) as total FROM teams;

-- 2. DÉTAILS : Liste des superviseurs
-- ==================================================

SELECT '=== SUPERVISEURS ===' as info;

SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as nom,
  u.email,
  CASE 
    WHEN t.id IS NOT NULL THEN t.name 
    ELSE '❌ Aucune équipe'
  END as equipe,
  COALESCE((SELECT COUNT(*) FROM users WHERE teamId = t.id AND role = 'field_agent'), 0) as nb_agents
FROM users u
LEFT JOIN teams t ON t.supervisorId = u.id
WHERE u.role = 'supervisor'
ORDER BY u.firstName;

-- 3. DÉTAILS : Liste des agents de terrain
-- ==================================================

SELECT '=== AGENTS DE TERRAIN ===' as info;

SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as nom,
  u.email,
  u.isActive as actif,
  CASE 
    WHEN u.teamId IS NOT NULL THEN t.name || ' (Superviseur: ' || s.firstName || ' ' || s.lastName || ')'
    ELSE '❌ Aucune équipe'
  END as equipe
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
LEFT JOIN users s ON t.supervisorId = s.id
WHERE u.role = 'field_agent'
ORDER BY u.firstName;

-- ==================================================
-- CORRECTION AUTOMATIQUE (décommenter pour exécuter)
-- ==================================================

/*
-- Étape 1 : Créer une équipe pour chaque superviseur qui n'en a pas
INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
SELECT 
  gen_random_uuid(),
  'Équipe de ' || u.firstName || ' ' || u.lastName,
  'Équipe créée automatiquement',
  u.id,
  true,
  NOW(),
  NOW()
FROM users u
WHERE u.role = 'supervisor'
  AND u.id NOT IN (SELECT supervisorId FROM teams WHERE supervisorId IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Étape 2 : Assigner tous les agents sans équipe à la première équipe disponible
UPDATE users
SET teamId = (SELECT id FROM teams LIMIT 1),
    updatedAt = NOW()
WHERE role = 'field_agent'
  AND teamId IS NULL;

-- Étape 3 : Activer tous les agents de terrain
UPDATE users
SET isActive = true,
    updatedAt = NOW()
WHERE role = 'field_agent';

-- Étape 4 : Vérification après correction
SELECT '=== APRÈS CORRECTION ===' as info;

SELECT 
  'Superviseurs avec équipe' as statut,
  COUNT(*) as total
FROM users u
WHERE u.role = 'supervisor'
  AND u.id IN (SELECT supervisorId FROM teams WHERE supervisorId IS NOT NULL);

SELECT 
  'Agents avec équipe' as statut,
  COUNT(*) as total
FROM users
WHERE role = 'field_agent'
  AND teamId IS NOT NULL;

SELECT 
  'Agents actifs' as statut,
  COUNT(*) as total
FROM users
WHERE role = 'field_agent'
  AND isActive = true;
*/







