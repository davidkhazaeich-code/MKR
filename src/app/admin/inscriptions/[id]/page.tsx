import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdminShell from '@/components/admin/shell/AdminShell'
import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import { DossierContractCard } from '@/components/admin/ContractCard'
import DangerSection from '@/components/admin/DangerSection'
import FormAnswers from '@/components/admin/FormAnswers'
import { DossierRebookingCard } from '@/components/admin/RebookingCard'
import ReferralPanel from '@/components/admin/ReferralPanel'
import AcquisitionCard from '@/components/admin/dossier/AcquisitionCard'
import ActionBar from '@/components/admin/dossier/ActionBar'
import DossierHeader from '@/components/admin/dossier/DossierHeader'
import DossierNav from '@/components/admin/dossier/DossierNav'
import { DossierProvider } from '@/components/admin/dossier/DossierProvider'
import DossierTabs from '@/components/admin/dossier/DossierTabs'
import NextStepPanel from '@/components/admin/dossier/NextStepPanel'
import NotesCard from '@/components/admin/dossier/NotesCard'
import PaymentCard from '@/components/admin/dossier/PaymentCard'
import ProfileCards, { GroupMembersCard } from '@/components/admin/dossier/ProfileCards'
import SiblingsCard from '@/components/admin/dossier/SiblingsCard'
import Timeline from '@/components/admin/dossier/Timeline'
import VisioCard from '@/components/admin/dossier/VisioCard'
import { sessionFromId } from '@/data/sessions'
import { loadDossierDetail } from '@/lib/admin/data'
import { isCampDeparted, type DossierLive, type DossierStatic } from '@/lib/admin/dossier'
import { campParts, candidateName } from '@/lib/admin/row-helpers'
import { frSessionDisplay } from '@/lib/session-display-fr'

// Fiche dossier (spec 6.3) : en-tete, prochaine etape, contenu en onglets
// sous 1024 px (Profil, Suivi, Paiement, Historique) ou en deux colonnes
// au-dessus, barre d'actions fixe en mobile. Les donnees sont lues ici une
// fois ; l'etat modifiable par les actions (statut, paiement, envois) vit
// dans DossierProvider. Une seule horloge : nowIso, pris ici.

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Dossier · MKR Admin',
}

function LoadError({ message }: { message: string }) {
  return (
    <AdminShell active="candidatures" title="Dossier">
      <div className="adm-container">
        <section className="adm-empty adm-tone--danger" aria-labelledby="adm-dossier-error-title">
          <span className="adm-empty-icon" aria-hidden="true">
            <Icon name="alert-triangle" size={28} />
          </span>
          <h1 id="adm-dossier-error-title" className="adm-empty-title">
            Configuration manquante
          </h1>
          <p className="adm-empty-text">{message}</p>
          <div className="adm-empty-actions">
            <ButtonLink href="/admin/inscriptions" variant="secondary">
              Retour aux candidatures
            </ButtonLink>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // notFound() lance une erreur interceptee par Next : jamais dans le try
  // ci-dessous, sinon le catch l'avale et affiche "Configuration manquante :
  // NEXT_HTTP_ERROR_FALLBACK;404" au lieu de la 404 (bug du 2026-07-13).
  let detail: Awaited<ReturnType<typeof loadDossierDetail>> | null = null
  let configError: string | null = null
  try {
    detail = await loadDossierDetail(id)
  } catch (err) {
    configError = err instanceof Error ? err.message : String(err)
  }
  if (configError) return <LoadError message={configError} />
  const dossier = detail?.dossier
  // Id inconnu ou non-uuid : vraie 404 admin (src/app/admin/not-found.tsx).
  if (!detail || !dossier) notFound()

  const now = new Date()
  const nowIso = now.toISOString()
  const c = dossier.candidate
  const fullName = candidateName(dossier)
  const session = sessionFromId(dossier.session_id)

  const staticData: DossierStatic = {
    id: dossier.id,
    firstName: c?.prenom?.trim() || fullName,
    fullName,
    email: c?.email || null,
    phoneE164: c?.telephone || null,
    lang: dossier.submission_language ?? 'fr',
    tunnelType: dossier.tunnel_type,
    sessionId: dossier.session_id,
    createdAt: dossier.created_at,
    visioBookedAt: dossier.visio_booked_at,
    visioStartsAt: dossier.visio_starts_at,
    visioBookingUid: dossier.visio_booking_uid,
    contractStartDate: dossier.contract_start_date,
    contractEndDate: dossier.contract_end_date,
    // Rotation des saisons : camp deja parti = carte "Proposer une autre session".
    campDeparted: isCampDeparted(dossier.session_id, now),
    missedSessionLabel: session ? frSessionDisplay(session).season_label : null,
  }
  const initial: DossierLive = {
    status: dossier.status,
    statusChangedAt: dossier.status_changed_at,
    packageCents: dossier.package_amount_cents,
    packagePaidAt: dossier.package_paid_at,
    paymentMethod: dossier.payment_method,
    paymentDate: dossier.payment_date,
    visioReminderSentAt: dossier.visio_reminder_sent_at,
    visioReminderCount: dossier.visio_reminder_count ?? 0,
    rebookingSentAt: dossier.rebooking_sent_at,
    rebookingSentCount: dossier.rebooking_sent_count ?? 0,
    contractSentAt: dossier.contract_sent_at,
    contractPaymentDeadline: dossier.contract_payment_deadline,
  }

  return (
    <AdminShell active="candidatures" title="Dossier" hideBottomNav mobileTop={<DossierNav id={id} />}>
      <DossierProvider key={id} staticData={staticData} initial={initial} nowIso={nowIso}>
        <div className="adm-container adm-container--wide adm-dossier">
          <DossierHeader
            prenom={c?.prenom ?? null}
            nom={c?.nom ?? null}
            campParts={campParts(dossier)}
            durationWeeks={dossier.duree_semaines}
            mmaToCheck={dossier.camp_discipline === 'mma' && dossier.tunnel_type !== 'groupe'}
          />
          <NextStepPanel />
          <DossierTabs
            profil={
              <>
                <ProfileCards dossier={dossier} now={now} />
                <FormAnswers formData={dossier.form_data ?? {}} tunnelType={dossier.tunnel_type} />
                <GroupMembersCard members={dossier.group_members} />
                <AcquisitionCard source={dossier.attribution_source} attribution={dossier.attribution} />
                <SiblingsCard siblings={detail.siblings} />
              </>
            }
            suivi={
              <>
                <NotesCard notesVisio={dossier.notes_visio ?? ''} notesAdmin={dossier.notes_admin ?? ''} />
                <VisioCard />
                <DossierRebookingCard />
              </>
            }
            paiement={
              <>
                <PaymentCard
                  paymentReminderCount={dossier.payment_reminder_count}
                  paymentReminderSentAt={dossier.payment_reminder_sent_at}
                  predepartureSentAt={dossier.predeparture_sent_at}
                />
                <DossierContractCard
                  sessionId={dossier.session_id}
                  dureeSemaines={dossier.duree_semaines}
                  dateDebutSouhaitee={dossier.date_debut_souhaitee}
                  contractStartDate={dossier.contract_start_date}
                  contractEndDate={dossier.contract_end_date}
                  contractDurationWeeks={dossier.contract_duration_weeks}
                  contractInclusions={dossier.contract_inclusions}
                  contractExclusions={dossier.contract_exclusions}
                  contractNote={dossier.contract_note}
                  contractPaymentDeadline={dossier.contract_payment_deadline}
                  contractLocale={dossier.contract_locale}
                  contractNumber={dossier.contract_number}
                  contractSentAt={dossier.contract_sent_at}
                  contractSentCount={dossier.contract_sent_count ?? 0}
                  contractPdfPath={dossier.contract_pdf_path}
                />
                <ReferralPanel
                  referralCode={dossier.referral_code}
                  referralCodeValid={dossier.referral_code_valid}
                  referralPartnerName={dossier.referral_partner_name}
                  referralPartnerType={dossier.referral_partner_type}
                  referralBonusEur={dossier.referral_bonus_eur}
                  referralCommissionType={dossier.referral_commission_type}
                  referralCommissionPct={dossier.referral_commission_pct}
                  referralPayoutStatus={dossier.referral_payout_status}
                  referralPayoutPaidAt={dossier.referral_payout_paid_at}
                  referralPayoutMethod={dossier.referral_payout_method}
                />
              </>
            }
            historique={
              <>
                <Timeline audit={detail.audit} />
                <DangerSection candidatureId={dossier.id} candidateName={fullName} />
              </>
            }
          />
        </div>
        <ActionBar />
      </DossierProvider>
    </AdminShell>
  )
}
