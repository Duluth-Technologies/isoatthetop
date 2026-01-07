# Génération de la Carte d'Accès à Isola 2000

Ce dossier contient les scripts pour générer automatiquement une carte avec un vrai fond OpenStreetMap montrant les temps de trajet vers Isola 2000.

## 📋 Prérequis

Les dépendances sont déjà installées :
- `staticmaps` - Pour générer des cartes statiques avec OpenStreetMap
- `sharp` - Pour composer l'image finale avec les annotations

## 🚀 Utilisation

### Génération complète de la carte

Pour générer la carte complète avec le fond OpenStreetMap et toutes les annotations :

```bash
npm run generate:map
```

Cette commande exécute automatiquement les deux scripts :
1. `generate-map.mjs` - Télécharge les tuiles OpenStreetMap et crée la carte de base
2. `create-final-map.mjs` - Ajoute tous les labels, temps de trajet et légendes

### Génération étape par étape

Si vous voulez exécuter les scripts séparément :

```bash
# 1. Générer la carte de base avec OpenStreetMap
node scripts/generate-map.mjs

# 2. Ajouter les annotations (labels, temps, légende)
node scripts/create-final-map.mjs
```

## 📁 Fichiers générés

- `public/media/acces-carte-base.png` - Carte OpenStreetMap de base avec marqueurs
- `public/media/acces-carte.png` - Carte finale avec toutes les annotations

## 🎨 Personnalisation

### Modifier les villes ou temps de trajet

Éditez [`generate-map.mjs`](./generate-map.mjs) pour modifier les coordonnées ou ajouter d'autres villes :

```javascript
const locations = {
  isola2000: { lat: 44.1847, lng: 7.1583, name: 'Isola 2000' },
  montpellier: { lat: 43.6108, lng: 3.8767, name: 'Montpellier' },
  // Ajoutez d'autres villes ici
};
```

### Modifier les labels et styles

Éditez [`create-final-map.mjs`](./create-final-map.mjs) pour personnaliser :
- Les temps de trajet affichés
- Les couleurs et tailles de police
- Les informations pratiques
- La position des labels

### Modifier la taille de la carte

Dans `generate-map.mjs`, changez les dimensions :

```javascript
const options = {
  width: 1600,  // Largeur en pixels
  height: 900,  // Hauteur en pixels
  // ...
};
```

N'oubliez pas de modifier aussi les dimensions du SVG dans `create-final-map.mjs`.

## 🗺️ Informations sur la carte

La carte affiche :
- **Montpellier** → Isola 2000 : ~5h (rouge)
- **Marseille** → Isola 2000 : ~3h30 (orange)
- **Nice** → Isola 2000 : ~1h30 (vert)

Chaque trajet est représenté par une ligne bleue connectant la ville à Isola 2000.

## 📝 Notes

- Les temps de trajet sont **indicatifs** et peuvent varier
- Les tuiles OpenStreetMap sont téléchargées à la demande
- La carte utilise les données © OpenStreetMap contributors
- La génération peut prendre quelques secondes selon votre connexion Internet

## 🔄 Régénération

Vous devrez peut-être régénérer la carte si :
- Vous modifiez les temps de trajet
- Vous ajoutez/supprimez des villes
- Vous changez les informations affichées
- Vous voulez une carte à jour avec les dernières données OpenStreetMap
