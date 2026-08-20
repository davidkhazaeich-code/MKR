/**
 * Copie de session en francais, hors contexte React.
 *
 * L'admin est 100 % FR (le middleware bloque /en/admin) et certaines couches
 * serveur (API places, notifications, PDF) n'ont pas de `t` sous la main.
 * Elles lisent donc directement le dictionnaire FR.
 *
 * Point important : ces surfaces doivent afficher des sessions PASSEES, sorties
 * depuis longtemps de la fenetre d'inscription. On repasse donc par
 * `sessionFromId`, qui reconstruit n'importe quelle session depuis son id.
 */

import frCopy from '../../messages/fr/data.sessions.json'
import { sessionFromId, type Session } from '@/data/sessions'
import { buildSessionDisplay, type SessionCopy, type SessionDisplay } from '@/lib/session-display'

const FR_COPY = frCopy as unknown as SessionCopy

export function frSessionDisplay(session: Session): SessionDisplay {
  return buildSessionDisplay(session, FR_COPY)
}

/**
 * Libelle FR d'un id de session, quelle que soit son anciennete.
 * Renvoie `null` si l'id n'est pas une session officielle (sur-mesure, groupe...).
 */
export function frSessionDisplayFromId(id: string | null | undefined): SessionDisplay | null {
  const session = sessionFromId(id)
  return session ? frSessionDisplay(session) : null
}
