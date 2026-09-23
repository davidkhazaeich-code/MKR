// Genere public/images/world-map-dots.svg, le fond pointille de la carte
// "Comment y aller" (composant WorldMap).
//
// La carte etait calculee par dotted-map a chaque rendu puis inlinee en data
// URI, deux fois (balise img + preload) : 2,2 Mo dans le HTML de l'accueil,
// FR et EN. Elle ne depend d'aucune donnee, c'est donc un fichier statique.
//
// A relancer seulement si un parametre ci-dessous change :
//   node scripts/generate-world-map.mjs

import DottedMap from 'dotted-map'
import { writeFileSync } from 'node:fs'

const map = new DottedMap({ height: 100, grid: 'diagonal' })

const svg = map.getSVG({
  radius: 0.22,
  color: 'rgba(200,75,49,0.28)',
  shape: 'circle',
  backgroundColor: '#0E0E0E',
})

const out = new URL('../public/images/world-map-dots.svg', import.meta.url)
writeFileSync(out, svg)
console.log(`world-map-dots.svg : ${(Buffer.byteLength(svg) / 1024).toFixed(0)} Ko`)
