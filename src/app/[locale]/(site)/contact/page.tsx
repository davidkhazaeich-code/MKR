import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import PageFaq from '@/components/PageFaq'
import PhotoStrip from '@/components/PhotoStrip'
import ProcessStrip, { type ProcessStep } from '@/components/ProcessStrip'
import Icon from '@/components/Icon'
import { whatsappUrl } from '@/data/site'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  return localizedMetadata('/contact', locale as Locale, t('meta.title'), t('meta.description'))
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  // Parcours canonique partage : /contact et /sessions le rendent tel quel, les
  // pages camp n'en reprennent que la promesse. Une seule copie a maintenir.
  const tp = await getTranslations('common.process')

  const galleryPhotos = [
    { src: '/images/ruslan/action/mma-adultes-cercle.webp', key: 'one' },
    { src: '/images/mma-tchechenie/pads-boxe-club.webp', key: 'two' },
    { src: '/images/ruslan/lutte/salle-vue-plongeante-daghestan.webp', key: 'three' },
    { src: '/images/ruslan/environment/canyon-sulak-passerelle-hd.webp', key: 'four' },
  ]

  const faqItems = (['delay', 'language', 'who', 'followup', 'call', 'cancel'] as const).map((key) => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  }))

  const processSteps: ProcessStep[] = (['one', 'two', 'three', 'four'] as const).map((key) => ({
    title: tp(`items.${key}.title`),
    desc: tp(`items.${key}.desc`),
  }))

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/contact' },
      ]} />

      {/* Breadcrumb rend « Accueil » de lui-meme : on ne lui passe QUE la page
          courante, sinon le fil affiche « Accueil / Accueil ». */}
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        breadcrumb={[{ href: '/contact', label: t('breadcrumb.current') }]}
        image="/images/mma-tchechenie/briefing-coach-4-combattants.webp"
        imageAlt={t('hero.image_alt')}
        imageFocusY="40%"
      />

      {/* Ligne directrice AVANT le formulaire (demande David 2026-08-21) : des
          prospects renoncent a candidater par peur de s'engager. La peur doit
          tomber avant qu'on demande de remplir quoi que ce soit, pas apres.
          Ruslan n'a plus sa grosse carte ici : il est passe en encart compact
          a cote du formulaire, la ou on decide d'ecrire. */}
      <ProcessStrip
        variant="line"
        label={tp('label')}
        title={tp('title')}
        steps={processSteps}
        pledge={{ title: tp('pledge.title'), body: tp('pledge.body') }}
        note={tp('note')}
      />

      {/* Le formulaire arrive juste apres Ruslan (demande David 2026-08-21) :
          c'est l'action principale de la page, et AUCUNE adresse email n'est
          publiee sur le site pour ne pas nourrir les moissonneurs de spam. */}
      <section className="ctp-form-section fx-grid fx-glow fx-glow-breathe fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <header className="ctp-head reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('form_section.label')}
            </span>
            <h2>{t('form_section.title')}</h2>
            <p className="ctp-notice">
              <Icon name="info" size={16} />
              <span>
                <strong>{t('form_section.notice')}</strong>{' '}
                <Link href="/inscription">{t('form_section.notice_link')}</Link>
              </span>
            </p>
          </header>

          <div className="ctp-form-grid">
            <div className="reveal">
              {/* useSearchParams impose une frontiere Suspense, sinon le build
                  bascule /contact en rendu dynamique. Meme montage que GuideForm. */}
              <Suspense fallback={<div className="contact-form ctp-form-skeleton" aria-hidden="true" />}>
                <ContactForm />
              </Suspense>
            </div>

            <aside className="ctp-practical reveal" style={{ transitionDelay: '0.1s' }}>
              {/* Ruslan en encart compact plutot qu'en grosse carte pleine
                  largeur (demande David) : il est ici parce que c'est le moment
                  ou l'on decide d'ecrire, et il faut savoir a qui. */}
              <div className="ctp-who">
                <div className="ctp-who-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/ruslan/ruslan-portrait-chemise-noire.webp"
                    alt={t('who.photo_alt')}
                    width={702}
                    height={840}
                    loading="lazy"
                  />
                </div>
                <div className="ctp-who-body">
                  <p className="ctp-who-name">{t('who.name')}</p>
                  <p className="ctp-who-role">{t('who.role')}</p>
                  <p className="ctp-who-langs">
                    <span className="ctp-who-langs-label">{t('who.languages_label')}</span>
                    {t('who.languages_value')}
                  </p>
                </div>
              </div>

              {/* Seule porte de sortie hors formulaire : WhatsApp. Le NUMERO
                  n'est jamais ecrit (decision David 2026-08-21, anti-scraping),
                  il ne vit que dans le href. */}
              <a
                className="ctp-whatsapp-btn"
                href={whatsappUrl(t('whatsapp.prefill'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="whatsapp" size={20} />
                <span>{t('whatsapp.cta')}</span>
              </a>

              <h3 className="ctp-practical-title">{t('form_section.practical.title')}</h3>
              <dl className="ctp-practical-list">
                <div className="ctp-practical-row">
                  <span className="ctp-practical-icon" aria-hidden="true"><Icon name="clock" size={18} /></span>
                  <div>
                    <dt>{t('form_section.practical.delay.label')}</dt>
                    <dd>{t('form_section.practical.delay.value')}</dd>
                  </div>
                </div>
                <div className="ctp-practical-row">
                  <span className="ctp-practical-icon" aria-hidden="true"><Icon name="shield-check" size={18} /></span>
                  <div>
                    <dt>{t('form_section.practical.privacy.label')}</dt>
                    <dd>
                      {t('form_section.practical.privacy.value')}{' '}
                      <Link href="/politique-de-confidentialite" className="ctp-practical-link">
                        {t('form_section.practical.privacy.link')}
                      </Link>
                    </dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Aiguillage : quatre demandes sur cinq ont deja leur page. Les envoyer
          la plutot que dans la boite mail leur fait gagner 48 h. */}
      <section className="ctp-routes">
        <div className="inner">
          <header className="ctp-head reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('routes.label')}
            </span>
            <h2>{t('routes.title')}</h2>
            <p className="ctp-head-intro">{t('routes.intro')}</p>
          </header>

          <ul className="ctp-routes-list reveal">
            <li className="ctp-route">
              <Link href="/inscription" className="ctp-route-link">
                <span className="ctp-route-icon" aria-hidden="true"><Icon name="send" size={20} /></span>
                <span className="ctp-route-text">
                  <span className="ctp-route-title">{t('routes.items.inscription.title')}</span>
                  <span className="ctp-route-body">{t('routes.items.inscription.body')}</span>
                  <span className="ctp-route-cta">{t('routes.items.inscription.cta')}</span>
                </span>
                <span className="ctp-route-chevron" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
              </Link>
            </li>
            <li className="ctp-route">
              <Link href="/familles" className="ctp-route-link">
                <span className="ctp-route-icon" aria-hidden="true"><Icon name="parent" size={20} /></span>
                <span className="ctp-route-text">
                  <span className="ctp-route-title">{t('routes.items.famille.title')}</span>
                  <span className="ctp-route-body">{t('routes.items.famille.body')}</span>
                  <span className="ctp-route-cta">{t('routes.items.famille.cta')}</span>
                </span>
                <span className="ctp-route-chevron" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
              </Link>
            </li>
            <li className="ctp-route">
              <Link href="/clubs-groupes" className="ctp-route-link">
                <span className="ctp-route-icon" aria-hidden="true"><Icon name="team" size={20} /></span>
                <span className="ctp-route-text">
                  <span className="ctp-route-title">{t('routes.items.groupe.title')}</span>
                  <span className="ctp-route-body">{t('routes.items.groupe.body')}</span>
                  <span className="ctp-route-cta">{t('routes.items.groupe.cta')}</span>
                </span>
                <span className="ctp-route-chevron" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
              </Link>
            </li>
            <li className="ctp-route">
              <Link href="/logistique" className="ctp-route-link">
                <span className="ctp-route-icon" aria-hidden="true"><Icon name="passport" size={20} /></span>
                <span className="ctp-route-text">
                  <span className="ctp-route-title">{t('routes.items.logistique.title')}</span>
                  <span className="ctp-route-body">{t('routes.items.logistique.body')}</span>
                  <span className="ctp-route-cta">{t('routes.items.logistique.cta')}</span>
                </span>
                <span className="ctp-route-chevron" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
              </Link>
            </li>
            {/* La 5e demande n'a pas de page dediee : elle remonte au formulaire
                avec le sujet deja choisi (ContactForm lit `?sujet=`). */}
            <li className="ctp-route ctp-route--wide">
              <Link href={{ pathname: '/contact', query: { sujet: 'presse' } }} className="ctp-route-link">
                <span className="ctp-route-icon" aria-hidden="true"><Icon name="briefcase" size={20} /></span>
                <span className="ctp-route-text">
                  <span className="ctp-route-title">{t('routes.items.presse.title')}</span>
                  <span className="ctp-route-body">{t('routes.items.presse.body')}</span>
                  <span className="ctp-route-cta">{t('routes.items.presse.cta')}</span>
                </span>
                <span className="ctp-route-chevron" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <PhotoStrip
        className="ctp-gallery"
        label={t('gallery.label')}
        title={t('gallery.title')}
        intro={t('gallery.intro')}
        scrollAriaLabel={t('gallery.scroll_aria')}
        items={galleryPhotos.map((photo) => ({
          src: photo.src,
          alt: t(`gallery.photos.${photo.key}.alt`),
          caption: t(`gallery.photos.${photo.key}.caption`),
        }))}
      />

      <PageFaq
        id="contact-faq"
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
        image={{ src: '/images/mma-tchechenie/pads-coach-orange.webp', alt: t('faq.image_alt') }}
      />
    </>
  )
}
