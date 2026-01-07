import StaticMaps from 'staticmaps';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coordonnées des villes
const locations = {
  isola2000: { lat: 44.1847, lng: 7.1583, name: 'Isola 2000' },
  montpellier: { lat: 43.6108, lng: 3.8767, name: 'Montpellier' },
  marseille: { lat: 43.2965, lng: 5.3698, name: 'Marseille' },
  nice: { lat: 43.7102, lng: 7.2620, name: 'Nice' }
};

async function generateMap() {
  console.log('🗺️  Génération de la carte avec OpenStreetMap...');

  // Options de la carte
  const options = {
    width: 1600,
    height: 900,
    paddingX: 80,
    paddingY: 80,
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    tileSubdomains: ['a', 'b', 'c', 'd'],
    reverseY: false
  };

  const map = new StaticMaps(options);

  // Ajouter les lignes de trajet (polylines)
  const cities = [locations.montpellier, locations.marseille, locations.nice];
  
  for (const city of cities) {
    // Ligne de trajet vers Isola 2000
    map.addLine({
      coords: [
        [city.lng, city.lat],
        [locations.isola2000.lng, locations.isola2000.lat]
      ],
      color: '#3b82f6',
      width: 4
    });
  }

  // Ajouter des cercles pour les marqueurs (en utilisant des polygones)
  // Villes de départ
  for (const city of cities) {
    map.addCircle({
      coord: [city.lng, city.lat],
      radius: 8000, // rayon en mètres
      color: '#3b82f6',
      fill: '#3b82f6',
      width: 3
    });
  }

  // Isola 2000
  map.addCircle({
    coord: [locations.isola2000.lng, locations.isola2000.lat],
    radius: 10000, // rayon en mètres
    color: '#ef4444',
    fill: '#ef4444',
    width: 4
  });

  // Générer la carte
  console.log('📥 Téléchargement des tuiles OpenStreetMap...');
  await map.render();

  // Sauvegarder en PNG
  const outputPath = path.join(__dirname, '..', 'public', 'media', 'acces-carte-base.png');
  console.log('💾 Sauvegarde de la carte...');
  await map.image.save(outputPath);

  console.log(`✅ Carte de base générée avec succès : ${outputPath}`);
  console.log('\n📝 Maintenant, vous pouvez ajouter les annotations (temps de trajet, labels) avec un éditeur d\'image');
  console.log('    ou utiliser cette carte comme fond pour un SVG overlay.');
}

// Exécuter le script
generateMap().catch(error => {
  console.error('❌ Erreur lors de la génération de la carte:', error);
  process.exit(1);
});
