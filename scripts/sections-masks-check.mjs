/**
 * QA "masques d'intersection".
 *
 * Le site emboite chaque section dans la precedente : margin-top negatif +
 * clip-path en crete de montagne. La zone d'intrusion d'une section masquee va
 * donc du haut de sa boite (deja remontee par la marge negative) jusqu'au creux
 * le plus bas de sa crete. Tout ce que la section PRECEDENTE dessine dans cette
 * bande passe sous la montagne.
 *
 * On mesure ca geometriquement (et pas au elementFromPoint) parce qu'un
 * clip-path evide la zone des pics : le hit-testing ne voit donc rien, alors
 * que l'oeil, lui, voit la crete traverser le texte.
 *
 * Usage : node .tmp/qa-masks.mjs [chemin...]
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'
const WIDTHS = [1024, 1440, 1920, 2560]
const PAGES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '/',
      '/le-camp',
      '/familles',
      '/logistique',
      '/preparer-son-camp',
      '/comment-ca-marche',
      '/programme',
      '/programme/lutte',
      '/programme/mma',
      '/programme/lutte-enfants',
      '/sessions',
      '/destinations',
      '/destinations/dagestan',
      '/destinations/tchetchenie',
      '/sur-mesure',
      '/clubs-groupes',
      '/a-propos',
      '/galerie',
      '/mkr-camp-2026',
      '/temoignages',
      '/contact',
      '/faq',
      '/blog',
    ]

const PROBE = () => {
  const describe = (el) => {
    if (!el) return 'null'
    const id = el.id ? `#${el.id}` : ''
    const cls =
      el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : ''
    return `${el.tagName.toLowerCase()}${id}${cls}`
  }

  // Les blocs de premier niveau qui composent la page.
  const blocks = []
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el)
    const isBlock =
      el.tagName === 'SECTION' ||
      el.classList.contains('voyage-reveal-outer') ||
      el.classList.contains('vvs-section') ||
      el.classList.contains('page-hero')
    if (!isBlock) continue
    if (el.closest('#site-header, #mobile-menu, .wa-float-root, .cookie-consent')) continue
    const r = el.getBoundingClientRect()
    if (r.height < 40) continue
    blocks.push({
      el,
      top: r.top + window.scrollY,
      bottom: r.bottom + window.scrollY,
      clip: cs.clipPath,
      marginTop: parseFloat(cs.marginTop) || 0,
      z: cs.zIndex,
    })
  }
  blocks.sort((a, b) => a.top - b.top)

  // profondeur maximale de la crete, en px, lue dans le polygone du clip-path
  const crestDepth = (clip) => {
    if (!clip || clip === 'none' || !clip.startsWith('polygon')) return 0
    const nums = [...clip.matchAll(/([\d.]+)px/g)].map((m) => parseFloat(m[1]))
    // polygon(x y, x y, ...) : on prend les y (index impairs) de la crete haute,
    // c'est a dire tant qu'on n'a pas atteint les deux derniers points (le bas).
    const ys = []
    for (let i = 1; i < nums.length; i += 2) ys.push(nums[i])
    if (!ys.length) return 0
    const top = ys.filter((y) => y < window.innerHeight)
    return top.length ? Math.max(...top) : 0
  }

  const CONTENT_SEL =
    'h1, h2, h3, h4, h5, p, li, img, figure, .label-tag, .card-title, .card-body, ' +
    '.btn-primary, .btn-ghost, button, table, .content-card, .photo-card, .stat-value, .stat-label'

  // Boite REELLEMENT visible : on intersecte avec chaque ancetre qui rogne.
  // Sans ca, le <p> d'un accordeon replie (max-height:0 + overflow:hidden)
  // rend sa hauteur naturelle et fait croire a une intrusion.
  const visibleRect = (el) => {
    const r = el.getBoundingClientRect()
    let box = { top: r.top, bottom: r.bottom, left: r.left, right: r.right }
    let n = el.parentElement
    while (n && n !== document.body) {
      const cs = getComputedStyle(n)
      if (/hidden|clip|auto|scroll/.test(cs.overflowY) || /hidden|clip|auto|scroll/.test(cs.overflowX)) {
        const pr = n.getBoundingClientRect()
        box = {
          top: Math.max(box.top, pr.top),
          bottom: Math.min(box.bottom, pr.bottom),
          left: Math.max(box.left, pr.left),
          right: Math.min(box.right, pr.right),
        }
      }
      n = n.parentElement
    }
    return box
  }

  const findings = []
  for (let i = 1; i < blocks.length; i++) {
    const cur = blocks[i]
    const prev = blocks[i - 1]
    if (prev.el.contains(cur.el) || cur.el.contains(prev.el)) continue

    const depth = crestDepth(cur.clip)
    const pull = cur.marginTop < 0 ? -cur.marginTop : 0
    // Rien ne remonte et pas de crete : pas de masque, on passe.
    if (depth === 0 && pull === 0) continue

    // Bande d'intrusion : du haut de la boite masquee jusqu'au creux de la crete.
    const bandTop = cur.top
    const bandBottom = cur.top + depth

    for (const el of prev.el.querySelectorAll(CONTENT_SEL)) {
      if (el.querySelector(CONTENT_SEL)) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue
      if (cs.position === 'fixed') continue
      const r = visibleRect(el)
      if (r.bottom - r.top < 4 || r.right - r.left < 4) continue
      const top = r.top + window.scrollY
      const bottom = r.bottom + window.scrollY
      if (bottom <= bandTop) continue // au-dessus de l'intrusion : sain
      if (top >= bandBottom && depth > 0) {
        // sous le creux de la crete : entierement recouvert par l'opaque
      }
      const overlap = Math.min(bottom, Math.max(bandBottom, bandTop)) - Math.max(top, bandTop)
      if (overlap <= 1) continue
      findings.push({
        kind: 'section du dessus',
        prev: describe(prev.el),
        masked: describe(cur.el),
        el: describe(el),
        text: (el.textContent || el.getAttribute('alt') || '').trim().slice(0, 55),
        overlapPx: Math.round(overlap),
        crestPx: Math.round(depth),
        pullPx: Math.round(pull),
      })
    }

    // 2e moitie du probleme : la crete peut aussi couper le contenu de la
    // section masquee ELLE-MEME si son padding-top est plus court que le creux.
    if (depth <= 0) continue
    for (const el of cur.el.querySelectorAll(CONTENT_SEL)) {
      if (el.querySelector(CONTENT_SEL)) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue
      // les couches de decor (fonds, voiles, orbes) sont posees en absolu et
      // sont censees remplir la boite : elles ne comptent pas comme du contenu.
      if (cs.position !== 'static' && cs.position !== 'relative') continue
      if (el.closest('[style*="position: sticky"], .voyage-reveal-sticky')) continue
      const r = visibleRect(el)
      if (r.bottom - r.top < 4) continue
      const top = r.top + window.scrollY
      if (top >= bandBottom) continue
      findings.push({
        kind: 'son propre contenu',
        prev: describe(prev.el),
        masked: describe(cur.el),
        el: describe(el),
        text: (el.textContent || el.getAttribute('alt') || '').trim().slice(0, 55),
        overlapPx: Math.round(bandBottom - top),
        crestPx: Math.round(depth),
        pullPx: Math.round(pull),
      })
    }
  }
  return findings
}

const browser = await chromium.launch()
let total = 0
const summary = []
for (const path of PAGES) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    try {
      await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
    } catch {
      await page.waitForTimeout(2000)
    }
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 50))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 250))
    })
    const found = await page.evaluate(PROBE)
    if (found.length) {
      console.log(`\n### ${path} @ ${width}px — ${found.length} intrusion(s)`)
      const seen = new Set()
      for (const f of found) {
        const key = `${f.masked}|${f.el}|${f.text}`
        if (seen.has(key)) continue
        seen.add(key)
        console.log(
          `  ${f.masked}  (crete ${f.crestPx}px, remontee ${f.pullPx}px)\n` +
            `    mange ${f.overlapPx}px de  ${f.el}  "${f.text}"  [${f.kind}]`,
        )
      }
      total += found.length
      summary.push(`${path} @${width}: ${found.length}`)
    }
    await ctx.close()
  }
}
await browser.close()
console.log('\n' + (total === 0 ? 'OK — aucune intrusion de masque sur du contenu' : `TOTAL ${total}`))
if (summary.length) console.log(summary.join('\n'))
process.exit(total === 0 ? 0 : 1)
