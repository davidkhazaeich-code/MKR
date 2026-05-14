import type { Metadata } from 'next'
import InscriptionLayout from '@/components/InscriptionLayout'
import type { RegistrationTypeId } from '@/data/registration-types'
import { SESSIONS } from '@/data/sessions'

export const metadata: Metadata = {
  title: "Inscription · MKR Caucasian Camp",
  description:
    "Dépose ta candidature pour rejoindre un camp MMA et Lutte au Caucase. 4 sessions par an, sur mesure, famille ou clubs : 4 tunnels.",
  alternates: {
    canonical: 'https://mkrcamp.com/inscription',
  },
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
