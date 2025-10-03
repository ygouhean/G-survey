# 🤝 Guide de Contribution - G-Survey

Merci de votre intérêt pour contribuer à G-Survey ! Ce guide vous aidera à démarrer.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Structure du Projet](#structure-du-projet)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Processus de Revue](#processus-de-revue)

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- Soyez respectueux et professionnel
- Accueillez favorablement les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres membres

## 🚀 Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le projet sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/g-survey.git
cd g-survey
```

### 2. Créer une Branche

```bash
# Créez une branche pour votre fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite

# Ou pour un bugfix
git checkout -b fix/correction-bug
```

### 3. Faire vos Modifications

- Écrivez du code propre et commenté
- Suivez les conventions de code du projet
- Testez vos modifications

### 4. Commit

```bash
# Ajoutez vos fichiers
git add .

# Commit avec un message descriptif
git commit -m "feat: Ajoute la fonctionnalité X"
```

**Convention de messages de commit :**

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, pas de changement de code
- `refactor:` Refactoring de code
- `test:` Ajout de tests
- `chore:` Maintenance

### 5. Push et Pull Request

```bash
# Push vers votre fork
git push origin feature/ma-nouvelle-fonctionnalite
```

Créez ensuite une Pull Request sur GitHub avec :
- Un titre clair
- Une description détaillée des changements
- Des screenshots si applicable
- La référence aux issues concernées

## 🏗️ Structure du Projet

```
g-survey/
├── server/              # Backend
│   ├── config/         # Configuration
│   ├── models/         # Modèles de données
│   ├── routes/         # Routes API
│   ├── middleware/     # Middlewares
│   └── index.js       # Point d'entrée
├── src/                # Frontend
│   ├── components/     # Composants React
│   ├── layouts/       # Layouts
│   ├── pages/         # Pages
│   ├── services/      # Services API
│   └── store/         # State management
└── public/            # Assets statiques
```

## 💻 Standards de Code

### TypeScript/JavaScript

```typescript
// ✅ Bon
const getUserById = async (id: string): Promise<User> => {
  const user = await User.findById(id)
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

// ❌ Mauvais
const getUser = async (id) => {
  return await User.findById(id)
}
```

### React Components

```tsx
// ✅ Bon - Composant fonctionnel avec TypeScript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  )
}

// ❌ Mauvais - Sans types
export default function Button({ label, onClick, variant }) {
  return <button onClick={onClick}>{label}</button>
}
```

### CSS/TailwindCSS

```tsx
// ✅ Bon - Utilisation de classes Tailwind
<div className="flex items-center gap-4 p-6 rounded-lg bg-white dark:bg-gray-800">
  <span className="text-lg font-semibold">Content</span>
</div>

// ❌ Mauvais - Styles inline
<div style={{ display: 'flex', padding: '24px' }}>
  <span style={{ fontSize: '18px' }}>Content</span>
</div>
```

## 🧪 Tests

Avant de soumettre une PR, assurez-vous que :

1. **Le code compile sans erreurs**
```bash
npm run build
```

2. **Les tests passent** (quand implémentés)
```bash
npm test
```

3. **Le linting est OK**
```bash
npm run lint
```

4. **L'application fonctionne**
```bash
npm run dev
# Testez manuellement toutes les fonctionnalités affectées
```

## 🔍 Processus de Revue

### Checklist avant la PR

- [ ] Le code suit les conventions du projet
- [ ] Les tests passent
- [ ] La documentation est à jour
- [ ] Les commits sont propres et descriptifs
- [ ] Pas de code commenté inutile
- [ ] Pas de console.log oubliés
- [ ] Les dépendances sont nécessaires

### Ce que nous vérifions

1. **Qualité du Code**
   - Lisibilité et maintenabilité
   - Respect des patterns du projet
   - Gestion des erreurs

2. **Fonctionnalité**
   - La feature fonctionne comme prévu
   - Pas de régression
   - Edge cases gérés

3. **Performance**
   - Pas de requêtes inutiles
   - Optimisation des rendus React
   - Gestion de la mémoire

4. **Sécurité**
   - Validation des inputs
   - Protection contre les injections
   - Gestion correcte des tokens

## 🎯 Idées de Contributions

### Fonctionnalités

- [ ] Import/Export de sondages en masse
- [ ] Templates de sondages prédéfinis
- [ ] Notifications en temps réel
- [ ] Dashboard avancé avec BI
- [ ] Intégration avec d'autres services

### Améliorations

- [ ] Tests unitaires et d'intégration
- [ ] Documentation API avec Swagger
- [ ] CI/CD Pipeline
- [ ] Docker Compose pour déploiement facile
- [ ] Internationalisation (i18n)

### Bugs Connus

- [ ] Optimisation du chargement des grandes listes
- [ ] Amélioration de la synchronisation hors-ligne
- [ ] Correction des problèmes de timezone

## 📞 Contact

Pour toute question :
- Ouvrez une issue sur GitHub
- Contactez les mainteneurs du projet

---

Merci de contribuer à G-Survey ! 🎉