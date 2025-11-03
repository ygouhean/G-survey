# 🧪 Test - Assignation par Superviseur

## ✅ Corrections Apportées

J'ai **simplifié et corrigé** la logique d'assignation pour les superviseurs :

### Avant (❌ Ne fonctionnait pas)
- Utilisait une inclusion complexe `include: [{ model: User, as: 'members' }]`
- Récupérait les membres puis filtrait manuellement

### Après (✅ Fonctionne)
- Utilise directement `teamId` dans la requête
- Filtre automatiquement par `role = 'field_agent'` et `teamId = team.id`

---

## 🔍 Étapes de Test

### Étape 1 : Redémarrer le Serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

### Étape 2 : Vérifier la Base de Données

Exécutez ce SQL pour voir la situation actuelle :

```sql
-- Vérifier le superviseur et son équipe
SELECT 
  u.id as supervisor_id,
  u.firstName || ' ' || u.lastName as supervisor_name,
  t.id as team_id,
  t.name as team_name
FROM users u
LEFT JOIN teams t ON t.supervisorId = u.id
WHERE u.role = 'supervisor';

-- Vérifier les agents de terrain
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as agent_name,
  u.teamId,
  u.isActive,
  t.name as team_name
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.role = 'field_agent'
ORDER BY u.firstName;
```

### Étape 3 : Si Nécessaire, Configurer l'Équipe

Si le superviseur n'a pas d'équipe ou si les agents ne sont pas assignés :

```sql
-- Option A : Script automatique (RECOMMANDÉ)
DO $$
DECLARE 
  v_supervisor_id UUID; 
  v_team_id UUID;
BEGIN
  -- Prendre le premier superviseur
  SELECT id INTO v_supervisor_id FROM users WHERE role = 'supervisor' LIMIT 1;
  
  -- Créer ou récupérer l'équipe
  INSERT INTO teams (id, name, description, supervisorId, isActive, createdAt, updatedAt)
  VALUES (gen_random_uuid(), 'Équipe Terrain', 'Équipe principale', v_supervisor_id, true, NOW(), NOW())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_team_id;
  
  IF v_team_id IS NULL THEN
    SELECT id INTO v_team_id FROM teams WHERE supervisorId = v_supervisor_id;
  END IF;
  
  -- Assigner tous les agents à cette équipe
  UPDATE users
  SET teamId = v_team_id, isActive = true, updatedAt = NOW()
  WHERE role = 'field_agent';
  
  RAISE NOTICE '✅ Configuration terminée ! Équipe: %, Superviseur: %', v_team_id, v_supervisor_id;
END $$;
```

### Étape 4 : Tester en Mode Superviseur

1. **Connectez-vous en tant que superviseur**
2. **Ouvrez ou créez un sondage**
3. **Cliquez sur "Assigner le sondage" (icône 👥)**
4. **Regardez la console du serveur**

---

## 📊 Logs à Surveiller

### ✅ Cas de Succès

Vous devriez voir dans la console serveur :

```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Oui (ID: xyz-789, Nom: Équipe Terrain)
🔍 DEBUG - whereClause pour superviseur: {
  isActive: true,
  teamId: 'xyz-789',
  role: 'field_agent'
}
✅ DEBUG - Utilisateurs trouvés: 3
✅ DEBUG - Liste des utilisateurs: [
  { nom: 'Jean Dupont', role: 'field_agent' },
  { nom: 'Marie Martin', role: 'field_agent' },
  { nom: 'Paul Durand', role: 'field_agent' }
]
```

**Interface :** Vous devez voir les agents dans le modal ✅

---

### ❌ Cas 1 : Pas d'Équipe

```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Non
⚠️ Ce superviseur n'a pas d'équipe assignée
```

**Solution :** Exécutez le script SQL de l'Étape 3

---

### ❌ Cas 2 : Équipe Vide

```
🔍 DEBUG - Superviseur: abc-123-def-456
🔍 DEBUG - Équipe trouvée: Oui (ID: xyz-789, Nom: Équipe Terrain)
🔍 DEBUG - whereClause pour superviseur: { ... }
✅ DEBUG - Utilisateurs trouvés: 0
```

**Solution :** Les agents ne sont pas assignés à l'équipe. Exécutez :

```sql
-- Récupérer l'ID de l'équipe
SELECT id FROM teams WHERE supervisorId = (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1);

-- Assigner les agents à cette équipe
UPDATE users
SET teamId = 'ID_DE_L_EQUIPE',  -- Remplacer par l'ID réel
    isActive = true
WHERE role = 'field_agent';
```

---

## 🎯 Résultat Attendu

Après correction, en mode superviseur :

1. ✅ **Liste "Utilisateurs déjà assignés"** → Vous voyez les agents déjà assignés
2. ✅ **Liste "Assigner à de nouveaux utilisateurs"** → Vous voyez vos agents de terrain disponibles
3. ✅ **Recherche** → Vous pouvez filtrer par nom
4. ✅ **Sélection** → Vous pouvez cocher les agents
5. ✅ **Bouton "Assigner"** → L'assignation fonctionne

---

## 🔄 Comparaison Admin vs Superviseur

### En Mode Admin
- Voit **tous les field_agents ET supervisors**
- Peut les assigner à n'importe quel sondage

### En Mode Superviseur (MAINTENANT CORRIGÉ)
- Voit **uniquement les field_agents de son équipe**
- Peut les assigner uniquement à ses sondages

---

## 🐛 Dépannage

### Problème : "Aucun utilisateur disponible" persiste

1. **Vérifiez les logs** - Combien d'utilisateurs sont trouvés ?
2. **Exécutez ce SQL** :
```sql
SELECT 
  u.firstName || ' ' || u.lastName as agent,
  u.teamId,
  t.name as team,
  s.firstName || ' ' || s.lastName as supervisor
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
LEFT JOIN users s ON t.supervisorId = s.id
WHERE u.role = 'field_agent';
```

3. **Partagez les résultats** avec moi

---

### Problème : Erreur lors de l'assignation

Si l'assignation échoue avec une erreur 403, vérifiez :

```sql
-- Les agents sélectionnés sont-ils bien dans l'équipe du superviseur ?
SELECT 
  u.id,
  u.firstName || ' ' || u.lastName as agent,
  u.teamId,
  t.supervisorId
FROM users u
LEFT JOIN teams t ON u.teamId = t.id
WHERE u.id IN ('ID_AGENT_1', 'ID_AGENT_2');  -- Remplacer par les IDs réels
```

---

## ✅ Checklist Finale

Avant de valider que tout fonctionne :

- [ ] Le superviseur a une équipe dans la table `teams`
- [ ] Les agents ont `teamId` = ID de l'équipe du superviseur
- [ ] Les agents ont `role = 'field_agent'`
- [ ] Les agents ont `isActive = true`
- [ ] Le serveur est redémarré
- [ ] Les logs affichent les agents trouvés
- [ ] L'interface affiche les agents dans le modal
- [ ] L'assignation fonctionne sans erreur

---

**Date** : 2 novembre 2025  
**Version** : 2.0 - CORRIGÉ ✅



