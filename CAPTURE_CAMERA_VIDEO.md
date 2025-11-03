# Capture Directe Photo et Vidéo 📷🎥

## 🎯 Fonctionnalité

Les questions de type Photo et Vidéo permettent maintenant une **capture directe** via la caméra de n'importe quel appareil (ordinateur, tablette, téléphone) en utilisant l'API WebRTC.

---

## ✨ Nouvelles Capacités

### 📷 Capture Photo

#### Deux Options
1. **📸 Ouvrir la caméra** : Capture directe via WebRTC
2. **📁 Choisir un fichier** : Upload classique depuis la galerie

#### Fonctionnalités
- ✅ Accès caméra en temps réel (tous appareils)
- ✅ Prévisualisation live du flux vidéo
- ✅ Changement de caméra (avant/arrière)
- ✅ Capture haute qualité (1920x1080)
- ✅ Validation de taille automatique
- ✅ Support photos multiples
- ✅ Suppression individuelle des photos
- ✅ Interface plein écran optimisée

### 🎥 Capture Vidéo

#### Deux Options
1. **🎬 Enregistrer une vidéo** : Enregistrement direct via WebRTC
2. **📁 Choisir un fichier** : Upload depuis l'appareil

#### Fonctionnalités
- ✅ Enregistrement vidéo en temps réel (tous appareils)
- ✅ Enregistrement audio inclus
- ✅ Changement de caméra (avant/arrière)
- ✅ Timer d'enregistrement visible
- ✅ Indicateur d'enregistrement (point rouge)
- ✅ Validation de taille automatique
- ✅ Support vidéos multiples
- ✅ Suppression individuelle des vidéos
- ✅ Format WebM optimisé

---

## 🖥️ Interface Utilisateur

### Capture Photo - Écran Plein

```
┌─────────────────────────────────────┐
│ ✕   Prendre une photo        🔄    │ ← Header
├─────────────────────────────────────┤
│                                     │
│                                     │
│         [Flux vidéo live]           │ ← Prévisualisation
│                                     │
│                                     │
├─────────────────────────────────────┤
│              ◉                      │ ← Bouton capture
│   Appuyez pour capturer             │
└─────────────────────────────────────┘
```

### Capture Vidéo - Écran Plein

```
┌─────────────────────────────────────┐
│ ✕  Enregistrer une vidéo     🔄    │
│     ● 00:15 (enregistrement)        │ ← Timer
├─────────────────────────────────────┤
│                                     │
│                                     │
│         [Flux vidéo live]           │ ← Prévisualisation
│                                     │
│                                     │
├─────────────────────────────────────┤
│              ■                      │ ← Bouton stop
│   Appuyez pour arrêter              │
│   Taille max : 10 MB                │
└─────────────────────────────────────┘
```

### Dans le Formulaire

```
┌──────────────────────────────────────┐
│         📷                           │
│  [📸 Ouvrir la caméra]              │
│  [📁 Choisir un fichier]            │
│                                      │
│  Taille max: 10 MB                   │
│  (plusieurs photos autorisées)       │
└──────────────────────────────────────┘

Photos sélectionnées (3) :
┌─────┐ ┌─────┐ ┌─────┐
│ IMG │ │ IMG │ │ IMG │
│  ✕  │ │  ✕  │ │  ✕  │ ← Boutons suppression
└─────┘ └─────┘ └─────┘
```

---

## 🔧 Composants Créés

### 1. `CameraCapture.tsx`

**Props** :
- `onCapture: (file: File) => void` - Callback avec la photo capturée
- `onClose: () => void` - Callback fermeture
- `maxSizeMB?: number` - Taille max en MB (défaut: 10)

**Fonctionnalités** :
- Accès à `navigator.mediaDevices.getUserMedia()`
- Prévisualisation avec `<video>` element
- Capture sur `<canvas>` hidden
- Conversion en File JPEG (qualité 90%)
- Validation de taille
- Changement de caméra (facingMode)
- Arrêt propre du stream

**États** :
```typescript
- stream: MediaStream | null
- error: string
- facingMode: 'user' | 'environment'
```

### 2. `VideoCapture.tsx`

**Props** :
- `onCapture: (file: File) => void` - Callback avec la vidéo
- `onClose: () => void` - Callback fermeture
- `maxSizeMB?: number` - Taille max en MB (défaut: 10)

**Fonctionnalités** :
- Enregistrement avec `MediaRecorder` API
- Support audio + vidéo
- Timer d'enregistrement
- Indicateur visuel (point rouge clignotant)
- Format WebM (vp9 ou fallback)
- Validation de taille
- Changement de caméra
- Arrêt propre du stream et recorder

**États** :
```typescript
- stream: MediaStream | null
- isRecording: boolean
- recordingTime: number
- error: string
- facingMode: 'user' | 'environment'
```

---

## 📱 Support Appareils

### Ordinateur (Desktop)
- ✅ Accès webcam intégrée
- ✅ Webcam externe USB
- ✅ Changement de caméra si plusieurs
- ✅ Micro pour vidéos
- ✅ Chrome, Firefox, Edge, Safari

### Tablette
- ✅ Caméra avant
- ✅ Caméra arrière
- ✅ Changement automatique
- ✅ Tactile optimisé
- ✅ iOS Safari, Android Chrome

### Téléphone
- ✅ Caméra avant (selfie)
- ✅ Caméra arrière (principale)
- ✅ Bouton de changement
- ✅ Mode portrait/paysage
- ✅ iOS Safari, Android Chrome

---

## 🔐 Permissions

### Demande de Permission
Au premier accès, le navigateur demande :
- **Photo** : Permission caméra
- **Vidéo** : Permission caméra + microphone

### Gestion des Erreurs
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' },
    audio: true  // Pour vidéo uniquement
  })
} catch (err) {
  // Affiche : "Impossible d'accéder à la caméra"
  // + Instructions pour activer les permissions
}
```

### Messages d'Erreur
- ❌ "Impossible d'accéder à la caméra. Vérifiez les permissions."
- ❌ "La photo est trop volumineuse (15.2 MB). Taille max : 10 MB"
- ❌ "La vidéo est trop volumineuse (25.8 MB). Taille max : 10 MB"

---

## ⚙️ Configuration Technique

### Qualité Photo
```typescript
video: {
  facingMode: 'environment',  // ou 'user' pour selfie
  width: { ideal: 1920 },
  height: { ideal: 1080 }
}

canvas.toBlob(blob => {
  // Conversion JPEG
}, 'image/jpeg', 0.9)  // Qualité 90%
```

### Qualité Vidéo
```typescript
video: {
  facingMode: 'environment',
  width: { ideal: 1920 },
  height: { ideal: 1080 }
},
audio: true

// Format WebM avec codec VP9
mimeType: 'video/webm;codecs=vp9'
// Fallback: 'video/webm'
```

### Optimisations
- Photos en JPEG (meilleure compression)
- Qualité 90% (bon rapport qualité/taille)
- Vidéos en WebM (format moderne, bonne compression)
- Arrêt automatique des streams (économie batterie)

---

## 🎨 Améliorations UX

### Interface Photo
- ✅ Design plein écran immersif
- ✅ Gradients semi-transparents
- ✅ Gros bouton de capture intuitif
- ✅ Bouton fermeture toujours visible
- ✅ Changement de caméra en un clic
- ✅ Messages d'erreur clairs

### Interface Vidéo
- ✅ Timer en temps réel
- ✅ Point rouge pulsant (enregistrement)
- ✅ Bouton Start (●) / Stop (■)
- ✅ Désactivation changement caméra pendant enregistrement
- ✅ Indication taille max
- ✅ Fermeture sécurisée (arrêt enregistrement)

### Galerie Photos/Vidéos
- ✅ Compteur d'éléments
- ✅ Prévisualisation miniatures (photos)
- ✅ Liste détaillée (vidéos avec taille)
- ✅ Bouton suppression par élément
- ✅ Effet hover sur suppression

---

## 💡 Cas d'Usage

### Enquête de Terrain
```
Question : Photographier le lieu d'intervention
- Type : Photo
- Multiple : Oui
- Max : 20 MB
→ L'agent ouvre la caméra et prend 5 photos du site
```

### Témoignage Client
```
Question : Enregistrez votre avis en vidéo
- Type : Vidéo
- Multiple : Non
- Max : 50 MB
→ Le client enregistre un témoignage de 30 secondes
```

### Contrôle Qualité
```
Question : Photos du produit défectueux
- Type : Photo
- Multiple : Oui
- Max : 10 MB
→ 3 photos sous différents angles
```

### Incident
```
Question : Vidéo de l'incident
- Type : Vidéo
- Multiple : Non
- Max : 100 MB
→ Enregistrement de 1 minute
```

---

## 🚀 Utilisation

### Créer une Question Photo
1. Créer un sondage
2. Ajouter question **📷 Prendre une photo**
3. Configurer :
   - Taille max : 10-50 MB
   - Multiple : Oui/Non
4. Tester la capture

### Créer une Question Vidéo
1. Créer un sondage
2. Ajouter question **🎥 Prendre une vidéo**
3. Configurer :
   - Taille max : 20-100 MB (vidéos plus volumineuses)
   - Multiple : Oui/Non
4. Tester l'enregistrement

### Répondre au Sondage
**Option 1 : Capture directe**
1. Cliquer "Ouvrir la caméra" ou "Enregistrer une vidéo"
2. Autoriser les permissions si demandé
3. Capturer/Enregistrer
4. Valider ou recommencer

**Option 2 : Upload fichier**
1. Cliquer "Choisir un fichier"
2. Sélectionner depuis la galerie
3. Confirmer

---

## ⚠️ Limitations & Considérations

### Taille des Fichiers
- **Photos** : 1-5 MB typique (haute qualité)
- **Vidéos** : 5-10 MB par minute (WebM)
- **Recommandation** : 10-20 MB pour photos, 50-100 MB pour vidéos

### Support Navigateurs
| Navigateur | Desktop | Mobile | Notes |
|-----------|---------|--------|-------|
| Chrome | ✅ | ✅ | Support complet |
| Firefox | ✅ | ✅ | Support complet |
| Safari | ✅ | ✅ | iOS 11+ requis |
| Edge | ✅ | ✅ | Support complet |
| Opera | ✅ | ✅ | Support complet |

### Stockage
⚠️ **Important** : Les fichiers sont en mémoire côté client.

Pour la production, implémenter :
- Upload vers serveur backend
- Service de stockage cloud (AWS S3, Firebase, etc.)
- Compression côté serveur si nécessaire
- Base de données pour métadonnées

### Sécurité
- ✅ Permissions utilisateur requises
- ✅ HTTPS requis pour getUserMedia
- ✅ Validation de taille côté client
- ⚠️ Validation serveur nécessaire en production

---

## 📊 Fichiers Créés/Modifiés

### Nouveaux Composants
- `src/components/CameraCapture.tsx` - Composant capture photo
- `src/components/VideoCapture.tsx` - Composant enregistrement vidéo

### Fichiers Modifiés
- `src/pages/surveys/SurveyRespond.tsx` :
  - Import des composants
  - États de gestion des modals
  - Boutons d'ouverture
  - Rendu conditionnel des modals
  - Gestion photos/vidéos multiples
  - Suppression individuelle

### Documentation
- `CAPTURE_CAMERA_VIDEO.md` - Ce fichier

---

## 🎓 Différences Avant/Après

### Avant
```
[📸 Prendre une photo]
     ↓
Ouvre sélecteur de fichiers
     ↓
Sur mobile : Option caméra OU galerie
Sur desktop : Seulement fichiers
```

### Après
```
[📸 Ouvrir la caméra]  [📁 Choisir un fichier]
         ↓                        ↓
   Capture directe          Upload fichier
   (tous appareils)        (comme avant)
         ↓
   Interface plein écran
   Prévisualisation live
   Changement caméra
         ↓
   Photo/Vidéo capturée
```

---

## ✅ Avantages

### Pour les Utilisateurs
- ✅ Capture instantanée sans quitter l'application
- ✅ Interface intuitive et moderne
- ✅ Prévisualisation avant capture
- ✅ Changement facile de caméra
- ✅ Feedback visuel immédiat

### Pour les Enquêtes
- ✅ Meilleur taux de complétion
- ✅ Photos/vidéos de meilleure qualité
- ✅ Expérience utilisateur fluide
- ✅ Moins d'abandon (workflow simplifié)
- ✅ Données plus riches

### Technique
- ✅ API standard (WebRTC)
- ✅ Support multi-plateforme
- ✅ Pas de dépendances externes
- ✅ Performance optimisée
- ✅ Gestion mémoire propre

---

## 🎉 Résumé

Les questions Photo et Vidéo utilisent maintenant **l'API WebRTC** pour permettre une **capture directe** sur **tous les appareils** :

- 📷 **Capture photo instantanée** avec prévisualisation live
- 🎥 **Enregistrement vidéo** avec audio et timer
- 🔄 **Changement de caméra** (avant/arrière)
- 📱 **Support universel** (PC, tablette, téléphone)
- 🎨 **Interface immersive** plein écran
- ✅ **Validation automatique** de la taille
- 🗑️ **Gestion individuelle** des fichiers

Le système G-survey offre maintenant une expérience de capture multimédia **professionnelle** et **intuitive** ! 🚀



