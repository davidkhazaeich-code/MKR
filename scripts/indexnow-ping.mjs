#!/usr/bin/env node
/**
 * IndexNow ping script — soumet les URLs MKR à Bing + Yandex en une requête.
 *
 * Usage :
 *   node scripts/indexnow-ping.mjs                  # tout le sitemap
 *   node scripts/indexnow-ping.mjs / /sessions      # URLs spécifiques (relatives à HOST)
 *   IndexNow doc : https://www.indexnow.org/documentation
 */

const HOST = 'mkrcamp.com'
const KEY = 'a5144c79a1d2c1992254d725a82a159e'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

// URLs publiques principales (sync avec src/app/sitemap.ts si tu en ajoutes)
const ALL_URLS = [
  '/',
  '/le-camp',
  '/programme',
  '/programme/mma',
  '/programme/lutte',
  '/programme/lutte-enfants',
  '/familles',
  '/mkr-camp-2026',
  '/sur-mesure',
  '/clubs-groupes',
  '/sessions',
  '/destinations',
  '/destinations/dagestan',
  '/destinations/tchetchenie',
  '/comment-ca-marche',
  '/preparer-son-camp',
  '/logistique',
  '/temoignages',
  '/galerie',
  '/faq',
  '/blog',
  '/blog/pourquoi-le-dagestan-domine-le-mma',
  '/blog/preparer-son-premier-camp',
  '/blog/lutte-daghestanaise-guide-complet',
  '/blog/securite-dagestan-2026',
  '/blog/nutrition-athlete-combat',
  '/blog/khabib-methode-entrainement',
  '/guide-caucase',
  '/a-propos',
  '/contact',
]

const args = process.argv.slice(2)
const targets = args.length ? args : ALL_URLS

const urlList = targets.map(u => `https://${HOST}${u.startsWith('/') ? u : '/' + u}`)

const body = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
}

console.log(`Pinging IndexNow with ${urlList.length} URLs...`)
console.log(`Key location: ${KEY_LOCATION}`)

// Bing (relais principal, partage avec Yandex + Naver)
const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})

if (res.ok) {
  console.log(`OK (HTTP ${res.status})`)
} else {
  console.error(`Failed (HTTP ${res.status}): ${await res.text()}`)
  process.exit(1)
}
