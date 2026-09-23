'use client'

// Carte "Visio de sélection" (onglet Suivi) : etat de la reservation Cal
// (heure du rendez-vous en Europe/Zurich, lien vers la page Cal du
// rendez-vous, date de reservation), puis la relance visio
// (VisioReminderCard, tant que le dossier est "Recue"), branchee sur l'etat
// live de la fiche. Masquee sur un dossier sans reservation qui n'attend
// plus de visio.

import { ButtonLink } from '@/components/admin/ui/Button'
import Icon from '@/components/admin/ui/Icon'
import VisioReminderCard from '@/components/admin/VisioReminderCard'
import { useDossier } from './DossierProvider'
import { VISIO_GRACE_MS } from '@/lib/admin/next-step'
import { bookingHref } from '@/lib/admin/dossier'
import {
  capitalize, daysBetween, formatAgo, formatDateTime, formatVisioMoment, relativeDay, zurichDay,
} from '@/lib/admin/format'

export default function VisioCard() {
  const { id, live, staticData: s, now, pendingStatus, setLive } = useDossier()
  if (!s.visioBookedAt && live.status !== 'recue') return null

  const starts = s.visioStartsAt
  const startMs = starts ? Date.parse(starts) : null
  const upcoming = startMs !== null && startMs + VISIO_GRACE_MS > now.getTime()
  // "aujourd'hui" et "demain" sont deja dans la date ; au-dela, "dans N j".
  let rel: string | null = null
  if (starts && !upcoming) rel = 'passée'
  else if (starts && daysBetween(zurichDay(now), zurichDay(starts)) > 1) rel = relativeDay(starts, now)

  let when: React.ReactNode
  if (!s.visioBookedAt) {
    when = <p className="adm-dossier-text">Pas encore de visio réservée.</p>
  } else if (starts) {
    when = (
      <>
        <p className="adm-dossier-visio-when">
          {capitalize(formatVisioMoment(starts, now))}
          {rel && <span className="adm-dossier-visio-rel">{rel}</span>}
        </p>
        <p className="adm-dossier-text">Réservée le {formatDateTime(s.visioBookedAt)}.</p>
      </>
    )
  } else {
    when = (
      <p className="adm-dossier-text">
        Réservée {formatAgo(s.visioBookedAt, now)}. Cal n’a pas transmis l’heure du rendez-vous.
      </p>
    )
  }

  return (
    <section id="visio" className="adm-card adm-dossier-anchor" tabIndex={-1} aria-labelledby="adm-visio-title">
      <h2 id="adm-visio-title" className="adm-card-title">
        <Icon name="video" size={14} />
        Visio de sélection
      </h2>
      {when}
      {s.visioBookingUid && (
        <div className="adm-btn-row adm-dossier-card-actions">
          <ButtonLink
            href={bookingHref(s.visioBookingUid)}
            external
            variant="secondary"
            aria-label={`Ouvrir la réservation de ${s.firstName} dans Cal, nouvel onglet`}
          >
            Ouvrir la réservation
          </ButtonLink>
        </div>
      )}
      <VisioReminderCard
        candidatureId={id}
        status={live.status}
        candidateEmail={s.email}
        submissionLanguage={s.lang}
        visioReminderSentAt={live.visioReminderSentAt}
        visioReminderCount={live.visioReminderCount}
        busyExternal={pendingStatus !== null}
        onSent={(sent) => setLive({ visioReminderSentAt: sent.sentAt, visioReminderCount: sent.count })}
      />
    </section>
  )
}
