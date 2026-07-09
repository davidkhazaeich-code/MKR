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
  candidate: AutomationCandidate | AutomationCandidate[] | null
}

// Cutoff A1 : les candidatures creees AVANT le deploiement du webhook Cal n'ont
// pas de visio_booked_at fiable (stock historique) -> JAMAIS relancees en auto.
// Le stock se traite a la main avec Ruslan (sa liste Cal fait foi), cf. plan §2.
export const AUTOMATION_CUTOFF_ISO = '2026-07-10T00:00:00Z'

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
  }

  const impayesTmp: { line: string; deadline: string }[] = []

  for (const row of rows) {
    if (row.status === 'recue') d.actifs.recue += 1
    if (row.status === 'validee') d.actifs.validee += 1
    if (row.status === 'soldee') d.actifs.soldee += 1

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
        impayesTmp.push({
          line: `${who(row)} · ${quand} (${row.contract_payment_deadline})${cashNote}`,
          deadline: row.contract_payment_deadline,
        })
      }
    }
  }

  impayesTmp.sort((a, b) => a.deadline.localeCompare(b.deadline))
  d.impayes = impayesTmp.map((x) => x.line)
  return d
}

export interface DigestRunInfo {
  dryRun: boolean
  automationEnabled: boolean
  sentVisio: string[]
  wouldSendVisio: string[]
}

// ASCII only (pas d'emoji, cf. memory feedback_no_emoji_use_svg).
export function formatDigestSlack(d: DigestData, run: DigestRunInfo): string {
  const parts: string[] = []
  const nothingToReport =
    d.recueSansVisio.length + d.valideeSansContrat.length + d.contratSansDeadline.length + d.impayes.length === 0

  parts.push('*Digest MKR · pipeline candidatures*')

  if (nothingToReport) {
    // Heartbeat : on envoie TOUJOURS quelque chose. Silence total = cron mort.
    parts.push(`[OK] RAS · ${d.actifs.recue + d.actifs.validee + d.actifs.soldee} dossiers actifs (reçue ${d.actifs.recue} / validée ${d.actifs.validee} / soldée ${d.actifs.soldee})`)
  } else {
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

  if (run.sentVisio.length) {
    parts.push(`*Relances visio auto envoyées ce matin (${run.sentVisio.length})* :\n- ${run.sentVisio.join('\n- ')}`)
  }
  if (run.wouldSendVisio.length) {
    const motif = run.automationEnabled ? 'hors prod' : 'EMAIL_AUTOMATION_ENABLED=false'
    parts.push(`*[DRY-RUN ${motif}] relances visio qui SERAIENT envoyées (${run.wouldSendVisio.length})* :\n- ${run.wouldSendVisio.join('\n- ')}`)
  }

  return parts.join('\n\n')
}
