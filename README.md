# RPG-true

Ce projet contient un prototype de RPG textuel minimaliste en français.

## Utilisation

Ouvrez simplement `Index.html` dans un navigateur moderne. Le jeu sauvegarde
votre progression automatiquement dans `localStorage`.

## Déploiement

Le jeu peut être hébergé comme un simple site statique. Deux approches sont
possibles :

1. **GitHub Pages**
   - Placez l'ensemble des fichiers du projet dans une branche ou un dossier
     publié via GitHub Pages.
   - Rendez-vous ensuite à l'URL fournie par GitHub pour jouer directement en
     ligne.

2. **Serveur local**
   - Depuis le dossier du projet, lancez par exemple `python -m http.server` puis
     ouvrez `http://localhost:8000` dans votre navigateur.

Le jeu utilise Tailwind et Font Awesome via des CDN ; une connexion Internet est
nécessaire lors de l'exécution.

### Développement

Le code JavaScript se trouve maintenant dans `game.js` et les styles dans `style.css`. Les données (ennemis,
scénarios, inventaire) sont structurées pour faciliter l'ajout de nouveaux
éléments.

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus
d'informations.
