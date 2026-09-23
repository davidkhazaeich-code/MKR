#!/usr/bin/env node
// Faux backend local pour l'admin MKR : emule juste assez de PostgREST (Supabase
// DB), de Supabase Storage et de l'API Resend pour que src/lib/supabase-admin.ts
// et src/lib/email.ts fonctionnent sans toucher la prod. Node pur, zero
// dependance npm. Ecoute sur 127.0.0.1:54321 (jamais 0.0.0.0 : local only).
//
// Donnees en memoire uniquement (Map/array), rechargees a chaque demarrage et
// sur POST /__reset. Rien n'est persiste sur disque.
//
// Comportement calque sur le CLIENT reellement installe (@supabase/postgrest-js
// et @supabase/storage-js 2.105.1, lus dans node_modules avant d'ecrire ce
// fichier), pas sur la doc PostgREST generale :
// - `select` arrive deja sans espaces (le client les retire avant d'envoyer).
// - `.maybeSingle()` n'envoie PAS `Accept: vnd.pgrst.object+json` (fix cote
//   client de supabase/postgrest-js#361) : il recupere un tableau et despouille
//   cote client. Seul `.single()` envoie cet Accept -> c'est le SEUL cas ou ce
//   serveur doit repondre 406/PGRST116 sur 0 ou plusieurs lignes.
// - `.select()` (meme sans single) ajoute `Prefer: return=representation`.
// - insert() sur un tableau ajoute un parametre `columns="a","b"` — ignore ici,
//   ce serveur complete de toute facon TOUTES les colonnes du schema a `null`
//   sur chaque ligne inseree, meme effet sans avoir a le parser.

import { createServer } from 'node:http'
import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HOST = '127.0.0.1'
const PORT = 54321

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const ALIAS_HOOK = './scripts/_alias-hook.mjs'
const FIXTURES_ENTRY = 'scripts/admin-mock/fixtures.mts'

/* ------------------------------------------------------------------ */
/* Schema — colonnes EXACTES par table (brief task-1). Toute colonne    */
/* absente d'ici est refusee en select/filtre/insert/update, comme      */
/* PostgREST le fait pour une vraie colonne inconnue.                   */
/* ------------------------------------------------------------------ */

const TABLES = {
  candidatures: {
    idType: 'uuid',
    columns: [
      'id', 'candidate_id', 'tunnel_type', 'session_id', 'duree_semaines', 'date_debut_souhaitee',
      'status', 'status_changed_at', 'status_changed_by_email', 'package_amount_cents', 'package_paid_at',
      'notes_visio', 'notes_admin', 'form_data', 'group_members', 'created_at', 'updated_at',
      'payment_method', 'payment_date', 'camp_discipline', 'referral_code', 'referral_code_valid',
      'referral_partner_name', 'referral_partner_type', 'referral_bonus_eur', 'referral_payout_status',
      'referral_payout_paid_at', 'referral_payout_method', 'submission_language', 'referral_commission_type',
      'referral_commission_pct', 'contract_start_date', 'contract_end_date', 'contract_duration_weeks',
      'contract_inclusions', 'contract_exclusions', 'contract_note', 'contract_payment_deadline',
      'contract_locale', 'contract_number', 'contract_sent_at', 'contract_sent_count', 'contract_pdf_path',
      'attribution_source', 'attribution', 'souvenir_sent_at', 'visio_reminder_sent_at', 'visio_reminder_count',
      'cancel_token', 'visio_booked_at', 'visio_booking_uid', 'visio_starts_at', 'payment_reminder_sent_at',
      'payment_reminder_count', 'predeparture_sent_at', 'rebooking_sent_at', 'rebooking_sent_count',
    ],
  },
  candidates: {
    idType: 'uuid',
    columns: ['id', 'prenom', 'nom', 'email', 'telephone', 'date_naissance', 'pays', 'ville_depart', 'notes_admin', 'created_at', 'updated_at'],
  },
  audit_log: {
    idType: 'bigint',
    columns: ['id', 'candidature_id', 'event', 'from_value', 'to_value', 'actor_email', 'data', 'at'],
  },
  guide_leads: {
    idType: 'uuid',
    columns: [
      'id', 'email', 'locale', 'source', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
      'utm_content', 'referrer', 'ip', 'user_agent', 'created_at', 'submission_language',
    ],
  },
}

// Seule relation embarquee reellement utilisee par l'admin : candidatures.candidate_id -> candidates.id
// (`candidate:candidates(...)`, avec ou sans le hint `!candidate_id`).
const EMBED_TABLE = 'candidates'
const EMBED_FK = 'candidate_id'

/* ------------------------------------------------------------------ */
/* Etat en memoire                                                      */
/* ------------------------------------------------------------------ */

const db = { candidatures: [], candidates: [], audit_log: [], guide_leads: [] }
const storage = new Map() // path relatif au bucket "contracts" -> Buffer
let emails = []
let contractNumberSeq = 20
let auditIdCounter = 1

function loadFixtures() {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--import', ALIAS_HOOK, FIXTURES_ENTRY, '--json'],
    { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`fixtures.mts a echoue (code ${result.status})\n${result.stderr}`)
  }
  const data = JSON.parse(result.stdout)
  db.candidatures = data.candidatures
  db.candidates = data.candidates
  db.audit_log = data.audit_log
  db.guide_leads = data.guide_leads
  storage.clear()
  emails = []
  contractNumberSeq = 20
  auditIdCounter = db.audit_log.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1
}

function stateCounts() {
  return {
    candidatures: db.candidatures.length,
    candidates: db.candidates.length,
    audit_log: db.audit_log.length,
    guide_leads: db.guide_leads.length,
    emails: emails.length,
    storageObjects: storage.size,
    uptimeSeconds: Math.round(process.uptime()),
  }
}

/* ------------------------------------------------------------------ */
/* Erreurs PostgREST                                                    */
/* ------------------------------------------------------------------ */

class PgError extends Error {
  constructor(status, code, message, details = null) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}
function unknownColumn(table, col) {
  return new PgError(400, '42703', `column ${table}.${col} does not exist`)
}

/* ------------------------------------------------------------------ */
/* Parsing du `select` — colonnes, alias, embarquement candidate(s)     */
/* ------------------------------------------------------------------ */

/** Coupe `str` sur `sep` au niveau racine seulement (ignore les virgules dans les parentheses). */
function splitTopLevel(str, sep) {
  const parts = []
  let depth = 0
  let current = ''
  for (const ch of str) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === sep && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current !== '') parts.push(current)
  return parts
}

const EMBED_RE = /^(?:([A-Za-z_]\w*):)?candidates(?:![A-Za-z_]\w*)?\(([\s\S]*)\)$/
const ALIAS_RE = /^([A-Za-z_]\w*):([A-Za-z_]\w*)$/

function parseSelect(table, raw) {
  const str = (raw ?? '*').trim()
  if (str === '' || str === '*') return { star: true, columns: [], embed: null }

  const columns = []
  let embed = null
  for (const rawSeg of splitTopLevel(str, ',')) {
    const seg = rawSeg.trim()
    if (!seg) continue

    const embedMatch = EMBED_RE.exec(seg)
    if (embedMatch) {
      const alias = embedMatch[1] || EMBED_TABLE
      const innerRaw = embedMatch[2].trim()
      const innerCols = innerRaw === '' || innerRaw === '*'
        ? TABLES[EMBED_TABLE].columns.slice()
        : splitTopLevel(innerRaw, ',').map((c) => c.trim()).filter(Boolean)
      for (const c of innerCols) {
        if (!TABLES[EMBED_TABLE].columns.includes(c)) throw unknownColumn(EMBED_TABLE, c)
      }
      embed = { alias, columns: innerCols }
      continue
    }

    const aliasMatch = ALIAS_RE.exec(seg)
    const alias = aliasMatch ? aliasMatch[1] : seg
    const column = aliasMatch ? aliasMatch[2] : seg
    if (!TABLES[table].columns.includes(column)) throw unknownColumn(table, column)
    columns.push({ alias, column })
  }
  return { star: false, columns, embed }
}

function projectRow(table, row, spec) {
  const out = {}
  if (spec.star) {
    for (const c of TABLES[table].columns) out[c] = row[c] ?? null
  } else {
    for (const { alias, column } of spec.columns) out[alias] = row[column] ?? null
  }
  if (spec.embed && table === 'candidatures') {
    const cand = db.candidates.find((c) => c.id === row[EMBED_FK]) ?? null
    if (cand) {
      const sub = {}
      for (const col of spec.embed.columns) sub[col] = cand[col] ?? null
      out[spec.embed.alias] = sub
    } else {
      out[spec.embed.alias] = null
    }
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Filtres — eq, neq, gt, gte, lt, lte, is, ilike, like, in, not.*      */
/* ------------------------------------------------------------------ */

const RESERVED_PARAMS = new Set(['select', 'order', 'limit', 'offset', 'columns', 'on_conflict'])

function scalarEq(value, raw) {
  if (value === null || value === undefined) return raw === 'null'
  if (typeof value === 'boolean') return String(value) === raw
  if (typeof value === 'number') return Number(raw) === value
  return String(value) === raw
}
/** NaN pour une valeur null : tous les comparateurs (>, >=, <, <=) rendent alors
 * false, exactement le comportement SQL d'une comparaison avec NULL. */
function compareScalar(value, raw) {
  if (value === null || value === undefined) return NaN
  if (typeof value === 'number') return value - Number(raw)
  return value < raw ? -1 : value > raw ? 1 : 0
}
function likeToRegex(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/%/g, '.*').replace(/_/g, '.')}$`, 'is')
}
function parseListLiteral(arg) {
  const inner = arg.startsWith('(') && arg.endsWith(')') ? arg.slice(1, -1) : arg
  if (inner === '') return []
  return splitTopLevel(inner, ',').map((raw) => {
    const t = raw.trim()
    return t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t
  })
}

function makeTest(table, column, op, arg) {
  switch (op) {
    case 'eq': return (v) => scalarEq(v, arg)
    case 'neq': return (v) => !scalarEq(v, arg)
    case 'gt': return (v) => compareScalar(v, arg) > 0
    case 'gte': return (v) => compareScalar(v, arg) >= 0
    case 'lt': return (v) => compareScalar(v, arg) < 0
    case 'lte': return (v) => compareScalar(v, arg) <= 0
    case 'is': return (v) => (arg === 'null' ? v === null : arg === 'true' ? v === true : arg === 'false' ? v === false : v === arg)
    case 'ilike': { const re = likeToRegex(arg); return (v) => re.test(v === null || v === undefined ? '' : String(v)) }
    case 'like': { const re = new RegExp(`^${arg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`, 's'); return (v) => re.test(v === null || v === undefined ? '' : String(v)) }
    case 'in': { const list = parseListLiteral(arg); return (v) => list.some((item) => scalarEq(v, item)) }
    default:
      throw new PgError(400, '42883', `operator does not exist: ${table}.${column} ${op}`)
  }
}

function parseFilters(table, searchParams) {
  const filters = []
  for (const [key, raw] of searchParams.entries()) {
    if (RESERVED_PARAMS.has(key)) continue
    if (!TABLES[table].columns.includes(key)) throw unknownColumn(table, key)

    let negate = false
    let rest = raw
    if (rest.startsWith('not.')) {
      negate = true
      rest = rest.slice(4)
    }
    const dot = rest.indexOf('.')
    const op = dot === -1 ? rest : rest.slice(0, dot)
    const arg = dot === -1 ? '' : rest.slice(dot + 1)
    const test = makeTest(table, key, op, arg)
    filters.push({ column: key, test: negate ? (v) => !test(v) : test })
  }
  return filters
}

/* ------------------------------------------------------------------ */
/* order / limit / offset                                               */
/* ------------------------------------------------------------------ */

function parseOrder(raw) {
  if (!raw) return []
  return raw.split(',').filter(Boolean).map((token) => {
    const [column, dir, nulls] = token.split('.')
    const ascending = dir !== 'desc'
    const nullsPos = nulls === 'nullsfirst' ? 'first' : nulls === 'nullslast' ? 'last' : ascending ? 'last' : 'first'
    return { column, ascending, nullsPos }
  })
}

function applyOrder(rows, specs) {
  if (!specs.length) return rows
  return [...rows].sort((a, b) => {
    for (const spec of specs) {
      const av = a[spec.column]
      const bv = b[spec.column]
      if (av === null && bv === null) continue
      if (av === null) return spec.nullsPos === 'first' ? -1 : 1
      if (bv === null) return spec.nullsPos === 'first' ? 1 : -1
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av) < String(bv) ? -1 : String(av) > String(bv) ? 1 : 0
      if (cmp !== 0) return spec.ascending ? cmp : -cmp
    }
    return 0
  })
}

function applyRange(rows, url) {
  const offset = Number(url.searchParams.get('offset') ?? '0') || 0
  const limitRaw = url.searchParams.get('limit')
  const limit = limitRaw === null ? undefined : Number(limitRaw)
  const page = limit === undefined ? rows.slice(offset) : rows.slice(offset, offset + limit)
  return { page, offset }
}

/* ------------------------------------------------------------------ */
/* Corps de requete                                                     */
/* ------------------------------------------------------------------ */

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
async function readJsonBody(req) {
  const raw = await readRawBody(req)
  if (raw.length === 0) return undefined
  return JSON.parse(raw.toString('utf8'))
}

/* ------------------------------------------------------------------ */
/* REST : SELECT / INSERT / UPDATE / DELETE                             */
/* ------------------------------------------------------------------ */

function wantsRepresentation(prefer) {
  return prefer.includes('return=representation')
}
function wantsCount(prefer) {
  return /count=(exact|planned|estimated)/.test(prefer)
}
function wantsObject(accept) {
  return accept.includes('vnd.pgrst.object+json')
}
function singleOrError(rows, table, row, spec) {
  if (rows.length !== 1) {
    throw new PgError(
      406, 'PGRST116', 'JSON object requested, multiple (or no) rows returned',
      `Results contain ${rows.length} rows, application/vnd.pgrst.object+json requires 1 row`,
    )
  }
  return projectRow(table, row ?? rows[0], spec)
}

function handleSelect(req, url, table, send) {
  const spec = parseSelect(table, url.searchParams.get('select'))
  const filters = parseFilters(table, url.searchParams)
  const matched = db[table].filter((row) => filters.every((f) => f.test(row[f.column])))
  const total = matched.length
  const ordered = applyOrder(matched, parseOrder(url.searchParams.get('order')))
  const { page, offset } = applyRange(ordered, url)

  const prefer = req.headers['prefer'] || ''
  const headers = {}
  if (wantsCount(prefer)) {
    headers['Content-Range'] = page.length > 0 ? `${offset}-${offset + page.length - 1}/${total}` : `*/${total}`
  }

  if (req.method === 'HEAD') return send(200, undefined, headers)

  const accept = req.headers['accept'] || ''
  if (wantsObject(accept)) {
    if (page.length !== 1) {
      return send(406, {
        code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned',
        details: `Results contain ${page.length} rows, application/vnd.pgrst.object+json requires 1 row`, hint: null,
      }, headers)
    }
    return send(200, projectRow(table, page[0], spec), headers)
  }
  return send(200, page.map((row) => projectRow(table, row, spec)), headers)
}

function nextId(table) {
  if (TABLES[table].idType === 'bigint') return auditIdCounter++
  return randomUUID()
}

/** Complete une ligne inseree avec TOUTES les colonnes du schema (defaut null).
 * Cote PostgREST reel, une colonne omise a une valeur par defaut (souvent NULL) —
 * jamais "absente" de la ligne stockee. Reproduit ici sans avoir a interpreter le
 * parametre `columns` que le client ajoute pour les inserts en tableau. */
function fillRow(table, partial) {
  const row = { ...partial }
  const now = new Date().toISOString()
  if (row.id === undefined || row.id === null) row.id = nextId(table)
  if (TABLES[table].columns.includes('created_at') && row.created_at === undefined) row.created_at = now
  if (TABLES[table].columns.includes('updated_at') && row.updated_at === undefined) row.updated_at = now
  if (TABLES[table].columns.includes('at') && row.at === undefined) row.at = now
  for (const c of TABLES[table].columns) if (!(c in row)) row[c] = null
  return row
}

async function handleInsert(req, url, table, send) {
  const body = (await readJsonBody(req)) ?? {}
  const items = Array.isArray(body) ? body : [body]
  const inserted = items.map((item) => {
    for (const key of Object.keys(item)) {
      if (!TABLES[table].columns.includes(key)) throw unknownColumn(table, key)
    }
    const row = fillRow(table, item)
    db[table].push(row)
    return row
  })

  const prefer = req.headers['prefer'] || ''
  if (!wantsRepresentation(prefer)) return send(201, undefined)

  const spec = parseSelect(table, url.searchParams.get('select'))
  const accept = req.headers['accept'] || ''
  if (wantsObject(accept)) {
    return send(201, singleOrError(inserted, table, inserted[0], spec))
  }
  return send(201, inserted.map((row) => projectRow(table, row, spec)))
}

async function handleUpdate(req, url, table, send) {
  const body = (await readJsonBody(req)) ?? {}
  for (const key of Object.keys(body)) {
    if (!TABLES[table].columns.includes(key)) throw unknownColumn(table, key)
  }
  const filters = parseFilters(table, url.searchParams)
  const matched = db[table].filter((row) => filters.every((f) => f.test(row[f.column])))
  const now = new Date().toISOString()
  for (const row of matched) {
    Object.assign(row, body)
    if (TABLES[table].columns.includes('updated_at') && !('updated_at' in body)) row.updated_at = now
  }

  const prefer = req.headers['prefer'] || ''
  const headers = {}
  if (wantsCount(prefer)) headers['Content-Range'] = matched.length > 0 ? `0-${matched.length - 1}/${matched.length}` : `*/${matched.length}`

  if (!wantsRepresentation(prefer)) return send(204, undefined, headers)

  const spec = parseSelect(table, url.searchParams.get('select'))
  const accept = req.headers['accept'] || ''
  if (wantsObject(accept)) return send(200, singleOrError(matched, table, matched[0], spec), headers)
  return send(200, matched.map((row) => projectRow(table, row, spec)), headers)
}

async function handleDelete(req, url, table, send) {
  const filters = parseFilters(table, url.searchParams)
  const matched = db[table].filter((row) => filters.every((f) => f.test(row[f.column])))
  const matchedIds = new Set(matched.map((r) => r.id))
  db[table] = db[table].filter((row) => !matchedIds.has(row.id))
  if (table === 'candidatures' && matchedIds.size > 0) {
    db.audit_log = db.audit_log.filter((a) => !matchedIds.has(a.candidature_id))
  }

  const prefer = req.headers['prefer'] || ''
  if (!wantsRepresentation(prefer)) return send(204, undefined)

  const spec = parseSelect(table, url.searchParams.get('select'))
  const accept = req.headers['accept'] || ''
  if (wantsObject(accept)) return send(200, singleOrError(matched, table, matched[0], spec))
  return send(200, matched.map((row) => projectRow(table, row, spec)))
}

async function handleRest(req, url, send) {
  const table = url.pathname.slice('/rest/v1/'.length).split('/')[0]
  if (!TABLES[table]) return send(404, { message: `relation "${table}" does not exist` })
  if (req.method === 'GET' || req.method === 'HEAD') return handleSelect(req, url, table, send)
  if (req.method === 'POST') return handleInsert(req, url, table, send)
  if (req.method === 'PATCH') return handleUpdate(req, url, table, send)
  if (req.method === 'DELETE') return handleDelete(req, url, table, send)
  return send(405, { message: 'method not allowed' })
}

/* ------------------------------------------------------------------ */
/* RPC : next_contract_number                                           */
/* ------------------------------------------------------------------ */

async function handleRpc(req, url, send) {
  const fn = url.pathname.slice('/rest/v1/rpc/'.length)
  if (req.method !== 'POST') return send(405, { message: 'method not allowed' })
  if (fn !== 'next_contract_number') return send(404, { message: `function ${fn}() does not exist` })
  await readRawBody(req) // aucun argument attendu
  return send(200, contractNumberSeq++)
}

/* ------------------------------------------------------------------ */
/* Storage : bucket "contracts" uniquement (seul bucket utilise)        */
/* ------------------------------------------------------------------ */

const STORAGE_OBJECT_PREFIX = '/storage/v1/object/contracts/'
const STORAGE_SIGN_PREFIX = '/storage/v1/object/sign/contracts/'

async function handleStorageUpload(req, url, send) {
  if (req.method !== 'POST' && req.method !== 'PUT') return send(405, { message: 'method not allowed' })
  const path = decodeURIComponent(url.pathname.slice(STORAGE_OBJECT_PREFIX.length))
  if (!path) return send(400, { message: 'chemin de fichier manquant' })
  const buf = await readRawBody(req)
  storage.set(path, buf)
  return send(200, { Id: randomUUID(), Key: `contracts/${path}` })
}

async function handleStorageSign(req, url, send) {
  const path = decodeURIComponent(url.pathname.slice(STORAGE_SIGN_PREFIX.length))
  if (req.method === 'POST') {
    await readRawBody(req) // { expiresIn } ignore : un jeton mock ne bloque jamais
    return send(200, { signedURL: `/object/sign/contracts/${path}?token=mock` })
  }
  if (req.method === 'GET') {
    const buf = storage.get(path)
    if (!buf) return send(404, { message: 'Object not found' })
    return send(200, buf, { 'Content-Type': 'application/pdf' })
  }
  return send(405, { message: 'method not allowed' })
}

/* ------------------------------------------------------------------ */
/* Resend : POST /resend/emails (RESEND_BASE_URL = .../resend)          */
/* ------------------------------------------------------------------ */

async function handleResend(req, send) {
  if (req.method !== 'POST') return send(405, { message: 'method not allowed' })
  const body = (await readJsonBody(req)) ?? {}
  emails.push({
    to: body.to ?? null,
    subject: body.subject ?? null,
    bcc: body.bcc ?? null,
    tags: body.tags ?? null,
    attachmentsCount: Array.isArray(body.attachments) ? body.attachments.length : 0,
    at: new Date().toISOString(),
  })
  return send(200, { id: `mock_${emails.length}` })
}

/* ------------------------------------------------------------------ */
/* Controle : /__reset /__emails /__state                               */
/* ------------------------------------------------------------------ */

async function handleControl(req, url, send) {
  if (url.pathname === '/__reset' && req.method === 'POST') {
    await readRawBody(req)
    loadFixtures()
    return send(200, { ok: true, counts: stateCounts() })
  }
  if (url.pathname === '/__emails' && req.method === 'GET') return send(200, emails)
  if (url.pathname === '/__state' && req.method === 'GET') return send(200, stateCounts())
  return null // pas une route de controle
}

/* ------------------------------------------------------------------ */
/* Serveur HTTP                                                         */
/* ------------------------------------------------------------------ */

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`)
  const isHead = req.method === 'HEAD'

  function send(status, body, extraHeaders) {
    const headers = { ...extraHeaders }
    let payload
    if (body === undefined) {
      payload = Buffer.alloc(0)
    } else if (Buffer.isBuffer(body)) {
      payload = body
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
      payload = Buffer.from(JSON.stringify(body))
    }
    console.log(`${req.method} ${url.pathname}${url.search} -> ${status}`)
    res.writeHead(status, headers)
    res.end(isHead ? undefined : payload)
  }

  Promise.resolve()
    .then(async () => {
      const controlled = await handleControl(req, url, send)
      if (controlled !== null) return

      if (url.pathname.startsWith('/rest/v1/rpc/')) return handleRpc(req, url, send)
      if (url.pathname.startsWith('/rest/v1/')) return handleRest(req, url, send)
      if (url.pathname.startsWith(STORAGE_SIGN_PREFIX)) return handleStorageSign(req, url, send)
      if (url.pathname.startsWith(STORAGE_OBJECT_PREFIX)) return handleStorageUpload(req, url, send)
      if (url.pathname === '/resend/emails') return handleResend(req, send)

      return send(404, { message: `no route for ${req.method} ${url.pathname}` })
    })
    .catch((err) => {
      if (err instanceof PgError) {
        return send(err.status, { code: err.code, message: err.message, details: err.details ?? null, hint: null })
      }
      console.error('[mock] erreur non geree', err)
      return send(500, { message: String(err && err.message || err) })
    })
})

loadFixtures()
server.listen(PORT, HOST, () => {
  console.log(`[mock] faux backend pret sur http://${HOST}:${PORT} (${stateCounts().candidatures} candidatures, ${stateCounts().candidates} candidats, ${stateCounts().audit_log} entrees d'audit, ${stateCounts().guide_leads} leads)`)
})

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0))
  })
}
