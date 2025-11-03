# 🚀 Guide Rapide : Mise à Jour du Profil Utilisateur

## Problème Résolu
Les champs de la page d'inscription (genre, nom d'utilisateur, pays, secteur, type d'organisation) sont maintenant disponibles dans la page Paramètres/Profil.

## ⚡ Application Rapide

### Windows (PowerShell)

```powershell
# 1. Arrêter le serveur backend (Ctrl+C)

# 2. Appliquer la migration
cd scripts
.\add-profile-fields.ps1

# 3. Redémarrer le serveur
cd ..\server
npm start
```

### Linux/Mac (Bash)

```bash
# 1. Arrêter le serveur backend (Ctrl+C)

# 2. Appliquer la migration
cd scripts
chmod +x add-profile-fields.sh
./add-profile-fields.sh

# 3. Redémarrer le serveur
cd ../server
npm start
```

## ✅ Vérification Rapide

1. **Ouvrir** http://localhost:5173/
2. **S'inscrire** avec un nouveau compte en remplissant TOUS les champs
3. **Se connecter** avec ce compte
4. **Aller dans** Paramètres > Profil
5. **Vérifier** que tous les champs sont bien affichés et modifiables

## 📝 Nouveaux Champs Disponibles

### Page d'Inscription ✅
- Nom d'utilisateur
- Genre
- Pays
- Secteur d'activité
- Type d'organisation

### Page Profil (Paramètres) ✅
Maintenant organisée en 3 sections :

**1. Informations de base**
- Nom, Prénoms, Genre, Nom d'utilisateur

**2. Informations de contact**
- Email (non modifiable), Téléphone

**3. Informations professionnelles**
- Pays (50+ options), Secteur (14 options), Type d'organisation (9 options)

## 🎯 Test Rapide

```
✓ Inscription avec tous les champs → OK
✓ Affichage dans le profil → OK
✓ Modification du profil → OK
✓ Sauvegarde des modifications → OK
```

## ⚠️ Important

- **Email** : Ne peut pas être modifié (par sécurité)
- **Nom d'utilisateur** : Doit être unique
- **Anciens comptes** : Les nouveaux champs seront vides, vous pouvez les remplir

## 🐛 Problème ?

### La migration échoue
→ Vérifiez que PostgreSQL est démarré

### "psql n'est pas reconnu"
→ Ajoutez PostgreSQL au PATH : `C:\Program Files\PostgreSQL\17\bin`

### Les champs ne s'affichent pas
→ Redémarrez le serveur backend

## 📚 Documentation Complète

Pour plus de détails, consultez : `MISE_A_JOUR_PROFIL_UTILISATEUR.md`

---

**C'est tout ! Votre application est maintenant à jour ! 🎉**


