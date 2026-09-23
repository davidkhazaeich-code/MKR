#!/usr/bin/env node
// Contraste WCAG des jetons de l'admin, dans les deux themes.
// Lit les blocs de jetons de src/app/admin/admin.css (aucune valeur en dur) :
//   - :root seul                       -> jetons independants du theme (chrome)
//   - bloc [data-theme="light"]        -> theme clair
//   - bloc [data-theme="dark"]         -> theme sombre (surcharge le clair)
//   - @media (prefers-color-scheme: dark) :root:not([data-theme="light"])
//                                      -> doit etre IDENTIQUE au bloc sombre
// Couleurs translucides : composees sur le fond qu'elles recouvrent.
// Seuils : 4,5:1 pour le texte ; 3:1 pour --adm-text-4 (placeholders, ornements).
// Usage : node scripts/admin-mock/contrast.mjs   (code 1 si un seuil manque)

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSS_PATH = join(__dirname, '..', '..', 'src', 'app', 'admin', 'admin.css')

// ---------------------------------------------------------------- parsing

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Arbre minimal { prelude, body } / { prelude, children } (at-rules imbriquees). */
function parseBlocks(css) {
  const nodes = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf('{', i)
    if (open === -1) break
    const prelude = css.slice(i, open).trim().replace(/\s+/g, ' ')
    let depth = 1
    let j = open + 1
    while (j < css.length && depth > 0) {
      if (css[j] === '{') depth++
      else if (css[j] === '}') depth--
      j++
    }
    const inner = css.slice(open + 1, j - 1)
    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      nodes.push({ prelude, children: parseBlocks(inner) })
    } else {
      nodes.push({ prelude, body: inner })
    }
    i = j
  }
  return nodes
}

function declarations(body) {
  const map = new Map()
  for (const part of body.split(';')) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const name = part.slice(0, idx).trim()
    if (!name.startsWith('--adm-')) continue
    map.set(name, part.slice(idx + 1).trim().replace(/\s+/g, ' '))
  }
  return map
}

const selectors = (prelude) => prelude.split(',').map((s) => s.trim())

function findRule(nodes, test) {
  return nodes.find((n) => n.body !== undefined && test(selectors(n.prelude), declarations(n.body)))
}

const css = stripComments(readFileSync(CSS_PATH, 'utf8'))
const tree = parseBlocks(css)

const baseRule = findRule(tree, (sel, d) => sel.length === 1 && sel[0] === ':root' && d.has('--adm-chrome-bg'))
const lightRule = findRule(tree, (sel, d) => sel.includes('[data-theme="light"]') && d.has('--adm-bg'))
const darkRule = findRule(tree, (sel, d) => sel.includes('[data-theme="dark"]') && d.has('--adm-bg'))
const media = tree.find((n) => n.children && /prefers-color-scheme:\s*dark/.test(n.prelude))
const mediaRule = media && findRule(media.children, (sel, d) => sel.includes(':root:not([data-theme="light"])') && d.has('--adm-bg'))

const missing = [
  ['bloc :root (chrome)', baseRule],
  ['bloc clair [data-theme="light"]', lightRule],
  ['bloc sombre [data-theme="dark"]', darkRule],
  ['bloc sombre de la media query', mediaRule],
].filter(([, r]) => !r)
if (missing.length) {
  console.error('Blocs de jetons introuvables dans admin.css :', missing.map(([n]) => n).join(', '))
  process.exit(1)
}

const base = declarations(baseRule.body)
const light = declarations(lightRule.body)
const dark = declarations(darkRule.body)
const darkMedia = declarations(mediaRule.body)

// Les deux copies du theme sombre doivent etre identiques.
const syncErrors = []
for (const [k, v] of dark) {
  if (!darkMedia.has(k)) syncErrors.push(`${k} absent de la media query`)
  else if (darkMedia.get(k) !== v) syncErrors.push(`${k} : "${v}" (attribut) != "${darkMedia.get(k)}" (media)`)
}
for (const k of darkMedia.keys()) if (!dark.has(k)) syncErrors.push(`${k} absent du bloc [data-theme="dark"]`)

// ------------------------------------------------------------ couleurs

function resolveVar(value, tokens, seen = new Set()) {
  return value.replace(/var\((--[a-z0-9-]+)(?:,\s*([^)]+))?\)/gi, (_, name, fallback) => {
    if (seen.has(name)) throw new Error(`reference circulaire ${name}`)
    if (tokens.has(name)) return resolveVar(tokens.get(name), tokens, new Set([...seen, name]))
    if (fallback) return fallback
    throw new Error(`jeton inconnu ${name}`)
  })
}

function parseColor(raw) {
  const v = raw.trim().toLowerCase()
  if (v === 'white') return [255, 255, 255, 1]
  if (v === 'black') return [0, 0, 0, 1]
  let m = v.match(/^#([0-9a-f]{3,8})$/)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    const n = [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16))
    return [...n, h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]
  }
  m = v.match(/^rgba?\(([^)]+)\)$/)
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean)
    const [r, g, b] = parts.slice(0, 3).map(Number)
    const a = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : Number(parts[3])
    return [r, g, b, a]
  }
  throw new Error(`couleur non reconnue : ${raw}`)
}

/** Compose `top` (eventuellement translucide) sur `under` (opaque). */
function over(top, under) {
  const a = top[3]
  return [0, 1, 2].map((k) => top[k] * a + under[k] * (1 - a)).concat(1)
}

function luminance([r, g, b]) {
  const lin = (c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function ratio(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// ------------------------------------------------------------- paires

const THEMES = {
  clair: new Map([...base, ...light]),
  sombre: new Map([...base, ...light, ...dark]),
}

const TONES = ['ok', 'warn', 'danger', 'info', 'violet', 'neutral']

/**
 * Chaque paire : texte, fond (liste de couches, de la plus haute a la plus
 * basse ; la derniere doit etre opaque), seuil, type : requis (exige par le
 * brief) ou extra (paire reelle d'un composant, meme seuil).
 */
function pairsFor() {
  const list = []
  const add = (group, fg, layers, min, kind = 'requis') => list.push({ group, fg, layers, min, kind })
  const grounds = ['--adm-bg', '--adm-surface', '--adm-surface-2']
  for (const t of ['--adm-text', '--adm-text-2', '--adm-text-3', '--adm-text-4']) {
    for (const g of grounds) add('texte', t, [g], t === '--adm-text-4' ? 3 : 4.5)
  }
  for (const tone of TONES) {
    const fg = `--adm-${tone}`
    add('tons', fg, [`--adm-${tone}-bg`, '--adm-surface'], 4.5)
    add('tons', fg, [`--adm-${tone}-bg`, '--adm-bg'], 4.5, 'extra')
    add('tons', fg, ['--adm-surface'], 4.5)
    add('tons', fg, ['--adm-bg'], 4.5, 'extra')
    add('encadres', '--adm-text', [`--adm-${tone}-bg`, '--adm-surface'], 4.5, 'extra')
    add('encadres', '--adm-text-2', [`--adm-${tone}-bg`, '--adm-surface'], 4.5, 'extra')
  }
  add('action', '--adm-action-text', ['--adm-surface'], 4.5)
  add('action', '--adm-action-text', ['--adm-bg'], 4.5, 'extra')
  add('action', '--adm-action-text', ['--adm-surface-2'], 4.5, 'extra')
  add('boutons', '--adm-on-action', ['--adm-action'], 4.5)
  add('boutons', '--adm-on-action', ['--adm-action-hover'], 4.5, 'extra')
  add('boutons', '--adm-on-whatsapp', ['--adm-whatsapp'], 4.5)
  add('boutons', '--adm-on-whatsapp', ['--adm-whatsapp-hover'], 4.5, 'extra')
  add('boutons', '--adm-on-danger', ['--adm-danger-solid'], 4.5, 'extra')
  add('composants', '--adm-text-2', ['--adm-surface-3'], 4.5, 'extra')
  add('composants', '--adm-text', ['--adm-seg-active'], 4.5, 'extra')
  add('composants', '--adm-surface', ['--adm-text'], 4.5, 'extra')
  for (let n = 0; n < 6; n++) add('avatars', `--adm-av${n}-fg`, [`--adm-av${n}-bg`], 4.5, 'extra')
  add('chrome', '--adm-chrome-text', ['--adm-chrome-bg'], 4.5, 'extra')
  add('chrome', '--adm-chrome-text-2', ['--adm-chrome-bg'], 4.5, 'extra')
  add('chrome', '--adm-chrome-active-text', ['--adm-chrome-active-bg', '--adm-chrome-bg'], 4.5, 'extra')
  return list
}

const rows = []
let failures = 0
for (const [theme, tokens] of Object.entries(THEMES)) {
  const color = (name) => parseColor(resolveVar(`var(${name})`, tokens))
  for (const p of pairsFor()) {
    const layers = p.layers.map(color)
    let ground = layers[layers.length - 1]
    if (ground[3] < 1) throw new Error(`${p.layers.at(-1)} (${theme}) doit etre opaque`)
    for (let k = layers.length - 2; k >= 0; k--) ground = over(layers[k], ground)
    const fg = over(color(p.fg), ground)
    const r = ratio(fg, ground)
    const ok = r >= p.min
    if (!ok) failures++
    rows.push({ theme, ...p, r, ok })
  }
}

// ------------------------------------------------------------- sortie

const pad = (s, n) => String(s).padEnd(n)
console.log('Contraste des jetons de src/app/admin/admin.css\n')
console.log(pad('theme', 8) + pad('groupe', 12) + pad('texte', 26) + pad('fond', 48) + pad('ratio', 8) + pad('seuil', 7) + pad('type', 8) + 'etat')
for (const r of rows) {
  console.log(
    pad(r.theme, 8) +
      pad(r.group, 12) +
      pad(r.fg, 26) +
      pad(r.layers.join(' sur '), 48) +
      pad(r.r.toFixed(2), 8) +
      pad(r.min, 7) +
      pad(r.kind, 8) +
      (r.ok ? 'OK' : 'ECHEC'),
  )
}

const minOf = (theme, fg) =>
  Math.min(...rows.filter((r) => r.theme === theme && r.fg === fg).map((r) => r.r)).toFixed(2)
console.log('\nMinimum par jeton de texte :')
for (const theme of Object.keys(THEMES)) {
  console.log(
    `  ${theme} : ` +
      ['--adm-text', '--adm-text-2', '--adm-text-3', '--adm-text-4', '--adm-action-text']
        .map((t) => `${t.replace('--adm-', '')} ${minOf(theme, t)}`)
        .join(' · '),
  )
}

if (syncErrors.length) {
  console.log('\nTheme sombre : les deux copies divergent :')
  for (const e of syncErrors) console.log('  - ' + e)
} else {
  console.log(`\nTheme sombre : attribut et media query identiques (${dark.size} jetons).`)
}

const total = rows.length
console.log(`\n${total - failures}/${total} paires au-dessus du seuil.`)
if (failures || syncErrors.length) {
  console.log('CONTRASTE ECHEC')
  process.exit(1)
}
console.log('CONTRASTE OK')
