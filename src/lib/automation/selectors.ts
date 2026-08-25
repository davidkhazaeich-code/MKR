import { sessionFromId, getSessions } from '@/data/sessions'
import { frSessionDisplay } from '@/lib/session-display-fr'

// Selecteurs PURS du cron d'automatisation email — cf. PLAN_EMAIL_AUTOMATION.md.
//
// Zero I/O ici : input = rows Supabase + horloge, output = cibles/digest.
// Toute la logique de ciblage vit ICI pour etre lisible, dry-runnable et
// testable avec des fixtures. La route cron ne fait qu'executer.

export interface AutomationCandidate {
  prenom: string | null
  email: string | null
}

export interface AutomationRow {
  id: string
  status: string
  created_at: string
  status_changed_at: string | null
  submission_language: string | null
  camp_discipline: string | null
  duree_semaines: number | null
  cancel_token: string | null
  session_id: string | null
  visio_booked_at: string | null
  visio_reminder_sent_at: string | null
  visio_reminder_count: number | null
  contract_sent_at: string | null
  contract_payment_deadline: string | null
  package_paid_at: string | null
  payment_method: string | null
  package_amount_cents: number | null
  contract_number: number | null
  contract_start_date: string | null
  payment_reminder_sent_at: string | null
  payment_reminder_count: number | null
  predeparture_sent_at: string | null
  tunnel_type: 'session' | 'custom' | 'famille' | 'groupe' | null
  rebooking_sent_at: string | null
  rebooking_sent_count: number | null
  candidate: AutomationCandidate | AutomationCandidate[] | null
}

// Cutoff A1 : les candidatures creees AVANT le deploiement du webhook Cal n'ont
// pas de visio_booked_at fiable (stock historique) -> JAMAIS relancees en auto.
// Le stock se traite a la main avec Ruslan (sa liste Cal fait foi), cf. plan §2.
export const AUTOMATION_CUTOFF_ISO = '2026-07-10T00:00:00Z'

/** Statuts encore « vivants » : un dossier dans cet etat attend une action. */
const ACTIVE_STATUSES = ['recue', 'validee', 'soldee']

const HOUR_MS = 3_600_000
export const VISIO_FIRST_DELAY_MS = 72 * HOUR_MS // 1re relance : J+3 apres candidature
export const VISIO_SECOND_GAP_MS = 96 * HOUR_MS // 2e relance : 4 j apres la 1re
export const MAX_AUTO_VISIO_REMINDERS = 2
export const SEND_CAP_PER_RUN = 20

export function normalizeCandidate(
  c: AutomationCandidate | AutomationCandidate[] | null,
): AutomationCandidate | null {
  if (!c) return null
  return Array.isArray(c) ? (c[0] ?? null) : c
}

export interface VisioReminderTarget {
  id: string
  email: string
  prenom: string | null
  locale: 'fr' | 'en'
  campDiscipline: string | null
  dureeSemaines: number | null
  cancelToken: string | null
  /** Compteur attendu AVANT envoi — sert de verrou optimiste dans l'UPDATE conditionnel. */
  expectedCount: number
}

// A1 — relance visio automatique.
// Regles (plan §2 A1) : status recue, pas de visio reservee, cree apres le cutoff,
// relance 1 a J+3 (count=0), relance 2 si count=1 et derniere relance > 96 h.
// Un candidat present plusieurs fois (multi-candidatures) n'est cible qu'une fois
// (la plus recente), et jamais deux emails par run.
export function selectVisioReminders(rows: AutomationRow[], now: Date): VisioReminderTarget[] {
  const nowMs = now.getTime()
  const cutoffMs = Date.parse(AUTOMATION_CUTOFF_ISO)
  const seenEmails = new Set<string>()
  const targets: VisioReminderTarget[] = []

  // Tri : plus recentes d'abord -> en cas de multi-candidatures, on garde la derniere.
  const sorted = [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

  for (const row of sorted) {
    if (row.status !== 'recue') continue
    if (row.visio_booked_at) continue
    const createdMs = Date.parse(row.created_at)
    if (!Number.isFinite(createdMs) || createdMs < cutoffMs) continue

    const count = row.visio_reminder_count ?? 0
    if (count >= MAX_AUTO_VISIO_REMINDERS) continue

    if (count === 0) {
      if (nowMs - createdMs < VISIO_FIRST_DELAY_MS) continue
    } else {
      // count === 1 : respecter l'espacement depuis la derniere relance (auto OU manuelle).
      const lastMs = row.visio_reminder_sent_at ? Date.parse(row.visio_reminder_sent_at) : createdMs
      if (nowMs - lastMs < VISIO_SECOND_GAP_MS) continue
    }

    const candidate = normalizeCandidate(row.candidate)
    const email = candidate?.email?.trim().toLowerCase()
    if (!email) continue
    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    targets.push({
      id: row.id,
      email,
      prenom: candidate?.prenom ?? null,
      locale: row.submission_language === 'en' ? 'en' : 'fr',
      campDiscipline: row.camp_discipline,
      dureeSemaines: row.duree_semaines,
      cancelToken: row.cancel_token,
      expectedCount: count,
    })
  }

  return targets.slice(0, SEND_CAP_PER_RUN)
}

// ---------------------------------------------------------------------------
// A2 — rappels de paiement (paliers avec rattrapage, cf. plan §2 A2).
// ---------------------------------------------------------------------------

export interface PaymentReminderTarget {
  id: string
  email: string
  prenom: string | null
  locale: 'fr' | 'en'
  amountCents: number | null
  deadline: string
  contractNumber: number | null
  stage: 1 | 2
  /** Compteur attendu AVANT envoi (verrou optimiste). */
  expectedCount: number
}

const PAYMENT_STAGE1_WINDOW_DAYS = 7 // rappel courtois : deadline sous 7 jours
const PAYMENT_STAGE2_WINDOW_DAYS = 1 // rappel ferme : deadline demain (rattrapage jusqu'a +1)
const PAYMENT_STAGE2_MIN_GAP_MS = 72 * HOUR_MS

// Regles :
//   - eligibles : validee + contrat envoye + non paye + deadline posee + pas cash
//   - palier 1 (count=0) : J-7 <= aujourd'hui <= deadline
//   - palier 2 (count=1) : J-1 <= aujourd'hui <= deadline+1, espace de 72 h min
//   - deadline depassee de 3 j+ : escalade INTERNE (digest), pas d'email candidat
// Pas de cutoff created_at ici : les deadlines sont posees a la main dans le
// back office, donc fiables pour tout le stock.
export function selectPaymentReminders(rows: AutomationRow[], now: Date): PaymentReminderTarget[] {
  const nowMs = now.getTime()
  const today = todayZurich(now)
  const seenEmails = new Set<string>()
  const targets: PaymentReminderTarget[] = []

  const sorted = [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))

  for (const row of sorted) {
    if (row.status !== 'validee') continue
    if (!row.contract_sent_at) continue
    if (row.package_paid_at) continue
    if (row.payment_method === 'cash') continue
    const deadline = row.contract_payment_deadline
    if (!deadline) continue

    const count = row.payment_reminder_count ?? 0
    const daysToDeadline = daysBetween(deadline, today) // negatif = depassee

    let stage: 1 | 2 | null = null
    if (count === 0) {
      if (daysToDeadline <= PAYMENT_STAGE1_WINDOW_DAYS && daysToDeadline >= 0) stage = 1
    } else if (count === 1) {
      const lastMs = row.payment_reminder_sent_at ? Date.parse(row.payment_reminder_sent_at) : 0
      if (
        daysToDeadline <= PAYMENT_STAGE2_WINDOW_DAYS &&
        daysToDeadline >= -1 &&
        nowMs - lastMs >= PAYMENT_STAGE2_MIN_GAP_MS
      ) {
        stage = 2
      }
    }
    if (!stage) continue

    const candidate = normalizeCandidate(row.candidate)
    const email = candidate?.email?.trim().toLowerCase()
    if (!email) continue
    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    targets.push({
      id: row.id,
      email,
      prenom: candidate?.prenom ?? null,
      locale: row.submission_language === 'en' ? 'en' : 'fr',
      amountCents: row.package_amount_cents,
      deadline,
      contractNumber: row.contract_number,
      stage,
      expectedCount: count,
    })
  }

  return targets.slice(0, SEND_CAP_PER_RUN)
}

// ---------------------------------------------------------------------------
// A3 — infos pratiques pre-depart (fenetre J-14 -> J-3 avec rattrapage).
// ---------------------------------------------------------------------------

export interface PredepartureTarget {
  id: string
  email: string
  prenom: string | null
  locale: 'fr' | 'en'
  startDate: string
  dureeSemaines: number | null
}

const PREDEPARTURE_MAX_DAYS_BEFORE = 14
const PREDEPARTURE_MIN_DAYS_BEFORE = 3

export function selectPredeparture(rows: AutomationRow[], now: Date): PredepartureTarget[] {
  const today = todayZurich(now)
  const seenEmails = new Set<string>()
  const targets: PredepartureTarget[] = []

  for (const row of rows) {
    if (row.status !== 'soldee') continue
    if (row.predeparture_sent_at) continue
    // `contract_start_date` fait foi quand elle existe (le candidat peut ne prendre
    // qu'une semaine dans la fenetre de 3). A defaut, la session officielle donne
    // la date de depart : sans ce repli, un dossier solde dont le contrat n'a pas
    // ete enregistre ne recevait JAMAIS ses infos pratiques.
    const start = row.contract_start_date ?? sessionFromId(row.session_id)?.startDate ?? null
    if (!start) continue

    const daysToStart = daysBetween(start, today)
    if (daysToStart > PREDEPARTURE_MAX_DAYS_BEFORE || daysToStart < PREDEPARTURE_MIN_DAYS_BEFORE) continue

    const candidate = normalizeCandidate(row.candidate)
    const email = candidate?.email?.trim().toLowerCase()
    if (!email) continue
    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    targets.push({
      id: row.id,
      email,
      prenom: candidate?.prenom ?? null,
      locale: row.submission_language === 'en' ? 'en' : 'fr',
      startDate: start,
      dureeSemaines: row.duree_semaines,
    })
  }

  return targets.slice(0, SEND_CAP_PER_RUN)
}

// ---------------------------------------------------------------------------
// A4 — rappel du repositionnement (3 j apres, si rien n'a bouge).
// ---------------------------------------------------------------------------

export interface RebookingReminderTarget {
  id: string
  email: string
  prenom: string | null
  locale: 'fr' | 'en'
  variant: 'recue' | 'validee'
  missedSessionId: string | null
  campDiscipline: string | null
  dureeSemaines: number | null
  tunnel: 'session' | 'custom' | 'famille' | 'groupe' | null
  /** Compteur attendu AVANT envoi (verrou optimiste). */
  expectedCount: number
}

/**
 * Trois jours CALENDAIRES, pas 72 h. Le cron passe une fois par jour a 07h : un
 * seuil en heures ferait glisser le rappel au 4e jour des que l'envoi a eu lieu
 * apres 07h, ce qui est le cas general. On compare donc des dates.
 */
const REBOOKING_REMINDER_DELAY_DAYS = 3
/** Un seul rappel. Passe ce cap, on arrete : ce n'est plus une relance, c'est du harcelement. */
export const MAX_REBOOKING_REMINDERS = 1

/**
 * « Pas de reponse ni d'action » se mesure sur ce qu'on peut reellement
 * observer, pas sur une lecture d'email :
 *  - le candidat a reserve un appel apres l'envoi (`visio_booked_at`), ou
 *  - il a redepose une candidature apres l'envoi (nouvelle ligne pour le meme
 *    email), ou
 *  - son dossier a change d'etat (annule, reporte) : le filtre de statut suffit.
 * Dans les trois cas, on ne relance pas.
 */
export function selectRebookingReminders(rows: AutomationRow[], now: Date): RebookingReminderTarget[] {
  const nowMs = now.getTime()
  const seenEmails = new Set<string>()
  const targets: RebookingReminderTarget[] = []

  // Date de la candidature la plus recente par email : sert a detecter un redepot.
  const latestApplicationMs = new Map<string, number>()
  for (const row of rows) {
    const mail = normalizeCandidate(row.candidate)?.email?.trim().toLowerCase()
    if (!mail) continue
    const created = Date.parse(row.created_at)
    if (!Number.isFinite(created)) continue
    latestApplicationMs.set(mail, Math.max(latestApplicationMs.get(mail) ?? 0, created))
  }

  for (const row of rows) {
    if (row.status !== 'recue' && row.status !== 'validee') continue
    if (!row.rebooking_sent_at) continue

    const count = row.rebooking_sent_count ?? 0
    if (count < 1 || count > MAX_REBOOKING_REMINDERS) continue

    const sentMs = Date.parse(row.rebooking_sent_at)
    if (!Number.isFinite(sentMs)) continue
    if (daysBetween(todayZurich(now), row.rebooking_sent_at.slice(0, 10)) < REBOOKING_REMINDER_DELAY_DAYS) continue

    // Action 1 : il a pris rendez-vous depuis l'envoi.
    if (row.visio_booked_at && Date.parse(row.visio_booked_at) >= sentMs) continue

    const candidate = normalizeCandidate(row.candidate)
    const email = candidate?.email?.trim().toLowerCase()
    if (!email) continue

    // Action 2 : il a redepose une candidature depuis l'envoi.
    if ((latestApplicationMs.get(email) ?? 0) > sentMs) continue

    if (seenEmails.has(email)) continue
    seenEmails.add(email)

    targets.push({
      id: row.id,
      email,
      prenom: candidate?.prenom ?? null,
      locale: row.submission_language === 'en' ? 'en' : 'fr',
      variant: row.status === 'validee' ? 'validee' : 'recue',
      missedSessionId: row.session_id,
      campDiscipline: row.camp_discipline,
      dureeSemaines: row.duree_semaines,
      tunnel: row.tunnel_type,
      expectedCount: count,
    })
  }

  return targets.slice(0, SEND_CAP_PER_RUN)
}

// ---------------------------------------------------------------------------
// B1 — digest quotidien interne (Slack).
// ---------------------------------------------------------------------------

export interface DigestLine {
  label: string
}

export interface DigestData {
  recueSansVisio: string[]
  valideeSansContrat: string[]
  contratSansDeadline: string[]
  impayes: string[]
  actifs: { recue: number; validee: number; soldee: number }
  /** Etat des sessions ouvertes : combien de dossiers, a combien de jours du depart. */
  sessionsOuvertes: string[]
  /** Dossiers encore actifs sur un camp DEJA PARTI : ils ne partiront jamais. */
  dossiersSessionPartie: string[]
  /** Dossiers soldes sur un camp TERMINE : a passer en « camp fait ». */
  campTermineSansCloture: string[]
}

/** Aujourd'hui (YYYY-MM-DD) en Europe/Zurich — les colonnes date n'ont pas d'heure. */
export function todayZurich(now: Date): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' })
}

function daysBetween(dateIso: string, todayIso: string): number {
  return Math.round((Date.parse(dateIso) - Date.parse(todayIso)) / 86_400_000)
}

function who(row: AutomationRow): string {
  const c = normalizeCandidate(row.candidate)
  const name = c?.prenom ?? '?'
  const mail = c?.email ?? 'email manquant'
  return `${name} (${mail})`
}

function ageDays(iso: string, nowMs: number): number {
  return Math.floor((nowMs - Date.parse(iso)) / 86_400_000)
}

// Le digest couvre TOUT le stock (pas de cutoff) : il informe, il n'envoie rien
// aux candidats. C'est lui qui rend visibles les trous du process interne.
export function buildDigestData(rows: AutomationRow[], now: Date): DigestData {
  const nowMs = now.getTime()
  const today = todayZurich(now)
  const d: DigestData = {
    recueSansVisio: [],
    valideeSansContrat: [],
    contratSansDeadline: [],
    impayes: [],
    actifs: { recue: 0, validee: 0, soldee: 0 },
    sessionsOuvertes: [],
    dossiersSessionPartie: [],
    campTermineSansCloture: [],
  }

  const impayesTmp: { line: string; deadline: string }[] = []
  // Comptage par session ouverte, pour le bloc « sessions » du digest.
  const parSession = new Map<string, { recue: number; validee: number; soldee: number }>()

  for (const row of rows) {
    if (row.status === 'recue') d.actifs.recue += 1
    if (row.status === 'validee') d.actifs.validee += 1
    if (row.status === 'soldee') d.actifs.soldee += 1

    // --- Rotation des saisons ---------------------------------------------
    // Le camp tourne tout seul cote site (cf. data/sessions.ts). Cote CRM, il
    // reste des dossiers accroches a une session qui, elle, est partie : sans
    // ce controle ils vieillissent en silence dans les compteurs « actifs ».
    const session = sessionFromId(row.session_id)
    if (session && ACTIVE_STATUSES.includes(row.status)) {
      const slice = parSession.get(session.id) ?? { recue: 0, validee: 0, soldee: 0 }
      if (row.status === 'recue') slice.recue += 1
      else if (row.status === 'validee') slice.validee += 1
      else if (row.status === 'soldee') slice.soldee += 1
      parSession.set(session.id, slice)

      const label = frSessionDisplay(session).season_label
      if (session.endDate < today && row.status === 'soldee') {
        d.campTermineSansCloture.push(`${who(row)} · ${label} · camp termine le ${session.endDate}, passer en « camp fait »`)
      } else if (session.startDate <= today && row.status !== 'soldee') {
        const quoi = row.status === 'recue' ? 'jamais validee' : 'validee mais non soldee'
        d.dossiersSessionPartie.push(`${who(row)} · ${label} · parti le ${session.startDate}, ${quoi} : annuler ou reporter`)
      }
    }

    if (row.status === 'recue' && !row.visio_booked_at) {
      const age = ageDays(row.created_at, nowMs)
      if (age >= 3) {
        const relances = row.visio_reminder_count ?? 0
        d.recueSansVisio.push(`${who(row)} · ${age} j, ${relances} relance(s)`)
      }
    }

    if (row.status === 'validee' && !row.contract_sent_at) {
      const since = row.status_changed_at ? ageDays(row.status_changed_at, nowMs) : null
      if (since === null || since >= 2) {
        d.valideeSansContrat.push(`${who(row)} · validée depuis ${since ?? '?'} j, contrat non envoyé`)
      }
    }

    if (row.status === 'validee' && row.contract_sent_at && !row.package_paid_at) {
      const cashNote = row.payment_method === 'cash' ? ' [cash à l’arrivée]' : ''
      if (!row.contract_payment_deadline) {
        d.contratSansDeadline.push(`${who(row)} · contrat envoyé SANS deadline de paiement${cashNote}`)
      } else {
        const diff = daysBetween(row.contract_payment_deadline, today)
        const quand = diff < 0 ? `deadline dépassée de ${-diff} j` : `deadline dans ${diff} j`
        // Palier 3 (plan §2 A2) : retard de 3 j+ = escalade humaine, pas d'email auto.
        const escalade = diff <= -3 ? ' [ESCALADE : relancer par téléphone]' : ''
        impayesTmp.push({
          line: `${who(row)} · ${quand} (${row.contract_payment_deadline})${cashNote}${escalade}`,
          deadline: row.contract_payment_deadline,
        })
      }
    }
  }

  impayesTmp.sort((a, b) => a.deadline.localeCompare(b.deadline))
  d.impayes = impayesTmp.map((x) => x.line)

  // Une ligne par session ENCORE OUVERTE aux inscriptions, meme a zero dossier :
  // une session vide a 30 jours du depart est exactement ce qu'il faut voir.
  for (const s of getSessions(now)) {
    const c = parSession.get(s.id) ?? { recue: 0, validee: 0, soldee: 0 }
    const total = c.recue + c.validee + c.soldee
    const jours = daysBetween(s.startDate, today)
    const detail = total === 0 ? 'aucun dossier' : `${total} dossier(s) : ${c.recue} recue / ${c.validee} validee / ${c.soldee} soldee`
    d.sessionsOuvertes.push(`${frSessionDisplay(s).season_label} · depart dans ${jours} j · ${detail}`)
  }

  return d
}

export interface DigestRunInfo {
  dryRun: boolean
  automationEnabled: boolean
  sentVisio: string[]
  wouldSendVisio: string[]
  sentPayment: string[]
  wouldSendPayment: string[]
  sentPredeparture: string[]
  wouldSendPredeparture: string[]
  sentRebooking: string[]
  wouldSendRebooking: string[]
}

// ASCII only (pas d'emoji, cf. memory feedback_no_emoji_use_svg).
export function formatDigestSlack(d: DigestData, run: DigestRunInfo): string {
  const parts: string[] = []
  const nothingToReport =
    d.recueSansVisio.length +
      d.valideeSansContrat.length +
      d.contratSansDeadline.length +
      d.impayes.length +
      d.dossiersSessionPartie.length +
      d.campTermineSansCloture.length ===
    0

  parts.push('*Digest MKR · pipeline candidatures*')

  if (nothingToReport) {
    // Heartbeat : on envoie TOUJOURS quelque chose. Silence total = cron mort.
    parts.push(`[OK] RAS · ${d.actifs.recue + d.actifs.validee + d.actifs.soldee} dossiers actifs (reçue ${d.actifs.recue} / validée ${d.actifs.validee} / soldée ${d.actifs.soldee})`)
  } else {
    // Les alertes de rotation passent en tete : un camp parti ne se rattrape pas.
    if (d.dossiersSessionPartie.length) {
      parts.push(`*Dossiers actifs sur un camp DEJA PARTI (${d.dossiersSessionPartie.length})* :\n- ${d.dossiersSessionPartie.join('\n- ')}`)
    }
    if (d.campTermineSansCloture.length) {
      parts.push(`*Camps termines, dossiers a cloturer (${d.campTermineSansCloture.length})* :\n- ${d.campTermineSansCloture.join('\n- ')}`)
    }
    if (d.valideeSansContrat.length) {
      parts.push(`*Validées SANS contrat envoyé (${d.valideeSansContrat.length})* :\n- ${d.valideeSansContrat.join('\n- ')}`)
    }
    if (d.contratSansDeadline.length) {
      parts.push(`*Contrats sans deadline de paiement (${d.contratSansDeadline.length})* :\n- ${d.contratSansDeadline.join('\n- ')}`)
    }
    if (d.impayes.length) {
      parts.push(`*Contrats envoyés, en attente de paiement (${d.impayes.length})* :\n- ${d.impayes.join('\n- ')}`)
    }
    if (d.recueSansVisio.length) {
      parts.push(`*Reçues sans visio réservée > 3 j (${d.recueSansVisio.length})* :\n- ${d.recueSansVisio.join('\n- ')}`)
    }
    parts.push(`Actifs : reçue ${d.actifs.recue} / validée ${d.actifs.validee} / soldée ${d.actifs.soldee}`)
  }

  // Toujours affiche, meme quand tout va bien : c'est la vue « remplissage »
  // des sessions ouvertes, et elle suit la rotation automatique des saisons.
  if (d.sessionsOuvertes.length) {
    parts.push(`*Sessions ouvertes* :\n- ${d.sessionsOuvertes.join('\n- ')}`)
  }

  const sentAll = [
    ...run.sentPayment.map((l) => `[paiement] ${l}`),
    ...run.sentVisio.map((l) => `[visio] ${l}`),
    ...run.sentPredeparture.map((l) => `[pré-départ] ${l}`),
    ...run.sentRebooking.map((l) => `[report] ${l}`),
  ]
  if (sentAll.length) {
    parts.push(`*Emails automatiques envoyés ce matin (${sentAll.length})* :\n- ${sentAll.join('\n- ')}`)
  }

  const wouldAll = [
    ...run.wouldSendPayment.map((l) => `[paiement] ${l}`),
    ...run.wouldSendVisio.map((l) => `[visio] ${l}`),
    ...run.wouldSendPredeparture.map((l) => `[pré-départ] ${l}`),
    ...run.wouldSendRebooking.map((l) => `[report] ${l}`),
  ]
  if (wouldAll.length) {
    const motif = run.automationEnabled ? 'hors prod' : 'EMAIL_AUTOMATION_ENABLED=false'
    parts.push(`*[DRY-RUN ${motif}] emails qui SERAIENT envoyés (${wouldAll.length})* :\n- ${wouldAll.join('\n- ')}`)
  }

  return parts.join('\n\n')
}
