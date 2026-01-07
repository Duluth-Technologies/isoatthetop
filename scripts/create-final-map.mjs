import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import StaticMaps from 'staticmaps';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Coordonnées GPS des villes (les mêmes que dans generate-map.mjs)
const locations = {
  isola2000: { lat: 44.1847, lng: 7.1583, name: 'ISOLA 2000' },
  montpellier: { lat: 43.6108, lng: 3.8767, name: 'Montpellier', time: '~5h', color: '#ef4444' },
  marseille: { lat: 43.2965, lng: 5.3698, name: 'Marseille', time: '~3h30', color: '#f59e0b' },
  nice: { lat: 43.7102, lng: 7.2620, name: 'Nice', time: '~1h30', color: '#10b981' }
};

// Fonction pour calculer les positions pixel à partir des coordonnées GPS
function calculatePixelPositions() {
  const width = 1600;
  const height = 900;
  const paddingX = 80;
  const paddingY = 80;
  
  // Calculer les limites GPS de toutes les villes
  const allCities = [locations.montpellier, locations.marseille, locations.nice, locations.isola2000];
  const lats = allCities.map(c => c.lat);
  const lngs = allCities.map(c => c.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Ajouter un peu de marge
  const latMargin = (maxLat - minLat) * 0.15;
  const lngMargin = (maxLng - minLng) * 0.15;
  
  const boundsMinLat = minLat - latMargin;
  const boundsMaxLat = maxLat + latMargin;
  const boundsMinLng = minLng - lngMargin;
  const boundsMaxLng = maxLng + lngMargin;
  
  // Projection Mercator Web (EPSG:3857)
  function latToY(lat) {
    const rad = lat * Math.PI / 180;
    return Math.log(Math.tan(rad) + 1 / Math.cos(rad));
  }
  
  const boundsMinY = latToY(boundsMinLat);
  const boundsMaxY = latToY(boundsMaxLat);
  
  // Convertir coordonnées GPS en positions pixel
  const positions = {};
  for (const [key, city] of Object.entries(locations)) {
    // Normaliser longitude (0-1)
    const xNorm = (city.lng - boundsMinLng) / (boundsMaxLng - boundsMinLng);
    // Normaliser latitude avec projection Mercator (0-1)
    const yProj = latToY(city.lat);
    const yNorm = (yProj - boundsMinY) / (boundsMaxY - boundsMinY);
    
    // Convertir en pixels avec padding
    const x = Math.round(paddingX + xNorm * (width - 2 * paddingX));
    const y = Math.round(paddingY + (1 - yNorm) * (height - 2 * paddingY)); // Inverser Y
    
    positions[key] = {
      x,
      y,
      ...city
    };
  }
  
  return positions;
}

async function createFinalMap() {
  console.log('🎨 Création de la carte finale avec annotations...');

  const basePath = path.join(__dirname, '..', 'public', 'media', 'acces-carte-base.png');
  const outputPath = path.join(__dirname, '..', 'public', 'media', 'acces-carte.png');

  // Calculer les positions pixel des villes
  console.log('📍 Calcul des positions pixel à partir des coordonnées GPS...');
  const positions = calculatePixelPositions();
  
  console.log('Positions calculées:');
  console.log(`  Montpellier: (${positions.montpellier.x}, ${positions.montpellier.y})`);
  console.log(`  Marseille: (${positions.marseille.x}, ${positions.marseille.y})`);
  console.log(`  Nice: (${positions.nice.x}, ${positions.nice.y})`);
  console.log(`  Isola 2000: (${positions.isola2000.x}, ${positions.isola2000.y})`);

  // Générer les labels SVG avec positions calculées automatiquement
  const cityLabels = ['montpellier', 'marseille', 'nice'].map(cityKey => {
    const pos = positions[cityKey];
    const labelWidth = 200;
    const labelHeight = 70;
    const labelX = pos.x - labelWidth / 2;
    const labelY = pos.y + 25; // 25px sous le marqueur
    const textX = pos.x;
    const textY = labelY + 28;
    const timeY = textY + 29;
    
    return `
      <!-- ${pos.name} -->
      <rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}" rx="8" fill="#ffffff" fill-opacity="0.95" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
      <text x="${textX}" y="${textY}" font-size="18" font-weight="600" font-family="Arial, sans-serif" fill="#0f172a" text-anchor="middle">
        ${pos.name}
      </text>
      <text x="${textX}" y="${timeY}" font-size="26" font-weight="700" font-family="Arial, sans-serif" fill="${pos.color}" text-anchor="middle">
        ${pos.time}
      </text>
    `;
  }).join('\n');

  // SVG overlay avec toutes les annotations
  const svgOverlay = `
    <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Titre -->
      <rect x="550" y="20" width="500" height="90" rx="12" fill="#ffffff" fill-opacity="0.95" stroke="#cbd5e1" stroke-width="3" filter="url(#shadow)"/>
      <text x="800" y="60" font-size="36" font-weight="700" font-family="Arial, sans-serif" fill="#0f172a" text-anchor="middle">
        Accès à Isola 2000
      </text>
      <text x="800" y="90" font-size="16" font-family="Arial, sans-serif" fill="#64748b" text-anchor="middle">
        Temps de trajet depuis les principales villes
      </text>
      
      <!-- Labels des villes - générés automatiquement à partir des coordonnées GPS -->
      ${cityLabels}
      
      <!-- Isola 2000 (destination) - positionné automatiquement -->
      <rect x="${positions.isola2000.x - 140}" y="${positions.isola2000.y - 170}" width="280" height="100" rx="12" fill="#ef4444" fill-opacity="0.95" stroke="#ffffff" stroke-width="4" filter="url(#shadow)"/>
      <text x="${positions.isola2000.x}" y="${positions.isola2000.y - 130}" font-size="32" font-weight="800" font-family="Arial, sans-serif" fill="#ffffff" text-anchor="middle">
        ISOLA 2000
      </text>
      <text x="${positions.isola2000.x}" y="${positions.isola2000.y - 102}" font-size="15" font-family="Arial, sans-serif" fill="#fecaca" text-anchor="middle">
        Station de ski - 2000m
      </text>
      <text x="${positions.isola2000.x}" y="${positions.isola2000.y - 82}" font-size="14" font-family="Arial, sans-serif" fill="#fee2e2" text-anchor="middle">
        Alpes-Maritimes (06)
      </text>
      
      
      <!-- Note de bas de page -->
      <text x="800" y="880" font-size="11" font-family="Arial, sans-serif" fill="#475569" text-anchor="middle">
        Les temps de trajet sont indicatifs et peuvent varier selon les conditions. © OpenStreetMap contributors
      </text>
    </svg>
  `;

  // Composer l'image finale
  await sharp(basePath)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputPath);

  console.log(`✅ Carte finale créée avec succès : ${outputPath}`);
  console.log('\n🎉 Vous pouvez maintenant utiliser acces-carte.png dans votre site !');
}

createFinalMap().catch(error => {
  console.error('❌ Erreur lors de la création de la carte finale:', error);
  process.exit(1);
});
