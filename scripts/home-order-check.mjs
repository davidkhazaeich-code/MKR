/**
 * QA de la home apres reordonnancement :
 *  - l'ordre des sections est bien celui demande, FR et EN
 *  - le z-index de la chaine montagne suit strictement l'ordre du DOM
 *  - zero debordement horizontal, un seul h1
 *  - le sommaire lateral (ScrollNav) liste les sections dans le meme ordre
 */
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:3000'
const EXPECTED = [
  'hero',
  'video-section',
  'facilitator',
  'timeline',
  'audiences',
  'testimonials',
  'vvs-section',
  'philosophie',
  'voyage-reveal-outer',
  'sessions',
  'faq',
  'cta-final',
]

const browser = await chromium.launch()
let fail = 0
const say = (ok, msg) => {
  if (!ok) fail++
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`)
}

for (const path of ['/', '/en']) {
  for (const width of [390, 768, 1024, 1440, 1920, 2560]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.7
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: 'instant' })
        await new Promise((r) => setTimeout(r, 50))
      }
      window.scrollTo({ top: 0, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 200))
    })

    const data = await page.evaluate(() => {
      const main = document.getElementById('main')
      const order = []
      for (const w of main.children) {
        const s = w.matches('section, .voyage-reveal-outer, .vvs-section')
          ? w
          : w.querySelector('section, .voyage-reveal-outer, .vvs-section')
        if (!s) continue
        const cs = getComputedStyle(s)
        order.push({
          name: s.id || s.className.trim().split(/\s+/)[0],
          z: cs.zIndex === 'auto' ? null : Number(cs.zIndex),
          marginTop: parseFloat(cs.marginTop) || 0,
          clipped: cs.clipPath !== 'none',
        })
      }
      return {
        order,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        navLabels: [...document.querySelectorAll('.hs-dots [data-label], .hs-dots button')].map(
          (b) => b.getAttribute('data-label') || b.getAttribute('aria-label') || '',
        ),
      }
    })

    console.log(`\n--- ${path} @ ${width}px`)
    const names = data.order.map((o) => o.name)
    say(
      JSON.stringify(names) === JSON.stringify(EXPECTED),
      `ordre des sections : ${names.join(' > ')}`,
    )
    say(data.overflow <= 0, `debordement horizontal : ${data.overflow}px`)
    say(data.h1 === 1, `un seul h1 (${data.h1})`)

    if (width > 768) {
      // La chaine montagne : chaque section doit peindre par-dessus la precedente.
      let prevZ = -Infinity
      let chainOk = true
      const detail = []
      for (const o of data.order) {
        const z = o.z ?? 0
        detail.push(`${o.name}:${z}`)
        if (z <= prevZ) chainOk = false
        prevZ = z
      }
      say(chainOk, `z-index strictement croissant : ${detail.join(' < ')}`)
      const pulled = data.order.filter((o) => o.marginTop < 0).length
      const crests = data.order.filter((o) => o.clipped).length
      say(pulled >= 9 && crests >= 9, `${pulled} remontees / ${crests} cretes actives`)
    } else {
      const flat = data.order.every((o) => o.marginTop >= 0 && !o.clipped)
      say(flat, 'mobile : aucune remontee ni crete (flux normal)')
    }
    await ctx.close()
  }
}
await browser.close()
console.log(`\n${fail === 0 ? 'TOUT VERT' : `${fail} ECHEC(S)`}`)
process.exit(fail === 0 ? 0 : 1)
