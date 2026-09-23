// Onglet Profil (composants serveur) : camp et logistique, contact et
// identite (age calcule au jour de Zurich), puis GroupMembersCard (membres
// du groupe, apres les reponses du formulaire). Les reponses (FormAnswers),
// l'acquisition et les autres dossiers du candidat sont des cartes a part.
// Valeur vide : "Non renseigne".

import { sessionFromId } from '@/data/sessions'
import Icon from '@/components/admin/ui/Icon'
import type { DossierDetail } from '@/lib/admin/data'
import { sessionTiming, telHref } from '@/lib/admin/dossier'
import { ageOn, formatNumericDate, plural } from '@/lib/admin/format'
import { DISCIPLINE_LABEL_FULL, LANG_LABEL, TUNNEL_LABEL, sessionShortName } from '@/lib/admin/labels'
import { frSessionDisplay } from '@/lib/session-display-fr'
import { formatIntl } from '@/lib/phone'

type Def = [string, React.ReactNode]

function Empty({ text = 'Non renseigné' }: { text?: string }) {
  return <span className="adm-def-val--muted">{text}</span>
}

export function DefList({ items }: { items: Def[] }) {
  return (
    <dl className="adm-defs">
      {items.map(([key, value]) => (
        <div key={key} className="adm-def">
          <dt className="adm-def-key">{key}</dt>
          <dd className="adm-def-val">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** "Toussaint 2026 · 17 oct. - 7 nov. 2026 · départ dans 24 j", y compris une session passee. */
function sessionLine(sessionId: string | null, now: Date): React.ReactNode {
  if (!sessionId) return <Empty text="Sans session (sur mesure)" />
  const session = sessionFromId(sessionId)
  if (!session) return sessionId
  const timing = sessionTiming(sessionId, now)
  const state =
    timing?.state === 'terminee' ? 'camp terminé'
      : timing?.state === 'en_cours' ? 'camp en cours'
        : timing?.days === 1 ? 'départ demain'
          : timing ? `départ dans ${timing.days} j` : null
  return [sessionShortName(session), frSessionDisplay(session).dates_short, state].filter(Boolean).join(' · ')
}

function groupMembers(value: unknown): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value as object).length > 0
  return true
}

export default function ProfileCards({ dossier, now }: { dossier: DossierDetail; now: Date }) {
  const c = dossier.candidate
  const age = c?.date_naissance ? ageOn(c.date_naissance, now) : null

  return (
    <>
      <section className="adm-card" aria-labelledby="adm-profil-camp">
        <h2 id="adm-profil-camp" className="adm-card-title">
          <Icon name="calendar-days" size={14} />
          Camp et logistique
        </h2>
        <DefList
          items={[
            ['Tunnel', TUNNEL_LABEL[dossier.tunnel_type]],
            ['Camp choisi', dossier.camp_discipline ? DISCIPLINE_LABEL_FULL[dossier.camp_discipline] : <Empty />],
            ['Session', sessionLine(dossier.session_id, now)],
            ['Durée souhaitée', dossier.duree_semaines ? plural(dossier.duree_semaines, 'semaine', 'semaines') : <Empty />],
            ['Début souhaité', dossier.date_debut_souhaitee ? formatNumericDate(dossier.date_debut_souhaitee) : <Empty />],
          ]}
        />
      </section>

      <section className="adm-card" aria-labelledby="adm-profil-contact">
        <h2 id="adm-profil-contact" className="adm-card-title">
          <Icon name="user" size={14} />
          Contact et identité
        </h2>
        {c ? (
          <DefList
            items={[
              ['Prénom', c.prenom || <Empty />],
              ['Nom', c.nom || <Empty />],
              ['Email', c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : <Empty />],
              ['Téléphone', c.telephone ? <a href={telHref(c.telephone)}>{formatIntl(c.telephone)}</a> : <Empty />],
              [
                'Date de naissance',
                c.date_naissance
                  ? `${formatNumericDate(c.date_naissance)}${age !== null ? ` · ${age} ans` : ''}`
                  : <Empty />,
              ],
              ['Pays', c.pays || <Empty />],
              ['Ville de départ', c.ville_depart || <Empty />],
              ['Langue de la candidature', LANG_LABEL[dossier.submission_language ?? 'fr']],
            ]}
          />
        ) : (
          <p className="adm-action-empty">Candidat introuvable : le dossier n’est plus relié à un candidat.</p>
        )}
      </section>
    </>
  )
}

/** Membres du groupe (donnee brute du formulaire Club et Groupe), si presents. */
export function GroupMembersCard({ members }: { members: unknown }) {
  if (!groupMembers(members)) return null
  return (
    <section className="adm-card" aria-labelledby="adm-profil-groupe">
      <h2 id="adm-profil-groupe" className="adm-card-title">
        <Icon name="users" size={14} />
        Membres du groupe
      </h2>
      <pre className="adm-pre">{JSON.stringify(members, null, 2)}</pre>
    </section>
  )
}
