import type { AbstractIntlMessages } from 'next-intl'
import CLIENT_NAMESPACES from './client-namespaces.json'

/**
 * Messages serialises dans chaque page pour NextIntlClientProvider.
 *
 * Les composants serveur lisent tous les messages (getTranslations, ou
 * useTranslations hors 'use client') sans rien envoyer au navigateur. Seuls les
 * composants 'use client' ont besoin de leurs textes cote client : on ne
 * transmet donc que les namespaces de client-namespaces.json. En FR, 92 Ko au
 * lieu de 383 Ko par page, dont 148 Ko d'articles de blog.
 *
 * Un namespace oublie ne casse pas `next build` : le texte s'affiche en cle
 * brute (`home.hero.title`). C'est scripts/i18n-client-check.mjs, lance par
 * `npm run build` (donc par Vercel), qui fait alors echouer le build.
 */
export function pickClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  const picked: AbstractIntlMessages = {}
  for (const path of CLIENT_NAMESPACES) {
    const keys = path.split('.')
    let value: unknown = messages
    for (const key of keys) value = (value as AbstractIntlMessages | undefined)?.[key]
    if (value === undefined) continue
    let target = picked
    for (const key of keys.slice(0, -1)) {
      target[key] ??= {}
      target = target[key] as AbstractIntlMessages
    }
    target[keys[keys.length - 1]] = value as AbstractIntlMessages
  }
  return picked
}
