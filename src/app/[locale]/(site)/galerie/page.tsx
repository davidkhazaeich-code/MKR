import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import GalerieContent from '@/components/GalerieContent'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'galerie' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/galerie',
  })
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
