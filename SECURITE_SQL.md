# 🔒 Sécurité SQL - Protection contre les injections

## ✅ Protection mise en place

### 1. Utilisation de Sequelize ORM

Sequelize protège automatiquement contre les injections SQL en utilisant des requêtes paramétrées.

**Exemple sécurisé :**
```javascript
const user = await User.findOne({ 
  where: { email: req.body.email } 
});
```

### 2. Requêtes SQL brutes avec paramètres

Toutes les requêtes SQL brutes utilisent des **paramètres nommés** via `replacements` :

**✅ Correct :**
```javascript
await sequelize.query(`
  SELECT ST_Y(location) as lat, ST_X(location) as lon 
  FROM responses 
  WHERE id = :responseId
`, {
  replacements: { responseId: response.id },
  type: sequelize.QueryTypes.SELECT
});
```

**❌ Incorrect (vulnérable) :**
```javascript
// NE JAMAIS FAIRE ÇA
await sequelize.query(`
  SELECT * FROM responses WHERE id = ${response.id}
`);
```

### 3. Validation des données géographiques

Pour les coordonnées PostGIS utilisant `sequelize.literal`, validation stricte :

```javascript
// Validation et conversion
const longitude = parseFloat(location.coordinates[0])
const latitude = parseFloat(location.coordinates[1])

// Vérification des types
if (isNaN(longitude) || isNaN(latitude)) {
  return res.status(400).json({
    success: false,
    message: 'Coordonnées géographiques invalides'
  })
}

// Vérification des plages valides
if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
  return res.status(400).json({
    success: false,
    message: 'Coordonnées géographiques hors limites'
  })
}

// Utilisation sécurisée
responseData.location = sequelize.literal(
  `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
);
```

### 4. Validation des entrées utilisateur

Utilisation d'`express-validator` pour valider toutes les entrées :

```javascript
router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
  ],
  async (req, res, next) => {
    // ...
  }
);
```

## 📋 Requêtes vérifiées

### ✅ Requêtes sécurisées (utilisent `replacements`)

1. **server/routes/exports.js**
   - Ligne 73-80 : Requête PostGIS avec `replacements: { responseId }`
   - Ligne 221-228 : Requête PostGIS avec `replacements: { responseId }`
   - Ligne 336-343 : Requête PostGIS avec `replacements: { responseId }`
   - Ligne 500-507 : Requête PostGIS avec `replacements: { responseId }`

2. **server/routes/analytics.js**
   - Ligne 391-408 : Requête avec `replacements: { surveyId, startDate, dateFormat }`

3. **server/config/database.js**
   - Ligne 97 : Requête statique (CREATE EXTENSION) - pas de paramètres utilisateur
   - Ligne 119, 191 : Requêtes de test statiques - pas de paramètres utilisateur

### ✅ Requêtes corrigées (validation ajoutée)

1. **server/routes/responses.js**
   - Ligne 403-428 : Validation des coordonnées avant `sequelize.literal`
   - Ligne 648-658 : Validation des coordonnées dans bulkResponseData

## 🛡️ Bonnes pratiques appliquées

1. **Toujours utiliser Sequelize ORM** pour les requêtes standard
2. **Utiliser `replacements`** pour toutes les requêtes SQL brutes
3. **Valider et sanitizer** toutes les entrées utilisateur
4. **Valider les types** avant d'utiliser `sequelize.literal`
5. **Valider les plages** pour les coordonnées géographiques
6. **Ne jamais concaténer** des valeurs utilisateur dans des requêtes SQL

## ⚠️ Points d'attention

### Requêtes avec sequelize.literal

Les requêtes utilisant `sequelize.literal` doivent être validées manuellement car elles construisent du SQL brut.

**Exemple sécurisé :**
```javascript
// ✅ Validation stricte avant utilisation
const longitude = parseFloat(coords[0])
const latitude = parseFloat(coords[1])

if (isNaN(longitude) || isNaN(latitude)) {
  throw new Error('Coordonnées invalides')
}

if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
  throw new Error('Coordonnées hors limites')
}

// Utilisation sécurisée après validation
sequelize.literal(`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`)
```

## 🔍 Tests de sécurité recommandés

1. **Tester avec des valeurs malveillantes :**
   ```javascript
   // Tentative d'injection SQL
   const maliciousInput = "'; DROP TABLE users; --"
   
   // Devrait être rejeté par la validation
   ```

2. **Tester avec des types invalides :**
   ```javascript
   // Tentative avec des types incorrects
   const invalidCoords = ["not a number", "also not a number"]
   
   // Devrait être rejeté par parseFloat et validation
   ```

3. **Tester avec des valeurs hors limites :**
   ```javascript
   // Tentative avec des coordonnées hors limites
   const outOfBounds = [999, 999]
   
   // Devrait être rejeté par la validation de plage
   ```

---

**Date de vérification :** Décembre 2024  
**Statut :** ✅ Toutes les requêtes SQL sont sécurisées  
**Protection :** ✅ Requêtes paramétrées + Validation des entrées

