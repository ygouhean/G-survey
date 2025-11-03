# Validation des Types de Questions

Ce document décrit les améliorations apportées aux types de questions Email, Téléphone et le nouveau type Nombre.

## 📧 Question de type Email

### Fonctionnalités

1. **Validation stricte obligatoire**
   - Validation en temps réel pendant la saisie
   - Validation JavaScript avant la soumission du sondage
   - **Impossible de soumettre** un email invalide
   - Regex stricte : `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`

2. **Format requis**
   - L'email doit être au format standard : `utilisateur@domaine.extension`
   - Exemple : `jean.dupont@entreprise.com`
   - Minimum 2 caractères pour l'extension (.fr, .com, etc.)
   - Accepte les points, underscores, tirets et symboles + dans la partie locale

3. **Validation visuelle en temps réel**
   - 🔴 **Bordure rouge** + message d'erreur si l'email est invalide
   - 🟢 **Bordure verte** + message "✅ Adresse email valide" si l'email est correct
   - ⚪ **Bordure normale** si le champ est vide
   - Messages d'erreur explicites avec format attendu

4. **Blocage de soumission**
   - Si un email est invalide, une alerte s'affiche : 
     ```
     ❌ L'adresse email "123" n'est pas valide.
     
     Format attendu : exemple@domaine.com
     ```
   - Le sondage ne peut pas être soumis tant que l'email n'est pas corrigé

### Configuration dans le SurveyBuilder

```typescript
{
  type: 'email',
  label: 'Votre adresse email',
  placeholder: 'exemple@email.com', // Optionnel
  required: true // Optionnel
}
```

### Exemples de validation

| Entrée utilisateur | Résultat | Message affiché |
|-------------------|----------|-----------------|
| `123` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `@example.com` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example.c` | ❌ INVALIDE | ❌ Format email invalide (exemple: nom@domaine.com) |
| `test@example.com` | ✅ VALIDE | ✅ Adresse email valide |
| `jean.dupont@entreprise.fr` | ✅ VALIDE | ✅ Adresse email valide |
| `user+tag@domain.co.uk` | ✅ VALIDE | ✅ Adresse email valide |

### États visuels du champ

**État 1 : Champ vide (initial)**
```
┌────────────────────────────────────┐
│ [exemple@email.com______________] │ ← Bordure normale
│ 📧 Format attendu : nom@domaine.com│ ← Message gris
└────────────────────────────────────┘
```

**État 2 : Email invalide pendant la saisie**
```
┌────────────────────────────────────┐
│ [123_________________________] │ ← Bordure rouge
│ ❌ Format email invalide           │ ← Message rouge
│    (exemple: nom@domaine.com)      │
└────────────────────────────────────┘
```

**État 3 : Email valide**
```
┌────────────────────────────────────┐
│ [jean@example.com______________] │ ← Bordure verte
│ ✅ Adresse email valide            │ ← Message vert
└────────────────────────────────────┘
```

---

## 📞 Question de type Téléphone

### Fonctionnalités

1. **Code indicatif pays configurable**
   - L'administrateur peut définir un code indicatif pays (ex: +225, +33, +1)
   - Le code s'affiche automatiquement dans un badge séparé
   - Le code n'est pas modifiable par l'utilisateur lors de la réponse

2. **Validation stricte des chiffres**
   - Seuls les chiffres (0-9) peuvent être saisis
   - Tous les autres caractères sont automatiquement supprimés
   - Utilise `inputMode="numeric"` pour afficher le clavier numérique sur mobile

3. **Interface utilisateur**
   - Le code indicatif s'affiche dans un badge à gauche du champ
   - Message d'aide dynamique selon la présence du code indicatif
   - Placeholder par défaut : `0712345678`

### Configuration dans le SurveyBuilder

```typescript
{
  type: 'phone',
  label: 'Votre numéro de téléphone',
  phoneConfig: {
    countryCode: '+225' // Optionnel - Code indicatif pays
  },
  placeholder: '0712345678', // Optionnel
  required: true // Optionnel
}
```

### Exemples d'utilisation

**Avec code indicatif :**
```
Configuration : countryCode = '+225'
Affichage : [+225] [__________]
Saisie : 0712345678
Résultat stocké : "0712345678"
```

**Sans code indicatif :**
```
Configuration : pas de countryCode
Affichage : [__________]
Saisie : 0712345678
Résultat stocké : "0712345678"
```

---

## 🔢 Question de type Nombre

### Fonctionnalités

1. **Nouveau type de question**
   - Ajouté spécifiquement pour la saisie de valeurs numériques
   - Utilise `type="number"` pour le champ HTML

2. **Validation native**
   - Seuls les chiffres peuvent être saisis
   - Accepte les nombres entiers et décimaux
   - Supporte les nombres négatifs

3. **Interface utilisateur**
   - Icône : 🔢
   - Placeholder par défaut : `Entrez un nombre`
   - Message d'aide : "🔢 Seuls les chiffres sont autorisés"
   - Affiche les contrôles +/- sur desktop

### Configuration dans le SurveyBuilder

```typescript
{
  type: 'number',
  label: 'Combien de personnes dans votre foyer ?',
  placeholder: 'Ex: 5', // Optionnel
  required: true // Optionnel
}
```

### Cas d'usage

- Nombre de personnes dans un foyer
- Âge (si vous ne voulez pas utiliser les ranges démographiques)
- Quantités
- Scores numériques
- Budgets ou montants
- Distances
- Températures
- etc.

---

## 🎨 Aperçu visuel

### Dans le SurveyBuilder

Les trois types apparaissent maintenant dans la palette de questions :

```
📝 Texte libre
🔢 Nombre ← NOUVEAU
📧 Email
📞 Téléphone
...
```

### Dans la prévisualisation mobile

Chaque type affiche maintenant des informations contextuelles :

**Email :**
```
┌─────────────────────────────────┐
│ [exemple@email.com___________] │
│ 📧 Email valide requis          │
└─────────────────────────────────┘
```

**Téléphone (avec code) :**
```
┌─────────────────────────────────┐
│ [+225] [0712345678___________]  │
│ 📞 Chiffres uniquement          │
└─────────────────────────────────┘
```

**Nombre :**
```
┌─────────────────────────────────┐
│ [123________________] [▲] [▼]   │
│ 🔢 Chiffres uniquement          │
└─────────────────────────────────┘
```

---

## 🔧 Configuration pour l'administrateur

### Type Email

1. Aller dans "Ajouter une question"
2. Cliquer sur "📧 Email"
3. Renseigner le label de la question
4. (Optionnel) Définir un placeholder personnalisé
5. Cocher "Requis" si nécessaire

### Type Téléphone

1. Aller dans "Ajouter une question"
2. Cliquer sur "📞 Téléphone"
3. Renseigner le label de la question
4. **Configurer le code indicatif pays** :
   - Entrer le code avec le + (ex: `+225`)
   - Le code sera affiché automatiquement lors de la réponse
5. (Optionnel) Définir un placeholder personnalisé
6. Cocher "Requis" si nécessaire

### Type Nombre

1. Aller dans "Ajouter une question"
2. Cliquer sur "🔢 Nombre"
3. Renseigner le label de la question
4. (Optionnel) Définir un placeholder personnalisé
5. Cocher "Requis" si nécessaire

---

## 📱 Expérience utilisateur sur mobile

### Email
- Le clavier email s'affiche automatiquement (avec @ et .)
- Validation en temps réel lors de la soumission

### Téléphone
- Le clavier numérique s'affiche automatiquement
- Le code indicatif est visible et non modifiable
- Impossible de saisir des lettres ou caractères spéciaux

### Nombre
- Le clavier numérique s'affiche automatiquement
- Boutons +/- pour incrémenter/décrémenter sur certains appareils

---

## ✅ Avantages

1. **Validation améliorée** : Les données collectées sont plus fiables
2. **Meilleure UX** : Les utilisateurs reçoivent des indications claires
3. **Clavier adapté** : Sur mobile, le bon clavier s'affiche automatiquement
4. **Moins d'erreurs** : La validation en temps réel réduit les erreurs de saisie
5. **Standardisation** : Les formats de téléphone sont cohérents avec le code indicatif

---

## 🚀 Prochaines étapes possibles

- Ajouter une validation de longueur min/max pour les téléphones
- Permettre de formater automatiquement les numéros de téléphone (espaces, tirets)
- Ajouter des min/max pour le type nombre
- Supporter les formats email internationaux avec accents

---

## 📝 Fichiers modifiés

1. `src/components/SurveyBuilder.tsx`
   - Ajout de `phoneConfig` dans l'interface `Question`
   - Ajout du type "number" dans `questionTypes`
   - Configuration du code indicatif pour le téléphone

2. `src/pages/surveys/SurveyRespond.tsx`
   - Validation email avec pattern
   - Affichage du code indicatif et validation des chiffres pour téléphone
   - Rendu du nouveau type nombre

3. `src/pages/surveys/SurveyCreate.tsx`
   - Preview améliorée pour email, téléphone et nombre

---

**Date de mise à jour** : 2 novembre 2025
**Version** : 1.0

