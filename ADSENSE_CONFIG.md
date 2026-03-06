# 📱 Intégration Google AdSense

## Configuration

Le script AdSense a été ajouté dans `index.html` avec le client ID : `ca-pub-3185416709429781`

## Composant AdSense

Un composant réutilisable a été créé : `src/components/AdSense.jsx`

**Utilisation :**
```jsx
import AdSense from './AdSense';

<AdSense format="horizontal" slot="1234567890" />
```

**Formats disponibles :**
- `horizontal` - Bannière horizontale (728x90, 970x90, etc.)
- `vertical` - Publicité verticale (300x600)
- `square` - Carré (300x250)
- `responsive` - Responsive automatique (par défaut)

## Emplacements des publicités

Les publicités ont été intégrées aux endroits clés :

### 📍 Menu (page d'accueil)
- En bas de la page (horizontal)

### 📍 Mode Classique
- Après la légende des couleurs (horizontal)

### 📍 Mode Citation
- Après la liste des tentatives (horizontal)

### 📍 Mode Emoji
- Après la liste des tentatives (horizontal)

### 📍 Classement
- En bas du classement (horizontal)

### 📍 Profil Joueur
- En bas du profil (horizontal)

## Configuration Google AdSense

Pour activer les publicités, tu dois :

1. **Vérifier le domaine** : Ajoute ton domaine dans Google AdSense
2. **Remplacer les slots** : Les publicités utilisent le slot `1234567890` (placeholder)
   - Crée des slots différents dans AdSense
   - Remplace les values de `slot` dans chaque composant

3. **Attendre l'approbation** : Google approuvera ton site après quelques jours
4. **Tester** : Les publicités ne s'afficheront qu'avec un domaine approuvé

## Notes

- Les publicités ne s'affichent **que** sur les domaines approuvés par Google
- En développement local, tu verras juste le placeholder
- Chaque emplacement peut avoir un slot différent pour mieux tracker les performances
- L'ID du client reste confidentiel, ne le partage pas publiquement

## Personnalisation

Pour ajouter une publicité ailleurs :

```jsx
import AdSense from './AdSense';

// Dans ton composant
<AdSense format="horizontal" slot="YOUR_SLOT_ID" />
```

Remplace `YOUR_SLOT_ID` par ton ID de slot AdSense.

