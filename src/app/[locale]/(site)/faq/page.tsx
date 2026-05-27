import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import FAQTabs from '@/components/FAQTabs'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import { getAllFaqItems } from '@/data/faq'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })
  return localizedMetadata('/faq', locale as Locale, t('meta.title'), t('meta.description'))
}

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('faq')
  const tData = await getTranslations('data.faq')

  const allFaqItems = getAllFaqItems(tData as never)
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/faq' },
      ]} />

      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
      />
      <FAQTabs />
      <SectionCTA
        primaryHref="/sessions"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/contact"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
