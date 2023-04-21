# Netflix Like

## Introduction

Ce projet est une application web de recherche de films utilisant l'API de The Movie DB. L'objectif principal est de permettre aux utilisateurs d'explorer et de rechercher des films facilement.
L'application est une SPA , elle comporte une barre de navigation pour effectuer des recherches de film , une page d'accueil avec une bannière mettant en avant un film,
deux listes de film par genre.
L'application possède également une page de recherche affichants les 20 films les plus pertinents en fonction de la recherche ( la page propose une pagination si il y a plus de 20 films ) .
Il est également possible d'accèder à la description du film en cliquant sur sa fiche.

## Installation

1. Récuperer le projet sur github et installer ses librairies

```
git clone git@github.com:JDeniauSimplon/Brief-NetflixClone.git
cd Brief-NetflixClone
npm install
```

2. Créer le fichier apikey.ts dans le dossier src , ajouter cette ligne au fichier puis renseigner votre clé API tmdb :

```
export const API_KEY = "replace with your API key"
```

3. Demarrer le projet via parcel

``` 
parcel index.html 
```

