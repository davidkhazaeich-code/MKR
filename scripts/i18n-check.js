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

  if (exitCode === 0) {
    console.log(`OK: FR and EN have ${fr.keys.size} matching keys, ICU placeholders all match.`);
  }

  process.exit(exitCode);
}

main();
