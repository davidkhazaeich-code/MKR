import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import FAQAccordion from '@/components/FAQAccordion'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import RefundPolicyTable from '@/components/RefundPolicyTable'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'comment-ca-marche' })
  return localizedMetadata('/comment-ca-marche', locale as Locale, t('meta.title'), t('meta.description'))
}

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'] as const
const PAY_KEYS = ['virement', 'especes', 'autre'] as const
const FAQ_KEYS = ['q1', 'q2', 'q3'] as const

export default async function CommentCaMarchePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('comment-ca-marche')

  const processFaq = FAQ_KEYS.map((key) => ({
    question: t(`process_faq.items.${key}.question`),
    answer: t(`process_faq.items.${key}.answer`),
  }))

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/comment-ca-marche' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp"
        /* focus 60% : portrait vertical : a 35% le visage d'Antoine etait hors cadre */
        imageFocusY="60%"
        imageAlt={t('hero.image_alt')}
      />

      {/* Flow 6 etapes */}
      <section className="process-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="process-flow">
            {STEP_KEYS.map((key, i) => (
              <div key={key} className={`process-step reveal${i % 2 === 1 ? ' process-step--alt' : ''}`} style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="process-step-num">{t(`steps.items.${key}.num`)}</div>
                <div className="process-step-content">
                  <span className="process-step-detail">{t(`steps.items.${key}.detail`)}</span>
                  <h3>{t(`steps.items.${key}.title`)}</h3>
                  <p>{t(`steps.items.${key}.desc`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Politique d'annulation */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('annulation.label')}</span>
            <h2>{t('annulation.title')}</h2>
          </div>
          <div className="reveal" style={{ maxWidth: '600px' }}>
            <RefundPolicyTable />
          </div>
        </div>
      </section>

      {/* Moyens de paiement */}
      <section className="logi-section fx-grid fx-glow fx-mask-a fx-stack-5">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('paiement.label')}</span>
            <h2>{t('paiement.title')}</h2>
          </div>
          <div className="grid-3">
            {PAY_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{t(`paiement.items.${key}.title`)}</h3>
                <p className="card-body">{t(`paiement.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ process.
          fx-stack-6 et pas 4 : l'echelle doit monter dans l'ordre du DOM, la
          section precedente est en fx-stack-5. A 4, elle passait derriere et sa
          crete de montagne n'etait tout simplement pas visible. */}
      <section className="faq-page-section fx-texture-concrete fx-mask-c fx-stack-6">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('process_faq.label')}</span>
            <h2>{t('process_faq.title')}</h2>
          </div>
          <FAQAccordion items={processFaq} id="process-faq" />
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/faq"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
