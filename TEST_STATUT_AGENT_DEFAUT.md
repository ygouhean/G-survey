# ⚡ Test Rapide : Statut Agent par Défaut

## 🎯 Objectif
Vérifier que les nouveaux utilisateurs reçoivent automatiquement le statut "Agent de terrain" et voient le message d'information.

## ⏱️ Durée Estimée
3 minutes

## 🚀 Préparation

**Redémarrer le serveur backend** :
```bash
cd server
npm start
```

Le frontend se met à jour automatiquement.

## ✅ Test Complet

### Étape 1 : Créer un Nouveau Compte (1 minute)

1. **Aller sur** http://localhost:5173/

2. **Cliquer** sur "S'inscrire"

3. **Remplir** le formulaire :
   ```
   Nom: Nouvel
   Prénoms: Agent
   Genre: Homme
   Nom d'utilisateur: nouvelagent2025
   Email: agent2025@example.com
   Mot de passe: Agent@123
   Confirmer: Agent@123
   ☑ J'accepte les conditions
   ```

4. **Cliquer** "S'inscrire"

5. **Vérifier** :
   - ✅ Message "Inscription réussie"
   - ✅ Auto-connexion fonctionne
   - ✅ Redirection vers Dashboard

### Étape 2 : Vérifier le Message d'Information (1 minute)

Sur le Dashboard, **vérifier que vous voyez** :

```
┌─────────────────────────────────────────────┐
│ ℹ️  🎯 Compte créé avec succès !            │
│                                             │
│ Votre inscription a été validée.           │
│ Vous avez le statut Agent de terrain.      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 📋 Prochaines étapes :              │   │
│ │                                      │   │
│ │ 1️⃣ Contacter admin/superviseur     │   │
│ │ 2️⃣ Attendre assignation            │   │
│ │ 3️⃣ Commencer collecte données       │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ 📧 En attendant, complétez votre profil    │
└─────────────────────────────────────────────┘
```

**Points à vérifier** :
- ✅ Bannière bleue visible
- ✅ Titre "🎯 Compte créé avec succès !"
- ✅ Mention du statut "Agent de terrain"
- ✅ 3 étapes numérotées
- ✅ Lien vers "Paramètres" cliquable

### Étape 3 : Vérifier le Rôle (30 secondes)

1. **Cliquer** sur le lien "Paramètres" dans le message

2. **Aller dans** l'onglet "Profil"

3. **Vérifier** : Sous votre nom, vous voyez "👤 field agent"

### Étape 4 : Vérification Admin (30 secondes)

1. **Se déconnecter** (bouton en haut à droite)

2. **Se connecter** en tant qu'admin :
   ```
   Email: admin@gsurvey.com
   Mot de passe: Admin@123
   ```

3. **Aller dans** Utilisateurs (menu latéral)

4. **Trouver** "Nouvel Agent"

5. **Vérifier** :
   - ✅ Badge rôle : "👤 Agent" (vert)
   - ✅ Statut : "Actif"
   - ✅ Visible dans la liste

### Étape 5 : Test Assignation (Optionnel - 1 minute)

1. **Rester connecté** en tant qu'admin

2. **Modifier** l'utilisateur "Nouvel Agent"
   - Cliquer sur ✏️

3. **Noter** : L'admin peut changer le rôle si besoin

4. **Se déconnecter** et **se reconnecter** en tant que nouvel agent

5. **Si assigné à une équipe** : Bannière verte apparaît
   ```
   ✅ Vous êtes assigné à une équipe ! 🎉
   Vous pouvez maintenant accéder aux sondages
   qui vous sont assignés.
   ```

## 📊 Checklist Complète

### Inscription
- [ ] Formulaire d'inscription fonctionne
- [ ] Auto-connexion après inscription
- [ ] Redirection vers Dashboard

### Message d'Information
- [ ] Bannière bleue visible
- [ ] Titre "🎯 Compte créé avec succès !"
- [ ] Mention "Agent de terrain"
- [ ] Encadré "📋 Prochaines étapes"
- [ ] 3 étapes listées :
  - [ ] 1️⃣ Contacter admin/superviseur
  - [ ] 2️⃣ Assignation à une équipe
  - [ ] 3️⃣ Commencer collecte
- [ ] Icône email visible
- [ ] Lien "Paramètres" fonctionne
- [ ] Design responsive

### Rôle Utilisateur
- [ ] Profil affiche "👤 field agent"
- [ ] Admin voit "👤 Agent" dans la liste
- [ ] Statut "Actif" par défaut

### Comportement
- [ ] Message persiste après navigation
- [ ] Message persiste après F5
- [ ] Message disparaît si assigné à équipe
- [ ] Bannière verte si assigné

### Admin
- [ ] Admin ne voit PAS le message
- [ ] Superviseur ne voit PAS le message
- [ ] Seuls les agents sans équipe voient le message

## 🎨 Aperçu Visuel

### Bannière Agent sans Équipe (Bleu)

**Apparence** :
- 🔵 Fond bleu clair
- 📱 Barre bleue à gauche
- ℹ️ Icône d'information
- 📋 Liste avec numéros
- 📧 Icône email en bas
- 🔗 Lien souligné vers Paramètres

**Taille** :
- Pleine largeur du Dashboard
- Hauteur adaptative au contenu
- Padding généreux

### Bannière Agent avec Équipe (Vert)

**Apparence** :
- 🟢 Fond vert clair
- 📱 Barre verte à gauche
- ✅ Icône de succès
- 💬 Message court
- 🎉 Emoji de célébration

## 🐛 Problèmes Possibles

### La bannière ne s'affiche pas

**Solutions** :
1. Vérifier que vous êtes bien connecté en tant qu'agent
2. Vérifier que `user.role === 'field_agent'`
3. Vérifier que `user.teamId === null` ou `undefined`
4. Vider le cache : Ctrl+Shift+Delete
5. Rafraîchir : F5

### Le nouveau compte a un rôle "supervisor"

**Solution** :
- Vérifier que le serveur backend a bien été redémarré
- Vérifier le fichier `server/routes/auth.js` ligne 78
- Devrait être : `role: 'field_agent'`

### Le lien "Paramètres" ne fonctionne pas

**Solution** :
- Vérifier dans la console (F12)
- S'assurer que React Router fonctionne
- Essayer de cliquer directement sur le menu "Paramètres"

## 📈 Résultats Attendus

### Pour un Nouvel Agent

```
✅ Statut : Agent de terrain
✅ Bannière : Bleue (information)
✅ Message : Complet avec 3 étapes
✅ Lien : Vers Paramètres fonctionne
✅ Persistant : Après navigation et F5
```

### Pour un Admin

```
✅ Pas de bannière d'information
✅ Accès direct aux fonctionnalités
✅ Section "Actions Rapides" visible
✅ Peut créer des sondages
```

### Pour un Agent Assigné

```
✅ Bannière : Verte (succès)
✅ Message : Court et positif
✅ Accès : Aux sondages assignés
```

## 🎯 Scénario Complet

### Minute 0:00 - Inscription
```
User arrive sur la page d'accueil
     ↓
Clique "S'inscrire"
     ↓
Remplit le formulaire
     ↓
Soumission
```

### Minute 1:00 - Confirmation
```
Message "Inscription réussie"
     ↓
Auto-connexion
     ↓
Redirection Dashboard
```

### Minute 1:30 - Information
```
Dashboard se charge
     ↓
Bannière bleue apparaît
     ↓
User lit les instructions
     ↓
Comprend qu'il doit contacter admin
```

### Minute 2:00 - Exploration
```
User clique sur lien "Paramètres"
     ↓
Complète son profil
     ↓
Voit son rôle : Agent de terrain
```

### Minute 2:30 - Vérification Admin
```
User se déconnecte
     ↓
Admin se connecte
     ↓
Voit le nouvel agent dans la liste
     ↓
Peut l'assigner quand prêt
```

## ✅ Test Réussi Si...

**Tous ces points sont vérifiés** :

1. ✅ Inscription fonctionne
2. ✅ Rôle = Agent de terrain
3. ✅ Bannière bleue visible
4. ✅ Message complet et clair
5. ✅ 3 étapes affichées
6. ✅ Lien Paramètres fonctionne
7. ✅ Admin voit le nouvel utilisateur
8. ✅ Badge agent dans la liste

**Alors** :
```
🎉 Le système fonctionne parfaitement !
✅ Les nouveaux utilisateurs sont bien guidés
✅ Le processus d'onboarding est clair
✅ L'admin garde le contrôle
```

## 📚 Documentation Complète

Pour plus de détails : `STATUT_AGENT_PAR_DEFAUT.md`

---

**Durée réelle** : 3 minutes  
**Difficulté** : Facile  
**Statut** : ✅ Prêt pour test

**Bon test ! 🚀**

