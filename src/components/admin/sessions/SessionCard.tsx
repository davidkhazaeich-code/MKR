// Ecran Sessions (spec 6.4) : carte d'une session et briques partagees avec
// les blocs "Sans session" et "Sessions inconnues" de la page.
// Composants serveur, aucun calcul : les chiffres viennent de
// buildSessionsOverview (src/lib/admin/sessions-stats.ts, teste en Task 2).
//
// Carte : nom, dates et depart, inscriptions ouvertes ou fermees (texte au
// ton, jamais une pastille), jauges Lutte et MMA (role meter, barre plafonnee
// a 100 %, le texte dit la verite au-dela de la jauge), montants engages et
// encaisses, dossiers par statut en liens vers la liste filtree.
// Session terminee : ni jauges ni inscriptions (plus rien a remplir).

import Link from 'next/link'
import Icon from '@/components/admin/ui/Icon'
import { STATUS_TONE } from '@/lib/admin/labels'
import { formatEurosLarge } from '@/lib/admin/format'
import {
  GAUGE_TONE, gaugeStatus, gaugeValueText, sessionTiming, type PlaceGauge, type SessionStat,
} from '@/lib/admin/sessions-stats'
import type { Status } from '@/lib/admin/types'

// Ordre du tunnel, puis les dossiers fermes. Libelles au pluriel, comme les
// onglets de la liste ou menent les liens.
const STATUS_ORDER: Status[] = ['recue', 'validee', 'soldee', 'camp_fait', 'refusee', 'annulee', 'reportee']
const STATUS_PLURAL: Record<Status, string> = {
  recue: 'Reçues', validee: 'Validées', soldee: 'Soldées', camp_fait: 'Camp fait',
  refusee: 'Refusées', annulee: 'Annulées', reportee: 'Reportées',
}

/** Liste des candidatures filtree par session (`none` : sans session) et statut (`tous` compris). */
export function sessionListHref(session: string, statut: Status | 'tous'): string {
  return `/admin/inscriptions?session=${encodeURIComponent(session)}&statut=${statut}`
}

export function dossiersLabel(n: number): string {
  return n === 1 ? 'Voir le dossier' : `Voir les ${n} dossiers`
}

/**
 * Dossiers par statut : un lien par statut non nul (point au ton, libelle,
 * nombre), puis "Voir les N dossiers" (tous statuts), masque si N = 0.
 * `context` complete le nom accessible des liens ("Toussaint 2026").
 */
export function StatusLinks({
  session,
  context,
  byStatus,
  total,
}: {
  session: string
  context: string
  byStatus: Record<Status, number>
  total: number
}) {
  const present = STATUS_ORDER.filter((status) => byStatus[status] > 0)
  if (present.length === 0) return <p className="adm-sess-none">Aucun dossier</p>
  return (
    <>
      <ul className="adm-sess-links">
        {present.map((status) => (
          <li key={status}>
            <Link href={sessionListHref(session, status)} className="adm-sess-link">
              <span className={`adm-status adm-tone--${STATUS_TONE[status]}`}>
                <span className="adm-status-dot" aria-hidden="true" />
                {STATUS_PLURAL[status]}
              </span>{' '}
              <span className="adm-sess-link-count">{byStatus[status]}</span>
              <span className="adm-sr-only">, {context}</span>
              <Icon name="chevron-right" size={16} className="adm-sess-chevron" />
            </Link>
          </li>
        ))}
      </ul>
      {total > 0 && (
        <Link href={sessionListHref(session, 'tous')} className="adm-link adm-sess-all">
          {dossiersLabel(total)}
          <span className="adm-sr-only">, {context}</span>
        </Link>
      )}
    </>
  )
}

function Gauge({ id, label, gauge }: { id: string; label: string; gauge: PlaceGauge }) {
  // Au-dela de la jauge (21/15) : barre pleine, le texte dit le depassement.
  const width = gauge.max > 0 ? Math.min(100, (gauge.prises / gauge.max) * 100) : 100
  return (
    <div className={`adm-sess-gauge adm-tone--${GAUGE_TONE[gauge.level]}`}>
      <div className="adm-sess-gauge-head">
        <span id={id} className="adm-sess-gauge-label">
          {label}
        </span>
        <span className="adm-sess-gauge-count">
          {gauge.prises}/{gauge.max}
        </span>
      </div>
      <div
        className="adm-meter adm-sess-meter"
        role="meter"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={gauge.max}
        aria-valuenow={Math.min(gauge.prises, gauge.max)}
        aria-valuetext={gaugeValueText(gauge)}
      >
        <div className="adm-meter-fill" style={{ width: `${width}%` }} />
      </div>
      <p className="adm-sess-gauge-status">{gaugeStatus(gauge)}</p>
    </div>
  )
}

export default function SessionCard({ session: s }: { session: SessionStat }) {
  const ended = s.state === 'terminee'
  const key = `sess-${s.id}`
  return (
    <article className="adm-card adm-sess-card" aria-labelledby={`${key}-name`}>
      <header className="adm-sess-card-head">
        <h3 id={`${key}-name`} className="adm-sess-name">
          {s.name}
        </h3>
        <p className="adm-sess-when">
          {s.dates} · {sessionTiming(s)}
        </p>
        {!ended && (
          <p className={`adm-sess-open adm-tone--${s.open ? 'ok' : 'neutral'}`}>
            Inscriptions {s.open ? 'ouvertes' : 'fermées'}
          </p>
        )}
      </header>

      {!ended && (
        <div className="adm-sess-block">
          <h4 className="adm-label">Places</h4>
          <div className="adm-sess-gauges">
            <Gauge id={`${key}-lutte`} label="Lutte" gauge={s.lutte} />
            <Gauge id={`${key}-mma`} label="MMA" gauge={s.mma} />
          </div>
        </div>
      )}

      <dl className="adm-sess-money">
        <div>
          <dt className="adm-label">Engagé</dt>
          <dd className="adm-kpi adm-sess-kpi">{formatEurosLarge(s.engagedCents)}</dd>
        </div>
        <div>
          <dt className="adm-label">Encaissé</dt>
          <dd className="adm-kpi adm-sess-kpi">{formatEurosLarge(s.collectedCents)}</dd>
        </div>
      </dl>

      <div className="adm-sess-block">
        <h4 className="adm-label">Dossiers</h4>
        <StatusLinks session={s.id} context={s.name} byStatus={s.byStatus} total={s.total} />
      </div>
    </article>
  )
}
