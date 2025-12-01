# Nurse-dle 🏥

Un jeu de devinette inspiré de Wordle, adapté pour les étudiants infirmiers. Devinez la pathologie du jour en utilisant différents modes de jeu !

## 🎮 Modes de Jeu

- **Mode Classique** : Devinez la pathologie en comparant les caractéristiques (Système, Type, Urgence, Population, Chronique)
- **Mode Citation** : Devinez à partir d'une citation de patient
- **Mode Emoji** : Devinez à partir d'émojis
- **Mode Image** : En développement 🚧

## 🚀 Déploiement sur Netlify

### Méthode 1 : Déploiement via Git (Recommandé)

1. **Pousser votre code sur GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <votre-repo-url>
   git push -u origin main
   ```

2. **Connecter à Netlify**
   - Allez sur [netlify.com](https://www.netlify.com)
   - Cliquez sur "Add new site" → "Import an existing project"
   - Connectez votre repository Git
   - Netlify détectera automatiquement les paramètres :
     - **Build command** : `npm run build`
     - **Publish directory** : `dist`
   - Cliquez sur "Deploy site"

### Méthode 2 : Déploiement par Drag & Drop

1. **Build le projet localement**
   ```bash
   npm run build
   ```

2. **Déployer sur Netlify**
   - Allez sur [app.netlify.com/drop](https://app.netlify.com/drop)
   - Glissez-déposez le dossier `dist` généré
   - Votre site sera déployé en quelques secondes !

### Configuration

Le fichier `netlify.toml` est déjà configuré avec :
- Commande de build : `npm run build`
- Dossier de publication : `dist`
- Redirections SPA pour React Router

## 🛠️ Développement Local

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 📦 Technologies

- **React** - Framework UI
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Lucide React** - Icônes
- **CSS** - Styling avec Glassmorphism

## 📝 Notes

- Une pathologie différente chaque jour (même pour tous les joueurs)
- Progression sauvegardée dans le localStorage
- 85 pathologies disponibles couvrant toutes les spécialités médicales
