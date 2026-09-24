// Session reservee par un candidat, telle que la lisent les notifications
// internes d'une nouvelle candidature (email et Slack). Meme libelle que la
// fiche du dossier : « Toussaint 2026 · 17 oct. - 7 nov. 2026 ».
// Module serveur : labels.ts est aussi importe par des composants client, la
// copie des sessions (session-display-fr) n'a rien a faire dans leur bundle.

import { sessionFromId } from '@/data/sessions'
import { formatNumericDate } from '@/lib/admin/format'
import { sessionShortName, sessionShortNameFromId } from '@/lib/admin/labels'
import { frSessionDisplay } from '@/lib/session-display-fr'

/** Date seule lisible par formatNumericDate, qui leve une exception sur une date invalide. */
function isIsoDay(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T12:00:00Z`))
}

/**
 * « Toussaint 2026 · 17 oct. - 7 nov. 2026 » pour une session officielle,
 * « Sur mesure · début souhaité le 17/12/2026 » sans session, null sinon.
 * Hors tunnel session, l'id et la date arrivent tels que postes : un id
 * inconnu ou une date mal formee ne doivent ni faire tomber la notification
 * ni passer bruts dans Slack. Ils sont donc omis.
 */
export function bookedSessionLabel(sessionId: string | null, dateDebutSouhaitee: string | null): string | null {
  const session = sessionFromId(sessionId)
  if (session) return `${sessionShortName(session)} · ${frSessionDisplay(session).dates_short}`
  if (dateDebutSouhaitee && isIsoDay(dateDebutSouhaitee)) {
    return `Sur mesure · début souhaité le ${formatNumericDate(dateDebutSouhaitee)}`
  }
  return null
}

/**
 * Debut de l'objet de la notification, lu dans la liste d'une boite mail de
 * telephone avant d'etre coupe : le nom de la session remplace « Session
 * officielle » (« Toussaint 2026 »), il suit le tunnel sinon (« Famille ·
 * Toussaint 2026 »). Sans session, le tunnel seul.
 */
export function notificationSubjectLead(tunnel: string, tunnelLabel: string, sessionId: string | null): string {
  const name = sessionShortNameFromId(sessionId)
  if (!name) return tunnelLabel
  return tunnel === 'session' ? name : `${tunnelLabel} · ${name}`
}
