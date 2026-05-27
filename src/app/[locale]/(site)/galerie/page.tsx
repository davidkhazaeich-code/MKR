import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import GalerieContent from '@/components/GalerieContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'galerie' })
  return localizedMetadata('/galerie', locale as Locale, t('meta.title'), t('meta.description'))
}

export default async function GaleriePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('galerie')

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/galerie' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        compact
      />

      <GalerieContent />

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
      />
    </>
  )
}
