import type { Metadata } from 'next'
import InscriptionLayout from '@/components/InscriptionLayout'
import type { RegistrationTypeId } from '@/data/registration-types'

export const metadata: Metadata = {
  title: "Inscription · MKR Caucasian Camp",
  description:
    "Dépose ta candidature pour rejoindre le camp d'entraînement MMA & Lutte au Caucase. Session groupe, camp sur mesure ou clubs : 3 tunnels d'inscription.",
  alternates: {
    canonical: 'https://mkrcaucasiancamp.com/inscription',
  },
}

const VALID_TYPES: RegistrationTypeId[] = ['session', 'custom', 'groupe']

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const params = await searchParams
  const requested = params.type as RegistrationTypeId | undefined
  const initialAudience = requested && VALID_TYPES.includes(requested) ? requested : null
  return <InscriptionLayout initialAudience={initialAudience} />
}
