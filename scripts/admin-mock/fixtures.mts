// Jeu de donnees synthetique deterministe pour le faux backend admin (server.mjs).
//
// Tout est calcule relativement a `now` : aucune date figee en dur, aucun
// Math.random(). Deux appels avec le meme `now` produisent EXACTEMENT le meme jeu
// (server.mjs s'appuie sur cette propriete pour POST /__reset).
//
// Execution directe (utilisee par server.mjs, qui lance ce fichier en sous-processus) :
//   node --experimental-strip-types --import ./scripts/_alias-hook.mjs scripts/admin-mock/fixtures.mts --json
//
// Import de `@/data/sessions` et `@/data/referral-codes` : memes sources que l'app
// reelle, donc les session_id et codes referral generes ici sont TOUJOURS valides
// cote admin (pas de session ou de code invente qui n'existerait pas vraiment).
//
// Aucune donnee reelle : emails en @example.com, telephones +3360000xxxx,
// IP 203.0.113.0/24 (bloc TEST-NET-3, RFC 5737 — reserve a la documentation).

import { getSessions, sessionFromId, buildSession, type Session } from '@/data/sessions'
import { computeCommissionEur } from '@/data/referral-codes'

/* ------------------------------------------------------------------ */
/* Helpers temps                                                       */
/* ------------------------------------------------------------------ */

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

function hoursAgo(now: Date, h: number): Date {
  return new Date(now.getTime() - h * HOUR_MS)
}
function hoursFromNow(now: Date, h: number): Date {
  return new Date(now.getTime() + h * HOUR_MS)
}
function daysAgo(now: Date, d: number): Date {
  return new Date(now.getTime() - d * DAY_MS)
}
function daysFromNow(now: Date, d: number): Date {
  return new Date(now.getTime() + d * DAY_MS)
}
function fromSession(iso: string, hour = 9): Date {
  return new Date(`${iso}T${String(hour).padStart(2, '0')}:00:00.000Z`)
}
function shiftDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * DAY_MS)
}
function iso(d: Date): string {
  return d.toISOString()
}
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/* ------------------------------------------------------------------ */
/* Ids stables                                                         */
/* ------------------------------------------------------------------ */

// Candidatures : 00000000-0000-4000-8000-0000000000NN, NN en hexa de 01 a 3c (brief).
function candidatureId(n: number): string {
  return `00000000-0000-4000-8000-0000000000${n.toString(16).padStart(2, '0')}`
}
// Candidats : meme index que leur candidature d'origine, groupe 9000 pour rester
// visuellement distinct des candidatures (mais tout aussi stable/previsible).
function candidateIdOf(n: number): string {
  return `00000000-0000-4000-9000-0000000000${n.toString(16).padStart(2, '0')}`
}
// Leads guide : groupe b000.
function guideLeadId(n: number): string {
  return `00000000-0000-4000-b000-00000000000${n}`
}

/* ------------------------------------------------------------------ */
/* Pools de donnees fictives (@example.com uniquement)                 */
/* ------------------------------------------------------------------ */

// 30 x 37 (premier entre eux) : garantit des paires (prenom, nom) uniques sur
// les 59 candidats distincts du jeu (cf. buildFixtures) sans avoir a lister
// 59 noms a la main.
const FIRST_NAMES = [
  'Lucas', 'Mehdi', 'Karim', 'Thomas', 'Nikolai', 'Marco', 'Andrea', 'David', 'Yanis', 'Rayan',
  'Ilyes', 'Hugo', 'Adam', 'Noah', 'Liam', 'Ethan', 'Maxime', 'Julien', 'Sacha', 'Ivan',
  'Dimitri', 'Omar', 'Youssef', 'Enzo', 'Nathan', 'Gabriel', 'Leon', 'Theo', 'Amir', 'Rustam',
]
const LAST_NAMES = [
  'Petrov', 'Dubois', 'Martin', 'Bernard', 'Rossi', 'Ferrari', 'Novak', 'Ivanov', 'Sokolov', 'Volkov',
  'Traore', 'Diallo', 'Haddad', 'Benali', 'Moreau', 'Lefevre', 'Girard', 'Roux', 'Fontaine', 'Chevalier',
  'Fournier', 'Lambert', 'Rocher', 'Vasiliev', 'Kuznetsov', 'Popov', 'Morel', 'Simon', 'Michel', 'Garcia',
  'Lopez', 'Costa', 'Bianchi', 'Conti', 'Marchetti', 'Weber', 'Keller',
]
const PAYS = ['France', 'Belgique', 'Suisse', 'Allemagne', 'Italie', 'Espagne', 'Royaume-Uni', 'Etats-Unis', 'Canada', 'Maroc', 'Pologne', 'Pays-Bas']
const VILLES = ['Paris', 'Lyon', 'Marseille', 'Bruxelles', 'Geneve', 'Zurich', 'Berlin', 'Milan', 'Madrid', 'Londres', 'Montreal', 'Casablanca', 'Varsovie', 'Amsterdam', 'Nice', 'Toulouse']
const CLUBS: (string | null)[] = ['Dague Lutte Club', 'Free Fight Academy', 'Olympique Lutte', 'Iron Circle MMA', 'Wrestling Nation', 'Boxing Team 13', null]
const COACHS: (string | null)[] = ['Sergei M.', 'Karim B.', 'Anthony R.', null, null]
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36',
]

function personName(i: number): { prenom: string; nom: string } {
  return { prenom: FIRST_NAMES[i % FIRST_NAMES.length], nom: LAST_NAMES[i % LAST_NAMES.length] }
}
function phoneFor(n: number): string {
  return `+3360000${String(n).padStart(4, '0')}`
}
function ipFor(n: number): string {
  return `203.0.113.${n % 255}`
}
function uaFor(n: number): string {
  return USER_AGENTS[n % USER_AGENTS.length]
}

/* ------------------------------------------------------------------ */
/* Sessions : departee / terminee, calculees (jamais figees en dur)    */
/* ------------------------------------------------------------------ */

/** La session d'ete (aout) la plus recente dont le depart est deja passe. */
function departedSummerSession(now: Date): Session {
  const todayIso = isoDate(now)
  const year = now.getUTCFullYear()
  for (const y of [year, year - 1]) {
    const s = sessionFromId(`aout-${y}`)
    if (s && s.startDate <= todayIso) return s
  }
  // Filet de securite improbable (le gabarit aout existe toujours pour toute annee).
  return buildSession('ete', year - 1)
}

/** La session la plus recente deja entierement terminee (endDate < today). */
function endedSession(now: Date): Session {
  const todayIso = isoDate(now)
  const year = now.getUTCFullYear()
  const order = ['automne', 'ete', 'printemps', 'hiver'] as const
  for (const y of [year, year - 1]) {
    for (const key of order) {
      const s = buildSession(key, y)
      if (s.endDate < todayIso) return s
    }
  }
  return buildSession('hiver', year - 1)
}

/* ------------------------------------------------------------------ */
/* form_data : formats reels observes en prod (anonymises)             */
/* ------------------------------------------------------------------ */

function buildMeta(n: number) {
  return { ip: ipFor(n), ua: uaFor(n) }
}

function buildExperience(n: number, discipline: 'lutte' | 'mma' | 'combo_quote') {
  const niveaux = ['debutant', 'intermediaire', 'avance', 'competiteur-regional', 'competiteur-national', 'competiteur-international'] as const
  const annees = ['1-2', '2-5', '5-10', '10+'] as const
  return {
    discipline_principale: discipline === 'combo_quote' ? 'lutte' : discipline,
    disciplines_secondaires: discipline === 'combo_quote' ? ['mma'] : [],
    annees_pratique: annees[n % annees.length],
    niveau: niveaux[n % niveaux.length],
    club: CLUBS[n % CLUBS.length],
    coach: COACHS[n % COACHS.length],
    palmares: n % 3 === 0 ? 'Vice-champion regional 2025, 2e place tournoi open 2026' : '',
    lien_video: n % 4 === 0 ? `https://youtube.com/watch?v=mkr-demo-${n}` : '',
  }
}

function buildSante(n: number) {
  const blessures = ['non', 'mineure', 'oui'] as const
  const deuxFois = ['oui', 'avec-adaptation', 'non'] as const
  const b = blessures[n % blessures.length]
  return {
    condition_physique: String(2 + (n % 4)),
    blessures_recentes: b,
    blessures_detail: b === 'non' ? '' : 'Genou gauche, suivi kine termine avant le depart',
    contre_indications: n % 5 === 0 ? 'oui' : 'non',
    contre_indications_detail: n % 5 === 0 ? 'Asthme leger, ventoline sur soi si besoin' : '',
    deux_fois_jour: deuxFois[n % deuxFois.length],
  }
}

function buildLogistique(n: number) {
  const sources = ['instagram', 'google', 'coach', 'ami', 'youtube'] as const
  return {
    source_decouverte: sources[n % sources.length],
    message: n % 6 === 0 ? 'Dispo pour un appel en soiree, merci !' : '',
  }
}

function buildConfirmations(tunnel: string) {
  if (tunnel === 'groupe') {
    return { certif_medical: null, accepte_conditions: true, pret: null }
  }
  return { certif_medical: true, accepte_conditions: true, pret: true }
}

function buildCustomForm(n: number) {
  return {
    composition: '2',
    autres_participants: [
      { prenom: FIRST_NAMES[(n + 5) % FIRST_NAMES.length], niveau: 'competiteur', discipline: 'Boxe Anglaise' },
    ],
  }
}

function buildFamilleForm(n: number, format: string) {
  return {
    format,
    nombre_parents: n % 2 === 0 ? '1' : '2',
    conjoint_participe: n % 2 === 1,
    enfants: [
      { prenom: FIRST_NAMES[(n + 2) % FIRST_NAMES.length], age: '13', pratiqueDeja: 'oui', anneesPratique: '1', contreIndications: 'non', contreIndicationsDetail: '' },
      { prenom: FIRST_NAMES[(n + 9) % FIRST_NAMES.length], age: '10', pratiqueDeja: 'non', anneesPratique: '', contreIndications: 'non', contreIndicationsDetail: '' },
    ],
  }
}

function buildGroupeForm() {
  return {
    nom_club: 'Dague Lutte Club',
    nombre_participants: '6-10',
    niveau_groupe: 'intermediaire a competiteur',
    disciplines: ['lutte', 'mma'],
    palmares_club: '3 podiums regionaux en 2026, club affilie FFL',
    lien_video: 'https://youtube.com/watch?v=mkr-club-demo',
  }
}

function buildAttribution(now: Date, n: number, source: string | null): Record<string, unknown> | null {
  if (source === 'google_ads') {
    return {
      ts: iso(hoursAgo(now, 48 + n)),
      gclid: `Cj0KCQjw_mock_${n}`,
      gbraid: n % 2 === 0 ? `gbr_mock_${n}` : '',
      landing: n % 3 === 0 ? '/en' : '/',
      referrer: 'https://www.google.com/',
      gad_source: '1',
    }
  }
  if (source === 'meta_ads') {
    return {
      ts: iso(hoursAgo(now, 30 + n)),
      utm_source: 'facebook',
      utm_medium: 'paid-social',
      utm_campaign: 'mkr-prospection-2026',
    }
  }
  if (source === 'instagram') {
    return { ts: iso(hoursAgo(now, 20 + n)), referrer: 'https://www.instagram.com/' }
  }
  if (source === 'other') {
    return { ts: iso(hoursAgo(now, 60 + n)), referrer: 'https://www.bing.com/' }
  }
  return null
}

function formDataFor(n: number, tunnel: string, discipline: 'lutte' | 'mma' | 'combo_quote'): Record<string, unknown> {
  return {
    experience: buildExperience(n, discipline),
    sante: buildSante(n),
    logistique: buildLogistique(n),
    confirmations: buildConfirmations(tunnel),
    _meta: buildMeta(n),
  }
}

/** MKR-YYYY-XXXX — miroir de data/contract.ts::formatContractNumber. */
function formatContractNum(seq: number, year: number): string {
  return `MKR-${year}-${String(seq).padStart(4, '0')}`
}

/* ------------------------------------------------------------------ */
/* Constructeurs de ligne                                               */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>

function baseCandidature(n: number, candId: string, now: Date): Row {
  return {
    id: candidatureId(n),
    candidate_id: candId,
    tunnel_type: 'session',
    session_id: null,
    duree_semaines: ((n - 1) % 3) + 1,
    date_debut_souhaitee: null,
    status: 'recue',
    status_changed_at: iso(now),
    status_changed_by_email: null,
    package_amount_cents: null,
    package_paid_at: null,
    notes_visio: null,
    notes_admin: null,
    form_data: {},
    group_members: null,
    created_at: iso(now),
    updated_at: iso(now),
    payment_method: null,
    payment_date: null,
    camp_discipline: n % 4 === 0 ? 'mma' : 'lutte',
    referral_code: null,
    referral_code_valid: null,
    referral_partner_name: null,
    referral_partner_type: null,
    referral_bonus_eur: null,
    referral_payout_status: null,
    referral_payout_paid_at: null,
    referral_payout_method: null,
    submission_language: (n - 1) % 5 < 3 ? 'en' : 'fr', // 60 % en, cf. brief
    referral_commission_type: null,
    referral_commission_pct: null,
    contract_start_date: null,
    contract_end_date: null,
    contract_duration_weeks: null,
    contract_inclusions: null,
    contract_exclusions: null,
    contract_note: null,
    contract_payment_deadline: null,
    contract_locale: null,
    contract_number: null,
    contract_sent_at: null,
    contract_sent_count: 0,
    contract_pdf_path: null,
    attribution_source: null,
    attribution: null,
    souvenir_sent_at: null,
    visio_reminder_sent_at: null,
    visio_reminder_count: 0,
    cancel_token: `tok-${n.toString(16).padStart(2, '0')}`,
    visio_booked_at: null,
    visio_booking_uid: null,
    visio_starts_at: null,
    payment_reminder_sent_at: null,
    payment_reminder_count: 0,
    predeparture_sent_at: null,
    rebooking_sent_at: null,
    rebooking_sent_count: 0,
  }
}

function baseCandidate(n: number, now: Date): Row {
  const { prenom, nom } = personName(n - 1)
  return {
    id: candidateIdOf(n),
    prenom,
    nom,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase()}${n}@example.com`,
    telephone: phoneFor(n),
    date_naissance: isoDate(daysAgo(now, (18 + ((n * 3) % 25)) * 365)),
    pays: PAYS[n % PAYS.length],
    ville_depart: VILLES[n % VILLES.length],
    notes_admin: null,
    created_at: iso(daysAgo(now, 1)),
    updated_at: iso(daysAgo(now, 1)),
  }
}

/* ------------------------------------------------------------------ */
/* buildFixtures                                                       */
/* ------------------------------------------------------------------ */

export interface Fixtures {
  candidatures: Row[]
  candidates: Row[]
  audit_log: Row[]
  guide_leads: Row[]
}

export function buildFixtures(now: Date): Fixtures {
  const candidatures: Row[] = []
  const candidates: Row[] = []
  const audit_log: Row[] = []

  let auditSeq = 1
  function addAudit(
    candidature_id: string,
    event: string,
    opts: {
      from_value?: Record<string, unknown> | null
      to_value?: Record<string, unknown> | null
      data?: Record<string, unknown> | null
      actor?: string
      at: Date | string
    },
  ) {
    audit_log.push({
      id: auditSeq++,
      candidature_id,
      event,
      from_value: opts.from_value ?? null,
      to_value: opts.to_value ?? null,
      actor_email: opts.actor ?? 'admin',
      data: opts.data ?? null,
      at: typeof opts.at === 'string' ? opts.at : iso(opts.at),
    })
  }

  const upcoming = getSessions(now) // fenetre glissante ouverte, triee chronologiquement
  const departed = departedSummerSession(now)
  const ended = endedSession(now)

  // ---- ligne "candidature" generique + son candidat + son audit 'created' ----
  function addRow(n: number, overrides: Partial<Row>, candidateOverrides: Partial<Row> = {}, sharedCandidateId?: string) {
    const candId = sharedCandidateId ?? candidateIdOf(n)
    if (!sharedCandidateId) {
      candidates.push({ ...baseCandidate(n, now), ...candidateOverrides })
    }

    const source = (overrides.attribution_source as string | null | undefined) ?? null
    const attribution = source ? buildAttribution(now, n, source) : null

    const row: Row = {
      ...baseCandidature(n, candId, now),
      attribution_source: source,
      attribution,
      ...overrides,
    }
    if (!('form_data' in overrides)) {
      row.form_data = formDataFor(n, row.tunnel_type as string, row.camp_discipline as 'lutte' | 'mma' | 'combo_quote')
    }
    candidatures.push(row)

    addAudit(row.id as string, 'created', {
      to_value: { status: 'recue', tunnel_type: row.tunnel_type },
      actor: 'candidate',
      at: row.created_at as string,
    })

    // Auto-couverture : ces deux evenements sont mecaniquement lies a des champs
    // deja poses sur la ligne, donc generes automatiquement plutot que rappeles
    // ligne par ligne (attribution_captured des qu'une source existe, referral_attached
    // des qu'un code VALIDE est rattache).
    if (source) {
      const attr = attribution ?? {}
      addAudit(row.id as string, 'attribution_captured', {
        to_value: { source, gclid: (attr as Record<string, unknown>).gclid ?? null, utm_campaign: (attr as Record<string, unknown>).utm_campaign ?? null },
        actor: 'system',
        at: hoursFromNow(new Date(row.created_at as string), 0),
      })
    }
    if (row.referral_code && row.referral_code_valid === true) {
      addAudit(row.id as string, 'referral_attached', {
        to_value: { code: row.referral_code, partner: row.referral_partner_name, bonus_eur: row.referral_bonus_eur },
        actor: 'system',
        at: new Date(row.created_at as string),
      })
    }

    return row
  }

  /* ================================================================ */
  /* 1-3 : camp_parti — session d'ete deja partie                      */
  /* ================================================================ */
  const departStart = fromSession(departed.startDate)
  addRow(1, {
    session_id: departed.id,
    created_at: iso(shiftDays(departStart, -25)),
    status_changed_at: iso(shiftDays(departStart, -25)),
  })
  addRow(2, {
    session_id: departed.id,
    created_at: iso(shiftDays(departStart, -15)),
    status_changed_at: iso(shiftDays(departStart, -15)),
  })
  {
    const created = shiftDays(departStart, -30)
    const validated = shiftDays(departStart, -28)
    const row3 = addRow(3, {
      session_id: departed.id,
      status: 'validee',
      created_at: iso(created),
      status_changed_at: iso(validated),
      notes_admin: 'Valide avant depart mais jamais paye. Ruslan a tente de le joindre 2x (tel + WhatsApp), sans reponse.',
      rebooking_sent_at: iso(daysAgo(now, 5)),
      rebooking_sent_count: 2,
    })
    addAudit(row3.id as string, 'status_change', {
      from_value: { status: 'recue' },
      to_value: { status: 'validee' },
      data: { reminder: 'Envoyer le contrat sous 48h.' },
      at: validated,
    })
    addAudit(row3.id as string, 'notes_admin_update', { actor: 'admin', at: daysAgo(now, 6) })
    addAudit(row3.id as string, 'rebooking_sent', {
      to_value: { rebooking_sent_at: iso(daysAgo(now, 12)), rebooking_sent_count: 1 },
      data: { to: (candidates.find((c) => c.id === row3.candidate_id) as Row).email, count: 1, locale: 'fr', session_id: departed.id },
      at: daysAgo(now, 12),
    })
    addAudit(row3.id as string, 'rebooking_sent', {
      to_value: { rebooking_sent_at: iso(daysAgo(now, 5)), rebooking_sent_count: 2 },
      data: { to: (candidates.find((c) => c.id === row3.candidate_id) as Row).email, count: 2, locale: 'fr', session_id: departed.id },
      at: daysAgo(now, 5),
    })
    addAudit(row3.id as string, 'rebooking_reminder_sent', {
      data: { to: (candidates.find((c) => c.id === row3.candidate_id) as Row).email, auto: true, locale: 'fr' },
      actor: 'system-cron',
      at: daysAgo(now, 2),
    })
  }

  /* ================================================================ */
  /* 4-7 : visio_a_venir                                                */
  /* ================================================================ */
  const visioAVenirPlans: Array<{ n: number; starts: Date; extra?: Partial<Row> }> = [
    { n: 4, starts: hoursFromNow(now, 2) },
    { n: 5, starts: daysFromNow(now, 1) },
    { n: 6, starts: daysFromNow(now, 5) },
    { n: 7, starts: daysFromNow(now, 20) },
  ]
  for (const p of visioAVenirPlans) {
    const bookedAt = daysAgo(now, 2)
    const row = addRow(p.n, {
      session_id: upcoming[0]?.id ?? null,
      visio_booked_at: iso(bookedAt),
      visio_booking_uid: `cal-mock-uid-${p.n}`,
      visio_starts_at: iso(p.starts),
      ...p.extra,
    })
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    addAudit(row.id as string, 'visio_booked', {
      to_value: { visio_booked_at: iso(bookedAt), visio_booking_uid: row.visio_booking_uid },
      data: { email, start_time: iso(p.starts) },
      actor: 'cal-webhook',
      at: bookedAt,
    })
    if (p.n === 6) {
      addAudit(row.id as string, 'visio_confirmation_resent', {
        data: { to: email, locale: 'fr' },
        actor: 'admin',
        at: daysAgo(now, 1),
      })
    }
  }

  /* ================================================================ */
  /* 8-10 : visio_passee                                                */
  /* ================================================================ */
  const visioPasseePlans: Array<{ n: number; starts: Date }> = [
    { n: 8, starts: daysAgo(now, 1) },
    { n: 9, starts: daysAgo(now, 6) },
    { n: 10, starts: daysAgo(now, 30) },
  ]
  for (const p of visioPasseePlans) {
    const bookedAt = shiftDays(p.starts, -3)
    const row = addRow(p.n, {
      session_id: upcoming[0]?.id ?? null,
      visio_booked_at: iso(bookedAt),
      visio_booking_uid: `cal-mock-uid-${p.n}`,
      visio_starts_at: iso(p.starts),
      notes_visio: p.n === 9 ? 'Bon niveau technique, motive, budget confirme. A valider.' : null,
    })
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    if (p.n === 10) {
      // Reserve une premiere fois puis annulee, avant d'etre reprogrammee au
      // creneau finalement tenu (couvre visio_booking_cancelled).
      const firstBooking = shiftDays(p.starts, -10)
      addAudit(row.id as string, 'visio_booked', {
        to_value: { visio_booked_at: iso(firstBooking), visio_booking_uid: 'cal-mock-uid-10-v1' },
        data: { email, start_time: iso(shiftDays(p.starts, -1)) },
        actor: 'cal-webhook',
        at: firstBooking,
      })
      addAudit(row.id as string, 'visio_booking_cancelled', {
        from_value: { visio_booked_at: iso(firstBooking), visio_booking_uid: 'cal-mock-uid-10-v1' },
        to_value: { visio_booked_at: null, visio_booking_uid: null },
        data: { email },
        actor: 'candidate',
        at: shiftDays(p.starts, -8),
      })
    }
    addAudit(row.id as string, 'visio_booked', {
      to_value: { visio_booked_at: iso(bookedAt), visio_booking_uid: row.visio_booking_uid },
      data: { email, start_time: iso(p.starts) },
      actor: 'cal-webhook',
      at: bookedAt,
    })
  }

  /* ================================================================ */
  /* 11 : visio_reservee (visio_starts_at null)                        */
  /* ================================================================ */
  {
    const bookedAt = daysAgo(now, 2)
    const row = addRow(11, {
      session_id: upcoming[0]?.id ?? null,
      visio_booked_at: iso(bookedAt),
      visio_booking_uid: 'cal-mock-uid-11',
      visio_starts_at: null,
    })
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    addAudit(row.id as string, 'visio_booked', {
      to_value: { visio_booked_at: iso(bookedAt), visio_booking_uid: row.visio_booking_uid },
      data: { email },
      actor: 'cal-webhook',
      at: bookedAt,
    })
  }

  /* ================================================================ */
  /* 12 : devis_a_envoyer — tunnel groupe                               */
  /* ================================================================ */
  addRow(12, {
    tunnel_type: 'groupe',
    session_id: null,
    camp_discipline: 'combo_quote',
    created_at: iso(hoursAgo(now, 20)),
    status_changed_at: iso(hoursAgo(now, 20)),
    form_data: { groupe: buildGroupeForm(), confirmations: buildConfirmations('groupe'), _meta: buildMeta(12) },
  })

  /* ================================================================ */
  /* 13-16 : a_relancer                                                 */
  /* ================================================================ */
  const relancerPlans: Array<{ n: number; ageDays: number; count: number }> = [
    { n: 13, ageDays: 4, count: 0 },
    { n: 14, ageDays: 9, count: 1 },
    { n: 15, ageDays: 15, count: 2 },
    { n: 16, ageDays: 40, count: 0 }, // laisse volontairement sans relance : trou de l'automation a surveiller
  ]
  for (const p of relancerPlans) {
    const createdAt = daysAgo(now, p.ageDays)
    const row = addRow(p.n, {
      session_id: upcoming[0]?.id ?? null,
      created_at: iso(createdAt),
      status_changed_at: iso(createdAt),
      visio_reminder_count: p.count,
      visio_reminder_sent_at: p.count > 0 ? iso(daysAgo(now, p.ageDays - 2)) : null,
    })
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    if (p.count >= 1) {
      addAudit(row.id as string, 'visio_reminder_sent', {
        to_value: { visio_reminder_sent_at: iso(daysAgo(now, p.ageDays - 2)), visio_reminder_count: 1 },
        data: { to: email, count: 1, locale: row.submission_language },
        actor: 'system-cron',
        at: daysAgo(now, p.ageDays - 2),
      })
    }
    if (p.count >= 2) {
      addAudit(row.id as string, 'visio_reminder_sent', {
        to_value: { visio_reminder_sent_at: iso(daysAgo(now, p.ageDays - 6)), visio_reminder_count: 2 },
        data: { to: email, count: 2, locale: row.submission_language },
        actor: 'system-cron',
        at: daysAgo(now, p.ageDays - 6),
      })
    }
    if (p.n === 16) {
      // Historique plus long : valide par erreur puis repassee recue (couvre souvenir_reset).
      const wrongValidation = daysAgo(now, 35)
      const revert = daysAgo(now, 33)
      addAudit(row.id as string, 'status_change', {
        from_value: { status: 'recue' },
        to_value: { status: 'validee' },
        data: { reminder: 'Verifier le niveau avant confirmation.' },
        at: wrongValidation,
      })
      addAudit(row.id as string, 'souvenir_sent', {
        to_value: { souvenir_sent_at: iso(wrongValidation) },
        data: { to: email, session: upcoming[0]?.id ?? null, discipline: row.camp_discipline },
        actor: 'system',
        at: wrongValidation,
      })
      addAudit(row.id as string, 'status_change', {
        from_value: { status: 'validee' },
        to_value: { status: 'recue' },
        data: { reminder: 'Validation posee par erreur, dossier incomplet (visio a refaire).' },
        at: revert,
      })
      addAudit(row.id as string, 'souvenir_reset', {
        from_value: { souvenir_sent_at: iso(wrongValidation) },
        to_value: { souvenir_sent_at: null },
        actor: 'admin',
        at: revert,
      })
    }
  }

  /* ================================================================ */
  /* 17-18 : nouvelle                                                    */
  /* ================================================================ */
  addRow(17, { session_id: upcoming[0]?.id ?? null, created_at: iso(hoursAgo(now, 3)), status_changed_at: iso(hoursAgo(now, 3)) })
  addRow(18, { session_id: upcoming[0]?.id ?? null, created_at: iso(daysAgo(now, 1)), status_changed_at: iso(daysAgo(now, 1)) })

  /* ================================================================ */
  /* Helper commun aux dossiers valides (validation + souvenir + contrat)*/
  /* ================================================================ */
  function validateWithSouvenir(row: Row, createdAt: Date, validatedAt: Date) {
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    addAudit(row.id as string, 'status_change', {
      from_value: { status: 'recue' },
      to_value: { status: 'validee' },
      data: { reminder: 'Envoyer le contrat sous 48h.' },
      at: validatedAt,
    })
    addAudit(row.id as string, 'souvenir_sent', {
      to_value: { souvenir_sent_at: iso(validatedAt) },
      data: { to: email, session: row.session_id, discipline: row.camp_discipline },
      actor: 'system',
      at: validatedAt,
    })
  }

  function contractFieldsUpdate(row: Row, at: Date) {
    addAudit(row.id as string, 'contract_fields_update', {
      data: {
        fields: [
          'contract_start_date', 'contract_end_date', 'contract_duration_weeks',
          'contract_inclusions', 'contract_exclusions', 'contract_payment_deadline', 'contract_locale',
        ],
      },
      at,
    })
  }

  function contractSent(row: Row, at: Date) {
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    addAudit(row.id as string, 'contract_sent', {
      to_value: { contract_sent_at: iso(at), contract_sent_count: row.contract_sent_count },
      data: {
        to: email,
        locale: row.contract_locale,
        pdf_path: row.contract_pdf_path,
        amount_cents: row.package_amount_cents,
        contract_number: formatContractNum(row.contract_number as number, at.getUTCFullYear()),
      },
      at,
    })
  }

  const INCLUSIONS = 'Hebergement pension complete\nEncadrement technique quotidien\nTransferts aeroport - camp\nAssurance responsabilite civile MKR'
  const EXCLUSIONS = 'Vol international\nAssurance voyage personnelle (obligatoire)\nDepenses personnelles'
  const CONTRACT_NOTE = 'Merci de prevoir une tenue de lutte complete et un certificat medical de non contre-indication.'

  /* ================================================================ */
  /* 19-20 : contrat_a_envoyer                                          */
  /* ================================================================ */
  {
    const sessions = [upcoming[0], upcoming[1] ?? upcoming[0]]
    ;[19, 20].forEach((n, idx) => {
      const s = sessions[idx] as Session
      const created = daysAgo(now, 8 - idx)
      const validated = daysAgo(now, 6 - idx)
      const row = addRow(n, {
        status: 'validee',
        session_id: s.id,
        created_at: iso(created),
        status_changed_at: iso(validated),
        package_amount_cents: (((n - 1) % 3) + 1) * 145000,
        contract_start_date: s.startDate,
        contract_end_date: s.endDate,
        contract_duration_weeks: ((n - 1) % 3) + 1,
        contract_inclusions: INCLUSIONS,
        contract_exclusions: EXCLUSIONS,
        contract_note: CONTRACT_NOTE,
        contract_payment_deadline: isoDate(daysFromNow(now, 10 + idx)),
        contract_locale: row_submission_language(n),
        contract_number: idx + 1,
      })
      validateWithSouvenir(row, created, validated)
      addAudit(row.id as string, 'package_amount_estimated', {
        to_value: { package_amount_cents: row.package_amount_cents },
        at: validated,
      })
      contractFieldsUpdate(row, daysAgo(now, 4 - idx))
    })
  }

  /* ================================================================ */
  /* 21 : contrat_sans_echeance (contract_payment_deadline manquante)   */
  /* ================================================================ */
  {
    const s = upcoming[0] as Session
    const created = daysAgo(now, 7)
    const validated = daysAgo(now, 5)
    const row = addRow(21, {
      status: 'validee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(validated),
      package_amount_cents: 290000,
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_payment_deadline: null,
      contract_locale: row_submission_language(21),
      contract_number: 3,
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, daysAgo(now, 3))
  }

  /* ================================================================ */
  /* 22-23 : paiement_attendu                                           */
  /* ================================================================ */
  {
    const deadlines = [daysFromNow(now, 2), daysFromNow(now, 15)]
    const sessions = [upcoming[0], upcoming[1] ?? upcoming[0]]
    ;[22, 23].forEach((n, idx) => {
      const s = sessions[idx] as Session
      const created = daysAgo(now, 18 - idx * 3)
      const validated = daysAgo(now, 16 - idx * 3)
      const sentAt = daysAgo(now, 10 - idx * 3)
      const row = addRow(n, {
        status: 'validee',
        session_id: s.id,
        created_at: iso(created),
        status_changed_at: iso(validated),
        package_amount_cents: 290000,
        contract_start_date: s.startDate,
        contract_end_date: s.endDate,
        contract_duration_weeks: 2,
        contract_inclusions: INCLUSIONS,
        contract_exclusions: EXCLUSIONS,
        contract_note: CONTRACT_NOTE,
        contract_payment_deadline: isoDate(deadlines[idx]),
        contract_locale: row_submission_language(n),
        contract_number: idx + 4,
        contract_sent_at: iso(sentAt),
        contract_sent_count: 1,
        contract_pdf_path: `${candidatureId(n)}/${formatContractNum(idx + 4, sentAt.getUTCFullYear())}-v1.pdf`,
      })
      validateWithSouvenir(row, created, validated)
      contractFieldsUpdate(row, sentAt)
      contractSent(row, sentAt)
      if (n === 23) {
        addAudit(row.id as string, 'package_amount_change', {
          from_value: { package_amount_cents: 260000 },
          to_value: { package_amount_cents: 290000 },
          at: daysAgo(now, 12),
        })
      }
    })
  }

  /* ================================================================ */
  /* 24 : paiement_en_retard                                            */
  /* ================================================================ */
  {
    const s = upcoming[0] as Session
    const created = daysAgo(now, 30)
    const validated = daysAgo(now, 28)
    const sentAt = daysAgo(now, 20)
    const row = addRow(24, {
      status: 'validee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(validated),
      package_amount_cents: 290000,
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_note: CONTRACT_NOTE,
      contract_payment_deadline: isoDate(daysAgo(now, 4)),
      contract_locale: row_submission_language(24),
      contract_number: 6,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(24)}/${formatContractNum(6, sentAt.getUTCFullYear())}-v1.pdf`,
      payment_reminder_sent_at: iso(daysAgo(now, 2)),
      payment_reminder_count: 1,
      notes_admin: 'Echeance depassee de 4 jours. Candidat previent qu il vire cette semaine (message WhatsApp du 21).',
    })
    const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'payment_reminder_sent', {
      to_value: { payment_reminder_sent_at: iso(daysAgo(now, 2)), payment_reminder_count: 1 },
      data: { to: email, count: 1, locale: row.submission_language },
      actor: 'system-cron',
      at: daysAgo(now, 2),
    })
    addAudit(row.id as string, 'notes_admin_update', { actor: 'admin', at: daysAgo(now, 1) })
  }

  /* ================================================================ */
  /* 25 : a_solder — validee, package_paid_at pose, statut PAS soldee   */
  /* ================================================================ */
  {
    const s = upcoming[0] as Session
    const created = daysAgo(now, 25)
    const validated = daysAgo(now, 23)
    const sentAt = daysAgo(now, 15)
    const paidAt = daysAgo(now, 2)
    const row = addRow(25, {
      status: 'validee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(validated),
      package_amount_cents: 290000,
      package_paid_at: iso(paidAt),
      payment_method: 'virement',
      payment_date: isoDate(paidAt),
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_note: CONTRACT_NOTE,
      contract_payment_deadline: isoDate(daysAgo(now, 1)),
      contract_locale: row_submission_language(25),
      contract_number: 7,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(25)}/${formatContractNum(7, sentAt.getUTCFullYear())}-v1.pdf`,
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'package_paid_change', {
      from_value: { package_paid_at: null },
      to_value: { package_paid_at: iso(paidAt) },
      at: paidAt,
    })
    addAudit(row.id as string, 'payment_method_change', {
      from_value: { payment_method: null },
      to_value: { payment_method: 'virement' },
      at: paidAt,
    })
    addAudit(row.id as string, 'payment_date_change', {
      from_value: { payment_date: null },
      to_value: { payment_date: isoDate(paidAt) },
      at: paidAt,
    })
  }

  /* ================================================================ */
  /* 26-27 : depart_a_venir — soldees, session a venir                  */
  /* ================================================================ */
  {
    const sessions = [upcoming[0], upcoming[1] ?? upcoming[0]]
    ;[26, 27].forEach((n, idx) => {
      const s = sessions[idx] as Session
      const created = daysAgo(now, 60 - idx * 5)
      const validated = daysAgo(now, 55 - idx * 5)
      const sentAt = daysAgo(now, 45 - idx * 5)
      const paidAt = daysAgo(now, 30 - idx * 5)
      const row = addRow(n, {
        status: 'soldee',
        session_id: s.id,
        created_at: iso(created),
        status_changed_at: iso(paidAt),
        package_amount_cents: 290000,
        package_paid_at: iso(paidAt),
        payment_method: idx === 0 ? 'virement' : 'cash',
        payment_date: isoDate(paidAt),
        contract_start_date: s.startDate,
        contract_end_date: s.endDate,
        contract_duration_weeks: 2,
        contract_inclusions: INCLUSIONS,
        contract_exclusions: EXCLUSIONS,
        contract_note: CONTRACT_NOTE,
        contract_payment_deadline: isoDate(shiftDays(sentAt, 10)),
        contract_locale: row_submission_language(n),
        contract_number: idx + 8,
        contract_sent_at: iso(sentAt),
        contract_sent_count: 1,
        contract_pdf_path: `${candidatureId(n)}/${formatContractNum(idx + 8, sentAt.getUTCFullYear())}-v1.pdf`,
        predeparture_sent_at: idx === 0 ? iso(daysAgo(now, 3)) : null,
      })
      const email = (candidates.find((c) => c.id === row.candidate_id) as Row).email
      validateWithSouvenir(row, created, validated)
      contractFieldsUpdate(row, sentAt)
      contractSent(row, sentAt)
      addAudit(row.id as string, 'status_change', {
        from_value: { status: 'validee' },
        to_value: { status: 'soldee' },
        data: {},
        at: paidAt,
      })
      addAudit(row.id as string, 'package_paid_change', {
        from_value: { package_paid_at: null },
        to_value: { package_paid_at: iso(paidAt) },
        at: paidAt,
      })
      if (idx === 0) {
        addAudit(row.id as string, 'predeparture_sent', {
          to_value: { predeparture_sent_at: iso(daysAgo(now, 3)) },
          data: { to: email, locale: row.submission_language, session: s.id },
          actor: 'system-cron',
          at: daysAgo(now, 3),
        })
      }
    })
  }

  /* ================================================================ */
  /* 28 : camp_a_cloturer — soldee, session deja terminee               */
  /* ================================================================ */
  {
    const s = ended
    const start = fromSession(s.startDate)
    const created = shiftDays(start, -70)
    const validated = shiftDays(start, -65)
    const sentAt = shiftDays(start, -50)
    const paidAt = shiftDays(start, -40)
    const row = addRow(28, {
      status: 'soldee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(paidAt),
      package_amount_cents: 290000,
      package_paid_at: iso(paidAt),
      payment_method: 'virement',
      payment_date: isoDate(paidAt),
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_note: CONTRACT_NOTE,
      contract_payment_deadline: isoDate(shiftDays(sentAt, 10)),
      contract_locale: row_submission_language(28),
      contract_number: 10,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(28)}/${formatContractNum(10, sentAt.getUTCFullYear())}-v1.pdf`,
      predeparture_sent_at: iso(shiftDays(start, -5)),
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'status_change', {
      from_value: { status: 'validee' },
      to_value: { status: 'soldee' },
      data: {},
      at: paidAt,
    })
    addAudit(row.id as string, 'package_paid_change', {
      from_value: { package_paid_at: null },
      to_value: { package_paid_at: iso(paidAt) },
      at: paidAt,
    })
  }

  /* ================================================================ */
  /* 29-32 : clos (refusee, annulee, reportee, camp_fait)                */
  /* ================================================================ */
  {
    const created = daysAgo(now, 10)
    const changed = daysAgo(now, 9)
    const row = addRow(29, {
      status: 'refusee',
      session_id: upcoming[0]?.id ?? null,
      created_at: iso(created),
      status_changed_at: iso(changed),
    })
    addAudit(row.id as string, 'status_change', {
      from_value: { status: 'recue' },
      to_value: { status: 'refusee' },
      data: { reminder: 'Niveau insuffisant pour la session demandee, proposer une session ulterieure.' },
      at: changed,
    })
  }
  {
    const created = daysAgo(now, 60)
    const changed = daysAgo(now, 55)
    const row = addRow(30, { status: 'annulee', session_id: departed.id, created_at: iso(created), status_changed_at: iso(changed) })
    const candidate = candidates.find((c) => c.id === row.candidate_id) as Row
    const oldEmail = `${(candidate.prenom as string).toLowerCase()}.${(candidate.nom as string).toLowerCase()}.old@example.com`
    addAudit(row.id as string, 'email_corrected', {
      from_value: { email: oldEmail },
      to_value: { email: candidate.email },
      data: { field: 'email', reason: 'faute de frappe signalee par le candidat au telephone' },
      actor: 'admin',
      at: daysAgo(now, 58),
    })
    addAudit(row.id as string, 'status_change', {
      from_value: { status: 'recue' },
      to_value: { status: 'annulee' },
      data: { reminder: 'Candidat indisponible pour la session, annule de son propre chef.' },
      at: changed,
    })
  }
  {
    const created = daysAgo(now, 5)
    const changed = daysAgo(now, 4)
    const row = addRow(31, {
      status: 'reportee',
      session_id: upcoming[0]?.id ?? null,
      created_at: iso(created),
      status_changed_at: iso(changed),
    })
    addAudit(row.id as string, 'status_change', {
      from_value: { status: 'recue' },
      to_value: { status: 'reportee' },
      data: { reminder: 'Report a la demande du candidat (indisponibilite pro).' },
      at: changed,
    })
  }
  {
    const s = ended
    const start = fromSession(s.startDate)
    const created = shiftDays(start, -80)
    const validated = shiftDays(start, -75)
    const sentAt = shiftDays(start, -60)
    const paidAt = shiftDays(start, -50)
    const finished = shiftDays(fromSession(s.endDate), 1)
    const row = addRow(32, {
      status: 'camp_fait',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(finished),
      package_amount_cents: 290000,
      package_paid_at: iso(paidAt),
      payment_method: 'virement',
      payment_date: isoDate(paidAt),
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_locale: row_submission_language(32),
      contract_number: 11,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(32)}/${formatContractNum(11, sentAt.getUTCFullYear())}-v1.pdf`,
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'status_change', { from_value: { status: 'validee' }, to_value: { status: 'soldee' }, data: {}, at: paidAt })
    addAudit(row.id as string, 'package_paid_change', { from_value: { package_paid_at: null }, to_value: { package_paid_at: iso(paidAt) }, at: paidAt })
    addAudit(row.id as string, 'status_change', { from_value: { status: 'soldee' }, to_value: { status: 'camp_fait' }, data: {}, at: finished })
  }

  /* ================================================================ */
  /* 33 : meme candidat que #30 (annulee, session passee) — reçue recente */
  /* ================================================================ */
  {
    const sharedId = (candidatures.find((c) => c.id === candidatureId(30)) as Row).candidate_id as string
    // Pas de notes_admin ici : le brief demande EXACTEMENT 2 dossiers avec des
    // notes non vides (deja poses sur #3 et #24) — la doc du lien avec #30 vit
    // dans ce commentaire et le rapport de tache, pas dans la donnee elle-meme.
    addRow(
      33,
      {
        session_id: upcoming[0]?.id ?? null,
        created_at: iso(hoursAgo(now, 5)),
        status_changed_at: iso(hoursAgo(now, 5)),
      },
      {},
      sharedId,
    )
  }

  /* ================================================================ */
  /* 34-35 : tunnel custom                                              */
  /* ================================================================ */
  ;[34, 35].forEach((n, idx) => {
    addRow(n, {
      tunnel_type: 'custom',
      session_id: null,
      camp_discipline: idx === 0 ? 'lutte' : 'mma',
      date_debut_souhaitee: isoDate(daysFromNow(now, 50 + n)),
      created_at: iso(daysAgo(now, 2 + idx)),
      status_changed_at: iso(daysAgo(now, 2 + idx)),
      form_data: { custom: buildCustomForm(n), confirmations: buildConfirmations('custom'), _meta: buildMeta(n) },
    })
  })

  /* ================================================================ */
  /* 36-37 : tunnel famille                                             */
  /* ================================================================ */
  {
    addRow(36, {
      tunnel_type: 'famille',
      session_id: null,
      date_debut_souhaitee: null,
      created_at: iso(daysAgo(now, 3)),
      status_changed_at: iso(daysAgo(now, 3)),
      form_data: { famille: buildFamilleForm(36, upcoming[0]?.id ?? 'sur-mesure'), confirmations: buildConfirmations('famille'), _meta: buildMeta(36) },
    })
    addRow(37, {
      tunnel_type: 'famille',
      session_id: null,
      date_debut_souhaitee: isoDate(daysFromNow(now, 70)),
      created_at: iso(daysAgo(now, 6)),
      status_changed_at: iso(daysAgo(now, 6)),
      form_data: { famille: buildFamilleForm(37, 'sur-mesure'), confirmations: buildConfirmations('famille'), _meta: buildMeta(37) },
    })
  }

  /* ================================================================ */
  /* 38-43 : partenaires referral                                       */
  /* ================================================================ */
  {
    // 38 — STRIKE, due (soldee)
    const s = upcoming[0] as Session
    const created = daysAgo(now, 40)
    const validated = daysAgo(now, 38)
    const sentAt = daysAgo(now, 25)
    const paidAt = daysAgo(now, 10)
    const row = addRow(38, {
      status: 'soldee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(paidAt),
      package_amount_cents: 290000,
      package_paid_at: iso(paidAt),
      payment_method: 'virement',
      payment_date: isoDate(paidAt),
      referral_code: 'STRIKE',
      referral_code_valid: true,
      referral_partner_name: 'Strike Academy (Progress Gym SA)',
      referral_partner_type: 'gym',
      referral_commission_type: 'flat',
      referral_bonus_eur: 50,
      referral_payout_status: 'due',
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_locale: row_submission_language(38),
      contract_number: 12,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(38)}/${formatContractNum(12, sentAt.getUTCFullYear())}-v1.pdf`,
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'status_change', { from_value: { status: 'validee' }, to_value: { status: 'soldee' }, data: {}, at: paidAt })
    addAudit(row.id as string, 'package_paid_change', { from_value: { package_paid_at: null }, to_value: { package_paid_at: iso(paidAt) }, at: paidAt })
    addAudit(row.id as string, 'referral_due', {
      from_value: { referral_payout_status: 'pending' },
      to_value: { referral_payout_status: 'due' },
      data: { partner: 'Strike Academy (Progress Gym SA)', bonus_eur: 50 },
      at: paidAt,
    })
  }
  {
    // 39 — PAOLOZ, paid (soldee)
    const s = upcoming[1] ?? (upcoming[0] as Session)
    const created = daysAgo(now, 90)
    const validated = daysAgo(now, 88)
    const sentAt = daysAgo(now, 70)
    const paidAt = daysAgo(now, 45)
    const payoutPaidAt = daysAgo(now, 10)
    const packageCents = 290000
    const bonus = computeCommissionEur({ commissionType: 'percent', commissionPct: 11.5 }, packageCents) ?? 0
    const row = addRow(39, {
      status: 'soldee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(paidAt),
      package_amount_cents: packageCents,
      package_paid_at: iso(paidAt),
      payment_method: 'virement',
      payment_date: isoDate(paidAt),
      referral_code: 'PAOLOZ',
      referral_code_valid: true,
      referral_partner_name: 'PaoloZ (@paolo_irl)',
      referral_partner_type: 'influencer',
      referral_commission_type: 'percent',
      referral_commission_pct: 11.5,
      referral_bonus_eur: bonus,
      referral_payout_status: 'paid',
      referral_payout_paid_at: iso(new Date(`${isoDate(payoutPaidAt)}T00:00:00.000Z`)),
      referral_payout_method: 'virement',
      contract_start_date: s.startDate,
      contract_end_date: s.endDate,
      contract_duration_weeks: 2,
      contract_inclusions: INCLUSIONS,
      contract_exclusions: EXCLUSIONS,
      contract_locale: row_submission_language(39),
      contract_number: 13,
      contract_sent_at: iso(sentAt),
      contract_sent_count: 1,
      contract_pdf_path: `${candidatureId(39)}/${formatContractNum(13, sentAt.getUTCFullYear())}-v1.pdf`,
    })
    validateWithSouvenir(row, created, validated)
    contractFieldsUpdate(row, sentAt)
    contractSent(row, sentAt)
    addAudit(row.id as string, 'status_change', { from_value: { status: 'validee' }, to_value: { status: 'soldee' }, data: {}, at: paidAt })
    addAudit(row.id as string, 'package_paid_change', { from_value: { package_paid_at: null }, to_value: { package_paid_at: iso(paidAt) }, at: paidAt })
    addAudit(row.id as string, 'referral_due', {
      from_value: { referral_payout_status: 'pending' },
      to_value: { referral_payout_status: 'due' },
      data: { partner: 'PaoloZ (@paolo_irl)', bonus_eur: null },
      at: paidAt,
    })
    addAudit(row.id as string, 'referral_bonus_recomputed', {
      from_value: { referral_bonus_eur: null },
      to_value: { referral_bonus_eur: bonus },
      data: { reason: 'package_amount_change', pct: 11.5 },
      at: paidAt,
    })
    addAudit(row.id as string, 'referral_payout_status_change', {
      from_value: { referral_payout_status: 'due' },
      to_value: { referral_payout_status: 'paid' },
      at: payoutPaidAt,
    })
  }
  // 40, 42 — STRIKE pending (recue)
  ;[40, 42].forEach((n) => {
    addRow(n, {
      status: 'recue',
      session_id: (upcoming[0] as Session).id,
      created_at: iso(daysAgo(now, n === 40 ? 6 : 2)),
      status_changed_at: iso(daysAgo(now, n === 40 ? 6 : 2)),
      referral_code: 'STRIKE',
      referral_code_valid: true,
      referral_partner_name: 'Strike Academy (Progress Gym SA)',
      referral_partner_type: 'gym',
      referral_commission_type: 'flat',
      referral_bonus_eur: 50,
      referral_payout_status: 'pending',
    })
  })
  {
    // 41 — PAOLOZ pending (validee, CA pas encore saisi -> bonus inconnu)
    const s = upcoming[0] as Session
    const created = daysAgo(now, 9)
    const validated = daysAgo(now, 7)
    const row = addRow(41, {
      status: 'validee',
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: iso(validated),
      referral_code: 'PAOLOZ',
      referral_code_valid: true,
      referral_partner_name: 'PaoloZ (@paolo_irl)',
      referral_partner_type: 'influencer',
      referral_commission_type: 'percent',
      referral_commission_pct: 11.5,
      referral_bonus_eur: null,
      referral_payout_status: 'pending',
    })
    validateWithSouvenir(row, created, validated)
  }
  {
    // 43 — FAKE10, code invalide
    addRow(43, {
      status: 'recue',
      session_id: (upcoming[0] as Session).id,
      created_at: iso(hoursAgo(now, 10)),
      status_changed_at: iso(hoursAgo(now, 10)),
      referral_code: 'FAKE10',
      referral_code_valid: false,
      referral_partner_name: null,
      referral_partner_type: null,
      referral_commission_type: null,
      referral_bonus_eur: null,
      referral_payout_status: 'not_applicable',
    })
  }

  /* ================================================================ */
  /* 44-60 : lignes de remplissage (volume + variete disciplines/sources)*/
  /* ================================================================ */
  const sourcesCycle = ['google_ads', 'meta_ads', 'instagram', 'other', null] as const
  for (let n = 44; n <= 60; n++) {
    const idx = n - 44
    const status = idx % 7 === 0 ? 'validee' : 'recue'
    const s = upcoming[idx % upcoming.length] as Session
    const created = daysAgo(now, 1 + (idx * 2) % 28)
    const source = sourcesCycle[idx % sourcesCycle.length]
    const row = addRow(n, {
      status,
      session_id: s.id,
      created_at: iso(created),
      status_changed_at: status === 'validee' ? iso(daysAgo(now, Math.max(0, (idx * 2) % 28 - 1))) : iso(created),
      attribution_source: source,
      package_amount_cents: status === 'validee' ? 290000 : null,
    })
    if (status === 'validee') {
      validateWithSouvenir(row, created, new Date(row.status_changed_at as string))
    }
  }

  /* ================================================================ */
  /* Filet de securite : garantit qu'au moins un evenement de chaque    */
  /* type requis existe (cf. brief), meme si un cas particulier a ete   */
  /* oublie ci-dessus.                                                  */
  /* ================================================================ */
  const REQUIRED_EVENTS = [
    'created', 'status_change', 'package_amount_estimated', 'package_amount_change',
    'package_paid_change', 'payment_method_change', 'payment_date_change', 'notes_admin_update',
    'contract_fields_update', 'contract_sent', 'souvenir_sent', 'souvenir_reset',
    'visio_booked', 'visio_booking_cancelled', 'visio_reminder_sent', 'visio_confirmation_resent',
    'rebooking_sent', 'rebooking_reminder_sent', 'payment_reminder_sent', 'predeparture_sent',
    'attribution_captured', 'referral_attached', 'referral_due', 'referral_bonus_recomputed',
    'referral_payout_status_change', 'email_corrected',
  ]
  const present = new Set(audit_log.map((e) => e.event as string))
  const fallbackRow = candidatures[0]
  for (const event of REQUIRED_EVENTS) {
    if (present.has(event)) continue
    addAudit(fallbackRow.id as string, event, { data: { note: 'evenement de secours (couverture garantie)' }, at: daysAgo(now, 1) })
  }

  /* ================================================================ */
  /* guide_leads                                                        */
  /* ================================================================ */
  const guide_leads: Row[] = [
    {
      id: guideLeadId(1), email: 'lead1@example.com', locale: 'fr', source: 'guide-caucase',
      utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'mkr-guide-caucase', utm_term: 'camp lutte caucase', utm_content: null,
      referrer: 'https://www.google.com/', ip: ipFor(101), user_agent: uaFor(0), submission_language: 'fr',
      created_at: iso(daysAgo(now, 2)),
    },
    {
      id: guideLeadId(2), email: 'lead2@example.com', locale: 'en', source: 'guide-caucase',
      utm_source: 'instagram', utm_medium: 'social', utm_campaign: 'mkr-guide-en', utm_term: null, utm_content: 'story-swipe-up',
      referrer: 'https://www.instagram.com/', ip: ipFor(102), user_agent: uaFor(1), submission_language: 'en',
      created_at: iso(daysAgo(now, 5)),
    },
    {
      id: guideLeadId(3), email: 'lead3@example.com', locale: 'fr', source: 'blog',
      utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null,
      referrer: 'https://mkrcamp.com/blog/lutte-daghestan', ip: ipFor(103), user_agent: uaFor(2), submission_language: 'fr',
      created_at: iso(daysAgo(now, 10)),
    },
    {
      id: guideLeadId(4), email: 'lead4@example.com', locale: 'en', source: 'blog',
      utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'relance-2026-09', utm_term: null, utm_content: null,
      referrer: null, ip: ipFor(104), user_agent: uaFor(3), submission_language: 'en',
      created_at: iso(daysAgo(now, 1)),
    },
    {
      id: guideLeadId(5), email: 'lead5@example.com', locale: 'fr', source: 'guide-caucase',
      utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'mkr-guide-caucase', utm_term: 'mma tchetchenie stage', utm_content: null,
      referrer: 'https://www.google.com/', ip: ipFor(105), user_agent: uaFor(0), submission_language: 'fr',
      created_at: iso(hoursAgo(now, 6)),
    },
    {
      id: guideLeadId(6), email: 'lead6@example.com', locale: 'fr', source: 'guide-caucase',
      utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null, utm_content: null,
      referrer: null, ip: ipFor(106), user_agent: uaFor(1), submission_language: 'fr',
      created_at: iso(daysAgo(now, 20)),
    },
  ]

  // Locale du contrat = langue de soumission, deja fixee au moment de la creation
  // de chaque ligne ci-dessus (cf. row_submission_language). Petit helper local :
  function row_submission_language(n: number): 'fr' | 'en' {
    return (n - 1) % 5 < 3 ? 'en' : 'fr'
  }

  return { candidatures, candidates, audit_log, guide_leads }
}

/* ------------------------------------------------------------------ */
/* CLI : `node ... fixtures.mts --json` (utilise par server.mjs)       */
/* ------------------------------------------------------------------ */

if (process.argv.includes('--json')) {
  const data = buildFixtures(new Date())
  process.stdout.write(JSON.stringify(data))
}
