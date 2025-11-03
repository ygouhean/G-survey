# 🔔 Système de Notifications - G-Survey

## 📋 Vue d'ensemble

Le système de notifications permet aux utilisateurs de recevoir des alertes en temps réel sur les actions importantes concernant les sondages, les équipes et les réponses.

---

## ✨ Fonctionnalités

### 1. Types de Notifications

| Type | Icône | Description |
|------|-------|-------------|
| `survey_assigned` | 📋 | Un sondage vous a été assigné |
| `response_submitted` | 📝 | Une réponse a été soumise à votre sondage |
| `team_joined` | 👥 | Vous avez été ajouté à une équipe |
| `survey_closed` | 🔒 | Un sondage a été fermé |
| `survey_created` | ✨ | Un nouveau sondage a été créé |

### 2. Interface Utilisateur

- **Badge de notification** : Affiche le nombre de notifications non lues (max 9+)
- **Dropdown** : Liste des notifications avec scroll
- **Actions** :
  - Cliquer sur une notification pour la marquer comme lue et naviguer
  - Marquer toutes comme lues
  - Supprimer une notification
- **Rafraîchissement automatique** : Toutes les 30 secondes

---

## 👥 Règles de Distribution

### 🔴 Administrateur

Reçoit les notifications de :
- ✅ **Toutes les réponses** soumises aux sondages
- ✅ **Toutes les actions** des superviseurs
- ✅ **Toutes les actions** des agents de terrain

### 🔵 Superviseur

Reçoit les notifications de :
- ✅ **Réponses soumises** par les agents de son équipe
- ✅ **Réponses soumises** aux sondages qu'il a créés
- ✅ **Sondages assignés** à lui par un admin
- ✅ **Agents rejoignant** son équipe

### 🟢 Agent de Terrain

Reçoit les notifications de :
- ✅ **Sondages assignés** à lui
- ✅ **Ajout à une équipe**
- ✅ **Ses propres actions** (confirmation)

---

## 🔧 Installation

### Étape 1 : Créer la Table

Exécutez le script SQL de migration :

```bash
# Via psql
psql -U votre_utilisateur -d g_survey -f server/migrations/create-notifications-table.sql

# Ou directement dans pgAdmin
# Copier-coller le contenu du fichier
```

### Étape 2 : Redémarrer le Serveur

```bash
npm run dev
```

Le système de notifications est maintenant actif ! 🎉

---

## 📊 Scénarios d'Utilisation

### Scénario 1 : Assignation de Sondage

**Action :** Un superviseur assigne un sondage à un agent

**Notifications créées :**
```
Agent de terrain → 📋 Nouveau sondage assigné
                    "Jean Dupont vous a assigné le sondage 'Satisfaction Client'"
```

---

### Scénario 2 : Soumission de Réponse

**Action :** Un agent de terrain répond à un sondage

**Notifications créées :**
```
Créateur du sondage → 📝 Nouvelle réponse
                       "Paul Martin a répondu au sondage 'Audit Magasin'"

Superviseur de l'agent → 📝 Réponse d'un agent de votre équipe
                          "Paul Martin a répondu au sondage 'Audit Magasin'"
```

---

### Scénario 3 : Recrutement d'Agent

**Action :** Un superviseur assigne un agent sans équipe

**Notifications créées :**
```
Agent → 👥 Ajouté à une équipe
        "Vous avez été ajouté à l'équipe 'Équipe de Jean Dupont' par Jean Dupont"
```

---

## 🎨 Interface Utilisateur

### Badge de Notification

```
🔔 (avec badge rouge "3")
```

- Affiche le nombre de notifications non lues
- Met à jour automatiquement toutes les 30 secondes
- Badge rouge disparaît quand tout est lu

### Dropdown des Notifications

```
┌─────────────────────────────────────────┐
│ Notifications                    [3]     │
│                      Tout marquer lu →   │
├─────────────────────────────────────────┤
│ 📋 Nouveau sondage assigné        ●     │
│    Jean Dupont vous a assigné...         │
│    Il y a 5 min                          │
├─────────────────────────────────────────┤
│ 📝 Nouvelle réponse                      │
│    Paul Martin a répondu au...           │
│    Il y a 1h                             │
├─────────────────────────────────────────┤
│ 👥 Ajouté à une équipe                   │
│    Vous avez été ajouté à...             │
│    Il y a 2j                             │
└─────────────────────────────────────────┘
```

**Légende :**
- ● = Non lu (point bleu)
- Fond bleu clair = Non lu
- Fond blanc = Lu

---

## 🔌 API Endpoints

### GET /api/notifications
Récupère toutes les notifications de l'utilisateur

**Réponse :**
```json
{
  "success": true,
  "data": [...],
  "unreadCount": 3
}
```

### GET /api/notifications/unread-count
Récupère uniquement le nombre de notifications non lues

**Réponse :**
```json
{
  "success": true,
  "count": 3
}
```

### PUT /api/notifications/:id/read
Marque une notification comme lue

### PUT /api/notifications/mark-all-read
Marque toutes les notifications comme lues

### DELETE /api/notifications/:id
Supprime une notification

---

## 💡 Personnalisation

### Ajouter un Nouveau Type de Notification

1. **Mettre à jour le modèle** (`server/models/Notification.js`) :
```javascript
type: DataTypes.ENUM(
  'survey_assigned',
  'mon_nouveau_type'  // ← Ajouter ici
)
```

2. **Créer la fonction helper** (`server/routes/notifications.js`) :
```javascript
async function notifyMonAction(userId, data) {
  await Notification.create({
    type: 'mon_nouveau_type',
    title: 'Mon Titre',
    message: 'Mon message',
    userId,
    link: '/mon-lien'
  });
}
```

3. **Ajouter l'icône** (`src/components/NotificationDropdown.tsx`) :
```typescript
case 'mon_nouveau_type':
  return '🎉';
```

4. **Appeler la fonction** où vous voulez créer la notification :
```javascript
await notifyMonAction(userId, data);
```

---

## 🧪 Tests

### Test 1 : Assignation

1. Connectez-vous comme admin
2. Assignez un sondage à un agent
3. Déconnectez-vous
4. Connectez-vous comme cet agent
5. Vérifiez la notification 🔔

### Test 2 : Réponse

1. Connectez-vous comme agent
2. Répondez à un sondage
3. Déconnectez-vous
4. Connectez-vous comme créateur du sondage
5. Vérifiez la notification 🔔

### Test 3 : Badge

1. Ayez 3 notifications non lues
2. Le badge affiche "3"
3. Cliquez sur une notification
4. Le badge affiche "2"
5. Cliquez sur "Tout marquer lu"
6. Le badge disparaît ✅

---

## 📊 Base de Données

### Structure de la Table

```sql
notifications
├── id (UUID)
├── type (ENUM)
├── title (VARCHAR)
├── message (TEXT)
├── userId (UUID) → users.id
├── relatedUserId (UUID) → users.id
├── relatedSurveyId (UUID) → surveys.id
├── isRead (BOOLEAN)
├── link (VARCHAR)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)
```

### Index

- `userId` + `isRead` : Requêtes rapides des notifications non lues
- `createdAt` : Tri chronologique rapide

### Requêtes Utiles

**Voir toutes les notifications d'un utilisateur :**
```sql
SELECT * FROM notifications 
WHERE "userId" = 'user-id-here'
ORDER BY "createdAt" DESC;
```

**Compteur de notifications non lues :**
```sql
SELECT COUNT(*) FROM notifications
WHERE "userId" = 'user-id-here' AND "isRead" = FALSE;
```

**Nettoyer les anciennes notifications (>30 jours) :**
```sql
DELETE FROM notifications
WHERE "createdAt" < NOW() - INTERVAL '30 days'
AND "isRead" = TRUE;
```

---

## ⚙️ Configuration

### Fréquence de Rafraîchissement

Par défaut : **30 secondes**

Pour changer :
```typescript
// src/components/Header.tsx
const interval = setInterval(loadUnreadCount, 60000) // 60 secondes
```

### Nombre Maximum de Notifications

Par défaut : **50 dernières**

Pour changer :
```javascript
// server/routes/notifications.js
limit: 100 // ← Modifier ici
```

---

## 🐛 Dépannage

### Problème : Badge ne met pas à jour

**Solution :** Vérifiez que le serveur est démarré et que l'API `/api/notifications/unread-count` fonctionne.

### Problème : Notifications ne s'affichent pas

1. Vérifiez que la table est créée : `SELECT * FROM notifications LIMIT 1;`
2. Vérifiez les logs du serveur
3. Ouvrez la console du navigateur (F12)

### Problème : Erreur 404 sur /api/notifications

**Solution :** Assurez-vous que la route est bien enregistrée dans `server/index.js` :
```javascript
app.use('/api/notifications', notificationRoutes);
```

---

## 📈 Statistiques

### Voir les Notifications par Type

```sql
SELECT 
  type,
  COUNT(*) as total,
  SUM(CASE WHEN "isRead" THEN 1 ELSE 0 END) as lues,
  SUM(CASE WHEN NOT "isRead" THEN 1 ELSE 0 END) as non_lues
FROM notifications
GROUP BY type
ORDER BY total DESC;
```

### Voir les Utilisateurs les Plus Actifs

```sql
SELECT 
  u."firstName" || ' ' || u."lastName" as nom,
  COUNT(*) as notifications_generees
FROM notifications n
JOIN users u ON n."relatedUserId" = u.id
GROUP BY u.id, nom
ORDER BY notifications_generees DESC
LIMIT 10;
```

---

## 🔄 Maintenance

### Nettoyage Automatique

Créez un cron job pour nettoyer les vieilles notifications :

```sql
-- Garder seulement les 30 derniers jours
DELETE FROM notifications
WHERE "createdAt" < NOW() - INTERVAL '30 days';

-- Ou garder seulement les 100 dernières par utilisateur
DELETE FROM notifications
WHERE id NOT IN (
  SELECT id FROM notifications
  WHERE "userId" = 'user-id'
  ORDER BY "createdAt" DESC
  LIMIT 100
);
```

---

## ✅ Checklist de Déploiement

- [ ] Table `notifications` créée
- [ ] Index créés
- [ ] Routes enregistrées dans `server/index.js`
- [ ] Tests effectués
- [ ] Documentation lue
- [ ] Badge visible dans le header
- [ ] Notifications reçues correctement

---

**Date de création** : 2 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Production Ready

---

## 📞 Support

Pour toute question :
1. Consultez ce document
2. Vérifiez les logs serveur
3. Consultez la console du navigateur
4. Contactez l'équipe de développement



