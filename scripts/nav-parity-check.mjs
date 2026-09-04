/**
 * Parite de navigation entre le header desktop et le tiroir mobile.
 *
 * Le header desktop expose ses destinations a deux endroits : la barre
 * (.nav-list + .nav-right) et les quatre mega panels, qui sont toujours dans le
 * DOM. Le tiroir mobile doit mener aux memes pages, sinon un visiteur au doigt
 * n'a tout simplement pas acces a une partie du site.
 *
 * Verifie aussi que les entrees de PREMIER NIVEAU de la barre desktop
 * (accueil, contact) existent en acces direct dans le tiroir, et pas seulement
 * enfouies dans un accordeon : c'est la difference entre un geste et trois.
 *
 * Usage : node scripts/nav-parity-check.mjs
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'

/** Entrees de premier niveau de la barre desktop qui doivent rester a un geste. */
const TOP_LEVEL = { fr: ['/', '/contact'], en: ['/en', '/en/contact'] }

const norm = (href, origin) => {
  try {
    const u = new URL(href, origin)
    if (u.origin !== origin) return null // liens externes : Instagram, WhatsApp
    return u.pathname.replace(/\/$/, '') || '/'
  } catch {
    return null
  }
}

const browser = await chromium.launch()
let fail = 0
const say = (ok, msg) => {
  if (!ok) fail++
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`)
}

for (const [locale, path] of [
  ['fr', '/'],
  ['en', '/en'],
]) {
  console.log(`\n=== ${locale.toUpperCase()} (${path})`)

  // --- desktop
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const desk = await deskCtx.newPage()
  await desk.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
  const desktop = await desk.evaluate(() => {
    const grab = (sel) =>
      [...document.querySelectorAll(sel)].map((a) => ({
        href: a.getAttribute('href'),
        text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      }))
    return {
      bar: grab('#site-header .nav-list a[href], #site-header .nav-right a[href]'),
      panels: grab('#mega-wrap a[href]'),
    }
  })
  const origin = new URL(BASE).origin
  const deskPaths = new Map()
  for (const l of [...desktop.bar, ...desktop.panels]) {
    const p = norm(l.href, origin)
    if (p && !deskPaths.has(p)) deskPaths.set(p, l.text)
  }
  await deskCtx.close()

  // --- mobile
  const mobCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mob = await mobCtx.newPage()
  await mob.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
  await mob.click('.nav-hamburger')
  await mob.waitForSelector('#mobile-menu.is-open', { timeout: 5000 })
  const mobile = await mob.evaluate(() => {
    const inDrawer = (sel) =>
      [...document.querySelectorAll(sel)].map((a) => ({
        href: a.getAttribute('href'),
        text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        // « direct » = pas enfoui dans un accordeon repliable
        direct: !a.closest('.mob-acc-body'),
      }))
    return inDrawer('#mobile-menu a[href]')
  })
  const mobPaths = new Map()
  const mobDirect = new Set()
  for (const l of mobile) {
    const p = norm(l.href, origin)
    if (!p) continue
    if (!mobPaths.has(p)) mobPaths.set(p, l.text)
    if (l.direct) mobDirect.add(p)
  }

  const missing = [...deskPaths.keys()].filter((p) => !mobPaths.has(p))
  say(
    missing.length === 0,
    missing.length === 0
      ? `les ${deskPaths.size} destinations du header desktop sont dans le tiroir`
      : `manque dans le tiroir : ${missing.map((p) => `${p} (${deskPaths.get(p)})`).join(' · ')}`,
  )

  for (const p of TOP_LEVEL[locale]) {
    const key = p.replace(/\/$/, '') || '/'
    say(
      mobDirect.has(key),
      `« ${deskPaths.get(key) || key} » en acces direct dans le tiroir (hors accordeon)`,
    )
  }

  const extra = [...mobPaths.keys()].filter((p) => !deskPaths.has(p))
  if (extra.length) console.log(`  (le tiroir mène en plus vers : ${extra.join(' · ')})`)

  await mobCtx.close()
}

await browser.close()
console.log(`\n${fail === 0 ? 'TOUT VERT' : `${fail} ECHEC(S)`}`)
process.exit(fail === 0 ? 0 : 1)
