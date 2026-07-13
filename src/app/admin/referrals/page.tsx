import type { Metadata } from 'next'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import Topbar from '@/components/admin/ui/Topbar'
import Badge from '@/components/admin/ui/Badge'
import Icon from '@/components/admin/ui/Icon'
import { REFERRAL_CODES, affiliateLink } from '@/data/referral-codes'
import ReferralLinks, { type ReferralLinkItem } from '@/components/admin/ReferralLinks'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Partenaires referral · MKR Admin',
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

const TYPE_LABEL: Record<string, string> = {
  gym: 'Salle',
  influencer: 'Influenceur',
  coach: 'Coach',
  other: 'Autre',
}

// Meme palette que le badge referral de la liste (InscriptionsList.tsx) :
// gym vert / influencer violet / coach orange.
const TYPE_COLOR: Record<string, string> = {
  gym: '#4ade80',
  influencer: '#a78bfa',
  coach: '#f59e0b',
  other: 'var(--adm-text-muted)',
}

export default async function AdminReferralsPage() {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('candidatures')
    .select('id, status, package_amount_cents, referral_code, referral_code_valid, referral_partner_name, referral_partner_type, referral_commission_type, referral_commission_pct, referral_bonus_eur, referral_payout_status, referral_payout_paid_at, referral_payout_method')
    .not('referral_code', 'is', null)
    .order('referral_code', { ascending: true })

  const rows: Row[] = (data ?? []) as Row[]
  const summaries = aggregateByPartner(rows)
  const totalDue = summaries.reduce((s, x) => s + x.amountDue, 0)
  const totalPaid = summaries.reduce((s, x) => s + x.amountPaid, 0)
  const totalCancelled = summaries.reduce((s, x) => s + x.amountCancelled, 0)
  const totalCandidatures = summaries.reduce((s, x) => s + x.total, 0)

  const generatedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const linkItems: ReferralLinkItem[] = REFERRAL_CODES
    .filter((c) => c.active)
    .map((c) => ({ code: c.code, partnerName: c.partnerName, url: affiliateLink(c.code) }))

  return (
    <>
      <Topbar nav="referrals" />
      <main className="adm-container">
        <h1 className="adm-h1">Partenaires referral</h1>
        <p className="adm-h-meta">
          {summaries.length} partenaire{summaries.length > 1 ? 's' : ''} · {totalCandidatures} candidature{totalCandidatures > 1 ? 's' : ''} · Mis à jour à {generatedAt}{' '}
          <a href="/admin/referrals">↻ Rafraîchir</a>
        </p>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.06)',
              color: 'var(--adm-status-refusee)',
              fontSize: '0.85rem',
            }}
          >
            Erreur Supabase : {error.message}
          </div>
        )}

        {/* Stats globales */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            margin: '1.5rem 0 2rem',
          }}
        >
          <div className="adm-stat-card" style={{ ['--adm-stat-accent' as string]: 'var(--adm-status-recue)' }}>
            <div className="adm-stat-label">À payer</div>
            <div className="adm-stat-value" style={{ color: 'var(--adm-status-recue)' }}>{formatEur(totalDue)}</div>
          </div>
          <div className="adm-stat-card" style={{ ['--adm-stat-accent' as string]: 'var(--adm-status-validee)' }}>
            <div className="adm-stat-label">Déjà payé</div>
            <div className="adm-stat-value" style={{ color: 'var(--adm-status-validee)' }}>{formatEur(totalPaid)}</div>
          </div>
          <div className="adm-stat-card">
            <div className="adm-stat-label">Annulé (info)</div>
            <div className="adm-stat-value" style={{ color: 'var(--adm-text-muted)' }}>{formatEur(totalCancelled)}</div>
          </div>
          <div className="adm-stat-card" style={{ ['--adm-stat-accent' as string]: 'var(--adm-brand)' }}>
            <div className="adm-stat-label">Total acquis (payé + dû)</div>
            <div className="adm-stat-value">{formatEur(totalDue + totalPaid)}</div>
          </div>
        </div>

        <ReferralLinks items={linkItems} />

        {summaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--adm-text-muted, #6b7280)' }}>
            Aucune candidature avec code de recommandation pour le moment.
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Partenaire</th>
                  <th>Type</th>
                  <th>Modèle</th>
                  <th className="adm-table-num">Candidatures</th>
                  <th className="adm-table-num">En attente</th>
                  <th className="adm-table-num">À payer</th>
                  <th className="adm-table-num">Payé</th>
                  <th className="adm-table-num">Annulé</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr key={s.code}>
                    <td className="adm-table-mono">
                      {s.code}
                      {!s.isKnown && (
                        <span
                          style={{ marginLeft: 6, color: 'var(--adm-status-reportee)', display: 'inline-flex', verticalAlign: 'middle' }}
                          title="Code saisi non reconnu dans data/referral-codes.ts"
                        >
                          <Icon name="alert-triangle" size={12} strokeWidth={2.4} />
                        </span>
                      )}
                      {s.isKnown && !s.isActive && <span style={{ marginLeft: 6, color: 'var(--adm-text-muted)', fontSize: '0.7rem', fontWeight: 400 }} title="Code marqué inactif dans data/referral-codes.ts (historique conservé)">inactif</span>}
                    </td>
                    <td>{s.partnerName}</td>
                    <td>
                      {s.partnerType && (
                        <Badge color={TYPE_COLOR[s.partnerType] ?? TYPE_COLOR.other} dot>
                          {TYPE_LABEL[s.partnerType] ?? s.partnerType}
                        </Badge>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {s.commissionType === 'percent'
                        ? `${s.commissionPct ?? '?'} % du CA`
                        : s.commissionType === 'flat'
                          ? `Forfait ${s.bonusEurDefault} €`
                          : '—'}
                      {s.missingAmount > 0 && (
                        <span
                          title={`${s.missingAmount} candidature(s) soldée(s) sans CA saisi : commission non calculée`}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 2, color: 'var(--adm-status-reportee)', fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          <Icon name="alert-triangle" size={11} strokeWidth={2.4} />
                          {s.missingAmount} CA à saisir
                        </span>
                      )}
                    </td>
                    <td className="adm-table-num" style={{ fontWeight: 600 }}>{s.total}</td>
                    <td className="adm-table-num" style={{ color: 'var(--adm-text-muted)' }}>{s.pending || '-'}</td>
                    <td className="adm-table-num" style={{ color: s.due > 0 ? 'var(--adm-status-recue)' : 'var(--adm-text-muted)', fontWeight: s.due > 0 ? 700 : 400 }}>
                      {s.due > 0 ? `${s.due} · ${formatEur(s.amountDue)}` : '-'}
                    </td>
                    <td className="adm-table-num" style={{ color: s.paid > 0 ? 'var(--adm-status-validee)' : 'var(--adm-text-muted)' }}>
                      {s.paid > 0 ? `${s.paid} · ${formatEur(s.amountPaid)}` : '-'}
                    </td>
                    <td className="adm-table-num" style={{ color: 'var(--adm-text-muted)' }}>
                      {s.cancelled > 0 ? `${s.cancelled} · ${formatEur(s.amountCancelled)}` : '-'}
                    </td>
                    <td className="adm-table-num">
                      <Link
                        href={`/admin/inscriptions?referralCode=${encodeURIComponent(s.code)}`}
                        className="adm-btn adm-btn--ghost"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}>Total</td>
                  <td className="adm-table-num">{totalCandidatures}</td>
                  <td className="adm-table-num">-</td>
                  <td className="adm-table-num" style={{ color: 'var(--adm-status-recue)' }}>{formatEur(totalDue)}</td>
                  <td className="adm-table-num" style={{ color: 'var(--adm-status-validee)' }}>{formatEur(totalPaid)}</td>
                  <td className="adm-table-num" style={{ color: 'var(--adm-text-muted)' }}>{formatEur(totalCancelled)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--adm-text-muted)' }}>
          Le bonus passe automatiquement de "En attente" à "À payer" quand le statut de la candidature devient <strong>soldée</strong>.
          Clique sur "Voir" pour ouvrir la liste filtrée des candidatures de ce partenaire, puis sur une fiche pour marquer le bonus comme payé.
        </p>
      </main>
    </>
  )
}
