# Améliorations des Questions CSAT

## 📋 Modifications Effectuées

### 1. Configuration Personnalisée des Questions CSAT

Lors de la création ou modification d'un sondage, vous pouvez maintenant :

#### **Choisir le Type d'Émoji**
- ⭐ **Étoiles** (classique)
- 😊 **Visages** (😢 😕 😐 🙂 😊)
- 👍 **Pouces** (👎 👎 👌 👍 👍)
- ❤️ **Cœurs** (💔 🤍 💛 💚 ❤️)
- 🔢 **Nombres** (1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣)

#### **Personnaliser les Labels de Satisfaction**
Configurez les 5 niveaux de satisfaction avec vos propres textes :
- Niveau 1 : Par défaut "Très insatisfait"
- Niveau 2 : Par défaut "Insatisfait"
- Niveau 3 : Par défaut "Neutre"
- Niveau 4 : Par défaut "Satisfait"
- Niveau 5 : Par défaut "Très satisfait"

**Interface avec scroll** : La section des labels affiche uniquement les 2 premiers champs de saisie. Il faut scroller vers le bas pour accéder aux 3 autres labels, ce qui permet une interface plus compacte.

### 2. Interface de Réponse Améliorée

#### **Effet Hover avec Tooltip**
- Lorsque l'utilisateur survole un émoji, un tooltip s'affiche avec le label correspondant
- Animation d'agrandissement au survol (scale 1.1)
- Design moderne avec flèche pointant vers l'émoji

#### **Feedback Visuel**
- L'émoji sélectionné est agrandi
- Pour les étoiles : effet de remplissage (couleur jaune)
- Affichage du label de la sélection actuelle sous les émojis

### 3. Prévisualisation en Temps Réel

La prévisualisation mobile dans la page de création affiche les émojis personnalisés selon votre configuration.

## 🎯 Comment Utiliser

### Étape 1 : Créer une Question CSAT
1. Allez sur **Sondages** > **Créer un sondage**
2. Dans la section "Ajouter une question", cliquez sur **😊 CSAT (1-5 étoiles)**

### Étape 2 : Configurer les Émojis
1. La question CSAT apparaît avec une section de configuration étendue
2. Sélectionnez le **Type d'émoji** dans le menu déroulant
3. Personnalisez les **Labels de satisfaction** pour chaque niveau (5 champs de texte)

### Étape 3 : Tester la Réponse
1. Activez le sondage
2. Allez sur la page de réponse
3. Survolez les émojis pour voir les tooltips
4. Cliquez pour sélectionner un niveau de satisfaction

## 📁 Fichiers Modifiés

- `src/components/SurveyBuilder.tsx` : Configuration CSAT avec sélection d'émojis et labels
- `src/pages/surveys/SurveyRespond.tsx` : Affichage des émojis personnalisés avec tooltips
- `src/pages/surveys/SurveyCreate.tsx` : Prévisualisation des émojis CSAT

## 💡 Exemple d'Utilisation

### Pour un Sondage de Satisfaction Client
- **Type d'émoji** : Visages
- **Labels** : 
  - "Très déçu"
  - "Déçu"
  - "Moyen"
  - "Satisfait"
  - "Ravi !"

### Pour un Sondage Interne RH
- **Type d'émoji** : Cœurs
- **Labels** :
  - "Pas du tout motivé"
  - "Peu motivé"
  - "Neutre"
  - "Motivé"
  - "Très motivé"

## ✅ Avantages

- **Flexibilité** : Adaptez les émojis et labels à votre contexte spécifique
- **UX Améliorée** : Les tooltips facilitent la réponse en clarifiant chaque niveau
- **Engagement** : Les émojis variés rendent le sondage plus attrayant
- **Personnalisation** : Chaque sondage peut avoir son propre style de CSAT

## 🔧 Compatibilité

- ✅ Fonctionne avec les sondages nouveaux et existants
- ✅ Compatible avec le mode sombre
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Les sondages existants affichent les étoiles par défaut

