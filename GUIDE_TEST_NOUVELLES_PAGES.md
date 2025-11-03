# Guide de Test - Nouvelles Pages d'Accueil et d'Authentification

## 🚀 Démarrage Rapide

### 1. Lancer l'Application

#### Backend :
```powershell
cd server
npm start
```

#### Frontend (dans un nouveau terminal) :
```powershell
npm run dev
```

L'application sera accessible à : **http://localhost:5173/**

## 🧪 Tests à Effectuer

### Test 1 : Page d'Accueil ✅

1. **Accéder à la page d'accueil**
   - Ouvrir http://localhost:5173/
   - Vérifier que la page s'affiche correctement

2. **Vérifier les éléments**
   - Logo G-Survey en haut à gauche
   - Boutons "Se connecter" et "S'inscrire" en haut à droite
   - Section hero avec titre et description
   - Section statistiques (500+ agents, 10k+ points, etc.)
   - Section fonctionnalités (6 cartes)
   - Section témoignages (3 cartes)
   - Footer complet

3. **Tester la navigation**
   - Cliquer sur "S'inscrire" → doit aller vers /register
   - Revenir et cliquer sur "Se connecter" → doit aller vers /login
   - Cliquer sur "Conditions d'utilisation" dans le footer → doit aller vers /terms
   - Cliquer sur "Politique de confidentialité" dans le footer → doit aller vers /privacy

### Test 2 : Page d'Inscription ✅

1. **Accéder à la page**
   - Aller sur http://localhost:5173/register
   - Vérifier l'image de fond et le formulaire

2. **Tester la validation**
   - Essayer de soumettre le formulaire vide → messages d'erreur
   - Entrer un email invalide → message d'erreur
   - Entrer un mot de passe trop court → message d'erreur
   - Entrer des mots de passe différents → message d'erreur
   - Ne pas cocher les conditions → message d'erreur

3. **Créer un compte**
   ```
   Nom: Test
   Prénoms: Utilisateur
   Genre: Homme (optionnel)
   Nom d'utilisateur: testuser123
   Email: test@example.com
   Mot de passe: Test@1234
   Confirmer mot de passe: Test@1234
   Pays: France (optionnel)
   Secteur: Technologie (optionnel)
   Type d'organisation: Startup (optionnel)
   ☑ J'accepte les conditions
   ```

4. **Vérifier le résultat**
   - Message de succès affiché
   - Redirection automatique vers le dashboard après 1-2 secondes
   - Utilisateur connecté automatiquement

### Test 3 : Page de Connexion ✅

1. **Accéder à la page**
   - Aller sur http://localhost:5173/login
   - Vérifier l'image de fond et le formulaire

2. **Tester avec les identifiants de démo**
   ```
   Email: admin@gsurvey.com
   Mot de passe: Admin@123
   ```

3. **Vérifier**
   - Connexion réussie
   - Redirection vers le dashboard
   - Voir le nom de l'utilisateur dans le header

4. **Tester les liens**
   - Cliquer sur "Mot de passe oublié ?" → /forgot-password
   - Cliquer sur "S'inscrire" → /register
   - Cliquer sur les liens légaux → /terms et /privacy

5. **Se déconnecter**
   - Cliquer sur le bouton de déconnexion
   - Vérifier la redirection vers la page d'accueil

### Test 4 : Page Mot de Passe Oublié ✅

1. **Accéder à la page**
   - Aller sur http://localhost:5173/forgot-password
   - Vérifier l'image de fond

2. **Tester la validation**
   - Entrer un email invalide → message d'erreur
   - Laisser le champ vide → message d'erreur

3. **Envoyer une demande**
   - Entrer: test@example.com
   - Cliquer sur "Envoyer le lien de réinitialisation"
   - Vérifier le message de succès
   - Voir les instructions de vérification de boîte mail

4. **Tester la navigation**
   - Cliquer sur "Retour à la connexion" → /login

### Test 5 : Pages Légales ✅

#### Conditions d'Utilisation
1. **Accéder à la page**
   - Aller sur http://localhost:5173/terms
   - Vérifier le contenu complet

2. **Vérifier**
   - Navigation avec logo
   - Bouton "Retour"
   - 11 sections de conditions
   - Informations de contact

#### Politique de Confidentialité
1. **Accéder à la page**
   - Aller sur http://localhost:5173/privacy
   - Vérifier le contenu complet

2. **Vérifier**
   - Navigation avec logo
   - Bouton "Retour"
   - 11 sections de politique
   - Informations DPO et contact

### Test 6 : Navigation Générale ✅

1. **Utilisateur non connecté**
   - Aller sur / → voir page d'accueil
   - Essayer d'aller sur /dashboard → redirection vers /login

2. **Utilisateur connecté**
   - Se connecter avec admin@gsurvey.com
   - Aller sur / → redirection automatique vers /dashboard
   - Essayer d'aller sur /login → redirection vers /dashboard
   - Essayer d'aller sur /register → redirection vers /dashboard

### Test 7 : Responsive Design ✅

1. **Tester différentes tailles d'écran**
   - Ouvrir les DevTools (F12)
   - Activer le mode responsive
   - Tester les tailles :
     - Mobile (375px)
     - Tablette (768px)
     - Desktop (1024px, 1920px)

2. **Vérifier sur chaque page**
   - Landing page
   - Register
   - Login
   - Forgot password
   - Terms
   - Privacy

3. **Points à vérifier**
   - Menus adaptés
   - Formulaires utilisables
   - Textes lisibles
   - Images bien dimensionnées
   - Pas de défilement horizontal

### Test 8 : Mode Sombre ✅

1. **Activer le mode sombre**
   - Dans les paramètres du navigateur OU
   - Dans les paramètres de l'application (si disponible)

2. **Vérifier toutes les pages**
   - Contraste correct
   - Textes lisibles
   - Boutons visibles
   - Images avec overlay adapté

## 🐛 Problèmes Connus et Solutions

### Problème : Images de fond ne se chargent pas
**Solution** : Vérifier la connexion Internet (images hébergées sur Unsplash)

### Problème : "Email déjà utilisé" lors de l'inscription
**Solution** : Utiliser un email différent ou vérifier la base de données

### Problème : Erreur 500 lors de l'inscription
**Solution** : 
- Vérifier que le serveur backend est lancé
- Vérifier la connexion à la base de données
- Consulter les logs du serveur

### Problème : Redirection automatique ne fonctionne pas
**Solution** :
- Vider le cache du navigateur
- Vérifier le localStorage (DevTools > Application > Local Storage)

## 📊 Checklist de Test Complète

### Page d'Accueil
- [ ] Navigation header affichée correctement
- [ ] Section hero avec titre et boutons
- [ ] Section statistiques (4 cartes)
- [ ] Section fonctionnalités (6 cartes)
- [ ] Section témoignages (3 cartes)
- [ ] Section CTA
- [ ] Footer avec liens
- [ ] Tous les liens fonctionnent
- [ ] Responsive sur mobile/tablette/desktop

### Page d'Inscription
- [ ] Formulaire complet affiché
- [ ] Tous les champs présents
- [ ] Validation des champs fonctionne
- [ ] Boutons show/hide password fonctionnent
- [ ] Sélecteurs de pays/secteur/type fonctionnent
- [ ] Case à cocher conditions fonctionne
- [ ] Liens vers terms/privacy fonctionnent
- [ ] Soumission réussie
- [ ] Messages d'erreur clairs
- [ ] Auto-login après inscription
- [ ] Redirection vers dashboard

### Page de Connexion
- [ ] Formulaire affiché
- [ ] Champ identifiant unique fonctionne
- [ ] Lien "mot de passe oublié" fonctionne
- [ ] Connexion avec email fonctionne
- [ ] Messages d'erreur clairs
- [ ] Identifiants de démo affichés
- [ ] Lien vers inscription fonctionne
- [ ] Liens légaux fonctionnent
- [ ] Redirection après connexion

### Page Mot de Passe Oublié
- [ ] Formulaire affiché
- [ ] Validation email fonctionne
- [ ] Message de succès affiché
- [ ] Instructions claires
- [ ] Bouton retour fonctionne
- [ ] Liens légaux fonctionnent

### Pages Légales
- [ ] Terms : contenu complet affiché
- [ ] Terms : navigation fonctionne
- [ ] Privacy : contenu complet affiché
- [ ] Privacy : navigation fonctionne
- [ ] Liens retour fonctionnent

### Backend
- [ ] Route POST /api/auth/register fonctionne
- [ ] Route POST /api/auth/login fonctionne
- [ ] Route POST /api/auth/forgot-password fonctionne
- [ ] Validation des données côté serveur
- [ ] Génération de token JWT
- [ ] Hachage des mots de passe

## ✨ Fonctionnalités à Tester en Détail

### Auto-login après Inscription
1. S'inscrire avec un nouvel utilisateur
2. Observer la console réseau (DevTools > Network)
3. Vérifier que le token JWT est reçu
4. Vérifier que l'Authorization header est défini
5. Vérifier la redirection automatique
6. Vérifier que l'utilisateur est bien connecté

### Gestion des Erreurs
1. Tester avec connexion Internet coupée
2. Tester avec backend arrêté
3. Tester avec données invalides
4. Vérifier que les messages d'erreur sont clairs

### Persistance de Session
1. Se connecter
2. Rafraîchir la page (F5)
3. Vérifier que l'utilisateur reste connecté
4. Fermer et rouvrir le navigateur
5. Vérifier que l'utilisateur reste connecté (localStorage)

## 📝 Rapporter un Bug

Si vous trouvez un bug, notez :
1. **Page concernée** : URL exacte
2. **Action effectuée** : Ce que vous avez fait
3. **Résultat attendu** : Ce qui devrait se passer
4. **Résultat obtenu** : Ce qui s'est réellement passé
5. **Console** : Erreurs dans la console (F12 > Console)
6. **Navigateur** : Version et nom du navigateur
7. **Captures d'écran** : Si possible

## 🎉 Test Réussi !

Si tous les tests passent :
- ✅ Les pages sont fonctionnelles
- ✅ Le design est professionnel
- ✅ L'expérience utilisateur est fluide
- ✅ L'application est prête pour la démo

---

**Bon test ! 🚀**


