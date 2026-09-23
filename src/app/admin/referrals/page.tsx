import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import AdminShell from '@/components/admin/shell/AdminShell'
import RefreshButton from '@/components/admin/shell/RefreshButton'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import { REFERRAL_CODES, affiliateLink } from '@/data/referral-codes'
import ReferralLinks, { type ReferralLinkItem } from '@/components/admin/ReferralLinks'
import { PARTNER_TYPE_LABEL } from '@/lib/admin/labels'
import { formatTime, plural } from '@/lib/admin/format'

// Partenaires (spec 6.5) : memes donnees et memes calculs que l'ancienne page
// (aggregateByPartner inchangee), presentes en chiffres cles, liens
// d'affiliation a copier, puis compteurs par partenaire : tableau quand sa
// largeur le permet, cartes empilees sinon (admin.css, "Partenaires et Leads
// guide"). Chaque partenaire mene a ses dossiers, tous statuts (les soldes et
// camps faits portent les commissions).

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Partenaires · MKR Admin',
}

// Lecture light de candidatures : on agrege en TS plutot qu'en SQL pour rester
// simple. Volumes typiques : qq partenaires x qq dizaines de candidatures.
interface Row {
  id: string
  status: string
  package_amount_cents: number | null
  referral_code: string | null
  referral_code_valid: boolean | null
  referral_partner_name: string | null
  referral_partner_type: string | null
  referral_commission_type: string | null
  referral_commission_pct: number | null
  referral_bonus_eur: number | null
  referral_payout_status: string | null
  referral_payout_paid_at: string | null
  referral_payout_method: string | null
}

interface PartnerSummary {
  code: string
  partnerName: string
  partnerType: string | null
  isKnown: boolean
  isActive: boolean
  bonusEurDefault: number
  commissionType: string | null
  commissionPct: number | null
  missingAmount: number   // candidatures soldées 'percent' sans CA saisi (commission non calculée)
  total: number
  pending: number
  due: number
  paid: number
  cancelled: number
  amountDue: number
  amountPaid: number
  amountCancelled: number
}

function formatEur(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function aggregateByPartner(rows: Row[]): PartnerSummary[] {
  const byCode = new Map<string, PartnerSummary>()

  // Seed avec tous les codes du data file (meme ceux a 0 candidature) pour que Ruslan voie tous les partenaires actifs.
  for (const c of REFERRAL_CODES) {
    byCode.set(c.code, {
      code: c.code,
      partnerName: c.partnerName,
      partnerType: c.type,
      isKnown: true,
      isActive: c.active,
      bonusEurDefault: c.bonusEur ?? 0,
      commissionType: c.commissionType,
      commissionPct: c.commissionPct ?? null,
      missingAmount: 0,
      total: 0,
      pending: 0,
      due: 0,
      paid: 0,
      cancelled: 0,
      amountDue: 0,
      amountPaid: 0,
      amountCancelled: 0,
    })
  }

  for (const r of rows) {
    if (!r.referral_code) continue
    let summary = byCode.get(r.referral_code)
    if (!summary) {
      // Code orphelin (ex : code invalide saisi, ou code retire du data file apres usage).
      summary = {
        code: r.referral_code,
        partnerName: r.referral_partner_name ?? '(non reconnu)',
        partnerType: r.referral_partner_type,
        isKnown: false,
        isActive: false,
        bonusEurDefault: r.referral_bonus_eur ?? 0,
        commissionType: r.referral_commission_type,
        commissionPct: r.referral_commission_pct,
        missingAmount: 0,
        total: 0,
        pending: 0,
        due: 0,
        paid: 0,
        cancelled: 0,
        amountDue: 0,
        amountPaid: 0,
        amountCancelled: 0,
      }
      byCode.set(r.referral_code, summary)
    }

    summary.total += 1
    const bonus = r.referral_bonus_eur ?? 0

    switch (r.referral_payout_status) {
      case 'pending':
        summary.pending += 1
        break
      case 'due':
        summary.due += 1
        summary.amountDue += bonus
        break
      case 'paid':
        summary.paid += 1
        summary.amountPaid += bonus
        break
      case 'cancelled':
        summary.cancelled += 1
        summary.amountCancelled += bonus
        break
      // 'not_applicable' n'est pas comptabilise comme bonus.
    }

    // 'percent' due/pending mais bonus non encore calculé (CA absent) -> à signaler à Ruslan.
    if (
      r.referral_commission_type === 'percent'
      && (r.referral_payout_status === 'due' || r.referral_payout_status === 'pending')
      && (r.referral_bonus_eur === null && (r.package_amount_cents === null || r.package_amount_cents <= 0))
    ) {
      summary.missingAmount += 1
    }
  }

  return Array.from(byCode.values()).sort((a, b) => {
    // Tri : ceux qui ont du bonus du en premier, puis par volume.
    if (a.amountDue !== b.amountDue) return b.amountDue - a.amountDue
    if (a.total !== b.total) return b.total - a.total
    return a.code.localeCompare(b.code)
  })
}

/* ------------------------------------------------------------------ */
/* Affichage (aucun calcul en plus de aggregateByPartner)              */
/* ------------------------------------------------------------------ */

const pct = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

/** Grand chiffre (Teko) : espace insecable ordinaire, l'espace fine y est presque invisible. */
const kpiEur = (n: number): string => formatEur(n).replace(/\u202f/g, '\u00a0')

function modelLabel(s: PartnerSummary): string {
  if (s.commissionType === 'percent') return s.commissionPct === null ? 'Taux non renseigné' : `${pct.format(s.commissionPct)} % du CA`
  if (s.commissionType === 'flat') return `Forfait ${formatEur(s.bonusEurDefault)}`
  return 'Non renseigné'
}

const typeLabel = (s: PartnerSummary): string =>
  s.partnerType ? PARTNER_TYPE_LABEL[s.partnerType] ?? s.partnerType : 'Non renseigné'

const partnerHref = (code: string): string => `/admin/inscriptions?partenaire=${encodeURIComponent(code)}&statut=tous`

/** Nombre et montant separes par un point median ; zero : "0". */
const countAmount = (n: number, amount: number): string => (n > 0 ? `${n} · ${formatEur(amount)}` : '0')

function MissingAmount({ n }: { n: number }) {
  if (n === 0) return null
  return (
    <span
      className="adm-partner-missing adm-tone--warn"
      title={`${plural(n, 'candidature', 'candidatures')} sans CA saisi : commission non calculée`}
    >
      <Icon name="alert-triangle" size={14} />
      {n} CA à saisir
    </span>
  )
}

/** Code inconnu du fichier des codes (icone seule dans le tableau, comme avant) ou inactif. */
function CodeState({ s, compact = false }: { s: PartnerSummary; compact?: boolean }) {
  if (!s.isKnown) {
    return (
      <span className="adm-partner-flag adm-tone--warn" title="Code saisi non reconnu dans data/referral-codes.ts">
        <Icon name="alert-triangle" size={14} />
        {compact ? <span className="adm-sr-only">code non reconnu</span> : 'non reconnu'}
      </span>
    )
  }
  if (!s.isActive) {
    return (
      <span className="adm-partner-flag" title="Code marqué inactif dans data/referral-codes.ts (historique conservé)">
        inactif
      </span>
    )
  }
  return null
}

function LoadError({ title, message, retry }: { title: string; message: string; retry: boolean }) {
  return (
    <AdminShell active="partenaires" title="Partenaires">
      <div className="adm-container">
        <div className="adm-page-head">
          <h1 className="adm-h1">Partenaires</h1>
        </div>
        <section className="adm-empty adm-tone--danger" aria-labelledby="partners-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h2 id="partners-error-title" className="adm-empty-title">
            {title}
          </h2>
          <p className="adm-empty-text">{message}</p>
          {retry && (
            <div className="adm-empty-actions">
              <ButtonLink href="/admin/referrals" variant="primary" icon="refresh">
                Réessayer
              </ButtonLink>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

export default async function AdminReferralsPage() {
  let rows: Row[] = []
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('candidatures')
      .select('id, status, package_amount_cents, referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_commission_type, referral_commission_pct, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method')
      .not('referral_code', 'is', null)
      .order('referral_code', { ascending: true })
    if (error) {
      return <LoadError title="Chargement impossible" message={`Les candidatures n'ont pas pu être lues (${error.message}).`} retry />
    }
    rows = (data ?? []) as Row[]
  } catch (err) {
    return <LoadError title="Configuration manquante" message={err instanceof Error ? err.message : String(err)} retry={false} />
  }

  const summaries = aggregateByPartner(rows)
  const totalDue = summaries.reduce((s, x) => s + x.amountDue, 0)
  const totalPaid = summaries.reduce((s, x) => s + x.amountPaid, 0)
  const totalCancelled = summaries.reduce((s, x) => s + x.amountCancelled, 0)
  const totalCandidatures = summaries.reduce((s, x) => s + x.total, 0)
  const totalPending = summaries.reduce((s, x) => s + x.pending, 0)

  const linkItems: ReferralLinkItem[] = REFERRAL_CODES
    .filter((c) => c.active)
    .map((c) => ({ code: c.code, partnerName: c.partnerName, url: affiliateLink(c.code) }))

  const kpis = [
    { label: 'À payer', value: totalDue, tone: 'warn', hint: null },
    { label: 'Déjà payé', value: totalPaid, tone: 'ok', hint: null },
    { label: 'Annulé', value: totalCancelled, tone: null, hint: 'Pour information' },
    { label: 'Total acquis', value: totalDue + totalPaid, tone: null, hint: 'Payé et dû' },
  ] as const

  return (
    <AdminShell active="partenaires" title="Partenaires">
      <div className="adm-container adm-partners">
        <header className="adm-page-head adm-partners-head">
          <div>
            <h1 className="adm-h1">Partenaires</h1>
            <p className="adm-page-meta">
              {plural(summaries.length, 'partenaire', 'partenaires')} · {plural(totalCandidatures, 'candidature', 'candidatures')}
              {' · '}mis à jour à {formatTime(new Date().toISOString())}
            </p>
          </div>
          <RefreshButton variant="secondary" size="sm" className="adm-only-desktop" />
        </header>

        <ul className="adm-partners-kpis" aria-label="Bonus des partenaires">
          {kpis.map((k) => (
            <li key={k.label} className="adm-card adm-partners-kpi">
              <p className={k.tone ? `adm-label adm-partners-kpi-label adm-tone--${k.tone}` : 'adm-label adm-partners-kpi-label'}>
                {k.tone && <span className="adm-status-dot" aria-hidden="true" />}
                {k.label}
              </p>
              <p className="adm-kpi adm-partners-kpi-value">{kpiEur(k.value)}</p>
              {k.hint && <p className="adm-partners-kpi-hint">{k.hint}</p>}
            </li>
          ))}
        </ul>

        <ReferralLinks items={linkItems} />

        <section className="adm-section" aria-labelledby="partners-list-title">
          <div className="adm-section-head">
            <h2 id="partners-list-title" className="adm-section-title">
              Compteurs par partenaire
            </h2>
            <span className="adm-section-count">
              {summaries.length}
              <span className="adm-sr-only"> {summaries.length > 1 ? 'partenaires' : 'partenaire'}</span>
            </span>
          </div>

          {summaries.length === 0 ? (
            <section className="adm-empty" aria-labelledby="partners-empty-title">
              <span className="adm-empty-icon" aria-hidden="true">
                <Icon name="handshake" size={28} />
              </span>
              <h3 id="partners-empty-title" className="adm-empty-title">
                Aucune candidature avec code de recommandation pour le moment
              </h3>
            </section>
          ) : (
            <div className="adm-partners-list">
              <div className="adm-table-wrap adm-partners-table">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th scope="col">Code</th>
                      <th scope="col">Partenaire</th>
                      <th scope="col">Type</th>
                      <th scope="col">Modèle</th>
                      <th scope="col" className="adm-table-num">Candidatures</th>
                      <th scope="col" className="adm-table-num">En attente</th>
                      <th scope="col" className="adm-table-num">À payer</th>
                      <th scope="col" className="adm-table-num">Payé</th>
                      <th scope="col" className="adm-table-num">Annulé</th>
                      <th scope="col">
                        <span className="adm-sr-only">Dossiers</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((s) => (
                      <tr key={s.code}>
                        <td>
                          <span className="adm-table-mono">{s.code}</span>
                          <CodeState s={s} compact />
                        </td>
                        <td className="adm-partners-name">{s.partnerName}</td>
                        <td className="adm-partners-muted adm-partners-type">{typeLabel(s)}</td>
                        <td>
                          <span className="adm-partners-model">{modelLabel(s)}</span>
                          <MissingAmount n={s.missingAmount} />
                        </td>
                        <td className="adm-table-num adm-partners-strong">{s.total}</td>
                        <td className={s.pending > 0 ? 'adm-table-num' : 'adm-table-num adm-partners-zero'}>{s.pending}</td>
                        <td className={s.due > 0 ? 'adm-table-num adm-partners-due' : 'adm-table-num adm-partners-zero'}>{countAmount(s.due, s.amountDue)}</td>
                        <td className={s.paid > 0 ? 'adm-table-num adm-partners-paid' : 'adm-table-num adm-partners-zero'}>{countAmount(s.paid, s.amountPaid)}</td>
                        <td className={s.cancelled > 0 ? 'adm-table-num adm-partners-muted' : 'adm-table-num adm-partners-zero'}>{countAmount(s.cancelled, s.amountCancelled)}</td>
                        <td className="adm-partners-go">
                          {s.total > 0 && (
                            <Link href={partnerHref(s.code)} className="adm-link">
                              Voir les dossiers<span className="adm-sr-only"> de {s.code}</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td className="adm-table-num">{totalCandidatures}</td>
                      <td className="adm-table-num">{totalPending}</td>
                      <td className="adm-table-num">{formatEur(totalDue)}</td>
                      <td className="adm-table-num">{formatEur(totalPaid)}</td>
                      <td className="adm-table-num">{formatEur(totalCancelled)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <ul className="adm-partners-cards">
                {summaries.map((s) => (
                  <li key={s.code} className="adm-card adm-partner-card">
                    <div className="adm-partner-head">
                      <h3 className="adm-partner-name">{s.partnerName}</h3>
                      <p className="adm-meta adm-partner-meta">
                        <span>
                          <span className="adm-mono">{s.code}</span>
                          <CodeState s={s} />
                        </span>
                        {s.partnerType && <span>{typeLabel(s)}</span>}
                        {s.commissionType && <span>{modelLabel(s)}</span>}
                      </p>
                      <MissingAmount n={s.missingAmount} />
                    </div>
                    <dl className="adm-partner-counts">
                      <div>
                        <dt className="adm-label">Candidatures</dt>
                        <dd className="adm-partners-strong">{s.total}</dd>
                      </div>
                      <div>
                        <dt className="adm-label">En attente</dt>
                        <dd className={s.pending > 0 ? undefined : 'adm-partners-zero'}>{s.pending}</dd>
                      </div>
                      <div>
                        <dt className="adm-label">À payer</dt>
                        <dd className={s.due > 0 ? 'adm-partners-due' : 'adm-partners-zero'}>{countAmount(s.due, s.amountDue)}</dd>
                      </div>
                      <div>
                        <dt className="adm-label">Payé</dt>
                        <dd className={s.paid > 0 ? 'adm-partners-paid' : 'adm-partners-zero'}>{countAmount(s.paid, s.amountPaid)}</dd>
                      </div>
                      <div>
                        <dt className="adm-label">Annulé</dt>
                        <dd className={s.cancelled > 0 ? 'adm-partners-muted' : 'adm-partners-zero'}>{countAmount(s.cancelled, s.amountCancelled)}</dd>
                      </div>
                    </dl>
                    {s.total > 0 && (
                      <Link href={partnerHref(s.code)} className="adm-link adm-partner-go">
                        Voir les dossiers<span className="adm-sr-only"> de {s.code}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <p className="adm-partners-help">
          Le bonus passe de « En attente » à « À payer » quand la candidature devient soldée. « Voir les dossiers » ouvre
          la liste des candidatures du partenaire, tous statuts ; le bonus se marque payé depuis la fiche.
        </p>
      </div>
    </AdminShell>
  )
}
