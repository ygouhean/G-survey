# 🚀 Solution Rapide - Superviseur sans Agents Disponibles

## ⚡ 3 Étapes pour Corriger le Problème

### Étape 1 : Vérifier les Logs du Serveur 📋

1. **Redémarrez votre serveur** (si ce n'est pas déjà fait)
   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Puis redémarrer
   npm run dev
   ```

2. **En tant que superviseur, ouvrez le modal d'assignation**

3. **Regardez la console du serveur** - Vous verrez des messages comme :
   ```
   🔍 DEBUG - Superviseur: abc-123...
   🔍 DEBUG - Équipe trouvée: Non
   ⚠️ Ce superviseur n'a pas d'équipe assignée
   ```

---

### Étape 2 : Exécuter le Diagnostic SQL 🔍

Connectez-vous à votre base de données PostgreSQL et exécutez :

```sql
-- Copier-coller tout ce bloc dans votre client SQL

-- Vérifier les superviseurs
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as nom_superviseur,
  u.email,
  t.name as nom_equipe
FROM users u
LEFT JOIN teams t ON t.supervisorId = u.id
WHERE u.role = 'supervisor';

-- Vérifier les agents de terrain
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as nom_agent,
  u.email,
  u.teamId as equipe_id,
  u.isActive as actif
FROM users u
WHERE u.role = 'field_agent';
```

**Problèmes courants :**
- ❌ Superviseur sans `nom_equipe` → Pas d'équipe assignée
- ❌ Agents avec `equipe_id = NULL` → Pas assignés à une équipe
- ❌ Agents avec `actif = false` → Agents désactivés

---

### Étape 3 : Appliquer la Correction 🔧

#### Option A : Correction Automatique (Recommandée)

Exécutez ce script SQL :

```sql
-- 1. Créer une équipe pour le superviseur (si elle n'existe pas)
DO $$
DECLARE
  supervisor_id UUID;
  team_id UUID;
BEGIN
  -- Récupérer le premier superviseur
  SELECT id INTO supervisor_id FROM users WHERE role = 'supervisor' LIMIT 1;
  
  -- Créer une équipe pour ce superviseur
  INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
  VALUES (
    gen_random_uuid(),
    'Équipe Terrain',
    'Équipe principale des agents',
    supervisor_id,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO team_id;
  
  -- Si l'équipe existait déjà, la récupérer
  IF team_id IS NULL THEN
    SELECT id INTO team_id FROM teams WHERE supervisorId = supervisor_id;
  END IF;
  
  -- Assigner tous les agents de terrain à cette équipe
  UPDATE users
  SET teamId = team_id,
      isActive = true,
      updatedAt = NOW()
  WHERE role = 'field_agent';
  
  RAISE NOTICE 'Configuration terminée ! Équipe: %, Superviseur: %', team_id, supervisor_id;
END $$;
```

#### Option B : Correction Manuelle

```sql
-- 1. Noter l'ID de votre superviseur
SELECT id, firstName, lastName FROM users WHERE role = 'supervisor';
-- Exemple résultat: id = 'abc-123-def-456'

-- 2. Créer une équipe pour ce superviseur
INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
VALUES (
  gen_random_uuid(),
  'Équipe Terrain 1',
  'Équipe principale',
  'abc-123-def-456',  -- ⚠️ REMPLACER par l'ID réel du superviseur
  true,
  NOW(),
  NOW()
);

-- 3. Noter l'ID de l'équipe créée
SELECT id, name FROM teams WHERE supervisorId = 'abc-123-def-456';
-- Exemple résultat: id = 'xyz-789-ghi-012'

-- 4. Assigner les agents à cette équipe
UPDATE users
SET teamId = 'xyz-789-ghi-012',  -- ⚠️ REMPLACER par l'ID réel de l'équipe
    isActive = true,
    updatedAt = NOW()
WHERE role = 'field_agent';
```

---

### Étape 4 : Vérifier que ça Fonctionne ✅

1. **Rafraîchissez la page** dans votre navigateur
2. **En tant que superviseur, ouvrez le modal d'assignation**
3. **Vous devriez maintenant voir vos agents de terrain !** 🎉

**Dans les logs serveur, vous devriez voir :**
```
🔍 DEBUG - Superviseur: abc-123...
🔍 DEBUG - Équipe trouvée: Oui (ID: xyz-789)
🔍 DEBUG - Membres de l'équipe: 3
🔍 DEBUG - Détails membres: [...agents...]
```

---

## 🎯 Résumé Ultra-Rapide

Si vous voulez la solution la plus rapide :

```sql
-- Copier-coller ce bloc complet dans votre SQL
DO $$
DECLARE v_supervisor_id UUID; v_team_id UUID;
BEGIN
  SELECT id INTO v_supervisor_id FROM users WHERE role = 'supervisor' LIMIT 1;
  INSERT INTO teams (id, name, supervisorId, isActive, createdAt, updatedAt)
  VALUES (gen_random_uuid(), 'Équipe Terrain', v_supervisor_id, true, NOW(), NOW())
  ON CONFLICT DO NOTHING RETURNING id INTO v_team_id;
  IF v_team_id IS NULL THEN SELECT id INTO v_team_id FROM teams WHERE supervisorId = v_supervisor_id; END IF;
  UPDATE users SET teamId = v_team_id, isActive = true WHERE role = 'field_agent';
END $$;
```

Puis rafraîchissez la page !

---

## 📞 Besoin d'Aide ?

Si après ces étapes vous avez toujours le problème :

1. **Partagez les logs de la console serveur**
2. **Partagez le résultat de ce SQL** :
   ```sql
   SELECT role, COUNT(*) FROM users GROUP BY role;
   SELECT COUNT(*) as nb_equipes FROM teams;
   ```

---

**Version** : 1.0  
**Date** : 2 novembre 2025



