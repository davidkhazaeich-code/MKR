import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://mkrcamp.com/programme' },
}

export default function CoachsRedirect() {
  redirect('/programme')
}
