import { createOgImageResponse, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-template'

export const runtime = 'nodejs'
export const alt = 'Sessions MKR 2026-2027 et tarifs'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function OG() {
  return createOgImageResponse({
    label: 'Sessions et tarifs',
    title: '4 sessions par an',
    subtitle: 'Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027. Lutte ou MMA, 1 à 3 semaines.',
  })
}
