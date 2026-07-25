#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const LOCALES = ['fr', 'en'];

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function flattenValues(obj, prefix = '') {
  const values = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(values, flattenValues(v, fullKey));
    } else if (typeof v === 'string') {
      values[fullKey] = v;
    }
  }
  return values;
}

function loadAllKeys(locale) {
  const localeDir = path.join(MESSAGES_DIR, locale);
  if (!fs.existsSync(localeDir)) return { keys: new Set(), values: {} };
  const keys = new Set();
  const values = {};

  function walk(dir, namespace = '') {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, namespace ? `${namespace}.${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.json')) {
        const ns = namespace
          ? `${namespace}.${entry.name.replace(/\.json$/, '')}`
          : entry.name.replace(/\.json$/, '');
        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        for (const key of flattenKeys(content)) {
          const fullKey = `${ns}::${key}`;
          keys.add(fullKey);
        }
        const vals = flattenValues(content);
        for (const [k, v] of Object.entries(vals)) {
          values[`${ns}::${k}`] = v;
        }
      }
    }
  }

  walk(localeDir);
  return { keys, values };
}

function extractICUPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{[^}]+\}/g) || [];
  return matches.sort();
}

function main() {
  const fr = loadAllKeys('fr');
  const en = loadAllKeys('en');

  const missingInEn = [...fr.keys].filter((k) => !en.keys.has(k));
  const orphanInEn = [...en.keys].filter((k) => !fr.keys.has(k));

  let exitCode = 0;

  if (missingInEn.length > 0) {
    console.error(`Missing EN translations (${missingInEn.length} keys):`);
    for (const k of missingInEn.slice(0, 30)) console.error(`  - ${k}`);
    if (missingInEn.length > 30) console.error(`  ... and ${missingInEn.length - 30} more`);
    exitCode = 1;
  }

  if (orphanInEn.length > 0) {
    console.warn(`Orphan EN keys not in FR (${orphanInEn.length} keys):`);
    for (const k of orphanInEn.slice(0, 10)) console.warn(`  - ${k}`);
  }

  // ICU placeholder match check
  const icuMismatches = [];
  for (const key of fr.keys) {
    if (!en.keys.has(key)) continue;
    const frICU = extractICUPlaceholders(fr.values[key]);
    const enICU = extractICUPlaceholders(en.values[key]);
    if (JSON.stringify(frICU) !== JSON.stringify(enICU)) {
      icuMismatches.push({ key, fr: frICU, en: enICU });
    }
  }
  if (icuMismatches.length > 0) {
    console.error(`ICU placeholder mismatches (${icuMismatches.length} keys):`);
    for (const m of icuMismatches.slice(0, 20)) {
      console.error(`  - ${m.key}`);
      console.error(`    FR: ${JSON.stringify(m.fr)}`);
      console.error(`    EN: ${JSON.stringify(m.en)}`);
    }
    exitCode = 1;
  }

  // Longueur des meta (audit 2026-07-25) : 6 descriptions FR etaient tronquees
  // en SERP, ce qui coupait systematiquement l'argument final. Le title au-dela
  // de ~60 caracteres et la description au-dela de ~158 sont rognes par Google.
  // On garde le controle ici plutot que dans une revue manuelle : c'est le seul
  // endroit deja lance avant chaque push.
  const TITLE_MAX = 60;
  const DESC_MAX = 158;
  const tooLong = [];
  for (const [locale, bundle] of [['fr', fr], ['en', en]]) {
    for (const [key, value] of Object.entries(bundle.values)) {
      if (typeof value !== 'string') continue;
      // Les cles sont prefixees par leur namespace de fichier avec `::`
      // (ex. `sessions::meta.title`, `programme::lutte.meta.title`), donc on
      // teste le segment final, pas un suffixe pointe.
      const leaf = key.split('::').pop();
      const isTitle = leaf === 'meta.title' || leaf.endsWith('.meta.title') || leaf === 'meta_title';
      const isDesc = leaf === 'meta.description' || leaf.endsWith('.meta.description') || leaf === 'meta_description';
      if (!isTitle && !isDesc) continue;
      const max = isTitle ? TITLE_MAX : DESC_MAX;
      if (value.length > max) tooLong.push({ locale, key, len: value.length, max, value });
    }
  }
  if (tooLong.length > 0) {
    console.error(`Meta trop longues pour la SERP (${tooLong.length}) :`);
    for (const m of tooLong) {
      console.error(`  - [${m.locale}] ${m.key} : ${m.len} car. (max ${m.max})`);
      console.error(`    ${m.value.slice(0, 90)}...`);
    }
    exitCode = 1;
  }

  // Liens internes des contenus EN (audit 2026-07-25) : 43 href des articles
  // anglais pointaient vers les URL francaises, tunnel de conversion compris.
  // Un lecteur anglophone qui cliquait « next steps » atterrissait sur le
  // formulaire en francais. Tout href absolu interne d'un message EN doit
  // rester sous /en/.
  const frLinksInEn = [];
  for (const [key, value] of Object.entries(en.values)) {
    if (typeof value !== 'string' || !value.includes('href=')) continue;
    for (const m of value.matchAll(/href="(\/[^"]*)"/g)) {
      const href = m[1];
      if (href !== '/en' && !href.startsWith('/en/')) frLinksInEn.push({ key, href });
    }
  }
  if (frLinksInEn.length > 0) {
    console.error(`Liens internes non localises dans messages/en (${frLinksInEn.length}) :`);
    for (const l of frLinksInEn.slice(0, 25)) console.error(`  - ${l.key} -> ${l.href}`);
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log(`OK: FR and EN have ${fr.keys.size} matching keys, ICU placeholders all match, meta lengths within SERP limits, EN internal links localised.`);
  }

  process.exit(exitCode);
}

main();
