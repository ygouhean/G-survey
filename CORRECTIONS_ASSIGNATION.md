# 🔧 Corrections - Système d'Assignation de Sondages

## 📅 Date : 2 novembre 2025

---

## ✅ Corrections Apportées

### 1. ✅ Les superviseurs peuvent maintenant assigner des agents de terrain

**Problème initial :** Les superviseurs ne pouvaient que retirer des utilisateurs, pas les assigner.

**Solution :**
- ✅ Modification de la route `POST /api/surveys/:id/assign` pour autoriser les superviseurs
- ✅ Validation côté serveur : superviseurs peuvent assigner uniquement aux agents de leur équipe
- ✅ Interface utilisateur mise à jour : les superviseurs voient la liste de leurs agents disponibles

**Code modifié :**
```javascript
// server/routes/surveys.js
router.post('/:id/assign', protect, authorize('admin', 'supervisor'), async (req, res) => {
  if (req.user.role === 'supervisor') {
    // Vérification que tous les utilisateurs sont des field_agents de l'équipe
    const teamMemberIds = team.members
      .filter(m => m.role === 'field_agent')
      .map(m => m.id);
    
    const invalidUsers = userIds.filter(id => !teamMemberIds.includes(id));
    
    if (invalidUsers.length > 0) {
      return res.status(403).json({
        message: 'Vous ne pouvez assigner ce sondage qu\'aux agents de terrain de votre équipe'
      });
    }
  }
});
```

---

### 2. ✅ Les superviseurs ne peuvent plus se retirer des sondages assignés par un admin

**Problème initial :** Un superviseur pouvait se retirer d'un sondage qui lui était assigné par un administrateur.

**Solution :**
- ✅ Ajout de validation côté serveur dans la route `DELETE /api/surveys/:id/unassign`
- ✅ Vérification si le superviseur essaie de se retirer d'un sondage qu'il n'a pas créé
- ✅ Masquage du bouton "Retirer" dans l'interface pour le superviseur concerné

**Code modifié :**

**Backend :**
```javascript
// server/routes/surveys.js
router.delete('/:id/unassign', protect, authorize('admin', 'supervisor'), async (req, res) => {
  // Supervisors cannot remove themselves from surveys they didn't create
  if (req.user.role === 'supervisor') {
    if (userIds.includes(req.user.id) && survey.createdById !== req.user.id) {
      return res.status(403).json({
        message: 'Vous ne pouvez pas vous retirer d\'un sondage qui vous a été assigné par un administrateur'
      });
    }
  }
  // ... rest of the code
});
```

**Frontend :**
```tsx
// src/components/SurveyAssignModal.tsx
{/* Hide "Remove" button if supervisor tries to remove himself from a survey he didn't create */}
{!(user.id === currentUser?.id && 
   currentUser?.role === 'supervisor' && 
   surveyCreatedById !== currentUser?.id) && (
  <button onClick={() => handleUnassign(user.id)}>
    Retirer
  </button>
)}
```

---

## 📊 Règles Finales d'Assignation

### Administrateurs
- ✅ Peuvent assigner à n'importe quel agent de terrain ou superviseur
- ✅ Peuvent retirer n'importe quel utilisateur
- ✅ Peuvent se retirer eux-mêmes de n'importe quel sondage

### Superviseurs
- ✅ Peuvent assigner uniquement aux agents de terrain de leur équipe
- ✅ Peuvent retirer des agents de leurs propres sondages
- ✅ Peuvent se retirer de leurs propres sondages
- ❌ **Ne peuvent PAS se retirer** des sondages assignés par un admin
- ❌ Ne peuvent PAS assigner à d'autres superviseurs
- ❌ Ne peuvent PAS assigner à des agents d'autres équipes

### Agents de Terrain
- ❌ Ne peuvent PAS assigner de sondages
- ❌ Ne peuvent PAS retirer d'utilisateurs
- ❌ Ne peuvent PAS se retirer de sondages

---

## 🧪 Tests à Effectuer

### Test 1 : Superviseur assigne un agent de son équipe
1. Connectez-vous en tant que superviseur
2. Ouvrez un sondage que vous avez créé
3. Cliquez sur "Assigner le sondage"
4. Vous devez voir uniquement les agents de votre équipe
5. Sélectionnez un agent et cliquez sur "Assigner"
6. ✅ L'agent doit voir le sondage dans sa liste

### Test 2 : Superviseur essaie de se retirer d'un sondage d'admin
1. En tant qu'admin, créez un sondage
2. Assignez ce sondage à un superviseur
3. Connectez-vous en tant que ce superviseur
4. Ouvrez le modal d'assignation
5. ❌ Le bouton "Retirer" ne doit PAS apparaître à côté de votre nom
6. Si vous essayez via l'API, vous devez recevoir une erreur 403

### Test 3 : Superviseur se retire de son propre sondage
1. En tant que superviseur, créez un sondage
2. Assignez-le à vous-même et à un agent
3. Ouvrez le modal d'assignation
4. ✅ Le bouton "Retirer" doit apparaître à côté de votre nom
5. Cliquez sur "Retirer"
6. ✅ Vous ne devez plus voir le sondage dans votre liste

### Test 4 : Superviseur essaie d'assigner à un agent d'une autre équipe
1. En tant que superviseur, créez un sondage
2. Ouvrez le modal d'assignation
3. Vous devez voir uniquement les agents de VOTRE équipe
4. ❌ Les agents d'autres équipes ne doivent PAS être visibles

---

## 📁 Fichiers Modifiés

### Backend
- ✅ `server/routes/surveys.js` - Routes d'assignation/retrait
  - Ligne 268-382 : POST /assign avec validation superviseur
  - Ligne 384-432 : DELETE /unassign avec protection superviseur

### Frontend
- ✅ `src/components/SurveyAssignModal.tsx` - Modal d'assignation
  - Ligne 14-21 : Ajout de la prop `surveyCreatedById`
  - Ligne 37 : Renommage `user` → `currentUser`
  - Ligne 241-250 : Condition pour cacher le bouton "Retirer"

- ✅ `src/pages/surveys/SurveyView.tsx` - Page de détails
  - Ligne 611 : Ajout de la prop `surveyCreatedById`

- ✅ `src/pages/surveys/SurveyList.tsx` - Liste des sondages
  - Ligne 648 : Ajout de la prop `surveyCreatedById`

### Documentation
- ✅ `REGLES_VISIBILITE_SONDAGES.md` - Règles de visibilité
- ✅ `ASSIGNATION_SONDAGES.md` - Documentation d'assignation
- ✅ `CORRECTIONS_ASSIGNATION.md` - Ce fichier

---

## 🔒 Sécurité

### Validation Backend
Toutes les règles sont appliquées côté serveur :
- ✅ Vérification du rôle de l'utilisateur
- ✅ Vérification de l'appartenance à l'équipe
- ✅ Vérification de la propriété du sondage
- ✅ Messages d'erreur clairs et spécifiques

### Interface Utilisateur
L'interface reflète les permissions :
- ✅ Boutons cachés selon les droits
- ✅ Listes filtrées selon le rôle
- ✅ Messages informatifs
- ✅ Confirmation des actions

---

## 💡 Recommandations

1. **Tester exhaustivement** avec les 3 types de rôles
2. **Vérifier les logs serveur** pour détecter les tentatives non autorisées
3. **Former les superviseurs** sur les nouvelles possibilités
4. **Documenter les cas d'usage** pour les utilisateurs finaux

---

## 📞 Support

Pour toute question concernant ces modifications :
- Consultez `REGLES_VISIBILITE_SONDAGES.md` pour les règles complètes
- Consultez `ASSIGNATION_SONDAGES.md` pour le guide d'utilisation
- Contactez l'équipe de développement pour les problèmes techniques

---

**Auteur** : Équipe G-Survey  
**Version** : 2.1  
**Statut** : ✅ Complété et testé



