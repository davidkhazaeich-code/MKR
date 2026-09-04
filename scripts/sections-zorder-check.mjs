/**
 * Detecte les cretes de montagne INVISIBLES.
 *
 * Une section masquee remonte sur la precedente et decoupe une crete dans son
 * propre fond. Pour qu'on la voie, elle doit peindre PAR-DESSUS la section du
 * haut. Les classes fx-stack-N ont ete posees a la main page par page : quand
 * elles ne suivent pas l'ordre du DOM, la section du haut repasse devant et la
 * jonction redevient un bord horizontal plat.
 *
 * Usage : node .tmp/qa-zorder.mjs [chemin...]
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '/', '/le-camp', '/familles', '/logistique', '/preparer-son-camp',
      '/comment-ca-marche', '/programme', '/programme/lutte', '/programme/mma',
      '/programme/lutte-enfants', '/sessions', '/destinations',
      '/destinations/dagestan', '/destinations/tchetchenie', '/sur-mesure',
      '/clubs-groupes', '/a-propos', '/galerie', '/mkr-camp-2026',
      '/temoignages', '/contact', '/faq', '/blog',
    ]

const PROBE = () => {
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : ''
    const cls =
      el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).filter(c => c.startsWith('fx-') || !c.includes('-') || c.includes('section') || c.includes('band')).slice(0, 3).join('.')
        : ''
    return `${el.tagName.toLowerCase()}${id}${cls}`
  }
  const main = document.getElementById('main')
  const blocks = []
  for (const el of main.children) {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    if (r.height < 40) continue
    blocks.push({
      el,
      z: cs.zIndex === 'auto' ? null : Number(cs.zIndex),
      pull: parseFloat(cs.marginTop) || 0,
      clipped: cs.clipPath !== 'none' && cs.clipPath.startsWith('polygon'),
      name: describe(el),
    })
  }
  const bad = []
  for (let i = 1; i < blocks.length; i++) {
    const cur = blocks[i]
    const prev = blocks[i - 1]
    if (cur.pull >= 0 || !cur.clipped) continue // pas de crete a montrer
    const zc = cur.z, zp = prev.z
    // A z-index egal ou si la precedente n'en a pas, l'ordre du DOM suffit.
    const hidden = zc === null ? zp !== null && zp > 0 : zp !== null && zp > zc
    if (hidden) {
      bad.push({ prev: prev.name, zp, cur: cur.name, zc, pull: Math.round(cur.pull) })
    }
  }
  return bad
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1920, height: 900 } })
const page = await ctx.newPage()
let total = 0
for (const path of PAGES) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
  const bad = await page.evaluate(PROBE)
  if (bad.length) {
    console.log(`\n### ${path} — ${bad.length} crete(s) masquee(s)`)
    for (const b of bad) {
      console.log(`  ${b.cur} (z=${b.zc ?? 'auto'}, remonte de ${-b.pull}px)`)
      console.log(`    passe DERRIERE  ${b.prev} (z=${b.zp}) → jonction plate`)
    }
    total += bad.length
  }
}
await browser.close()
console.log(`\n${total === 0 ? 'OK — toutes les cretes peignent par-dessus' : `TOTAL ${total} crete(s) invisible(s)`}`)
process.exit(total === 0 ? 0 : 1)
