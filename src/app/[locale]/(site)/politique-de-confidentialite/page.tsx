import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'politique-de-confidentialite' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/politique-de-confidentialite',
  })
}

export default async function PolitiqueConfidentialitePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('politique-de-confidentialite')
  const dataItems = t.raw('sections.data_collected.items') as string[]
  const usageItems = t.raw('sections.usage.items') as string[]
  const rightsItems = t.raw('sections.rights.items') as string[]

  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">{t('title')}</h1>
        <div className="legal-content">
          <h2>{t('sections.intro.title')}</h2>
          <p>{t('sections.intro.body')}</p>

          <h2>{t('sections.data_collected.title')}</h2>
          <p>{t('sections.data_collected.intro')}</p>
          <ul>
            {dataItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <p>{t('sections.data_collected.metadata_intro_prefix')}</p>
          <ul>
            <li>
              {t('sections.data_collected.metadata_ip_prefix')}<code>{t('sections.data_collected.metadata_ip_code')}</code>{t('sections.data_collected.metadata_ip_suffix')}
            </li>
            <li>
              {t('sections.data_collected.metadata_ua_prefix')}<code>{t('sections.data_collected.metadata_ua_code')}</code>{t('sections.data_collected.metadata_ua_suffix')}
            </li>
          </ul>
          <p>{t('sections.data_collected.metadata_outro')}</p>

          <h2>{t('sections.usage.title')}</h2>
          <p>{t('sections.usage.intro')}</p>
          <ul>
            {usageItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2>{t('sections.retention.title')}</h2>
          <p>{t('sections.retention.body')}</p>

          <h2>{t('sections.subcontractors.title')}</h2>
          <p>{t('sections.subcontractors.intro')}</p>
          <ul>
            <li>
              <strong>{t('sections.subcontractors.supabase.strong')}</strong>{t('sections.subcontractors.supabase.body_prefix')}<code>{t('sections.subcontractors.supabase.region_code')}</code>{t('sections.subcontractors.supabase.body_middle')}<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">{t('sections.subcontractors.supabase.link_label')}</a>
            </li>
            <li>
              <strong>{t('sections.subcontractors.vercel.strong')}</strong>{t('sections.subcontractors.vercel.body_prefix')}<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">{t('sections.subcontractors.vercel.link_label')}</a>
            </li>
          </ul>

          <h2>{t('sections.sharing.title')}</h2>
          <p>{t('sections.sharing.body')}</p>

          <h2>{t('sections.rights.title')}</h2>
          <p>{t('sections.rights.intro')}</p>
          <ul>
            {rightsItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>
            {t('sections.rights.outro_prefix')}<Link href="/contact">{t('sections.rights.outro_link')}</Link>{t('sections.rights.outro_suffix')}
          </p>

          <h2>{t('sections.security.title')}</h2>
          <p>{t('sections.security.body')}</p>
        </div>
      </div>
    </section>
  )
}
