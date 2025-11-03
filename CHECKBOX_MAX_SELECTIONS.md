# Limitation du Nombre de Sélections - Questions à Choix Multiples

## 📋 Fonctionnalité

Vous pouvez maintenant définir un **nombre maximum de réponses** que l'enquêté peut sélectionner pour les questions de type "Cases à cocher" (Checkbox).

## 🎯 Utilisation

### Étape 1 : Créer une Question à Choix Multiples

1. Allez sur **Sondages** > **Créer un sondage**
2. Cliquez sur **☑️ Cases à cocher** dans la section "Ajouter une question"

### Étape 2 : Configurer les Options

1. Cliquez sur **▶ Options** pour déplier la section
2. Ajoutez vos différentes options de réponse
3. Utilisez **+ Ajouter une option** pour ajouter plus de choix

### Étape 3 : Définir le Nombre Maximum de Sélections

1. Dans la section qui apparaît en dessous des options
2. Trouvez le champ **"Nombre maximum de sélections"**
3. Entrez le nombre maximum de réponses autorisées (exemple: 3)
4. **Note** : Laissez le champ vide pour permettre une sélection illimitée

## 🎨 Comportement lors de la Réponse

### Message Informatif
Un message s'affiche en haut de la question :
```
ℹ️ Sélectionnez maximum 3 options (2/3)
```

Le compteur `(2/3)` montre :
- Le nombre actuel de sélections
- Le nombre maximum autorisé

### Validation Automatique
- ✅ L'utilisateur peut sélectionner jusqu'au maximum défini
- ⚠️ Une fois le maximum atteint, les options non sélectionnées sont **désactivées**
- 🔄 L'utilisateur peut décocher une option pour en sélectionner une autre
- 🎨 Les options désactivées apparaissent en grisé (opacité 50%)

### Exemple Visuel

**Avant d'atteindre le maximum :**
```
ℹ️ Sélectionnez maximum 2 options (1/2)

☑ Option 1 (sélectionné)
☐ Option 2 (cliquable)
☐ Option 3 (cliquable)
☐ Option 4 (cliquable)
```

**Après avoir atteint le maximum :**
```
ℹ️ Sélectionnez maximum 2 options (2/2)

☑ Option 1 (sélectionné)
☑ Option 2 (sélectionné)
☐ Option 3 (désactivé, grisé)
☐ Option 4 (désactivé, grisé)
```

## 💡 Cas d'Usage

### Sondage de Préférences
**Question** : Quelles sont vos 3 fonctionnalités préférées ?
- **Maximum** : 3 sélections
- Force l'utilisateur à prioriser ses choix

### Questionnaire de Compétences
**Question** : Sélectionnez jusqu'à 5 compétences que vous maîtrisez
- **Maximum** : 5 sélections
- Évite les réponses trop nombreuses

### Enquête de Disponibilité
**Question** : Choisissez 2 créneaux horaires qui vous conviennent
- **Maximum** : 2 sélections
- Facilite la planification

### Feedback Produit
**Question** : Quels sont les 3 problèmes principaux rencontrés ?
- **Maximum** : 3 sélections
- Identifie les priorités

## 🔧 Configuration Technique

### Dans SurveyBuilder
```typescript
interface Question {
  ...
  maxSelections?: number  // Nombre max de sélections (undefined = illimité)
  ...
}
```

### Validation
- **Min** : 1
- **Max** : Nombre total d'options disponibles
- **Par défaut** : Illimité (undefined)

## 📁 Fichiers Modifiés

- `src/components/SurveyBuilder.tsx` : Interface de configuration
- `src/pages/surveys/SurveyRespond.tsx` : Validation et affichage lors de la réponse
- `src/pages/surveys/SurveyCreate.tsx` : Prévisualisation

## ✅ Avantages

- **Meilleure qualité de données** : Limite les réponses trop nombreuses
- **Priorisation forcée** : L'utilisateur doit choisir les options les plus importantes
- **UX claire** : Le compteur et les désactivations guident l'utilisateur
- **Flexible** : Peut être laissé illimité si nécessaire
- **Visuel** : Feedback immédiat avec grisage des options non disponibles

## ⚙️ Compatibilité

- ✅ Fonctionne uniquement pour le type "Checkbox"
- ✅ Non applicable pour "Choix multiple" (radio) qui n'autorise qu'une seule sélection
- ✅ Compatible avec le mode sombre
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Les sondages existants sans limite continuent de fonctionner normalement

## 🆕 Différence avec "Choix multiple"

| Type | Icône | Sélections | Limitation |
|------|-------|-----------|------------|
| **Choix multiple** | 🔘 | Une seule (radio button) | N/A |
| **Cases à cocher** | ☑️ | Multiples (checkbox) | Configurable (1-n ou illimité) |



