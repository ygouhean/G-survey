# Guide de Test - Validation des Types de Questions

## 🧪 Tests à effectuer

### Test 1 : Type Email avec validation stricte

**Objectif** : Vérifier que seules les adresses email valides sont acceptées

#### Étapes :
1. Aller sur "Sondages" > "Créer un sondage"
2. Cliquer sur "📧 Email" dans la palette de questions
3. Renseigner le label : "Quelle est votre adresse email professionnelle ?"
4. Cocher "Requis"
5. Activer le sondage et aller sur "Répondre au sondage"

#### Tests de validation EN TEMPS RÉEL (pendant la saisie) :

| Saisie | Bordure attendue | Message attendu |
|--------|------------------|-----------------|
| `123` | 🔴 Rouge | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test` | 🔴 Rouge | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@` | 🔴 Rouge | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example` | 🔴 Rouge | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example.c` | 🔴 Rouge | ❌ Format email invalide (minimum 2 caractères pour l'extension) |
| `@example.com` | 🔴 Rouge | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example.com` | 🟢 Vert | ✅ Adresse email valide |
| `jean.dupont@entreprise.fr` | 🟢 Vert | ✅ Adresse email valide |
| `user+tag@domain.co.uk` | 🟢 Vert | ✅ Adresse email valide |

#### Tests de validation À LA SOUMISSION :
1. **Essayer de soumettre avec `123`** :
   - ❌ Une alerte doit apparaître : 
     ```
     ❌ L'adresse email "123" n'est pas valide.
     
     Format attendu : exemple@domaine.com
     ```
   - Le sondage ne doit PAS être soumis

2. **Essayer de soumettre avec `test@example.com`** :
   - ✅ Le sondage doit être soumis avec succès
   - Message : "✅ Réponse soumise avec succès !"

3. **Laisser vide (si requis)** :
   - ❌ Une alerte doit apparaître : "Veuillez répondre à toutes les questions requises"
   - Le sondage ne doit PAS être soumis

#### Résultats attendus :
- ✅ Validation en temps réel avec bordures colorées
- ✅ Messages d'erreur clairs et explicites
- ✅ Blocage de soumission si email invalide
- ✅ Le clavier email s'affiche sur mobile
- ✅ Impossible de contourner la validation

---

### Test 2 : Type Téléphone SANS code indicatif

**Objectif** : Vérifier que seuls les chiffres sont acceptés

#### Étapes :
1. Créer une nouvelle question de type "📞 Téléphone"
2. Renseigner le label : "Votre numéro de téléphone"
3. NE PAS renseigner de code indicatif
4. Placeholder : "0712345678"
5. Activer et tester

#### Tests de validation :
- ✅ Essayer d'entrer : `0712345678` → Devrait être accepté
- ❌ Essayer d'entrer : `07-12-34-56-78` → Les tirets devraient être supprimés automatiquement
- ❌ Essayer d'entrer : `abcd` → Les lettres devraient être supprimées automatiquement
- ❌ Essayer d'entrer : `07 12 34 56 78` → Les espaces devraient être supprimés

#### Résultats attendus :
- Seuls les chiffres apparaissent dans le champ
- Le message "📞 Seuls les chiffres sont autorisés" s'affiche
- Le clavier numérique s'affiche sur mobile

---

### Test 3 : Type Téléphone AVEC code indicatif

**Objectif** : Vérifier que le code indicatif s'affiche correctement

#### Étapes :
1. Créer une nouvelle question de type "📞 Téléphone"
2. Renseigner le label : "Votre téléphone portable"
3. **Code indicatif pays** : `+225` (Côte d'Ivoire)
4. Placeholder : "0712345678"
5. Activer et tester

#### Tests de validation :
- ✅ Le badge `+225` s'affiche à gauche du champ
- ✅ Essayer d'entrer : `0712345678` → Devrait être accepté
- ❌ Essayer de modifier le code `+225` → Ne devrait PAS être possible
- ❌ Essayer d'entrer des lettres → Devrait être refusé

#### Résultats attendus :
- Le code indicatif est visible dans un badge séparé
- Le message "📞 Seuls les chiffres sont autorisés (code +225 ajouté automatiquement)" s'affiche
- L'utilisateur ne peut pas modifier le code indicatif

---

### Test 4 : Type Nombre

**Objectif** : Vérifier que seuls les nombres sont acceptés

#### Étapes :
1. Créer une nouvelle question de type "🔢 Nombre"
2. Renseigner le label : "Combien de personnes dans votre foyer ?"
3. Placeholder : "Ex: 5"
4. Activer et tester

#### Tests de validation :
- ✅ Essayer d'entrer : `5` → Devrait être accepté
- ✅ Essayer d'entrer : `123` → Devrait être accepté
- ✅ Essayer d'entrer : `-10` → Devrait être accepté (nombre négatif)
- ✅ Essayer d'entrer : `3.14` → Devrait être accepté (nombre décimal)
- ❌ Essayer d'entrer : `abc` → Devrait être refusé

#### Résultats attendus :
- Le message "🔢 Seuls les chiffres sont autorisés" s'affiche
- Le clavier numérique s'affiche sur mobile
- Les boutons +/- s'affichent (sur desktop)

---

### Test 5 : Prévisualisation Mobile

**Objectif** : Vérifier que tous les types s'affichent correctement dans la preview

#### Étapes :
1. Créer un nouveau sondage
2. Ajouter une question de type "📧 Email"
3. Ajouter une question de type "📞 Téléphone" avec code `+33`
4. Ajouter une question de type "🔢 Nombre"
5. Observer la section "📱 Prévisualisation Mobile"

#### Résultats attendus :
- **Email** : Input avec placeholder et message "📧 Email valide requis"
- **Téléphone** : Badge du code indicatif + input + message "📞 Chiffres uniquement"
- **Nombre** : Input numérique + message "🔢 Chiffres uniquement"

---

### Test 6 : Édition de questions existantes

**Objectif** : Vérifier que les configurations sont bien sauvegardées

#### Étapes :
1. Créer un sondage avec une question téléphone (code `+225`)
2. Enregistrer comme brouillon
3. Aller dans "Modifier le sondage"
4. Vérifier que le code indicatif `+225` est toujours présent

#### Résultats attendus :
- Le code indicatif est préservé
- Toutes les configurations sont sauvegardées

---

## 📊 Checklist de validation

### Type Email
- [ ] Validation HTML5 fonctionne
- [ ] Pattern regex accepte les emails valides
- [ ] Pattern regex rejette les emails invalides
- [ ] Message d'aide affiché
- [ ] Clavier email sur mobile
- [ ] Preview correcte

### Type Téléphone
- [ ] Code indicatif configurable
- [ ] Code indicatif affiché dans un badge
- [ ] Seuls les chiffres acceptés
- [ ] Lettres et caractères spéciaux supprimés automatiquement
- [ ] Message d'aide dynamique
- [ ] Clavier numérique sur mobile
- [ ] Preview correcte avec et sans code

### Type Nombre
- [ ] Nouveau type visible dans la palette
- [ ] Input numérique fonctionne
- [ ] Nombres entiers acceptés
- [ ] Nombres décimaux acceptés
- [ ] Nombres négatifs acceptés
- [ ] Message d'aide affiché
- [ ] Clavier numérique sur mobile
- [ ] Preview correcte

### Général
- [ ] Aucune erreur de linter
- [ ] Aucune erreur console
- [ ] Sauvegarde et chargement corrects
- [ ] Compatible mobile et desktop
- [ ] Documentation créée

---

## 🐛 Bugs possibles à surveiller

1. **Email** : 
   - Emails avec accents (é, à, ô) pourraient être rejetés
   - Emails très longs pourraient déborder

2. **Téléphone** :
   - Code indicatif sans "+" pourrait poser problème
   - Très longs numéros pourraient déborder

3. **Nombre** :
   - Nombres très grands (> 1000000) pourraient poser problème
   - Notation scientifique (1e5) pourrait être mal gérée

---

## 📱 Tests sur différents appareils

- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Safari
- [ ] Mobile Android Chrome
- [ ] Mobile iOS Safari
- [ ] Tablette Android
- [ ] Tablette iOS

---

## ✅ Résultat final

**Toutes les fonctionnalités implémentées :**
1. ✅ Type Email avec validation
2. ✅ Type Téléphone avec code indicatif configurable
3. ✅ Type Nombre pour chiffres uniquement
4. ✅ Prévisualisation mobile correcte
5. ✅ Documentation complète

**Date de test** : __________
**Testeur** : __________
**Statut** : [ ] PASS [ ] FAIL

---

## 📞 En cas de problème

Si vous rencontrez un bug, veuillez noter :
1. Le type de question concerné
2. L'action effectuée
3. Le résultat attendu
4. Le résultat obtenu
5. Le navigateur/appareil utilisé
6. Une capture d'écran si possible

