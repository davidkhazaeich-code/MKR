import { getTranslations } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import InscriptionLayout from '@/components/InscriptionLayout'
import type { RegistrationTypeId } from '@/data/registration-types'
import { isSessionOpen } from '@/data/sessions'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'inscription' })
  return localizedMetadata('/inscription', locale as Locale, t('meta.title'), t('meta.description'))
}
/* Meme raison que le layout du site : la liste des sessions proposees vient de
   la fenetre glissante, elle doit etre recalculee sans redeploiement. */
export const revalidate = 3600

const VALID_TYPES: RegistrationTypeId[] = ['session', 'custom', 'famille', 'groupe']

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; session?: string }>
}) {
  const params = await searchParams
  const requested = params.type as RegistrationTypeId | undefined
  const initialAudience = requested && VALID_TYPES.includes(requested) ? requested : null
  const requestedSession = params.session
  // Un vieux lien (annonce, email, article) vers une session deja partie est
  // ignore : le formulaire retombe sur la prochaine session ouverte.
  const initialSessionId = requestedSession && isSessionOpen(requestedSession) ? requestedSession : null
  return <InscriptionLayout initialAudience={initialAudience} initialSessionId={initialSessionId} />
}
