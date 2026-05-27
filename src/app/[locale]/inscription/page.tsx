import { getTranslations } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import InscriptionLayout from '@/components/InscriptionLayout'
import type { RegistrationTypeId } from '@/data/registration-types'
import { SESSIONS } from '@/data/sessions'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'inscription' })
  return localizedMetadata('/inscription', locale as Locale, t('meta.title'), t('meta.description'))
}
const VALID_TYPES: RegistrationTypeId[] = ['session', 'custom', 'famille', 'groupe']
const VALID_SESSION_IDS = SESSIONS.map(s => s.id)

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; session?: string }>
}) {
  const params = await searchParams
  const requested = params.type as RegistrationTypeId | undefined
  const initialAudience = requested && VALID_TYPES.includes(requested) ? requested : null
  const requestedSession = params.session
  const initialSessionId = requestedSession && VALID_SESSION_IDS.includes(requestedSession) ? requestedSession : null
  return <InscriptionLayout initialAudience={initialAudience} initialSessionId={initialSessionId} />
}
