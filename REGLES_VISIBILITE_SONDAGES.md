# 🔐 Règles de Visibilité des Sondages

## 📋 Vue d'ensemble

Ce document décrit les règles de visibilité et de permissions pour les sondages selon le rôle de l'utilisateur.

---

## 👥 Règles par Rôle

### 1. 👑 Administrateur (Admin)

#### Visibilité des sondages
- ✅ **Voit TOUS les sondages** du système

#### Permissions
- ✅ Créer des sondages
- ✅ Modifier tous les sondages
- ✅ Supprimer tous les sondages
- ✅ Fermer/Activer tous les sondages
- ✅ Assigner des sondages à :
  - Agents de terrain (field_agent)
  - Superviseurs (supervisor)
- ✅ Répondre à tous les sondages
- ✅ Voir toutes les statistiques

---

### 2. 👨‍💼 Superviseur (Supervisor)

#### Visibilité des sondages
Un superviseur voit uniquement :
- ✅ Les sondages **qu'il a créés**
- ✅ Les sondages **qui lui sont assignés**

#### Permissions

**Création :**
- ✅ Créer des sondages

**Modification :**
- ✅ Modifier **uniquement** les sondages qu'il a créés
- ❌ Ne peut PAS modifier les sondages qui lui sont assignés par d'autres

**Suppression :**
- ❌ Ne peut PAS supprimer de sondages (réservé aux admins)

**Assignation :**
- ✅ Assigner des sondages **uniquement** aux agents de terrain de son équipe
- ✅ Retirer des agents de ses propres sondages
- ❌ Ne peut PAS assigner à d'autres superviseurs
- ❌ Ne peut PAS assigner à des agents d'autres équipes
- ❌ Ne peut PAS se retirer d'un sondage assigné par un administrateur

**Statut :**
- ✅ Fermer/Activer les sondages qu'il a créés
- ❌ Ne peut PAS modifier le statut des sondages assignés par d'autres

**Réponses :**
- ✅ Répondre aux sondages qu'il a créés
- ✅ Répondre aux sondages qui lui sont assignés

**Statistiques :**
- ✅ Voir les statistiques des sondages qu'il a créés
- ✅ Voir les statistiques des sondages qui lui sont assignés

---

### 3. 🏃 Agent de Terrain (Field Agent)

#### Visibilité des sondages
Un agent de terrain voit uniquement :
- ✅ Les sondages **qui lui sont assignés**

#### Permissions

**Création :**
- ❌ Ne peut PAS créer de sondages

**Modification :**
- ❌ Ne peut PAS modifier de sondages

**Suppression :**
- ❌ Ne peut PAS supprimer de sondages

**Assignation :**
- ❌ Ne peut PAS assigner de sondages

**Statut :**
- ❌ Ne peut PAS modifier le statut des sondages

**Réponses :**
- ✅ Répondre aux sondages qui lui sont assignés

**Statistiques :**
- ✅ Voir **uniquement ses propres statistiques**
- ✅ Voir ses propres réponses
- ❌ Ne peut PAS voir les statistiques globales du sondage
- ❌ Ne peut PAS voir les réponses des autres utilisateurs

---

## 📊 Tableau Récapitulatif

| Action | Admin | Superviseur | Agent de terrain |
|--------|-------|-------------|------------------|
| Voir tous les sondages | ✅ | ❌ | ❌ |
| Voir sondages créés par soi | ✅ | ✅ | ❌ |
| Voir sondages assignés | ✅ | ✅ | ✅ |
| Créer un sondage | ✅ | ✅ | ❌ |
| Modifier ses sondages | ✅ | ✅ | ❌ |
| Modifier tous les sondages | ✅ | ❌ | ❌ |
| Supprimer un sondage | ✅ | ❌ | ❌ |
| Assigner à tous types | ✅ | ❌ | ❌ |
| Assigner à son équipe | ✅ | ✅ | ❌ |
| Répondre aux sondages | ✅ | ✅ | ✅ |
| Voir toutes les stats | ✅ | ❌ | ❌ |
| Voir ses propres stats | ✅ | ✅ | ✅ |

---

## 🔄 Scénarios d'Utilisation

### Scénario 1 : Superviseur crée un sondage
1. Le superviseur Jean crée un sondage "Satisfaction Client"
2. Jean peut :
   - ✅ Voir ce sondage dans sa liste
   - ✅ Modifier ce sondage
   - ✅ L'assigner aux agents de son équipe
   - ✅ Changer son statut (draft → active → closed)
   - ✅ Voir toutes les statistiques

### Scénario 2 : Admin assigne un sondage à un superviseur
1. L'admin Marie crée un sondage "Évaluation Trimestrielle"
2. Marie assigne ce sondage au superviseur Jean
3. Jean peut :
   - ✅ Voir ce sondage dans sa liste
   - ✅ Répondre à ce sondage
   - ✅ Voir les statistiques
   - ❌ Ne peut PAS modifier ce sondage
   - ❌ Ne peut PAS changer son statut
   - ❌ Ne peut PAS l'assigner à d'autres
   - ❌ Ne peut PAS se retirer de ce sondage (car assigné par un admin)

### Scénario 3 : Agent de terrain assigné à un sondage
1. Le superviseur Jean crée un sondage "Audit Magasin"
2. Jean assigne ce sondage à l'agent Paul
3. Paul peut :
   - ✅ Voir ce sondage dans sa liste
   - ✅ Répondre à ce sondage
   - ✅ Voir uniquement ses propres réponses
   - ❌ Ne peut PAS voir les réponses des autres agents
   - ❌ Ne peut PAS modifier le sondage
   - ❌ Ne peut PAS voir les statistiques globales

### Scénario 4 : Agent non assigné
1. L'agent Paul n'est pas assigné au sondage "Formation Interne"
2. Paul :
   - ❌ Ne voit PAS ce sondage dans sa liste
   - ❌ Ne peut PAS y accéder même avec le lien direct
   - ❌ Reçoit une erreur 403 (Accès refusé) s'il tente d'y accéder

---

## 🔒 Sécurité

### Vérifications Backend
Toutes les actions sont vérifiées côté serveur :

1. **Authentification** : Token JWT valide requis
2. **Autorisation de rôle** : Vérification du rôle utilisateur
3. **Propriété** : Vérification de la propriété du sondage (pour superviseur)
4. **Assignation** : Vérification de l'assignation (pour agents et superviseurs)

### Codes d'Erreur
- **401** : Non authentifié (pas de token ou token invalide)
- **403** : Non autorisé (pas les permissions suffisantes)
- **404** : Ressource non trouvée

---

## 💡 Bonnes Pratiques

### Pour les Administrateurs
1. ✅ Assignez les sondages stratégiques aux superviseurs
2. ✅ Créez des équipes bien structurées
3. ✅ Vérifiez régulièrement les permissions

### Pour les Superviseurs
1. ✅ Créez des sondages clairs et concis
2. ✅ Assignez les sondages à tous les agents de votre équipe
3. ✅ Suivez les statistiques de vos sondages
4. ❌ N'essayez pas de modifier les sondages que vous n'avez pas créés

### Pour les Agents de Terrain
1. ✅ Répondez à tous les sondages qui vous sont assignés
2. ✅ Consultez votre tableau de bord pour voir vos sondages actifs
3. ❌ Ne tentez pas d'accéder à des sondages non assignés

---

## 🔧 Configuration Technique

### Modèle de Données

```javascript
// Relation Many-to-Many : Survey ↔ User
SurveyAssignee {
  surveyId: UUID
  userId: UUID
}

// Un sondage peut être assigné à plusieurs utilisateurs
// Un utilisateur peut avoir plusieurs sondages assignés
```

### Vérification d'Accès

```javascript
// Exemple de vérification pour un superviseur
if (user.role === 'supervisor') {
  // Peut voir si créé par lui OU assigné à lui
  return survey.createdById === user.id || 
         survey.assignedTo.includes(user.id)
}
```

---

## 📞 Support

Pour toute question concernant les permissions :
1. Consultez ce document
2. Contactez votre administrateur système
3. Vérifiez les logs d'erreur pour plus de détails

---

**Date de mise à jour** : 2 novembre 2025  
**Version** : 2.0  
**Auteur** : Équipe G-Survey

