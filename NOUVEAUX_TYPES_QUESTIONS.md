# Nouveaux Types de Questions

## 📋 Vue d'ensemble

Sept nouveaux types de questions ont été ajoutés au système de création de sondages pour enrichir les possibilités d'enquête.

## 🎯 Types de Questions Disponibles

### 1. ⚖️ Question Dichotomique

**Description** : Question à choix binaire (deux options seulement)

**Configuration** :
- Choix prédéfinis :
  - Oui / Non
  - D'accord / Pas d'accord
  - Vrai / Faux
  - Personnalisé (définir vos propres options)

**Utilisation** :
- Validation d'informations
- Questions de conformité
- Filtrage rapide

**Exemple** :
```
Question : Avez-vous plus de 18 ans ?
Options : [Oui] [Non]
```

---

### 2. 🎚️ Curseur de Défilement (Slider)

**Description** : Permet de sélectionner une valeur sur une échelle continue

**Configuration** :
- **Min** : Valeur minimum (ex: 0)
- **Max** : Valeur maximum (ex: 100)
- **Pas** : Incrément (ex: 1, 5, 10)
- **Labels** : Textes pour min et max (optionnel)
- **Afficher la valeur** : Montrer la valeur sélectionnée

**Utilisation** :
- Évaluation de satisfaction
- Niveau d'accord
- Budget, prix, quantité

**Exemple** :
```
Question : À quel point recommanderiez-vous notre service ?
Min : 0 (Pas du tout)  ━━━━━●━━━━━  Max : 100 (Absolument)
Valeur : 65
```

---

### 3. 🏆 Question de Classement

**Description** : Classer plusieurs éléments par ordre de préférence

**Configuration** :
- Liste des éléments à classer
- Nombre illimité d'éléments

**Interface** :
- Boutons ↑ et ↓ pour réordonner
- Numérotation automatique (1, 2, 3...)

**Utilisation** :
- Priorisation de fonctionnalités
- Préférences de produits
- Ordre d'importance

**Exemple** :
```
Question : Classez ces séries TV par ordre de préférence
1. Breaking Bad [↑↓]
2. Game of Thrones [↑↓]
3. Stranger Things [↑↓]
4. The Office [↑↓]
```

---

### 4. 👥 Question Démographique

**Description** : Collecte de données démographiques standardisées

**Types disponibles** :
1. **Âge** : Tranches d'âge prédéfinies
   - 18-24 ans, 25-34 ans, 35-44 ans, etc.

2. **Genre**
   - Homme, Femme, Non-binaire, Préfère ne pas dire

3. **Niveau d'éducation**
   - Sans diplôme, École primaire, Collège, Lycée, Bac+2, Bac+3, Bac+5, Doctorat

4. **Situation matrimoniale**
   - Célibataire, Marié(e), Pacsé(e), En couple, Divorcé(e), Veuf(ve)

5. **Pays d'origine**
   - Liste complète de tous les pays du monde (195+ pays)

6. **Localité**
   - Champ texte libre pour la ville/région

**Utilisation** :
- Segmentation des réponses
- Analyse statistique
- Profils démographiques

**Exemple** :
```
Question : Quelle est votre tranche d'âge ?
[Select : 25-34 ans ▼]
```

---

### 5. ⊞ Question Matrice

**Description** : Plusieurs questions avec les mêmes options de réponse

**Configuration** :
- **Lignes** : Questions/critères à évaluer
- **Colonnes** : Options de réponse communes
- Scroll automatique si nombreuses lignes/colonnes

**Utilisation** :
- Évaluation multi-critères
- Questionnaires de satisfaction
- Grilles d'évaluation

**Exemple** :
```
Évaluez les aspects suivants de notre service :

                  Très insatisfait | Insatisfait | Neutre | Satisfait | Très satisfait
─────────────────────────────────────────────────────────────────────────────────────────
Qualité           ○               ○            ○        ●          ○
Rapidité          ○               ○            ●        ○          ○
Prix              ○               ●            ○        ○          ○
Support client    ○               ○            ○        ○          ●
```

---

### 6. 🖼️ Choix d'Image

**Description** : Sélection parmi plusieurs images

**Configuration** :
- **URL de l'image** : Lien vers l'image
- **Label** : Texte descriptif
- Nombre illimité d'images

**Interface** :
- Grille responsive (2-3 colonnes selon l'écran)
- Image de fallback si URL invalide
- Badge de sélection (✓)
- Effet hover et surbrillance

**Utilisation** :
- Préférence de design
- Test A/B visuel
- Reconnaissance de produits
- Choix de logo/packaging

**Exemple** :
```
Question : Quel logo préférez-vous ?

┌────────────┐  ┌────────────┐  ┌────────────┐
│   [IMG 1]  │  │   [IMG 2]  │  │   [IMG 3]  │
│            │  │     ✓      │  │            │
│  Logo A    │  │  Logo B    │  │  Logo C    │
└────────────┘  └────────────┘  └────────────┘
                  Sélectionné
```

---

### 7. 🔢 Question de Type Classement (Alternative)

**Note** : Similaire au type "Classement" mais peut avoir des variantes d'implémentation

---

## 📁 Fichiers Modifiés

### Backend / Data
- `src/data/demographicOptions.ts` : Options démographiques standardisées

### Components
- `src/components/SurveyBuilder.tsx` : 
  - Interface Question étendue
  - Nouveaux types dans questionTypes
  - Configurations pour chaque type

### Pages
- `src/pages/surveys/SurveyRespond.tsx` : 
  - Rendu de tous les nouveaux types
  - Logique de réponse et validation

- `src/pages/surveys/SurveyCreate.tsx` : 
  - Prévisualisation des nouveaux types

## 🎨 Interface Utilisateur

### Dans le Builder (Création de Sondage)

1. Cliquez sur l'icône du type de question souhaité
2. Configurez les paramètres spécifiques
3. La prévisualisation mobile s'actualise automatiquement

### Dans le Formulaire de Réponse

- **Dichotomique** : 2 gros boutons côte à côte
- **Slider** : Barre de défilement interactive avec valeur
- **Ranking** : Liste avec boutons ↑↓ pour réordonner
- **Démographique** : Menu déroulant ou champ texte
- **Matrice** : Tableau avec boutons radio
- **Images** : Grille d'images cliquables

## 💡 Cas d'Usage Pratiques

### Enquête de Satisfaction Client
```
1. [Démographique] Âge
2. [CSAT] Satisfaction globale
3. [Matrix] Évaluation par critère
4. [Slider] Probabilité de recommandation
5. [Ranking] Classement des fonctionnalités
```

### Test de Produit
```
1. [Image Choice] Quel design préférez-vous ?
2. [Slider] Prix acceptable (0-100€)
3. [Ranking] Fonctionnalités prioritaires
4. [Dichotomous] Achèteriez-vous ce produit ?
```

### Étude Démographique
```
1. [Demographic] Âge
2. [Demographic] Genre
3. [Demographic] Niveau d'éducation
4. [Demographic] Pays d'origine
5. [Demographic] Localité
```

### Sondage d'Opinion
```
1. [Dichotomous] Êtes-vous d'accord avec cette affirmation ?
2. [Slider] Niveau d'accord (0-100)
3. [Multiple Choice] Raison principale
4. [Text] Commentaires additionnels
```

## ✅ Fonctionnalités Communes

### Tous les Types Supportent
- ✓ Champ obligatoire
- ✓ Drag & drop pour réorganiser
- ✓ Prévisualisation en temps réel
- ✓ Mode sombre
- ✓ Responsive (mobile/tablette/desktop)
- ✓ Validation des réponses
- ✓ Export des données

### Gestion des Données
- Toutes les réponses sont stockées avec leur type
- Format JSON pour les types complexes (matrice, ranking)
- Validation côté client et serveur

## 🔧 Compatibilité

- ✅ Compatible avec tous les navigateurs modernes
- ✅ Fonctionne avec les sondages existants
- ✅ Rétrocompatible (anciens sondages continuent de fonctionner)
- ✅ Mobile-first design
- ✅ Accessible (ARIA labels)

## 📊 Analytics

Les nouveaux types de questions sont compatibles avec le système d'analyse :
- Graphiques appropriés selon le type
- Statistiques descriptives
- Exports CSV/Excel
- Visualisation sur la carte (si géolocalisation)

## 🚀 Démarrage Rapide

1. Allez sur **Sondages > Créer un sondage**
2. Faites défiler la section "Ajouter une question"
3. Cliquez sur l'icône du nouveau type de question
4. Configurez les options
5. Testez avec "Répondre au sondage"

## 🆕 Nouveautés par Rapport aux Types Classiques

| Type Classique | Nouveau Type | Avantage |
|----------------|--------------|----------|
| Choix multiple | Dichotomique | Interface plus claire pour 2 options |
| Échelle | Slider | Sélection visuelle fluide |
| Cases à cocher | Ranking | Ordre de préférence conservé |
| Texte libre | Démographique | Données standardisées et analysables |
| Multiple questions | Matrice | Gain de place, cohérence visuelle |
| Texte | Image Choice | Choix visuels intuitifs |

## 🎓 Bonnes Pratiques

### Dichotomique
- ✓ Utilisez pour des questions claires et sans ambiguïté
- ✗ Évitez si une nuance est nécessaire

### Slider
- ✓ Ajoutez des labels min/max descriptifs
- ✓ Choisissez un pas adapté (1 pour précision, 10 pour rapidité)

### Ranking
- ✓ Limitez à 5-7 éléments max (fatigue cognitive)
- ✓ Rendez les éléments clairs et distincts

### Démographique
- ✓ Placez ces questions en début ou fin de sondage
- ✓ Expliquez pourquoi vous collectez ces données

### Matrice
- ✓ Gardez des lignes et colonnes concises
- ✗ N'abusez pas (maximum 7-8 lignes)

### Image Choice
- ✓ Utilisez des images de même format/taille
- ✓ Assurez-vous que les URLs sont valides
- ✓ Ajoutez des labels descriptifs



