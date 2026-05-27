import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coachs' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    robots: { index: false, follow: false },
    alternates: { canonical: 'https://mkrcamp.com/programme' },
  }
}

export default async function CoachsRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/programme', locale })
}
