# Correction de la Fermeture Automatique des Sondages

## 🔧 Problème corrigé

La fermeture automatique des sondages se produisait à une heure incorrecte (13h) au lieu de la fin de journée.

## ✅ Solution implémentée

Les sondages se ferment maintenant automatiquement à **23h59:59** de la date de fin définie.

## 📋 Modifications apportées

### Fichier: `server/models/Survey.js`

#### 1. Méthode `closeExpiredSurveys()`

**Avant:**
```javascript
// Comparait directement endDate avec now
// Ce qui pouvait fermer le sondage à 00:00:00 ou selon le fuseau horaire
endDate: {
  [Op.lt]: now
}
```

**Après:**
```javascript
// Récupère tous les sondages actifs avec endDate
// Puis filtre manuellement pour vérifier avec 23:59:59
const surveysToClose = expiredSurveys.filter(survey => {
  if (!survey.endDate) return false;
  
  // Créer une date à 23:59:59 du jour de fin
  const endDateTime = new Date(survey.endDate);
  endDateTime.setHours(23, 59, 59, 999);
  
  return endDateTime < now;
});
```

#### 2. Méthode `checkAndCloseIfExpired()`

**Avant:**
```javascript
if (this.status === 'active' && this.endDate && new Date(this.endDate) < now) {
  // Ferme immédiatement
}
```

**Après:**
```javascript
if (this.status === 'active' && this.endDate) {
  // Créer une date à 23:59:59 du jour de fin
  const endDateTime = new Date(this.endDate);
  endDateTime.setHours(23, 59, 59, 999);
  
  if (endDateTime < now) {
    // Ferme à 23:59:59
  }
}
```

## 🕐 Exemple de fonctionnement

### Scénario
- **Date de fin du sondage:** 15 janvier 2025
- **Sondage actif jusqu'à:** 15 janvier 2025 à 23:59:59

### Timeline
- ✅ **15 janvier 2025 à 08:00** → Sondage actif
- ✅ **15 janvier 2025 à 15:00** → Sondage actif
- ✅ **15 janvier 2025 à 23:00** → Sondage actif
- ✅ **15 janvier 2025 à 23:59:59** → Sondage actif (dernière seconde)
- ❌ **16 janvier 2025 à 00:00:00** → Sondage fermé automatiquement

## 🔍 Déclenchement de la fermeture

La vérification se fait automatiquement via:

1. **Hook `beforeFind`** sur le modèle Survey
   - Se déclenche avant chaque requête de recherche
   - Appelle `Survey.closeExpiredSurveys()`

2. **Méthode d'instance `checkAndCloseIfExpired()`**
   - Peut être appelée manuellement sur une instance de sondage
   - Utilise la même logique de 23:59:59

## 📊 Impact

### Avantages
- ✅ Les sondages restent ouverts toute la journée de la date de fin
- ✅ Comportement plus intuitif pour les utilisateurs
- ✅ Maximise la période de collecte de données
- ✅ Cohérent avec les attentes business (fermeture en fin de journée)

### Cas d'usage
Un sondage avec:
- **Date de début:** 1er janvier 2025
- **Date de fin:** 31 janvier 2025

Sera accessible du **1er janvier 2025 à 00:00:00** jusqu'au **31 janvier 2025 à 23:59:59**, soit une période complète de 31 jours.

## 🧪 Test

Pour tester cette fonctionnalité:

1. Créer un sondage avec une date de fin = aujourd'hui
2. Vérifier que le sondage reste actif toute la journée
3. À minuit (00:00:00 du lendemain), le sondage doit se fermer automatiquement
4. Le champ `autoClosedAt` doit être rempli avec l'heure de fermeture

## 📝 Note technique

L'utilisation de `setHours(23, 59, 59, 999)` garantit:
- **23 heures**
- **59 minutes**
- **59 secondes**
- **999 millisecondes**

Ce qui représente la dernière milliseconde de la journée avant minuit.



