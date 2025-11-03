# Question de Type "Mesure de Distance" 📏

## 📋 Vue d'Ensemble

La question de type **"Mesure de distance"** permet aux agents de terrain de mesurer avec précision la longueur de tracés linéaires (cours d'eau, routes, sentiers, canaux, etc.) en marquant des points GPS le long du parcours.

---

## 🎯 Objectif

Permettre à un agent de terrain de :
- ✅ Mesurer la longueur de cours d'eau, lacs, routes, sentiers
- ✅ Marquer des points GPS le long d'un tracé linéaire
- ✅ Obtenir automatiquement la distance totale en mètres ou kilomètres
- ✅ Nommer chaque tracé mesuré
- ✅ Gérer plusieurs mesures dans un seul sondage

---

## ⚙️ Configuration

### Dans le Créateur de Sondage

**Route** : `Sondages > Créer un sondage > Ajouter une question`

1. Cliquer sur le bouton **"📏 Mesure de distance"**
2. Configurer la question :
   ```
   Libellé : "Mesurez la longueur des cours d'eau"
   Requis : ☑️ (optionnel)
   ```
3. Sauvegarder

**C'est tout !** Aucune configuration supplémentaire nécessaire.

---

## 📱 Interface Utilisateur

### Vue d'Ensemble de l'Interface

```
┌─────────────────────────────────────────────┐
│ 📍 Position actuelle                        │
│ Lat: 14.693700, Lng: -17.444100            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📏 Nouvelle mesure de distance              │
│                                             │
│ Nom de la ligne *                           │
│ [Cours d'eau principal______________]       │
│                                             │
│ [📏 Commencer la mesure]                    │
└─────────────────────────────────────────────┘
```

### Pendant la Mesure

```
┌─────────────────────────────────────────────┐
│ 📏 Cours d'eau principal      [En cours]    │
│                                             │
│ 📍 Position actuelle                        │
│ Lat: 14.693700, Lng: -17.444100            │
│                                             │
│ 📋 Instructions                             │
│ 1. Déplacez-vous au point de départ        │
│ 2. Marquez le point                         │
│ 3. Suivez la ligne (cours d'eau, route...) │
│ 4. Marquez des points régulièrement         │
│ 5. Terminez au point d'arrivée (min. 2)    │
│                                             │
│ Points marqués : 5                          │
│ ① 14.69370, -17.44410                      │
│ ② 14.69385, -17.44395                      │
│ ③ 14.69400, -17.44380                      │
│ ④ 14.69415, -17.44365                      │
│ ⑤ 14.69430, -17.44350                      │
│                                             │
│ 📏 Distance : 247.82 m                      │
│                                             │
│ [📍 Marquer un point] [↩️ Retirer dernier]  │
│ [✓ Terminer (5 pts)] [✗ Annuler]          │
└─────────────────────────────────────────────┘
```

### Distances Mesurées

```
┌─────────────────────────────────────────────┐
│ 📊 Distances mesurées (3)                   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ① Cours d'eau principal                 │ │
│ │                                         │ │
│ │ Distance totale                         │ │
│ │ 2.45 km                                 │ │
│ │                                         │ │
│ │ Points : 8                              │ │
│ │ 02/11/2025 09:00                        │ │
│ │ [🗺️ Voir tracé] [🗑️ Supprimer]         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ② Route départementale                  │ │
│ │                                         │ │
│ │ Distance totale                         │ │
│ │ 5.12 km                                 │ │
│ │                                         │ │
│ │ Points : 15                             │ │
│ │ 02/11/2025 11:30                        │ │
│ │ [🗺️ Voir tracé] [🗑️ Supprimer]         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📊 Distance totale                      │ │
│ │                             7.57 km      │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🚶 Workflow pour l'Agent de Terrain

### Scénario : Mesure d'un Cours d'Eau

#### Étape 1 : Préparation
```
Agent se rend à l'embouchure du cours d'eau
Ouvre le sondage sur sa tablette/téléphone
Autorise la géolocalisation
```

#### Étape 2 : Commencer la Mesure
```
Entre le nom : "Cours d'eau principal - Rivière Gambie"
Clique sur "📏 Commencer la mesure"
```

#### Étape 3 : Suivre le Cours d'Eau
```
09:00 - Point de départ (embouchure)
      → Clique "📍 Marquer un point"
      → Point 1 capturé

09:15 - Suit le cours d'eau sur ~300m
      → Clique "📍 Marquer un point"
      → Point 2 capturé
      → Distance : 287 m

09:30 - Continue sur ~300m
      → Clique "📍 Marquer un point"
      → Point 3 capturé
      → Distance : 574 m

... Continue ainsi ...

11:45 - Point final (source)
      → Clique "📍 Marquer un point"
      → Point 8 capturé
      → Distance totale : 2.45 km
```

#### Étape 4 : Terminer la Mesure
```
Vérifie les données :
- Nom : Cours d'eau principal - Rivière Gambie
- Points : 8
- Distance : 2.45 km

Clique "✓ Terminer (8 pts)"
```

#### Résultat Final
```
📊 Cours d'eau mesuré :
Nom : Cours d'eau principal - Rivière Gambie
Distance : 2.45 km
Points GPS : 8
Temps : 2h45
```

---

## ✨ Fonctionnalités

### 1. Position en Temps Réel
- ✅ Affichage continu de la position GPS actuelle
- ✅ Mise à jour automatique toutes les 10 secondes
- ✅ Haute précision (GPS)

### 2. Marquage de Points
- ✅ Marquer des points illimités le long d'un tracé
- ✅ Minimum 2 points requis (début et fin)
- ✅ Numérotation automatique des points (①②③④⑤)
- ✅ Affichage des coordonnées de chaque point

### 3. Calcul Automatique
- ✅ **Distance** : Calcul en temps réel entre chaque point
- ✅ Formule géodésique de Haversine (précision maximale)
- ✅ Affichage intelligent :
  - < 1 000 m → en mètres
  - ≥ 1 000 m → en kilomètres (km)

### 4. Gestion des Points
- ✅ **Retirer dernier** : Annuler le dernier point marqué
- ✅ **Annuler** : Abandonner la mesure en cours
- ✅ **Terminer** : Valider la mesure (minimum 2 points)

### 5. Gestion des Tracés Mesurés
- ✅ Liste numérotée de tous les tracés
- ✅ **Voir tracé** : Ouvrir dans Google Maps
- ✅ **Supprimer** : Retirer une mesure
- ✅ **Total** : Somme automatique de toutes les distances

### 6. Horodatage
- ✅ Date et heure de chaque mesure
- ✅ Format localisé (français)

---

## 🔢 Algorithme de Calcul

### Calcul de Distance

**Méthode** : Formule de Haversine (distance géodésique)

```typescript
Pour chaque paire de points consécutifs :
1. Convertir lat/lng en radians
2. Appliquer la formule de Haversine :
   a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
   c = 2 × atan2(√a, √(1−a))
   distance = R × c  (R = 6371000m = rayon Terre)
3. Sommer toutes les distances
```

**Précision** :
- Distance géodésique exacte sur la sphère terrestre
- Prend en compte la courbure de la Terre
- Précision : < 0.5% pour des distances < 100 km

---

## 📊 Format des Données

### Structure d'un Tracé Mesuré

```typescript
interface MeasuredLine {
  id: string                    // Identifiant unique
  name: string                  // Nom du tracé
  points: Point[]               // Points GPS du tracé
  distance: number              // Distance totale en mètres
  timestamp: Date               // Date/heure de mesure
}

interface Point {
  latitude: number              // Latitude GPS
  longitude: number             // Longitude GPS
  order: number                 // Ordre du point (1, 2, 3...)
}
```

### Exemple de Réponse

```json
{
  "questionId": "q_line_123",
  "questionType": "line_measurement",
  "value": [
    {
      "id": "line_1698765432123",
      "name": "Cours d'eau principal - Rivière Gambie",
      "points": [
        { "latitude": 14.6937, "longitude": -17.4441, "order": 1 },
        { "latitude": 14.6952, "longitude": -17.4426, "order": 2 },
        { "latitude": 14.6967, "longitude": -17.4411, "order": 3 },
        { "latitude": 14.6982, "longitude": -17.4396, "order": 4 },
        { "latitude": 14.6997, "longitude": -17.4381, "order": 5 },
        { "latitude": 14.7012, "longitude": -17.4366, "order": 6 },
        { "latitude": 14.7027, "longitude": -17.4351, "order": 7 },
        { "latitude": 14.7042, "longitude": -17.4336, "order": 8 }
      ],
      "distance": 2450.67,
      "timestamp": "2025-11-02T09:00:00Z"
    },
    {
      "id": "line_1698765876543",
      "name": "Route départementale D12",
      "points": [
        { "latitude": 14.7021, "longitude": -17.4523, "order": 1 },
        { "latitude": 14.7035, "longitude": -17.4510, "order": 2 },
        // ... 13 autres points
        { "latitude": 14.7545, "longitude": -17.4123, "order": 15 }
      ],
      "distance": 5120.45,
      "timestamp": "2025-11-02T11:30:00Z"
    }
  ]
}
```

---

## 🎯 Cas d'Usage

### 1. Hydrologie - Cours d'Eau

```
Sondage : Inventaire des ressources en eau
Question : Mesurez la longueur des cours d'eau

Agent hydrologue :
- Rivière principale : 12.5 km
- Affluent Nord : 4.2 km
- Affluent Sud : 6.8 km

Total réseau : 23.5 km
```

### 2. Infrastructure - Routes

```
Sondage : État du réseau routier
Question : Mesurez la longueur des routes à réhabiliter

Inspecteur :
- Route départementale D12 : 15.3 km
- Route communale C45 : 8.7 km
- Chemin rural R23 : 3.2 km

Total à réhabiliter : 27.2 km
```

### 3. Environnement - Périmètre de Lacs

```
Sondage : Cartographie des zones humides
Question : Mesurez le périmètre des lacs

Écologue :
- Lac principal : 8.5 km
- Lac secondaire : 3.2 km
- Étang : 1.1 km

Total périmètres : 12.8 km
```

### 4. Agriculture - Canaux d'Irrigation

```
Sondage : Réseau d'irrigation
Question : Mesurez la longueur des canaux

Ingénieur agricole :
- Canal principal : 7.8 km
- Canal secondaire Est : 2.4 km
- Canal secondaire Ouest : 3.1 km

Total réseau : 13.3 km
```

### 5. Randonnée - Sentiers

```
Sondage : Cartographie des sentiers
Question : Mesurez la longueur des sentiers de randonnée

Guide touristique :
- Sentier de la forêt : 5.2 km
- Sentier côtier : 8.9 km
- Sentier des crêtes : 12.3 km

Total parcours : 26.4 km
```

### 6. Urbanisme - Lignes de Transport

```
Sondage : Extension réseau transport
Question : Mesurez les nouvelles lignes de bus

Urbaniste :
- Ligne A extension : 4.5 km
- Ligne B extension : 6.2 km
- Nouvelle ligne C : 8.7 km

Total extensions : 19.4 km
```

---

## 🎨 Design & UX

### Codes Couleurs

- 🔵 **Bleu** : Tracés mesurés, position, informations
- 🟢 **Vert** : Succès, validation
- 🟡 **Jaune** : Instructions, attention
- 🔴 **Rouge** : Erreurs, suppression
- 🟣 **Primaire** : Mesure en cours, actions principales

### Icônes

- 📏 : Mesure de distance
- 📍 : Position / Point GPS
- 📊 : Statistiques / Total
- 📋 : Instructions
- ✓ : Valider / Terminer
- ✗ : Annuler
- ↩️ : Retirer / Annuler dernier
- 🗺️ : Voir sur carte
- 🗑️ : Supprimer

### États Visuels

**État Initial** :
- Formulaire de saisie du nom
- Bouton "Commencer la mesure"

**État En Cours** :
- Bordure colorée (primaire)
- Badge "En cours"
- Instructions visibles
- Distance mise à jour en temps réel

**État Terminé** :
- Carte bleue avec dégradé
- Numérotation claire
- Distance en évidence
- Actions disponibles

---

## 📱 Compatibilité

### Appareils

✅ **Smartphones** :
- Android (Chrome, Firefox, Samsung Internet)
- iPhone (Safari, Chrome)

✅ **Tablettes** :
- Android (Chrome)
- iPad (Safari)

✅ **Ordinateurs** (avec GPS) :
- Windows (Chrome, Edge, Firefox)
- Mac (Safari, Chrome)

### Permissions Requises

- **Géolocalisation** : Obligatoire
- **Mode haute précision** : Recommandé
- **HTTPS** : Requis (sauf localhost)

---

## ⚠️ Limitations & Recommandations

### Limitations Techniques

**Précision GPS** :
- ❌ GPS standard : ±5-10 mètres
- ✅ GPS assisté (A-GPS) : ±2-5 mètres
- ⚠️ À l'intérieur : Précision réduite

**Distance des Tracés** :
- ✅ Optimale : 100 m - 50 km
- ⚠️ Acceptable : < 100 km
- ❌ Non recommandé : > 100 km (dérive GPS cumulée)

### Recommandations d'Utilisation

**Pour une Meilleure Précision** :

1. **Activer le GPS haute précision** dans les paramètres
2. **Marquer des points réguliers** : tous les 200-500 mètres
3. **Suivre le tracé au plus près** : ne pas couper les virages
4. **Attendre stabilisation** avant de marquer chaque point (3-5 sec)
5. **Conditions optimales** :
   - Ciel dégagé
   - Extérieur
   - Déplacement lent ou immobile lors du marquage

**Bonnes Pratiques** :

✅ Marquer le point de départ clairement  
✅ Suivre le tracé en ligne centrale  
✅ Marquer plus de points dans les zones sinueuses  
✅ Moins de points dans les lignes droites  
✅ Utiliser des noms descriptifs  

❌ Ne pas marquer de points depuis un véhicule rapide  
❌ Éviter les zones avec obstacles (bâtiments, forêts denses)  
❌ Ne pas espacer les points de plus de 1 km  

**Fréquence de Marquage Recommandée** :

| Type de tracé | Fréquence |
|---------------|-----------|
| Ligne droite | Tous les 500m |
| Courbes légères | Tous les 300m |
| Virages serrés | Tous les 100m |
| Méandres (cours d'eau) | Tous les 50-100m |

---

## 🔐 Sécurité & Vie Privée

### Données Capturées

**Stockées** :
- ✅ Nom du tracé (saisi par l'utilisateur)
- ✅ Coordonnées GPS des points
- ✅ Distance calculée
- ✅ Timestamp de la mesure

**NON stockées** :
- ❌ Position GPS continue
- ❌ Trajet complet de l'agent
- ❌ Métadonnées de l'appareil

### Permissions

- Position GPS requise uniquement lors du marquage
- Pas de tracking continu
- Données envoyées uniquement à la soumission du sondage

---

## 📁 Fichiers

### Nouveau Composant

```
src/components/LineMeasurement.tsx
```
- Interface complète de mesure de distance
- Calculs géodésiques (Haversine)
- Gestion d'état des mesures en cours et terminées
- UI responsive et intuitive

### Fichiers Modifiés

**`src/components/SurveyBuilder.tsx`**
- Ligne 68 : Ajout du type 'line_measurement' dans la liste

**`src/pages/surveys/SurveyRespond.tsx`**
- Ligne 10 : Import du composant LineMeasurement
- Lignes 527-533 : Rendu du composant pour les questions de type 'line_measurement'

**`src/pages/surveys/SurveyCreate.tsx`**
- Lignes 363-367 : Prévisualisation du type de question

---

## 🎓 Formation Agents de Terrain

### Guide Rapide

**1. Ouvrir le sondage**
- Sur smartphone ou tablette
- Autoriser la géolocalisation

**2. Commencer une mesure**
- Entrer le nom du tracé
- Cliquer "Commencer la mesure"

**3. Suivre le tracé**
- Se déplacer au point de départ
- Marquer le point
- Suivre la ligne (cours d'eau, route...)
- Marquer des points tous les 200-500m
- Se déplacer jusqu'au point final

**4. Terminer**
- Vérifier la distance
- Cliquer "Terminer"

**5. Répéter**
- Pour chaque tracé à mesurer

### Temps Estimés

- **Formation initiale** : 10-15 minutes
- **Mesure d'un tracé court** (< 1 km) : 15-20 minutes
- **Mesure d'un tracé moyen** (1-5 km) : 30-60 minutes
- **Mesure d'un tracé long** (> 5 km) : 1-3 heures

---

## 🆚 Différence avec "Mesure de Superficie"

| Aspect | Mesure Distance | Mesure Superficie |
|--------|----------------|-------------------|
| **Type** | Ligne (polyligne) | Surface (polygone) |
| **Minimum points** | 2 | 3 |
| **Mesure** | Distance linéaire | Surface + Périmètre |
| **Fermeture** | Ligne ouverte | Polygone fermé |
| **Unités** | m, km | m², ha |
| **Cas d'usage** | Cours d'eau, routes | Plantations, parcelles |

---

## 🎉 Avantages

### Pour les Organisations

✅ **Économie** : Pas besoin d'équipement de topographie  
✅ **Rapidité** : Mesure en marchant  
✅ **Précision** : Calculs géodésiques professionnels  
✅ **Base de données** : Données structurées et géolocalisées  
✅ **Traçabilité** : Horodatage de chaque mesure  

### Pour les Agents de Terrain

✅ **Simplicité** : Interface intuitive  
✅ **Mobilité** : Fonctionne sur smartphone  
✅ **Feedback immédiat** : Distance en temps réel  
✅ **Corrections faciles** : Retirer le dernier point  
✅ **Multi-tracés** : Plusieurs mesures dans un sondage  

### Pour l'Analyse

✅ **Données exploitables** : Format structuré  
✅ **Export cartographique** : Coordonnées GPS disponibles  
✅ **Totaux automatiques** : Somme des distances  
✅ **Traçabilité** : Points GPS pour validation  

---

## 📈 Évolutions Possibles

### Futures Fonctionnalités

- [ ] Carte interactive avec visualisation du tracé
- [ ] Export GPX pour GPS et applications de randonnée
- [ ] Import de tracés depuis fichiers GPX/KML
- [ ] Photos par point marqué
- [ ] Annotations vocales
- [ ] Mode offline avec synchronisation
- [ ] Calcul de vitesse moyenne
- [ ] Calcul de dénivelé (si altitude disponible)
- [ ] Superposition de tracés
- [ ] Comparaison avant/après

---

## 🎯 Conclusion

La question **"Mesure de distance"** transforme n'importe quel smartphone en odomètre GPS professionnel. Elle permet aux agents de terrain de :

- 📏 Mesurer des tracés linéaires avec précision GPS
- 🗺️ Créer des bases de données géospatiales de réseaux
- 📊 Obtenir des distances instantanées
- 💾 Documenter leurs mesures

**Idéale pour** :
- Hydrologie (cours d'eau, lacs)
- Infrastructure (routes, sentiers)
- Réseaux (irrigation, transport)
- Environnement (périmètres, parcours)
- Urbanisme (extensions, nouvelles lignes)

**Prêt à l'emploi et simple d'utilisation !** 🚀

---

## 💡 Astuce Pro

**Pour mesurer un périmètre fermé** (comme un lac), vous pouvez :
1. Utiliser la question "Mesure de distance"
2. Faire le tour complet et revenir au point de départ
3. La distance donnera le périmètre total

OU utiliser la question **"Mesure de superficie"** qui calculera automatiquement le périmètre en plus de la surface.



