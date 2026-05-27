import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coachs' })
  return localizedMetadata('/coachs', locale as Locale, t('meta.title'), t('meta.description'), {
    noindex: true,
  })
}

export default async function CoachsRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/programme', locale })
}
