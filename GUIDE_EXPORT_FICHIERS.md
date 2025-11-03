# 📦 Guide Rapide : Export des Fichiers Uploadés

## 🎯 En bref

Les photos, vidéos et pièces jointes uploadées par les agents sont maintenant **disponibles dans les exports** !

---

## 👤 Pour l'agent de terrain

### Comment uploader des fichiers

1. **Répondre au sondage**
2. Pour les questions "Photo", "Vidéo" ou "Pièce jointe" :
   - Cliquer sur "📸 Ouvrir la caméra" ou "📁 Choisir un fichier"
   - Sélectionner/capturer vos fichiers
   - Les fichiers apparaissent en prévisualisation
3. **Soumettre** le sondage
4. ✅ **Les fichiers sont automatiquement uploadés sur le serveur**

**Important** : Les fichiers doivent faire moins de 100 MB chacun.

---

## 👨‍💼 Pour l'administrateur

### 3 types d'export disponibles

#### 1. 📊 Export Excel

**Ce qu'il contient** :
- Toutes les réponses au sondage
- **URLs cliquables** des fichiers uploadés

**Comment faire** :
1. Aller sur la page du sondage
2. Section "Exporter les données"
3. Cliquer sur "📊 Excel"
4. Ouvrir le fichier Excel téléchargé
5. Les colonnes de fichiers contiennent les URLs

**Exemple dans Excel** :
```
Colonne "Photos du bâtiment":
photo1.jpg : http://localhost:5000/uploads/12345.jpg
photo2.jpg : http://localhost:5000/uploads/67890.jpg
```

**Avantage** : Rapide, léger, URLs accessibles
**Inconvénient** : Ne contient pas les fichiers eux-mêmes

#### 2. 📄 Export CSV

**Identique à Excel** mais au format CSV (compatible avec Excel, Google Sheets, etc.)

#### 3. 📦 Export Complet (NOUVEAU !)

**⭐ C'est la solution complète !**

**Ce qu'il contient** :
- ✅ Fichier Excel avec toutes les réponses
- ✅ **TOUS les fichiers uploadés** (photos, vidéos, documents)
- ✅ Fichier README.txt avec les instructions
- ✅ Organisation claire par réponse et question

**Comment faire** :
1. Aller sur la page du sondage
2. Section "Exporter les données"
3. Cliquer sur "📦 Export Complet (ZIP avec fichiers)"
4. Patienter (peut prendre quelques minutes si beaucoup de fichiers)
5. Télécharger le fichier ZIP
6. Décompresser l'archive
7. **Profiter !**

**Structure du ZIP** :
```
Enquete_Satisfaction_complete_123456.zip
│
├── Enquete_Satisfaction_reponses.xlsx  ← Ouvrir ce fichier en premier
├── README.txt                           ← Lire les instructions
│
├── reponse_1/                          ← Première réponse
│   ├── question_3_Photos_batiment/
│   │   ├── photo1.jpg
│   │   └── photo2.jpg
│   └── question_5_Rapport/
│       └── rapport.pdf
│
├── reponse_2/                          ← Deuxième réponse
│   ├── question_3_Photos_batiment/
│   │   └── photo_ecole.jpg
│   └── question_5_Rapport/
│       └── rapport_ecole.pdf
│
└── ... (autres réponses)
```

**Avantages** :
- ✅ Tout est regroupé dans une seule archive
- ✅ Fichiers organisés et faciles à retrouver
- ✅ Hors ligne : plus besoin de connexion internet
- ✅ Archivage : conservez tout pour référence future

**Cas d'usage** :
- Rapport final d'enquête
- Archivage long terme
- Partage avec partenaires (envoyer un seul fichier)
- Travail hors ligne

---

## 💡 Conseils pratiques

### Pour les agents

1. **Vérifiez la taille** : Max 100 MB par fichier
2. **Connexion internet** : Assurez-vous d'avoir une bonne connexion pour l'upload
3. **Nommage** : Donnez des noms clairs à vos fichiers (ex: "facade_nord.jpg")
4. **Qualité photos** : Bonne qualité mais pas trop lourdes (2-5 MB idéal)

### Pour les administrateurs

1. **Export Excel/CSV** : Pour consultation rapide des données
2. **Export Complet** : Pour archivage, rapports, ou partage
3. **Espace disque** : Vérifiez l'espace disponible avant gros export
4. **Organisation** : Le ZIP est déjà bien organisé, n'hésitez pas à le décompresser

---

## 🔍 Exemple concret

### Cas : Inspection de bâtiments scolaires

**Sondage** : 50 écoles inspectées
**Questions avec fichiers** :
- Photos des façades (3 photos par école)
- Photos de l'intérieur (2 photos par école)  
- Rapport d'inspection PDF (1 par école)

**Total** : 50 réponses × 6 fichiers = **300 fichiers**

**Export Complet** :
```
Inspection_Ecoles_complete_20251102.zip (taille: ~150 MB)
│
├── Inspection_Ecoles_reponses.xlsx
├── README.txt
│
├── reponse_1/  (École Primaire Centre)
│   ├── question_3_Photos_facades/
│   │   ├── facade_avant.jpg
│   │   ├── facade_arriere.jpg
│   │   └── facade_cote.jpg
│   ├── question_4_Photos_interieur/
│   │   ├── salle_classe.jpg
│   │   └── cantine.jpg
│   └── question_7_Rapport/
│       └── rapport_primaire_centre.pdf
│
├── reponse_2/  (École Maternelle Nord)
│   └── ...
│
└── ... (48 autres réponses)
```

**Utilisation** :
1. Ouvrir `Inspection_Ecoles_reponses.xlsx`
2. Voir toutes les réponses en tableau
3. Pour une école spécifique :
   - Trouver sa ligne dans Excel
   - Aller dans le dossier `reponse_X` correspondant
   - Consulter les photos et le rapport

---

## ❓ FAQ

### Q : Les fichiers sont-ils sécurisés ?
**R** : Oui ! Seuls les utilisateurs authentifiés peuvent uploader. Les fichiers sont stockés sur le serveur sécurisé.

### Q : Quelle est la limite de taille ?
**R** : 100 MB par fichier, 10 fichiers simultanés maximum.

### Q : Les fichiers sont-ils compressés ?
**R** : Le ZIP final est compressé (niveau maximum), mais les fichiers individuels gardent leur qualité originale.

### Q : Puis-je supprimer des fichiers après upload ?
**R** : Actuellement non. Une fois uploadé et le sondage soumis, le fichier est permanent. Contactez l'administrateur si besoin.

### Q : Que se passe-t-il si l'upload échoue ?
**R** : La soumission du sondage est annulée. Vous recevez un message d'erreur. Réessayez avec une meilleure connexion.

### Q : Les fichiers restent-ils après export ?
**R** : Oui ! L'export crée une copie. Les fichiers restent sur le serveur pour de futurs exports.

### Q : Combien de temps garde-t-on les fichiers ?
**R** : Actuellement, les fichiers sont conservés indéfiniment. Un système de nettoyage pourra être mis en place selon les besoins.

---

## 🚨 En cas de problème

### Upload ne fonctionne pas

1. **Vérifier la taille** du fichier (< 100 MB)
2. **Vérifier le type** (jpeg, png, pdf, mp4, etc.)
3. **Vérifier la connexion** internet
4. **Réessayer** ou contacter le support

### Fichiers manquants dans export

1. **Vérifier** que les fichiers ont bien été uploadés (message de confirmation)
2. **Réessayer** l'export
3. **Contacter** l'administrateur technique

### Export ZIP très lent

**Normal** si beaucoup de gros fichiers. Patienter ou :
1. **Filtrer** par date/agent pour exports plus petits
2. **Exporter en plusieurs fois**

---

## 📞 Support

Pour toute question ou problème :
- 📧 support@g-survey.com
- 📞 +XXX-XXX-XXXX
- 💬 Chat en ligne dans l'application

---

## 🎉 Résumé

✅ **Upload automatique** des fichiers lors de la soumission
✅ **3 types d'export** selon vos besoins
✅ **Export Complet** avec tous les fichiers organisés
✅ **Simple et rapide** à utiliser
✅ **Sécurisé** et fiable

**Profitez de cette nouvelle fonctionnalité pour enrichir vos sondages !** 📊📷🎥

---

**Dernière mise à jour** : 2 novembre 2025



