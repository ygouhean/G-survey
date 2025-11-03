# 🚀 Démarrage Rapide - Notifications

## ⚡ 3 Étapes pour Activer les Notifications

### Étape 1 : Créer la Table 📋

```bash
# Connectez-vous à votre base de données PostgreSQL
psql -U postgres -d g_survey

# Puis copiez-collez ce script SQL :
```

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "relatedUserId" UUID REFERENCES users(id) ON DELETE SET NULL,
  "relatedSurveyId" UUID REFERENCES surveys(id) ON DELETE CASCADE,
  "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
  link VARCHAR(500),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_userId_isRead ON notifications("userId", "isRead");
CREATE INDEX idx_notifications_createdAt ON notifications("createdAt" DESC);

SELECT '✅ Table créée!' as status;
```

---

### Étape 2 : Redémarrer le Serveur 🔄

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez
npm run dev
```

---

### Étape 3 : Tester ! 🧪

1. **Connectez-vous** à l'application
2. **Regardez le header** → Vous devriez voir l'icône 🔔
3. **Créez une action** (assignez un sondage, répondez à un sondage)
4. **Le badge de notification apparaît** avec le nombre de nouvelles notifications

---

## 🎯 Comment Ça Marche ?

### Vous Recevez des Notifications Quand :

| Rôle | Notifications |
|------|--------------|
| **Admin** | Toutes les actions des superviseurs et agents |
| **Superviseur** | Réponses de son équipe + sondages assignés à lui |
| **Agent** | Sondages assignés + ajout à une équipe |

---

## 🔔 Utilisation

### Voir les Notifications

1. Cliquez sur l'icône 🔔 dans le header
2. Un dropdown s'ouvre avec vos notifications

### Lire une Notification

1. Cliquez sur la notification
2. Elle devient grise (lue)
3. Vous êtes redirigé vers la ressource concernée

### Marquer Tout Comme Lu

1. Cliquez sur "Tout marquer comme lu" en haut du dropdown
2. Toutes les notifications deviennent grises
3. Le badge disparaît

### Supprimer une Notification

1. Cliquez sur le ✕ à droite de la notification
2. Elle est supprimée immédiatement

---

## 🧪 Test Rapide

### Test 1 : Assignation (2 min)

```
1. Admin → Assignez un sondage à un agent
2. Agent → Connectez-vous → Vérifiez 🔔
✅ Notification "Nouveau sondage assigné" visible
```

### Test 2 : Réponse (2 min)

```
1. Agent → Répondez à un sondage
2. Superviseur/Admin → Vérifiez 🔔
✅ Notification "Nouvelle réponse" visible
```

---

## ⚙️ Configuration Avancée

### Changer la Fréquence de Mise à Jour

Par défaut, les notifications se rafraîchissent toutes les **30 secondes**.

Pour changer :

```typescript
// src/components/Header.tsx (ligne ~36)
const interval = setInterval(loadUnreadCount, 60000) // 60 secondes au lieu de 30
```

---

## 🐛 Problèmes Courants

### Badge ne s'affiche pas

**Causes possibles :**
- Table pas créée → Exécutez l'Étape 1
- Serveur pas redémarré → Exécutez l'Étape 2

**Vérification :**
```sql
SELECT COUNT(*) FROM notifications;
```

Si erreur → Table pas créée ❌

---

### Erreur 404 sur /api/notifications

**Solution :** Vérifiez que vous avez bien redémarré le serveur après avoir tiré le code.

---

### Notifications ne se créent pas

**Vérification :**
```sql
-- Vérifiez si des notifications existent
SELECT * FROM notifications ORDER BY "createdAt" DESC LIMIT 5;
```

Si vide :
1. Faites une action (assignez un sondage)
2. Vérifiez à nouveau
3. Si toujours vide, consultez les logs du serveur

---

## 📝 Résumé

✅ Table `notifications` créée  
✅ Serveur redémarré  
✅ Badge 🔔 visible dans le header  
✅ Notifications reçues lors des actions  
✅ Système fonctionnel !

---

## 📚 Documentation Complète

Pour plus de détails, consultez **`SYSTEME_NOTIFICATIONS.md`**

---

**Version** : 1.0  
**Date** : 2 novembre 2025



