/**
 * Copie de session hors contexte React, dans les DEUX langues.
 *
 * Les emails candidat sont bilingues et n'ont pas de `t` sous la main : ils
 * lisent directement les dictionnaires. Meme fonction de construction que le
 * site (`buildSessionDisplay`), donc les dates ecrites sont rigoureusement les
 * memes des deux cotes.
 */

import frCopy from '../../messages/fr/data.sessions.json'
import enCopy from '../../messages/en/data.sessions.json'
import { sessionFromId, type Session } from '@/data/sessions'
import { buildSessionDisplay, type SessionCopy, type SessionDisplay } from '@/lib/session-display'

export type StaticLocale = 'fr' | 'en'

const COPY: Record<StaticLocale, SessionCopy> = {
  fr: frCopy as unknown as SessionCopy,
  en: enCopy as unknown as SessionCopy,
}

export function sessionDisplayStatic(session: Session, locale: StaticLocale): SessionDisplay {
  return buildSessionDisplay(session, COPY[locale] ?? COPY.fr)
}

/** Reconstruit la session depuis son id, meme si elle est sortie des inscriptions. */
export function sessionDisplayFromIdStatic(
  id: string | null | undefined,
  locale: StaticLocale,
): SessionDisplay | null {
  const session = sessionFromId(id)
  return session ? sessionDisplayStatic(session, locale) : null
}
