const { chromium } = require('playwright')

const PAGES = [
  { name: 'home-hero', url: 'http://localhost:3939/', scrollTo: null },
  { name: 'home-facilitator', url: 'http://localhost:3939/', scrollTo: '#facilitator' },
  { name: 'home-timeline', url: 'http://localhost:3939/', scrollTo: '#timeline' },
  { name: 'home-contact', url: 'http://localhost:3939/', scrollTo: '#contact' },
  { name: 'home-footer', url: 'http://localhost:3939/', scrollTo: 'footer' },
  { name: 'le-camp-includes', url: 'http://localhost:3939/le-camp', scrollTo: '.include-grid' },
  { name: 'contact', url: 'http://localhost:3939/contact', scrollTo: null },
  { name: 'inscription', url: 'http://localhost:3939/inscription', scrollTo: null },
  { name: 'inscription-session', url: 'http://localhost:3939/inscription?type=session', scrollTo: null },
  { name: 'inscription-famille', url: 'http://localhost:3939/inscription?type=famille', scrollTo: null },
  { name: 'familles-pricing', url: 'http://localhost:3939/familles', scrollTo: '.pricing-grid' },
]

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  for (const p of PAGES) {
    try {
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      // Wait for SiteLoader to vanish
      try {
        await page.waitForFunction(
          () => !document.querySelector('.site-loader') || document.querySelector('.site-loader').classList.contains('site-loader--gone'),
          { timeout: 5000 }
        )
      } catch (_) {}
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

      if (p.scrollTo) {
        await page.evaluate(sel => {
          const el = document.querySelector(sel)
          if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' })
        }, p.scrollTo).catch(() => {})
        await page.waitForTimeout(600)
      }
      await page.waitForTimeout(400)
      await page.screenshot({ path: `.tmp/qa-${p.name}.png`, fullPage: false })
      console.log(JSON.stringify({ page: p.name, status: 'ok' }))
    } catch (e) {
      console.log(JSON.stringify({ page: p.name, status: 'fail', error: e.message }))
    }
  }
  await browser.close()
})()
