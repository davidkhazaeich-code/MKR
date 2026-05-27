import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import Icon from '@/components/Icon'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return buildMetadata({
    title: t('meta.title'),
    description: t('meta.description'),
    path: '/contact',
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/contact' },
      ]} />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        compact
      />

      <section className="contact-page-section fx-grid fx-glow fx-glow-breathe fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split layout-split--balanced">
            <div className="reveal">
              <ContactForm />
            </div>

            <div className="reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="grid-3" style={{ gridTemplateColumns: '1fr' }}>
                <div className="content-card fx-grain fx-corner-glow">
                  <div style={{ color: 'var(--primary)', marginBottom: '0.8rem' }}>
                    <Icon name="mail" size={24} />
                  </div>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{t('cards.form.title')}</h3>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('cards.form.body')}
                  </span>
                </div>
                <div className="content-card fx-grain fx-corner-glow">
                  <div style={{ color: 'var(--primary)', marginBottom: '0.8rem' }}>
                    <Icon name="whatsapp" size={24} />
                  </div>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{t('cards.whatsapp.title')}</h3>
                  <a href="https://wa.me/33666177691" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('cards.whatsapp.value')}
                  </a>
                </div>
                <div className="content-card fx-grain fx-corner-glow">
                  <div style={{ color: 'var(--primary)', marginBottom: '0.8rem' }}>
                    <Icon name="instagram" size={24} />
                  </div>
                  <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{t('cards.instagram.title')}</h3>
                  <a href="https://instagram.com/mkrcamp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t('cards.instagram.value')}
                  </a>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                {t('note')}
              </p>
              <figure className="photo-card" style={{ marginTop: '1.5rem' }}>
                <img
                  src="/images/environment/mountain-road.webp"
                  alt={t('photo_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
