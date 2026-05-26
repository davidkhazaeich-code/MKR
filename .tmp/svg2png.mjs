import { chromium } from 'playwright'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 720, height: 270 }, deviceScaleFactor: 2 })
const svg = readFileSync(resolve('.tmp/icon-lutte-preview.svg'), 'utf-8')
await page.setContent(`<!DOCTYPE html><html><head><style>body{margin:0;background:#fff;}</style></head><body>${svg}</body></html>`)
await page.waitForLoadState('domcontentloaded')
await page.screenshot({ path: '.tmp/icon-lutte-preview.png', omitBackground: false, fullPage: false })
await browser.close()
console.log('OK')
