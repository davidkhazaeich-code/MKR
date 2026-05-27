import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/seo'
import Icon from '@/components/Icon'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'merci' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/merci',
    noindex: true,
  })
}

export default async function MerciPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('merci')

  return (
    <section className="merci-page">
      <div className="inner">
        <div className="merci-content reveal">
          <div className="merci-icon" aria-hidden="true" style={{ color: 'var(--primary)' }}>
            <Icon name="check-circle" size={64} />
          </div>
          <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
            {t('label')}
          </span>
          <h1>{t('title_line1')}<br />{t('title_line2')}</h1>
          <p className="merci-sub">{t('sub')}</p>

          <div className="merci-steps">
            <div className="merci-step">
              <span className="merci-step-num">{t('steps.step1.num')}</span>
              <div>
                <h3>{t('steps.step1.title')}</h3>
                <p>{t('steps.step1.body')}</p>
              </div>
            </div>
            <div className="merci-step">
              <span className="merci-step-num">{t('steps.step2.num')}</span>
              <div>
                <h3>{t('steps.step2.title')}</h3>
                <p>{t('steps.step2.body')}</p>
              </div>
            </div>
            <div className="merci-step">
              <span className="merci-step-num">{t('steps.step3.num')}</span>
              <div>
                <h3>{t('steps.step3.title')}</h3>
                <p>{t('steps.step3.body')}</p>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/sessions" className="btn-primary">{t('cta.sessions')}</Link>
            <Link href="/" className="btn-ghost">{t('cta.home')}</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
