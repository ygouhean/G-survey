# Mise à Jour : Synchronisation Profil et Inscription

## 📋 Vue d'ensemble

Cette mise à jour synchronise les champs de la page de profil (Paramètres) avec ceux de la page d'inscription, permettant aux utilisateurs de voir et modifier toutes les informations collectées lors de leur inscription.

## 🆕 Nouveaux Champs Ajoutés

### Dans la Base de Données (Table `users`)
- `username` - Nom d'utilisateur unique
- `gender` - Genre (male, female, other)
- `country` - Pays
- `sector` - Secteur d'activité
- `organization_type` - Type d'organisation

## 📝 Fichiers Modifiés

### Backend

#### 1. **server/models/User.js**
Ajout des nouveaux champs au modèle Sequelize :
```javascript
username: {
  type: DataTypes.STRING,
  allowNull: true,
  unique: true,
  trim: true
},
gender: {
  type: DataTypes.STRING,
  allowNull: true
},
country: {
  type: DataTypes.STRING,
  allowNull: true
},
sector: {
  type: DataTypes.STRING,
  allowNull: true
},
organizationType: {
  type: DataTypes.STRING,
  allowNull: true,
  field: 'organization_type'
}
```

#### 2. **server/routes/auth.js**
- ✅ Route `POST /api/auth/register` mise à jour pour sauvegarder les nouveaux champs
- ✅ Route `PUT /api/auth/update-profile` mise à jour pour permettre la modification
- ✅ Validation du nom d'utilisateur unique lors de la mise à jour

### Frontend

#### 3. **src/pages/Settings.tsx**
Refonte complète de l'onglet Profil avec trois sections :

**Informations de base :**
- Nom, Prénoms, Genre, Nom d'utilisateur

**Informations de contact :**
- Email (non modifiable), Téléphone

**Informations professionnelles :**
- Pays, Secteur d'activité, Type d'organisation

#### 4. **src/store/authStore.ts**
Mise à jour de l'interface `User` pour inclure les nouveaux champs optionnels

### Migration

#### 5. **server/migrations/add-profile-fields.sql**
Script SQL pour ajouter les colonnes à la table `users` :
- Création des colonnes avec `IF NOT EXISTS`
- Ajout d'index sur `username` pour les performances
- Commentaires de documentation

#### 6. **scripts/add-profile-fields.ps1** (Windows)
Script PowerShell automatisé pour appliquer la migration

#### 7. **scripts/add-profile-fields.sh** (Linux/Mac)
Script Bash automatisé pour appliquer la migration

## 🚀 Installation de la Mise à Jour

### Étape 1 : Arrêter le Serveur Backend

Si le serveur est en cours d'exécution, arrêtez-le avec `Ctrl+C`.

### Étape 2 : Appliquer la Migration de Base de Données

#### Sous Windows (PowerShell) :
```powershell
cd scripts
.\add-profile-fields.ps1
```

#### Sous Linux/Mac (Bash) :
```bash
cd scripts
chmod +x add-profile-fields.sh
./add-profile-fields.sh
```

#### Manuellement (avec psql) :
```bash
psql -h localhost -p 5432 -U postgres -d gsurvey -f server/migrations/add-profile-fields.sql
```

### Étape 3 : Redémarrer le Serveur Backend

```bash
cd server
npm start
```

### Étape 4 : Tester les Nouvelles Fonctionnalités

Le frontend n'a pas besoin d'être redémarré si déjà en cours d'exécution (hot reload).

## 🧪 Tests à Effectuer

### Test 1 : Inscription d'un Nouveau Utilisateur
1. Aller sur http://localhost:5173/register
2. Remplir tous les champs (y compris nom d'utilisateur, genre, pays, etc.)
3. S'inscrire
4. Vérifier la création du compte

### Test 2 : Vérification du Profil
1. Se connecter avec le nouveau compte
2. Aller dans Paramètres > Profil
3. Vérifier que tous les champs remplis à l'inscription sont affichés

### Test 3 : Modification du Profil
1. Dans Paramètres > Profil, modifier :
   - Le nom d'utilisateur
   - Le genre
   - Le pays
   - Le secteur d'activité
   - Le type d'organisation
2. Cliquer sur "Enregistrer les modifications"
3. Vérifier le message de succès
4. Rafraîchir la page
5. Vérifier que les modifications sont conservées

### Test 4 : Validation du Nom d'Utilisateur Unique
1. Créer un premier utilisateur avec username "test123"
2. Créer un second utilisateur avec le même username
3. Vérifier que l'erreur "Ce nom d'utilisateur est déjà utilisé" s'affiche

### Test 5 : Utilisateurs Existants
1. Se connecter avec un compte existant (créé avant la migration)
2. Aller dans Paramètres > Profil
3. Les nouveaux champs doivent être vides
4. Les remplir et sauvegarder
5. Vérifier que tout fonctionne

## 📊 Structure de la Page Profil

### Avant la Mise à Jour
```
┌─────────────────────────────────┐
│ Informations personnelles       │
├─────────────────────────────────┤
│ • Prénom                        │
│ • Nom                           │
│ • Email (non modifiable)        │
│ • Téléphone                     │
└─────────────────────────────────┘
```

### Après la Mise à Jour
```
┌─────────────────────────────────┐
│ Informations de base            │
├─────────────────────────────────┤
│ • Nom                           │
│ • Prénoms                       │
│ • Genre                         │
│ • Nom d'utilisateur             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Informations de contact         │
├─────────────────────────────────┤
│ • Email (non modifiable)        │
│ • Téléphone                     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Informations professionnelles   │
├─────────────────────────────────┤
│ • Pays (50+ pays)               │
│ • Secteur d'activité (14)       │
│ • Type d'organisation (9)       │
└─────────────────────────────────┘
```

## 🔍 Vérification de la Migration

### Vérifier que les colonnes ont été ajoutées :
```sql
-- Se connecter à la base de données
psql -h localhost -p 5432 -U postgres -d gsurvey

-- Lister les colonnes de la table users
\d users

-- Ou avec SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### Colonnes attendues :
```
     column_name     |          data_type          | is_nullable
---------------------+-----------------------------+-------------
 id                  | uuid                        | NO
 firstName           | character varying           | NO
 lastName            | character varying           | NO
 email               | character varying           | NO
 username            | character varying           | YES
 password            | character varying           | NO
 phone               | character varying           | YES
 gender              | character varying           | YES
 country             | character varying           | YES
 sector              | character varying           | YES
 organization_type   | character varying           | YES
 role                | USER-DEFINED                | NO
 teamId              | uuid                        | YES
 isActive            | boolean                     | NO
 lastLogin           | timestamp with time zone    | YES
 createdAt           | timestamp with time zone    | NO
 updatedAt           | timestamp with time zone    | NO
```

## 🛠️ Dépannage

### Erreur : "psql n'est pas reconnu"
**Solution :** Ajouter PostgreSQL au PATH système
- Windows : `C:\Program Files\PostgreSQL\17\bin`
- Linux : `sudo apt install postgresql-client`
- Mac : `brew install postgresql`

### Erreur : "La colonne existe déjà"
**Solution :** La migration a déjà été appliquée, rien à faire

### Erreur : "Connexion refusée"
**Solution :** Vérifier que PostgreSQL est en cours d'exécution

### Erreur : "Nom d'utilisateur déjà utilisé"
**Solution :** 
- Si c'est lors d'une inscription : choisir un autre nom d'utilisateur
- Si c'est lors d'une mise à jour : vous essayez d'utiliser un nom déjà pris

### Les nouveaux champs ne s'affichent pas
**Solution :** 
1. Vérifier que la migration a été appliquée
2. Redémarrer le serveur backend
3. Vider le cache du navigateur et rafraîchir la page

## 📋 Checklist Post-Migration

- [ ] Migration SQL appliquée avec succès
- [ ] Serveur backend redémarré
- [ ] Nouvelle inscription testée avec tous les champs
- [ ] Modification de profil testée
- [ ] Validation du nom d'utilisateur unique testée
- [ ] Utilisateurs existants peuvent accéder à leur profil
- [ ] Pas d'erreurs dans la console backend
- [ ] Pas d'erreurs dans la console frontend

## 🎯 Fonctionnalités Complètes

### Page d'Inscription
✅ Collecte : nom, prénoms, genre, nom d'utilisateur, email, mot de passe, pays, secteur, type d'organisation  
✅ Validation complète des champs  
✅ Sauvegarde de toutes les données  

### Page de Profil
✅ Affichage de tous les champs d'inscription  
✅ Modification possible de tous les champs (sauf email)  
✅ Validation du nom d'utilisateur unique  
✅ Organisation en sections claires  
✅ Design responsive  

### Base de Données
✅ Toutes les colonnes nécessaires ajoutées  
✅ Contraintes d'unicité sur username  
✅ Index pour les performances  
✅ Commentaires de documentation  

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifier les logs du serveur** : Regarder la console où le serveur backend tourne
2. **Vérifier les logs du navigateur** : F12 > Console
3. **Vérifier la base de données** : Utiliser psql ou pgAdmin pour inspecter les données
4. **Consulter la documentation** : Voir les autres fichiers .md du projet

## 🔄 Rollback (En cas de Problème)

Si vous devez annuler la migration :

```sql
-- Se connecter à la base de données
psql -h localhost -p 5432 -U postgres -d gsurvey

-- Supprimer les colonnes ajoutées
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS gender;
ALTER TABLE users DROP COLUMN IF EXISTS country;
ALTER TABLE users DROP COLUMN IF EXISTS sector;
ALTER TABLE users DROP COLUMN IF EXISTS organization_type;

-- Supprimer l'index
DROP INDEX IF EXISTS idx_users_username;
```

⚠️ **Attention** : Cela supprimera définitivement les données de ces colonnes !

## 📅 Informations de Version

- **Date de création** : 2 novembre 2025
- **Version** : 1.1.0
- **Compatibilité** : PostgreSQL 12+, Node.js 16+

---

**Mise à jour appliquée avec succès ? Profitez des nouvelles fonctionnalités ! 🎉**


