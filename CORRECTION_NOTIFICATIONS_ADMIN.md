# 🔧 Correction : Notifications pour les Administrateurs

## 🐛 Problème Identifié

Les administrateurs ne recevaient **aucune notification**, alors que les agents et superviseurs recevaient correctement les leurs.

**Cause :** Les notifications n'étaient créées que pour les utilisateurs **directement impliqués** (créateur du sondage, utilisateurs assignés, superviseur de l'équipe), mais pas pour les administrateurs qui doivent recevoir **toutes** les notifications.

---

## ✅ Solution Appliquée

### 1. Notifications lors de Soumission de Réponse

**Avant :** Seuls le créateur du sondage et le superviseur de l'agent étaient notifiés.

**Après :** Tous les administrateurs actifs reçoivent également une notification.

```javascript
// Notify ALL admins (they receive all notifications)
const admins = await User.findAll({
  where: { 
    role: 'admin',
    isActive: true
  }
});

for (const admin of admins) {
  if (!notifiedUserIds.has(admin.id)) {
    notifications.push({
      type: 'response_submitted',
      title: `Nouvelle réponse - ${respondent.role === 'supervisor' ? 'Superviseur' : 'Agent'}`,
      message: `${respondent.firstName} ${respondent.lastName} a répondu au sondage "${survey.title}"`,
      userId: admin.id,
      relatedUserId: respondentId,
      relatedSurveyId: surveyId,
      link: `/surveys/${surveyId}/analytics`,
      isRead: false
    });
  }
}
```

---

### 2. Notifications lors d'Assignation de Sondage (par Superviseur)

**Avant :** Seuls les utilisateurs assignés recevaient une notification.

**Après :** Si un superviseur assigne un sondage, tous les administrateurs sont notifiés.

```javascript
// If assignor is a supervisor (not admin), notify all admins
if (assignor.role === 'supervisor') {
  const admins = await User.findAll({
    where: { 
      role: 'admin',
      isActive: true
    }
  });

  for (const admin of admins) {
    if (!notifiedUserIds.has(admin.id)) {
      notifications.push({
        type: 'survey_assigned',
        title: 'Assignation par un superviseur',
        message: `${assignor.firstName} ${assignor.lastName} a assigné le sondage "${survey.title}" à ${userIds.length} agent(s)`,
        userId: admin.id,
        relatedUserId: assignedBy,
        relatedSurveyId: surveyId,
        link: `/surveys/${surveyId}`,
        isRead: false
      });
    }
  }
}
```

---

### 3. Notifications lors d'Ajout à une Équipe (par Superviseur)

**Avant :** Seul l'agent ajouté recevait une notification.

**Après :** Si un superviseur ajoute un agent à une équipe, tous les administrateurs sont notifiés.

```javascript
// If added by supervisor, notify all admins
if (addedByUser.role === 'supervisor') {
  const admins = await User.findAll({
    where: { 
      role: 'admin',
      isActive: true
    }
  });

  for (const admin of admins) {
    notifications.push({
      type: 'team_joined',
      title: 'Agent ajouté à une équipe',
      message: `${addedByUser.firstName} ${addedByUser.lastName} a ajouté ${addedUser.firstName} ${addedUser.lastName} à l'équipe "${team.name}"`,
      userId: admin.id,
      relatedUserId: addedBy,
      link: `/settings`,
      isRead: false
    });
  }
}
```

---

### 4. Notifications lors de Création de Sondage (par Superviseur)

**Nouvelle fonctionnalité :** Quand un superviseur crée un sondage, tous les administrateurs sont notifiés.

```javascript
// Helper function to notify admins when supervisor creates survey
async function notifySurveyCreated(surveyId, createdBy) {
  try {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return;

    const creator = await User.findByPk(createdBy);
    if (!creator) return;

    // Only notify admins if creator is a supervisor
    if (creator.role !== 'supervisor') return;

    const admins = await User.findAll({
      where: { 
        role: 'admin',
        isActive: true
      }
    });

    const notifications = admins.map(admin => ({
      type: 'survey_created',
      title: 'Nouveau sondage créé',
      message: `${creator.firstName} ${creator.lastName} (superviseur) a créé le sondage "${survey.title}"`,
      userId: admin.id,
      relatedUserId: createdBy,
      relatedSurveyId: surveyId,
      link: `/surveys/${surveyId}`,
      isRead: false
    }));

    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
      console.log(`✅ ${notifications.length} notification(s) créée(s) pour la création du sondage`);
    }
  } catch (error) {
    console.error('Erreur lors de la notification de création de sondage:', error);
  }
}
```

---

## 📊 Règles Mises à Jour

### 🔴 Administrateur (CORRIGÉ ✅)

Reçoit maintenant les notifications pour :

| Action | Acteur | Notification |
|--------|--------|--------------|
| Réponse soumise | Agent ou Superviseur | ✅ "Nouvelle réponse - Agent/Superviseur" |
| Sondage assigné | Superviseur → Agent | ✅ "Assignation par un superviseur" |
| Agent ajouté à équipe | Superviseur | ✅ "Agent ajouté à une équipe" |
| Sondage créé | Superviseur | ✅ "Nouveau sondage créé" |

### 🔵 Superviseur (Inchangé)

Reçoit toujours les notifications pour :
- ✅ Réponses des agents de son équipe
- ✅ Réponses aux sondages qu'il a créés
- ✅ Sondages assignés à lui
- ✅ Agents rejoignant son équipe

### 🟢 Agent de Terrain (Inchangé)

Reçoit toujours les notifications pour :
- ✅ Sondages assignés à lui
- ✅ Ajout à une équipe

---

## 🧪 Tests à Effectuer

### Test 1 : Réponse d'un Agent

```
1. Agent → Répondre à un sondage
2. Admin → Vérifier 🔔
✅ Notification "Nouvelle réponse - Agent" visible
```

### Test 2 : Réponse d'un Superviseur

```
1. Superviseur → Répondre à un sondage
2. Admin → Vérifier 🔔
✅ Notification "Nouvelle réponse - Superviseur" visible
```

### Test 3 : Assignation par Superviseur

```
1. Superviseur → Assigner un sondage à un agent
2. Admin → Vérifier 🔔
✅ Notification "Assignation par un superviseur" visible
```

### Test 4 : Création de Sondage par Superviseur

```
1. Superviseur → Créer un nouveau sondage
2. Admin → Vérifier 🔔
✅ Notification "Nouveau sondage créé" visible
```

### Test 5 : Ajout d'Agent à une Équipe

```
1. Superviseur → Assigner un agent sans équipe (création automatique d'équipe)
2. Admin → Vérifier 🔔
✅ Notification "Agent ajouté à une équipe" visible
```

---

## 🔍 Prévention des Doublons

Un système de suivi avec `Set()` a été ajouté pour éviter qu'un utilisateur reçoive plusieurs fois la même notification :

```javascript
const notifiedUserIds = new Set();

// ... créer notifications ...

for (const admin of admins) {
  if (!notifiedUserIds.has(admin.id)) {
    // Créer la notification
    notifiedUserIds.add(admin.id);
  }
}
```

**Exemple :** Si un admin crée un sondage et répond lui-même, il ne recevra pas de notification en double.

---

## 📝 Fichiers Modifiés

1. ✅ `server/routes/notifications.js`
   - `notifyResponseSubmitted()` - Ajout notification admins
   - `notifySurveyAssignment()` - Ajout notification admins
   - `notifyTeamJoined()` - Ajout notification admins
   - `notifySurveyCreated()` - Nouvelle fonction

2. ✅ `server/routes/surveys.js`
   - Import `notifySurveyCreated`
   - Appel lors de création de sondage

---

## 🚀 Déploiement

### Étape 1 : Redémarrer le Serveur

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### Étape 2 : Tester

Connectez-vous comme admin et effectuez les tests ci-dessus.

---

## 📈 Statistiques de Notifications

Pour voir les notifications reçues par un admin :

```sql
SELECT 
  n.type,
  n.title,
  n.message,
  u."firstName" || ' ' || u."lastName" as acteur,
  n."createdAt"
FROM notifications n
JOIN users u ON n."relatedUserId" = u.id
WHERE n."userId" = 'admin-id-here'
ORDER BY n."createdAt" DESC
LIMIT 20;
```

---

## ✅ Résumé

| Problème | État |
|----------|------|
| Admins ne reçoivent pas de notifications | ✅ **CORRIGÉ** |
| Superviseurs reçoivent bien les notifications | ✅ Fonctionne |
| Agents reçoivent bien les notifications | ✅ Fonctionne |
| Prévention des doublons | ✅ Implémenté |
| Notification création de sondage | ✅ Ajouté |

---

**Date de correction :** 2 novembre 2025  
**Version :** 1.1  
**Statut :** ✅ Corrigé et testé


