import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import { WHATSAPP } from '@/data/site'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'mentions-legales' })
  return localizedMetadata('/mentions-legales', locale as Locale, t('meta.title'), t('meta.description'))
}

export default async function MentionsLegalesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('mentions-legales')

  return (
    <section className="legal-page">
      <div className="inner">
        <h1 className="legal-title">{t('title')}</h1>
        <p className="legal-intro">
          {t('intro.prefix')}<a href="https://mkrcamp.com">{t('intro.link_label')}</a>{t('intro.suffix')}
        </p>

        <div className="legal-content">
          <h2>{t('sections.editor.title')}</h2>
          <p>
            <strong>{t('sections.editor.name')}</strong><br/>
            {t('sections.editor.activity')}<br/>
            {t('sections.editor.country')}<br/>
            {t('sections.editor.siret_prefix')}<em>{t('sections.editor.siret_em')}</em><br/>
            {t('sections.editor.address_prefix')}<em>{t('sections.editor.address_em')}</em><br/>
            {t('sections.editor.contact_prefix')}<Link href="/contact">{t('sections.editor.contact_link')}</Link><br/>
            {t('sections.editor.phone_prefix')}<a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer">{t('sections.editor.phone_value')}</a>
          </p>

          <h2>{t('sections.publisher.title')}</h2>
          <p>
            {t('sections.publisher.body')}<br/>
            {t('sections.publisher.contact_prefix')}<Link href="/contact">{t('sections.publisher.contact_link')}</Link>
          </p>

          <h2>{t('sections.host.title')}</h2>
          <p>
            <strong>{t('sections.host.name')}</strong><br/>
            {t('sections.host.address')}<br/>
            {t('sections.host.website_prefix')}<a href="https://vercel.com" target="_blank" rel="noopener noreferrer">{t('sections.host.website_label')}</a>
          </p>

          <h2>{t('sections.subcontractors.title')}</h2>
          <p>{t('sections.subcontractors.intro')}</p>
          <ul>
            <li>
              <strong>{t('sections.subcontractors.vercel.strong')}</strong>{t('sections.subcontractors.vercel.body')}
            </li>
            <li>
              <strong>{t('sections.subcontractors.supabase.strong')}</strong>{t('sections.subcontractors.supabase.body')}
            </li>
          </ul>
          <p>
            {t('sections.subcontractors.see_prefix')}<Link href="/politique-de-confidentialite">{t('sections.subcontractors.see_link')}</Link>{t('sections.subcontractors.see_suffix')}
          </p>

          <h2>{t('sections.ip.title')}</h2>
          <p>{t('sections.ip.p1')}</p>
          <p>{t('sections.ip.p2')}</p>

          <h2>{t('sections.rgpd.title')}</h2>
          <p>{t('sections.rgpd.p1')}</p>
          <p>{t('sections.rgpd.p2')}</p>
          <p>
            {t('sections.rgpd.p3_prefix')}<Link href="/contact">{t('sections.rgpd.p3_contact_link')}</Link>{t('sections.rgpd.p3_middle')}<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">{t('sections.rgpd.p3_cnil_link')}</a>{t('sections.rgpd.p3_suffix')}
          </p>
          <p>
            {t('sections.rgpd.p4_prefix')}<Link href="/politique-de-confidentialite">{t('sections.rgpd.p4_link')}</Link>{t('sections.rgpd.p4_suffix')}
          </p>

          <h2>{t('sections.cookies.title')}</h2>
          <p>{t('sections.cookies.body')}</p>

          <h2>{t('sections.liability.title')}</h2>
          <p>{t('sections.liability.p1')}</p>
          <p>{t('sections.liability.p2')}</p>

          <h2>{t('sections.law.title')}</h2>
          <p>{t('sections.law.body')}</p>

          <p className="legal-updated" style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {t('updated_prefix')}<time dateTime={t('updated_iso')}>{t('updated_date')}</time>.
          </p>
        </div>
      </div>
    </section>
  )
}
