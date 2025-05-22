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
   - Exécutez `npm start` pour lancer un petit serveur Node et ouvrir le jeu sur http://localhost:8080.
   - Vous pouvez également utiliser `python -m http.server` puis ouvrir `http://localhost:8000`.

Le jeu utilise Tailwind et Font Awesome via des CDN ; une connexion Internet est
nécessaire lors de l'exécution.

### Ambiance sonore

Une musique d'ambiance minimaliste est générée à l'aide de l'API Web Audio.
Les bruitages principaux (attaques, soins...) sont également produits
dynamiquement afin de renforcer l'atmosphère lors des combats.

### Développement

Le code JavaScript se trouve maintenant dans `game.js` et les styles dans `style.css`.
Les données (ennemis, scénarios, inventaire) sont structurées pour faciliter l'ajout
de nouveaux éléments.

### Évolutions de classe

À partir du niveau 3, votre personnage peut évoluer vers une version avancée de sa
classe. Chaque classe de base dispose désormais de plusieurs évolutions possibles
aux bonus variés (attaque, défense, critique, esquive, etc.). Les avantages sont
affichés lors du choix et rappelés quand l'évolution est appliquée.

### Récompenses et ressources

Chaque ennemi vaincu rapporte désormais une petite somme d'or. Les gains de
statistiques lors d'un passage de niveau sont indiqués dans le journal de
combat. La génération d'énergie du voleur a également été augmentée pour rendre
ses compétences plus faciles à utiliser.

### Système de craft

L'atelier affiche maintenant la liste des ingrédients nécessaires à la
fabrication de chaque objet afin de planifier plus facilement vos récoltes.
Les quantités possédées sont indiquées directement pour savoir ce qu'il vous
manque.

Dans l'inventaire, les consommables apparaissent désormais en vert tandis que
les composants de craft sont affichés en violet pour une meilleure clarté.

### Dialogues et quêtes

Des PNJ proposent désormais de courtes conversations. Certaines réponses
déclenchent des quêtes avec des récompenses en or, ajoutant un peu de contexte
au périple.

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus
d'informations.
