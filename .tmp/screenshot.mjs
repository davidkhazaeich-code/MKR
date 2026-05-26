import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const inputFile = resolve(__dirname, process.argv[2] || 'icon-preview.html')
const outputFile = resolve(__dirname, process.argv[3] || 'icon-preview.png')

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()
await page.goto(`file://${inputFile}`)
await page.waitForLoadState('networkidle')
await page.screenshot({ path: outputFile, fullPage: true })
await browser.close()
console.log(`screenshot saved → ${outputFile}`)
