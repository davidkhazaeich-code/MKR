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
 *
 * Pour les emails candidat, bilingues, utiliser `session-display-static.ts`.
 */

import type { Session } from '@/data/sessions'
import type { SessionDisplay } from '@/lib/session-display'
import { sessionDisplayStatic, sessionDisplayFromIdStatic } from '@/lib/session-display-static'

export function frSessionDisplay(session: Session): SessionDisplay {
  return sessionDisplayStatic(session, 'fr')
}

/**
 * Libelle FR d'un id de session, quelle que soit son anciennete.
 * Renvoie `null` si l'id n'est pas une session officielle (sur-mesure, groupe...).
 */
export function frSessionDisplayFromId(id: string | null | undefined): SessionDisplay | null {
  return sessionDisplayFromIdStatic(id, 'fr')
}
