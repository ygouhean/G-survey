# 📋 Fonctionnalité d'Assignation de Sondages

## 🎯 Vue d'ensemble

Cette fonctionnalité permet aux administrateurs et superviseurs d'assigner des sondages à des utilisateurs spécifiques (agents de terrain et superviseurs) pour une gestion plus précise de la collecte de données.

## 👥 Règles de Permissions

### Administrateurs
Les administrateurs peuvent assigner un sondage à :
- ✅ **Agents de terrain** (field_agent)
- ✅ **Superviseurs** (supervisor)

### Superviseurs
Les superviseurs peuvent assigner un sondage uniquement à :
- ✅ **Agents de terrain** de leur équipe

## 🔧 Fonctionnalités

### 1. Assignation de Sondages

#### Depuis la Liste des Sondages
- Cliquez sur l'icône **👥** dans la colonne "Actions"
- Une info-bulle indique le nombre d'utilisateurs déjà assignés
- Le modal d'assignation s'ouvre

#### Depuis la Page de Détails d'un Sondage
- Dans la section "Actions rapides", cliquez sur le bouton **"Assigner le sondage"**
- Le nombre d'utilisateurs actuellement assignés est affiché

### 2. Modal d'Assignation

Le modal d'assignation comprend :

#### Section "Utilisateurs déjà assignés"
- Liste des utilisateurs actuellement assignés au sondage
- Badge indiquant le rôle de chaque utilisateur
- Bouton **"Retirer"** pour désassigner un utilisateur

#### Section "Assigner à de nouveaux utilisateurs"
- **Barre de recherche** : Filtrez les utilisateurs par nom ou email
- **Bouton "Tout sélectionner/désélectionner"** : Sélectionne ou désélectionne tous les utilisateurs visibles
- **Liste des utilisateurs disponibles** :
  - Cases à cocher pour sélectionner les utilisateurs
  - Avatar avec initiales
  - Nom complet et email
  - Badge de rôle (Administrateur, Superviseur, Agent de terrain)

#### Actions
- **Annuler** : Ferme le modal sans sauvegarder
- **Assigner** : Assigne le sondage aux utilisateurs sélectionnés

### 3. Messages de Confirmation

- ✅ **Succès** : Affiche le nombre d'utilisateurs assignés
- ❌ **Erreur** : Affiche un message d'erreur détaillé si l'assignation échoue

## 🔌 API Endpoints

### Assigner des utilisateurs à un sondage
```http
POST /api/surveys/:id/assign
Content-Type: application/json
Authorization: Bearer {token}

{
  "userIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Sondage assigné avec succès à 3 utilisateur(s)",
  "data": {
    "id": "survey-uuid",
    "title": "Mon sondage",
    "assignedTo": [...]
  }
}
```

### Retirer des utilisateurs d'un sondage
```http
DELETE /api/surveys/:id/unassign
Content-Type: application/json
Authorization: Bearer {token}

{
  "userIds": ["uuid1", "uuid2"]
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "2 utilisateur(s) retiré(s) avec succès",
  "data": {
    "id": "survey-uuid",
    "title": "Mon sondage",
    "assignedTo": [...]
  }
}
```

### Obtenir la liste des utilisateurs assignables
```http
GET /api/surveys/:id/assignable-users
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@example.com",
      "role": "field_agent"
    }
  ]
}
```

## 🔒 Sécurité et Validations

### Backend (Serveur)

1. **Vérification des permissions** :
   - Les administrateurs peuvent assigner à des field_agents et supervisors
   - Les superviseurs peuvent assigner uniquement aux field_agents de leur équipe

2. **Validations** :
   - Tous les utilisateurs doivent exister dans la base de données
   - Les utilisateurs doivent avoir un rôle valide (field_agent ou supervisor)
   - Les utilisateurs doivent être actifs (isActive = true)

3. **Gestion des erreurs** :
   - Sondage non trouvé (404)
   - Permissions insuffisantes (403)
   - Données invalides (400)
   - Erreurs serveur (500)

### Frontend (Interface)

1. **Filtrage des utilisateurs** :
   - Seuls les utilisateurs assignables selon le rôle sont affichés
   - Les utilisateurs déjà assignés sont exclus de la liste des nouveaux utilisateurs

2. **Messages utilisateur** :
   - Instructions claires selon le rôle
   - Messages d'erreur détaillés
   - Confirmations de succès

## 📊 Impact sur les Autres Fonctionnalités

### Visibilité des Sondages
- **Agents de terrain** : Ne voient que les sondages qui leur sont assignés
- **Superviseurs** : Voient les sondages qu'ils ont créés + les sondages qui leur sont assignés
- **Administrateurs** : Voient tous les sondages

### Règles de Visibilité Détaillées
Consultez le fichier `REGLES_VISIBILITE_SONDAGES.md` pour une description complète des règles de visibilité et permissions par rôle.

### Réponses aux Sondages
- Les utilisateurs peuvent répondre uniquement aux sondages qui leur sont assignés
- L'accès est contrôlé au niveau de l'API

## 🎨 Interface Utilisateur

### Design
- **Modal plein écran** avec hauteur adaptative
- **Thème clair/sombre** supporté
- **Responsive** : S'adapte aux mobiles et tablettes

### Couleurs et Badges
- **Administrateur** : Badge violet
- **Superviseur** : Badge bleu
- **Agent de terrain** : Badge vert

### Icônes
- **👥** : Assignation de sondage
- **✅** : Succès
- **❌** : Erreur
- **🔍** : Recherche

## 📝 Exemple d'Utilisation

### Scénario 1 : Administrateur assigne un sondage
1. L'administrateur crée un nouveau sondage
2. Il clique sur "Assigner le sondage" depuis la page de détails
3. Il sélectionne 3 agents de terrain et 1 superviseur
4. Il clique sur "Assigner"
5. Le sondage est maintenant visible pour ces 4 utilisateurs

### Scénario 2 : Superviseur assigne un sondage à son équipe
1. Le superviseur ouvre un sondage existant
2. Il clique sur l'icône 👥 dans la liste des sondages
3. Il voit uniquement les agents de terrain de son équipe
4. Il sélectionne 2 agents
5. Il clique sur "Assigner"
6. Les 2 agents peuvent maintenant voir et répondre au sondage

### Scénario 3 : Retrait d'un utilisateur
1. Un superviseur ouvre le modal d'assignation
2. Il voit qu'un agent est déjà assigné
3. Il clique sur "Retirer" à côté du nom de l'agent
4. L'agent n'a plus accès au sondage

## 🔄 Mises à Jour Futures Possibles

- [ ] Assignation en masse à partir d'un fichier CSV
- [ ] Notifications par email lors de l'assignation
- [ ] Historique des assignations
- [ ] Assignation automatique basée sur des règles
- [ ] Assignation par équipe complète en un clic
- [ ] Statistiques d'assignation par utilisateur

## 🐛 Dépannage

### Problème : "Vous n'avez pas d'équipe assignée"
**Solution** : Contactez un administrateur pour être assigné à une équipe.

### Problème : "Certains utilisateurs n'existent pas"
**Solution** : Vérifiez que tous les utilisateurs sélectionnés sont actifs dans le système.

### Problème : "Vous ne pouvez assigner ce sondage qu'aux agents de terrain de votre équipe"
**Solution** : En tant que superviseur, vous ne pouvez assigner qu'aux agents de votre équipe. Contactez un administrateur pour assigner à d'autres utilisateurs.

## 📞 Support

Pour toute question ou problème concernant cette fonctionnalité, contactez l'équipe de développement ou consultez la documentation complète du projet.

---

**Date de création** : 2 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Fonctionnel

