import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { sessionFromId } from '@/data/sessions'
import { frSessionDisplay } from '@/lib/session-display-fr'
import { STATUS_LABEL, type Status } from '@/lib/admin-transitions'
import {
  ATTRIBUTION_SOURCE_LABEL,
  ATTRIBUTION_SOURCE_COLOR,
  type AttributionSource,
} from '@/lib/attribution'
import AdminActions from '@/components/admin/AdminActions'
import DangerSection from '@/components/admin/DangerSection'
import FormAnswers from '@/components/admin/FormAnswers'
import ReferralPanel from '@/components/admin/ReferralPanel'
import Avatar from '@/components/admin/ui/Avatar'
import BackShortcut from '@/components/admin/ui/BackShortcut'
import Badge from '@/components/admin/ui/Badge'
import Icon from '@/components/admin/ui/Icon'
import Progress from '@/components/admin/ui/Progress'
import Topbar from '@/components/admin/ui/Topbar'

/**
 * Libelle lisible d'une session, y compris une session sortie des inscriptions.
 * Les saisons tournent toutes seules (cf. data/sessions.ts) : la fiche d'un
 * dossier de 2026 doit rester lisible des annees apres, et dire franchement
 * que le camp est parti ou termine.
 */
function describeSession(sessionId: string | null): string {
  if (!sessionId) return '\u2014'
  const session = sessionFromId(sessionId)
  if (!session) return sessionId
  const display = frSessionDisplay(session)
  const today = new Date().toISOString().slice(0, 10)
  const etat =
    session.endDate < today ? ' \u00b7 camp termin\u00e9'
      : session.startDate <= today ? ' \u00b7 camp en cours ou d\u00e9j\u00e0 parti'
        : ''
  return `${display.season_label} \u00b7 ${display.dates}${etat}`
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Dossier · MKR Admin',
}

type TunnelType = 'session' | 'custom' | 'famille' | 'groupe'

// Libelles alignes sur le site public : « Club et Groupe », pas d'esperluette.
const TUNNEL_LABEL: Record<TunnelType, string> = {
  // Le tunnel ne porte plus d'annee : les sessions tournent (cf. data/sessions.ts).
  session: 'Session officielle',
  custom: 'Sur Mesure',
  famille: 'Famille',
  groupe: 'Club et Groupe',
}

const TUNNEL_COLOR: Record<TunnelType, string> = {
  session: 'var(--adm-tunnel-session)',
  custom: 'var(--adm-tunnel-custom)',
  famille: 'var(--adm-tunnel-famille)',
  groupe: 'var(--adm-tunnel-groupe)',
}

const STATUS_COLOR: Record<Status, string> = {
  recue: 'var(--adm-status-recue)',
  validee: 'var(--adm-status-validee)',
  refusee: 'var(--adm-status-refusee)',
  soldee: 'var(--adm-status-soldee)',
  camp_fait: 'var(--adm-status-camp_fait)',
  annulee: 'var(--adm-status-annulee)',
  reportee: 'var(--adm-status-reportee)',
}

type PaymentMethod = 'virement' | 'cash' | 'autre'

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  virement: 'Virement bancaire',
  cash: 'Espèces',
  autre: 'Autre',
}

type CampDiscipline = 'lutte' | 'mma' | 'combo_quote'

const DISCIPLINE_LABEL_FULL: Record<CampDiscipline, string> = {
  lutte: 'Lutte · Daghestan (Makhachkala / Kaspiysk)',
  mma: 'MMA · Tchétchénie (Grozny, Akhmat)',
  combo_quote: 'Combo Lutte + MMA · sur devis',
}

interface CandidatureRow {
  id: string
  created_at: string
  updated_at: string
  tunnel_type: TunnelType
  session_id: string | null
  duree_semaines: number | null
  date_debut_souhaitee: string | null
  camp_discipline: CampDiscipline | null
  status: Status
  status_changed_at: string
  status_changed_by_email: string | null
  package_amount_cents: number | null
  package_paid_at: string | null
  payment_method: PaymentMethod | null
  payment_date: string | null
  notes_admin: string | null
  notes_visio: string | null
  form_data: Record<string, unknown>
  group_members: unknown
  referral_code: string | null
  referral_code_valid: boolean | null
  referral_partner_name: string | null
  referral_partner_type: string | null
  referral_bonus_eur: number | null
  referral_commission_type: string | null
  referral_commission_pct: number | null
  referral_payout_status: string | null
  referral_payout_paid_at: string | null
  referral_payout_method: string | null
  submission_language: 'fr' | 'en'
  visio_reminder_sent_at: string | null
  visio_reminder_count: number
  rebooking_sent_at: string | null
  rebooking_sent_count: number
  contract_start_date: string | null
  contract_end_date: string | null
  contract_duration_weeks: number | null
  contract_inclusions: string | null
  contract_exclusions: string | null
  contract_note: string | null
  contract_payment_deadline: string | null
  contract_locale: 'fr' | 'en' | null
  contract_number: number | null
  contract_sent_at: string | null
  contract_sent_count: number
  contract_pdf_path: string | null
  attribution_source: string | null
  attribution: Record<string, unknown> | null
  candidate: {
    prenom: string
    nom: string
    email: string
    telephone: string | null
    date_naissance: string | null
    pays: string | null
    ville_depart: string | null
  } | null
}

interface AuditRow {
  id: number
  event: string
  from_value: Record<string, unknown> | null
  to_value: Record<string, unknown> | null
  data: Record<string, unknown> | null
  actor_email: string
  at: string
}

// Decrit un evenement audit en label explicite + detail optionnel.
// Le label change selon la direction du change (set vs unset).
function describeEvent(e: AuditRow): { label: string; detail: string | null; accent?: string } {
  switch (e.event) {
    case 'created':
      return { label: 'Candidature reçue', detail: null, accent: 'var(--adm-status-recue)' }
    case 'status_change': {
      const from = e.from_value?.status as Status | undefined
      const to = e.to_value?.status as Status | undefined
      return {
        label: 'Changement de statut',
        detail: from && to ? `${STATUS_LABEL[from]} → ${STATUS_LABEL[to]}` : null,
        accent: to ? `var(--adm-status-${to})` : undefined,
      }
    }
    case 'package_paid_change': {
      const isPaid = !!e.to_value?.package_paid_at
      return {
        label: isPaid
          ? 'Package soldé (paiement reçu)'
          : 'Package retiré du soldé',
        detail: null,
        accent: isPaid ? 'var(--adm-status-soldee)' : 'var(--adm-text-muted)',
      }
    }
    case 'package_amount_change': {
      const fromCents = e.from_value?.package_amount_cents as number | null | undefined
      const toCents = e.to_value?.package_amount_cents as number | null | undefined
      const fromEur = fromCents ? `${(fromCents / 100).toFixed(2)} €` : '—'
      const toEur = toCents ? `${(toCents / 100).toFixed(2)} €` : '—'
      return { label: 'Montant package mis à jour', detail: `${fromEur} → ${toEur}` }
    }
    case 'payment_method_change': {
      const from = e.from_value?.payment_method as PaymentMethod | null | undefined
      const to = e.to_value?.payment_method as PaymentMethod | null | undefined
      const fromLabel = from ? PAYMENT_METHOD_LABEL[from] : '—'
      const toLabel = to ? PAYMENT_METHOD_LABEL[to] : '—'
      return { label: 'Méthode de paiement mise à jour', detail: `${fromLabel} → ${toLabel}` }
    }
    case 'payment_date_change': {
      const from = e.from_value?.payment_date as string | null | undefined
      const to = e.to_value?.payment_date as string | null | undefined
      return {
        label: 'Date de paiement mise à jour',
        detail: `${from ? formatDateOnly(from) : '—'} → ${to ? formatDateOnly(to) : '—'}`,
      }
    }
    // Events legacy (avant suppression Stripe / 100€) : on les laisse s'afficher
    // bruts pour préserver l'historique sans casser l'UI.
    case 'fee_paid_change':
      return { label: '[archive] Frais d\'inscription marqués payés/retirés', detail: null }
    case 'attribution_captured': {
      const src = e.to_value?.source as AttributionSource | undefined
      const campaign = e.to_value?.utm_campaign as string | undefined
      const label = src ? ATTRIBUTION_SOURCE_LABEL[src] ?? src : 'inconnue'
      return {
        label: 'Source d\'acquisition',
        detail: campaign ? `${label} · ${campaign}` : label,
        accent: src === 'google_ads' ? '#4285F4' : undefined,
      }
    }
    case 'notes_admin_update':
      return { label: 'Notes admin éditées', detail: null }
    case 'notes_visio_update':
      return { label: 'Compte-rendu visio édité', detail: null }
    case 'contract_fields_update': {
      const fields = Array.isArray(e.data?.fields) ? (e.data.fields as string[]) : []
      return {
        label: 'Infos contrat mises à jour',
        detail: fields.length > 0 ? fields.map((f) => f.replace('contract_', '')).join(', ') : null,
      }
    }
    case 'contract_sent': {
      const num = e.data?.contract_number ? String(e.data.contract_number) : null
      const to = e.data?.to ? String(e.data.to) : null
      const count = e.to_value?.contract_sent_count as number | undefined
      return {
        label: count && count > 1 ? `Contrat renvoyé (envoi n°${count})` : 'Contrat envoyé',
        detail: [num, to].filter(Boolean).join(' → '),
        accent: 'var(--adm-status-validee)',
      }
    }
    case 'souvenir_sent': {
      const to = e.data?.to ? String(e.data.to) : null
      return {
        label: 'Image souvenir envoyée au candidat',
        detail: to,
        accent: 'var(--adm-status-validee)',
      }
    }
    case 'souvenir_reset':
      return {
        label: 'Image souvenir réinitialisée',
        detail: 'sera renvoyée à la prochaine validation',
        accent: 'var(--adm-text-muted)',
      }
    case 'visio_reminder_sent': {
      const to = e.data?.to ? String(e.data.to) : null
      const cnt = e.to_value?.visio_reminder_count as number | undefined
      return {
        label: cnt && cnt > 1 ? `Rappel visio renvoyé (envoi n°${cnt})` : 'Rappel visio envoyé au candidat',
        detail: to,
        accent: 'var(--adm-status-reportee)',
      }
    }
    case 'rebooking_sent': {
      const to = e.data?.to ? String(e.data.to) : null
      const cnt = e.to_value?.rebooking_sent_count as number | undefined
      return {
        label:
          cnt && cnt > 1
            ? `Proposition d'une autre session renvoyée (envoi n°${cnt})`
            : 'Proposition d\u2019une autre session envoyée au candidat',
        detail: to,
        accent: 'var(--adm-status-reportee)',
      }
    }
    default:
      return { label: e.event, detail: null }
  }
}

function formatDateOnly(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

// Date de naissance lisible + age calcule (verification majorite en un coup d'oeil).
function formatBirthDate(iso: string): string {
  const birth = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(birth.getTime())) return iso
  const now = new Date()
  let age = now.getUTCFullYear() - birth.getUTCFullYear()
  const anniversaryPassed =
    now.getUTCMonth() > birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() >= birth.getUTCDate())
  if (!anniversaryPassed) age -= 1
  return `${formatDateOnly(iso)} · ${age} ans`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `il y a ${diffD}j`
}

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let candidature: CandidatureRow | null = null
  let auditEntries: AuditRow[] = []
  let configError: string | null = null

  // notFound() lance une erreur interceptee par Next : elle ne doit JAMAIS etre
  // appelee dans le try/catch ci-dessous, sinon le catch l'avale et affiche
  // « Configuration manquante : NEXT_HTTP_ERROR_FALLBACK;404 » au lieu de la 404.
  try {
    const supabase = getSupabaseAdmin()
    const [candRes, auditRes] = await Promise.all([
      supabase
        .from('candidatures')
        .select(`
          id, created_at, updated_at, tunnel_type, session_id, duree_semaines, camp_discipline,
          date_debut_souhaitee, status, status_changed_at, status_changed_by_email,
          package_amount_cents, package_paid_at, payment_method, payment_date,
          notes_admin, notes_visio, form_data, group_members,
          referral_code, referral_code_valid, referral_partner_name, referral_partner_type,
          referral_bonus_eur, referral_commission_type, referral_commission_pct,
          referral_payout_status, referral_payout_paid_at, referral_payout_method,
          submission_language, visio_reminder_sent_at, visio_reminder_count,
          rebooking_sent_at, rebooking_sent_count,
          contract_start_date, contract_end_date, contract_duration_weeks,
          contract_inclusions, contract_exclusions, contract_note,
          contract_payment_deadline, contract_locale, contract_number,
          contract_sent_at, contract_sent_count, contract_pdf_path,
          attribution_source, attribution,
          candidate:candidates ( prenom, nom, email, telephone, date_naissance, pays, ville_depart )
        `)
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('audit_log')
        .select('id, event, from_value, to_value, data, actor_email, at')
        .eq('candidature_id', id)
        .order('at', { ascending: false })
        .limit(50),
    ])

    candidature = (candRes.data as unknown as CandidatureRow | null) ?? null
    auditEntries = (auditRes.data ?? []) as AuditRow[]
  } catch (err) {
    configError = (err as Error).message
  }

  if (configError) {
    return (
      <>
        <Topbar />
        <div className="adm-container">
          <p style={{ color: 'var(--adm-status-refusee)' }}>Configuration manquante : {configError}</p>
        </div>
      </>
    )
  }

  // Id inconnu ou non-uuid -> vraie 404 admin (src/app/admin/not-found.tsx).
  if (!candidature) notFound()

  const c = candidature.candidate
  // Rotation des saisons : si le camp de ce dossier est deja parti, on ouvre la
  // carte qui propose une autre session au candidat.
  const dossierSession = sessionFromId(candidature.session_id)
  const campDeparted = !!dossierSession && dossierSession.startDate <= new Date().toISOString().slice(0, 10)
  const missedSessionLabel = dossierSession ? frSessionDisplay(dossierSession).season_label : null
  const fullName = c ? `${c.prenom} ${c.nom}` : '(candidat manquant)'
  const tunnelColor = TUNNEL_COLOR[candidature.tunnel_type]
  const statusColor = STATUS_COLOR[candidature.status]
  const formData = candidature.form_data ?? {}
  const packageEur = candidature.package_amount_cents
    ? (candidature.package_amount_cents / 100).toFixed(2)
    : null

  // Calcul du restant à payer (centimes). Plus de frais 100€ upfront : le
  // package est soit soldé en une fois post-visio, soit en attente.
  const totalCents = candidature.package_amount_cents
  const packagePaid = !!candidature.package_paid_at
  const remainingCents = packagePaid ? 0 : totalCents ?? null
  const remainingEur = remainingCents !== null ? (remainingCents / 100).toFixed(2) : null
  const paidCents = packagePaid && totalCents ? totalCents : 0
  const totalToCollect = totalCents ?? 0
  const progressPct = totalToCollect > 0 ? Math.min(100, Math.round((paidCents / totalToCollect) * 100)) : 0
  const phoneTel = c?.telephone?.replace(/[^+0-9]/g, '') ?? ''

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Candidatures', href: '/admin/inscriptions' },
          { label: c ? `${c.prenom ?? ''} ${c.nom ?? ''}`.trim() || 'Dossier' : 'Dossier' },
        ]}
      />
      <BackShortcut to="/admin/inscriptions" />
      <main className="adm-container" style={{ paddingBottom: '6rem' }}>
        <Link href="/admin/inscriptions" className="adm-back-link">
          <Icon name="arrow-left" size={15} />
          Retour à la liste
          <span className="adm-hide-mobile" style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--adm-text-muted)' }}>
            <kbd className="adm-kbd">Esc</kbd>
          </span>
        </Link>

        {/* Hero */}
        <section
          className="adm-card adm-card--hero adm-hero"
          style={{ ['--adm-status-color' as string]: statusColor }}
        >
          <Avatar prenom={c?.prenom} nom={c?.nom} seed={candidature.id} size="lg" />
          <div className="adm-hero-main">
            <div className="adm-hero-badges">
              <Badge color={tunnelColor} dot size="lg">
                {TUNNEL_LABEL[candidature.tunnel_type]}
              </Badge>
              <Badge
                color={statusColor}
                dot
                pulse={candidature.status === 'recue'}
                size="lg"
              >
                {STATUS_LABEL[candidature.status]}
              </Badge>
            </div>
            <h1 className="adm-hero-name">{fullName}</h1>
            <p className="adm-hero-meta">
              Reçue {formatRelative(candidature.created_at)} · {formatDateTime(candidature.created_at)}
            </p>
          </div>
          {c && (
            <div className="adm-hero-quick">
              <a href={`mailto:${c.email}`} className="adm-quick-btn" aria-label="Envoyer un email">
                <Icon name="mail" size={15} />
                <span className="adm-hide-mobile">Email</span>
              </a>
              {c.telephone && (
                <>
                  <a href={`tel:${phoneTel}`} className="adm-quick-btn" aria-label="Appeler">
                    <Icon name="phone" size={15} />
                    <span className="adm-hide-mobile">Appeler</span>
                  </a>
                  <a
                    href={`https://wa.me/${phoneTel.replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-quick-btn adm-quick-btn--whatsapp"
                    aria-label="Ouvrir WhatsApp"
                  >
                    <Icon name="whatsapp" size={15} />
                    <span className="adm-hide-mobile">WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          )}
        </section>

        {/* Bandeau "Devis à envoyer" pour les groupes/clubs */}
        {candidature.tunnel_type === 'groupe' && candidature.status === 'recue' && (
          <section
            className="adm-card"
            style={{
              marginBottom: '1.25rem',
              padding: '1rem 1.25rem',
              borderColor: 'rgba(167, 139, 250, 0.35)',
              background: 'rgba(167, 139, 250, 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ color: '#a78bfa', flexShrink: 0, marginTop: '0.1rem' }}>
                <Icon name="history" size={28} strokeWidth={1.6} />
              </span>
              <div>
                <strong style={{ color: '#a78bfa', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  Demande de devis Club et Groupe
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--adm-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Aucun paiement à ce stade. <strong>À contacter sous 48h</strong> pour cadrer en visio (objectifs, dates, niveau, budget)
                  puis envoyer un devis personnalisé. La santé individuelle et les certificats médicaux seront collectés après acceptation.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="adm-card" style={{ marginBottom: '1.25rem' }}>
          <h2 className="adm-card-title">
            <Icon name="check-circle" size={14} />
            Progression du dossier
          </h2>
          <Progress status={candidature.status} />
        </section>

        {/* 2-col desktop / stack mobile */}
        <div className="adm-card-grid adm-card-grid--detail">
          {/* LEFT : infos */}
          <div className="adm-card-stack">
            <section className="adm-card">
              <h2 className="adm-card-title">Identité</h2>
              {c && (
                <DefList
                  items={[
                    ['Prénom', c.prenom],
                    ['Nom', c.nom],
                    ['Email', <a key="e" href={`mailto:${c.email}`}>{c.email}</a>],
                    [
                      'Téléphone',
                      c.telephone ? (
                        <a key="t" href={`tel:${phoneTel}`}>
                          {c.telephone}
                        </a>
                      ) : (
                        '—'
                      ),
                    ],
                    ['Date de naissance', c.date_naissance ? formatBirthDate(c.date_naissance) : '—'],
                    ['Pays', c.pays ?? '—'],
                    ['Ville de départ', c.ville_depart ?? '—'],
                  ]}
                />
              )}
            </section>

            <section className="adm-card">
              <h2 className="adm-card-title">Logistique demandée</h2>
              <DefList
                items={[
                  ['Tunnel', TUNNEL_LABEL[candidature.tunnel_type]],
                  ['Camp choisi', candidature.camp_discipline ? DISCIPLINE_LABEL_FULL[candidature.camp_discipline] : '—'],
                  ['Session', describeSession(candidature.session_id)],
                  [
                    'Durée souhaitée',
                    candidature.duree_semaines ? `${candidature.duree_semaines} semaine(s)` : '—',
                  ],
                  ['Date début souhaitée', candidature.date_debut_souhaitee ?? '—'],
                ]}
              />
            </section>

            <AcquisitionCard source={candidature.attribution_source} attribution={candidature.attribution} />

            <FormAnswers formData={formData} tunnelType={candidature.tunnel_type} />

            {candidature.group_members ? (
              <section className="adm-card">
                <h2 className="adm-card-title">Membres du groupe</h2>
                <pre className="adm-pre">{JSON.stringify(candidature.group_members, null, 2)}</pre>
              </section>
            ) : null}

            <section className="adm-card">
              <h2 className="adm-card-title">
                <Icon name="euro" size={14} />
                État paiement
              </h2>

              {/* Récap visuel : reste à payer en grand + barre de progression */}
              <div
                style={{
                  marginBottom: '1.25rem',
                  padding: '1rem 1.1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--adm-border-subtle)',
                  background: packagePaid
                    ? 'rgba(34, 197, 94, 0.06)'
                    : remainingCents && remainingCents > 0
                      ? 'rgba(251, 191, 36, 0.05)'
                      : 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-text-muted)', fontWeight: 700 }}>
                    {packagePaid ? 'Tout est payé' : 'Reste à payer'}
                  </span>
                  {totalCents && totalCents > 0 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--adm-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {(paidCents / 100).toFixed(2)} € sur {(totalCents / 100).toFixed(2)} €
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--adm-font-display)',
                    fontSize: '3rem',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    lineHeight: 0.95,
                    color: packagePaid
                      ? 'var(--adm-status-validee)'
                      : remainingCents && remainingCents > 0
                        ? 'var(--adm-status-reportee)'
                        : 'var(--adm-text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                    marginBottom: '0.9rem',
                  }}
                >
                  {packagePaid ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon name="check" size={32} strokeWidth={3} />
                      Soldé
                    </span>
                  ) : remainingEur !== null ? (
                    `${remainingEur} €`
                  ) : (
                    <span style={{ fontSize: '1.6rem' }}>Montant à définir</span>
                  )}
                </div>
                {totalCents && totalCents > 0 && (
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--adm-bg-base)',
                      overflow: 'hidden',
                      border: '1px solid var(--adm-border-subtle)',
                    }}
                    role="progressbar"
                    aria-valuenow={progressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${progressPct}% encaissé`}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPct}%`,
                        background: packagePaid
                          ? 'var(--adm-status-validee)'
                          : 'linear-gradient(90deg, var(--adm-status-validee), var(--adm-status-reportee))',
                        borderRadius: 999,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              <DefList
                items={[
                  ['Montant package total', packageEur ? `${packageEur} €` : '—'],
                  [
                    'Package soldé',
                    candidature.package_paid_at ? (
                      <span style={{ color: 'var(--adm-status-validee)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        Soldé le {formatDateTime(candidature.package_paid_at)}
                      </span>
                    ) : (
                      <span className="adm-def-val--muted">Non soldé</span>
                    ),
                  ],
                  [
                    'Méthode de paiement',
                    candidature.payment_method ? (
                      <span>{PAYMENT_METHOD_LABEL[candidature.payment_method]}</span>
                    ) : (
                      <span className="adm-def-val--muted">—</span>
                    ),
                  ],
                  [
                    'Date de réception',
                    candidature.payment_date ? (
                      <span>{formatDateOnly(candidature.payment_date)}</span>
                    ) : (
                      <span className="adm-def-val--muted">—</span>
                    ),
                  ],
                ]}
              />
            </section>

            <ReferralPanel
              candidatureId={candidature.id}
              referralCode={candidature.referral_code}
              referralCodeValid={candidature.referral_code_valid}
              referralPartnerName={candidature.referral_partner_name}
              referralPartnerType={candidature.referral_partner_type}
              referralBonusEur={candidature.referral_bonus_eur}
              referralCommissionType={candidature.referral_commission_type}
              referralCommissionPct={candidature.referral_commission_pct}
              packageAmountCents={candidature.package_amount_cents}
              referralPayoutStatus={candidature.referral_payout_status}
              referralPayoutPaidAt={candidature.referral_payout_paid_at}
              referralPayoutMethod={candidature.referral_payout_method}
            />

            <section className="adm-card">
              <h2 className="adm-card-title">
                <Icon name="history" size={14} />
                Historique
              </h2>
              {auditEntries.length === 0 ? (
                <p className="adm-action-empty">Aucune entrée.</p>
              ) : (
                <ol className="adm-timeline">
                  {auditEntries.map((e, idx) => {
                    const described = describeEvent(e)
                    const reminderText =
                      e.data && typeof e.data === 'object' && 'reminder' in e.data
                        ? String((e.data as Record<string, unknown>).reminder)
                        : null
                    const dotClass = idx === 0 || described.accent
                      ? 'adm-timeline-dot adm-timeline-dot--accent'
                      : 'adm-timeline-dot'
                    const dotStyle: React.CSSProperties | undefined = described.accent
                      ? { background: described.accent, borderColor: described.accent, boxShadow: `0 0 0 3px color-mix(in srgb, ${described.accent} 24%, transparent)` }
                      : undefined
                    return (
                      <li key={e.id} className="adm-timeline-item">
                        <span className={dotClass} style={dotStyle} aria-hidden="true" />
                        <div className="adm-timeline-event">{described.label}</div>
                        <div className="adm-timeline-time">
                          {formatDateTime(e.at)} · {e.actor_email}
                        </div>
                        {described.detail && (
                          <div className="adm-timeline-detail">
                            <span style={{ color: 'var(--adm-text-primary)', fontWeight: 600 }}>
                              {described.detail}
                            </span>
                          </div>
                        )}
                        {reminderText && (
                          <div className="adm-timeline-reminder" style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                            <Icon name="alert-triangle" size={13} strokeWidth={2.2} />
                            <span>{reminderText}</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          </div>

          {/* RIGHT : actions admin (sticky desktop) */}
          <div id="admin-actions" style={{ position: 'sticky', top: '78px', scrollMarginTop: '78px' }}>
            <AdminActions
              candidatureId={candidature.id}
              currentStatus={candidature.status}
              packagePaidAt={candidature.package_paid_at}
              packageAmountCents={candidature.package_amount_cents}
              paymentMethod={candidature.payment_method}
              paymentDate={candidature.payment_date}
              notesAdmin={candidature.notes_admin ?? ''}
              notesVisio={candidature.notes_visio ?? ''}
              candidateEmail={c?.email ?? null}
              submissionLanguage={candidature.submission_language ?? 'fr'}
              visioReminderSentAt={candidature.visio_reminder_sent_at}
              visioReminderCount={candidature.visio_reminder_count ?? 0}
              campDeparted={campDeparted}
              missedSessionLabel={missedSessionLabel}
              rebookingSentAt={candidature.rebooking_sent_at}
              rebookingSentCount={candidature.rebooking_sent_count ?? 0}
              sessionId={candidature.session_id}
              dureeSemaines={candidature.duree_semaines}
              dateDebutSouhaitee={candidature.date_debut_souhaitee}
              contractStartDate={candidature.contract_start_date}
              contractEndDate={candidature.contract_end_date}
              contractDurationWeeks={candidature.contract_duration_weeks}
              contractInclusions={candidature.contract_inclusions}
              contractExclusions={candidature.contract_exclusions}
              contractNote={candidature.contract_note}
              contractPaymentDeadline={candidature.contract_payment_deadline}
              contractLocale={candidature.contract_locale}
              contractNumber={candidature.contract_number}
              contractSentAt={candidature.contract_sent_at}
              contractSentCount={candidature.contract_sent_count ?? 0}
              contractPdfPath={candidature.contract_pdf_path}
            />
          </div>
        </div>

        {/* Danger zone — full width, en bas, separe du workflow normal */}
        <DangerSection candidatureId={candidature.id} candidateName={fullName} />
      </main>

      {/* FAB mobile vers les actions admin (caché desktop, sticky desktop suffit) */}
      <a
        href="#admin-actions"
        className="adm-fab adm-hide-desktop"
        aria-label="Aller aux actions admin"
        title="Actions admin"
      >
        <Icon name="zap" size={18} strokeWidth={2.2} />
        <span>Actions</span>
      </a>
    </>
  )
}

// Carte "Acquisition" : d'ou vient le candidat (Google Ads en priorite), avec le
// detail brut de l'attribution (click id, campagne, referent, page d'atterrissage).
function AcquisitionCard({
  source,
  attribution,
}: {
  source: string | null
  attribution: Record<string, unknown> | null
}) {
  const src = (source as AttributionSource | null) ?? null
  const label = src ? ATTRIBUTION_SOURCE_LABEL[src] ?? src : 'Direct / inconnu'
  const color = src ? ATTRIBUTION_SOURCE_COLOR[src] ?? 'var(--adm-text-muted)' : 'var(--adm-text-muted)'
  const isGoogleAds = src === 'google_ads'

  const attr = attribution ?? {}
  const str = (k: string): string | null => {
    const v = attr[k]
    return typeof v === 'string' && v.trim() ? v.trim() : null
  }
  const clickId = str('gclid') ?? str('gbraid') ?? str('wbraid') ?? str('fbclid') ?? str('msclkid') ?? null
  const clickIdLabel = str('gclid')
    ? 'gclid'
    : str('gbraid')
      ? 'gbraid'
      : str('wbraid')
        ? 'wbraid'
        : str('fbclid')
          ? 'fbclid'
          : str('msclkid')
            ? 'msclkid'
            : 'Click ID'
  const capturedAt = str('ts')

  const rows: Array<[string, React.ReactNode]> = [
    [
      'Source',
      <Badge key="src" color={color} dot>
        {isGoogleAds && <Icon name="zap" size={11} strokeWidth={2.5} />}
        {label}
      </Badge>,
    ],
  ]
  if (str('utm_source')) rows.push(['utm_source', str('utm_source')])
  if (str('utm_medium')) rows.push(['utm_medium', str('utm_medium')])
  if (str('utm_campaign')) rows.push(['Campagne (utm_campaign)', str('utm_campaign')])
  if (str('utm_term')) rows.push(['Mot-cle (utm_term)', str('utm_term')])
  if (str('utm_content')) rows.push(['Annonce (utm_content)', str('utm_content')])
  if (clickId) {
    rows.push([
      clickIdLabel,
      <code key="cid" style={{ fontSize: '0.72rem', wordBreak: 'break-all', color: 'var(--adm-text-secondary)' }}>
        {clickId}
      </code>,
    ])
  }
  if (str('referrer')) {
    rows.push([
      'Site referent',
      <span key="ref" style={{ wordBreak: 'break-all' }}>{str('referrer')}</span>,
    ])
  }
  if (str('landing')) rows.push(['Page d\'atterrissage', str('landing')])
  if (capturedAt) rows.push(['Capture', formatDateTime(capturedAt)])

  return (
    <section className="adm-card">
      <h2 className="adm-card-title">
        <Icon name="zap" size={14} />
        Acquisition
      </h2>
      {isGoogleAds && (
        <div
          style={{
            marginBottom: '0.9rem',
            padding: '0.7rem 0.9rem',
            borderRadius: 10,
            border: '1px solid rgba(66, 133, 244, 0.35)',
            background: 'rgba(66, 133, 244, 0.08)',
            color: '#4285F4',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Icon name="zap" size={14} strokeWidth={2.4} />
          Ce candidat vient de Google Ads
        </div>
      )}
      <DefList items={rows} />
    </section>
  )
}

function DefList({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="adm-defs">
      {items.map(([k, v], i) => (
        <div key={i} className="adm-def">
          <dt className="adm-def-key">{k}</dt>
          <dd className="adm-def-val">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
