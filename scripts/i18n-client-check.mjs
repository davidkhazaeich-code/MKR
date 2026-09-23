#!/usr/bin/env node
// Garde-fou de src/i18n/client-messages.ts, lance par `npm run build`.
//
// Le navigateur ne recoit que les namespaces de src/i18n/client-namespaces.json.
// Un composant 'use client' qui lit un namespace absent de cette liste ne casse
// pas `next build` : il affiche la cle brute (`home.hero.title`) en production.
// Ce script parcourt tout le code qui part dans le navigateur (fichiers
// 'use client' et tout ce qu'ils importent), releve chaque useTranslations et
// echoue si un namespace n'est pas couvert.
//
//   node scripts/i18n-client-check.mjs

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, normalize, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const ALLOWLIST_FILE = 'src/i18n/client-namespaces.json'
const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST_FILE), 'utf8'))

/* Tous les modules TS / TSX de src/ */
const files = new Map()
;(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (/\.(ts|tsx)$/.test(entry.name)) files.set(p, readFileSync(p, 'utf8'))
  }
})(SRC)

function resolveImport(spec, from) {
  let base
  if (spec.startsWith('@/')) base = join(SRC, spec.slice(2))
  else if (spec.startsWith('.')) base = normalize(join(dirname(from), spec))
  else return null
  for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    if (files.has(base + ext)) return base + ext
  }
  return null
}

const IMPORT_RE = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g
const USE_CLIENT_RE = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*['"]use client['"]/

/* Code qui part dans le navigateur : les fichiers 'use client' et leurs imports */
const clientModules = new Set()
const stack = [...files.keys()].filter(p => USE_CLIENT_RE.test(files.get(p)))
while (stack.length) {
  const p = stack.pop()
  if (clientModules.has(p)) continue
  clientModules.add(p)
  for (const m of files.get(p).matchAll(IMPORT_RE)) {
    const target = resolveImport(m[1] ?? m[2] ?? m[3], p)
    if (target) stack.push(target)
  }
}

const covered = ns => allowlist.some(a => ns === a || ns.startsWith(`${a}.`))
const errors = []
const used = new Set()

for (const p of clientModules) {
  const src = files.get(p)
  const rel = relative(ROOT, p)
  // Noms locaux des hooks importes de next-intl (alias compris).
  const hooks = new Map()
  for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*['"]next-intl['"]/g)) {
    for (const part of m[1].split(',')) {
      const [name, alias] = part.trim().split(/\s+as\s+/)
      if (name === 'useTranslations' || name === 'useMessages') hooks.set(alias ?? name, name)
    }
  }
  for (const [local, hook] of hooks) {
    for (const m of src.matchAll(new RegExp(`\\b${local}\\s*\\(([^)]*)\\)`, 'g'))) {
      const arg = m[1].trim()
      const line = src.slice(0, m.index).split('\n').length
      if (hook === 'useMessages') {
        errors.push(`${rel}:${line} useMessages() cote client : il lui faut tous les messages.`)
      } else if (!arg) {
        errors.push(`${rel}:${line} useTranslations() sans namespace : preciser le namespace.`)
      } else if (!/^(['"])[^'"]+\1$/.test(arg)) {
        errors.push(`${rel}:${line} useTranslations(${arg}) : namespace calcule, impossible a verifier.`)
      } else {
        const ns = arg.slice(1, -1)
        used.add(ns)
        if (!covered(ns)) errors.push(`${rel}:${line} namespace "${ns}" absent de ${ALLOWLIST_FILE}.`)
      }
    }
  }
}

/* Chaque entree de la liste doit exister dans les messages FR et EN (faute de frappe). */
for (const locale of ['fr', 'en']) {
  for (const entry of allowlist) {
    const [head, ...rest] = entry.split('.')
    const file = head === 'data' && rest.length
      ? join(ROOT, 'messages', locale, `data.${rest.shift()}.json`)
      : join(ROOT, 'messages', locale, `${head}.json`)
    let node = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined
    for (const key of rest) node = node?.[key]
    if (node === undefined) errors.push(`${ALLOWLIST_FILE} : "${entry}" introuvable dans messages/${locale}.`)
  }
}

if (errors.length) {
  console.error('i18n client : textes manquants cote navigateur\n')
  for (const e of errors) console.error(`  - ${e}`)
  console.error(`\nAjouter le namespace dans ${ALLOWLIST_FILE} (cf. src/i18n/client-messages.ts).`)
  process.exit(1)
}
console.log(`i18n client : ${clientModules.size} modules navigateur, ${used.size} namespaces lus, tous couverts par ${allowlist.length} entrees.`)
