import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link, getPathname } from '@/i18n/navigation'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'
import SceneBand from '@/components/SceneBand'
import DestinationSafetyProtocol from '@/components/DestinationSafetyProtocol'
import TldrBox from '@/components/TldrBox'
import UpdatedAt from '@/components/UpdatedAt'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import PageFaq from '@/components/PageFaq'
import PriceAnchor from '@/components/PriceAnchor'
import DestinationProof from '@/components/DestinationProof'
import DestinationJsonLd from '@/components/DestinationJsonLd'
import RelatedReading from '@/components/RelatedReading'
import type { FAQItem } from '@/components/FAQAccordion'

const UPDATED = '2026-07-25'

/* Temoignages retenus pour cette page : les deux lutteurs et le grappler, dont
   celui qui parle explicitement des Daghestanais. Les profils MMA sont gardes
   pour la page Tchetchenie. */
const PROOF_IDS = ['mehdi-r', 'yassine-k', 'adam-s']

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'destinations.dagestan' })
  return localizedMetadata(
    '/destinations/dagestan',
    locale as Locale,
    t('meta.title'),
    t('meta.description'),
  )
}

const EXCURSION_KEYS = ['sulak', 'sarykum', 'gamsutl'] as const

/* Dimensions reelles des sources : elles different d'une photo a l'autre (le
   canyon est un portrait), et le 800x600 uniforme precedent etait faux pour
   les trois. */
const EXCURSION_IMAGES: Record<typeof EXCURSION_KEYS[number], { src: string; width: number; height: number }> = {
  // Vraie photo, recadree depuis l'original 3024x4032 : la version precedente
  // portait un garde-corps en travers du coin bas droit.
  sulak: { src: '/images/ruslan/environment/canyon-sulak-passerelle-hd.webp', width: 1800, height: 1125 },
  sarykum: { src: '/images/environment/sarykum-dune.webp', width: 1920, height: 1071 },
  gamsutl: { src: '/images/environment/gamsutl-village.webp', width: 1920, height: 1071 },
}

export default async function DagestanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('destinations.dagestan')

  const faqItems = t.raw('faq.items') as FAQItem[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.destinations'), url: 'https://mkrcamp.com/destinations' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/destinations/dagestan' },
      ]} />
      {/* La page decrit un lieu et ses attractions, mais n'emettait qu'un fil
          d'Ariane et une FAQ : rien ne disait de quel endroit on parle. */}
      <DestinationJsonLd
        name={t('breadcrumb.current')}
        description={t('meta.description')}
        url={`https://mkrcamp.com${getPathname({ href: '/destinations/dagestan', locale: locale as Locale })}`}
        image="https://mkrcamp.com/images/ruslan/environment/canyon-sulak-hero-v2.webp"
        addressRegion="Dagestan"
        addressCountry="RU"
        latitude={42.9849}
        longitude={47.5047}
        inLanguage={locale}
        attractions={EXCURSION_KEYS.map(key => ({
          name: t(`excursions.items.${key}.title`),
          description: t(`excursions.items.${key}.desc`),
        }))}
      />
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        /* Recadre depuis l'original 4284x5712 : l'ancien fichier faisait 896px
           de large, donc upscale et flou sur un hero pleine largeur. Le
           garde-corps et le cable du premier plan sont sortis du cadre.
           ⚠️ PageHero sert cette image en <img> BRUT, hors optimiseur : elle
           part telle quelle sur mobile. D'ou 1920x1120 et non 2400x1891, et un
           ratio proche du cadre affiche. Tant que PageHero n'est pas passe en
           next/image, garder ce fichier sous ~350 Ko. */
        image="/images/ruslan/environment/canyon-sulak-hero-v2.webp"
        imageFocusY="50%"
        imageAlt={t('hero.image_alt')}
        breadcrumb={[
          { href: '/destinations', label: t('breadcrumb.destinations') },
          { href: '/destinations/dagestan', label: t('breadcrumb.current') },
        ]}
      />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={t.raw('tldr.facts') as string[]}
        />
        <UpdatedAt date={UPDATED} />
      </div>

      <DestinationReveal
        /* La bande s'appelle « LES MONTAGNES DU DAGHESTAN » : l'ancienne photo
           etait dominee par un quad bleu au premier plan. Meme original, recadre
           au-dessus du quad, il ne reste que les cretes et la silhouette. */
        image="/images/ruslan/environment/montagnes-daghestan-cretes.webp"
        focusY="50%"
        alt={t('reveal.image_alt')}
        label={t('reveal.label')}
        title={t('reveal.title')}
        facts={[
          { label: t('reveal.facts.capitale'), value: t('reveal.facts.capitale_value') },
          { label: t('reveal.facts.altitude'), value: t('reveal.facts.altitude_value') },
          { label: t('reveal.facts.olympiques'), value: t('reveal.facts.olympiques_value') },
          { label: t('reveal.facts.khasavyurt'), value: t('reveal.facts.khasavyurt_value') },
          { label: t('reveal.facts.salles'), value: t('reveal.facts.salles_value') },
          { label: t('reveal.facts.population'), value: t('reveal.facts.population_value') },
        ]}
        badges={t.raw('reveal.badges') as string[]}
      />

      {/* Presentation */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('presentation.label')}</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', textTransform: 'uppercase' }}>{t('presentation.title')}</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('presentation.p1')}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('presentation.p2')}
            </p>
          </div>
        </div>
      </section>

      <DestinationSafetyProtocol
        narrative={
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {t('safety.p1')}
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              {t('safety.p2')}
            </p>
          </>
        }
        testimonial={{
          quote: t('safety.testimonial_quote'),
          author: t('safety.testimonial_author'),
        }}
      />

      {/* Lieux d'entraînement */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('salles.label')}</span>
            <h2>{t('salles.title')}</h2>
          </div>
          <div className="grid-2">
            {/* Dimensions reelles des sources (1600x1066). Le 800x600 precedent
                reservait un cadre 4/3 pour une photo 3/2, donc un saut de mise
                en page a chaque chargement. */}
            <figure className="photo-card reveal">
              <Image
                src="/images/action/lutte-banner-makhachkala.webp"
                alt={t('salles.photo1_alt')}
                width={1600}
                height={1066}
                sizes="(max-width: 760px) 100vw, 50vw"
                className="section-photo-img"
              />
              <figcaption>{t('salles.photo1_caption')}</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <Image
                src="/images/action/lutte-coach-gereev.webp"
                alt={t('salles.photo2_alt')}
                width={1600}
                height={1066}
                sizes="(max-width: 760px) 100vw, 50vw"
                className="section-photo-img"
              />
              <figcaption>{t('salles.photo2_caption')}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Culture & excursions */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('excursions.label')}</span>
            <h2>{t('excursions.title')}</h2>
          </div>
          <div className="grid-3">
            {EXCURSION_KEYS.map((key, i) => (
              <div key={key} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <Image
                  src={EXCURSION_IMAGES[key].src}
                  alt={t(`excursions.items.${key}.title`)}
                  width={EXCURSION_IMAGES[key].width}
                  height={EXCURSION_IMAGES[key].height}
                  sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  className="section-photo-img"
                />
                <h3 className="card-title">{t(`excursions.items.${key}.title`)}</h3>
                <p className="card-body">{t(`excursions.items.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <SceneBand
        /* Le titre dit « LE PAYS QUI FORGE LES CORPS » et l'image montrait un
           canyon, soit le 3e canyon de la page. Vue plongeante sur une salle de
           lutte entiere : la salle et le collectif sont le sujet, aucun visage
           n'est lisible a cette echelle. */
        image="/images/ruslan/lutte/salle-vue-plongeante-daghestan.webp"
        focusY="50%"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Preuve sociale AVANT le prix (meme ordre que /familles : on justifie
          avant d'annoncer). Cette page n'en avait aucune. */}
      <DestinationProof
        ids={PROOF_IDS}
        label={t('proof.label')}
        title={t('proof.title')}
        intro={t('proof.intro')}
        ctaLabel={t('proof.cta')}
        scrollAriaLabel={t('proof.scroll_aria')}
      />

      {/* Prix transparent + prochaine session + places live */}
      <PriceAnchor discipline="lutte" href="/inscription?type=session" />

      {/* Objections zone + JSON-LD FAQPage */}
      <PageFaq
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
        id="faq-dagestan"
      />

      {/* Maillage vers le blog, qui etait un silo ferme : aucune page
          commerciale ne liait un article. Place apres la FAQ et avant le CTA
          final pour ne pas detourner la conversion. */}
      <RelatedReading
        label={t('related.label')}
        title={t('related.title')}
        items={[
          {
            slug: 'combien-coute-s-entrainer-au-dagestan',
            label: t('related.cout_label'),
            hint: t('related.cout_hint'),
          },
          {
            slug: 'securite-dagestan-2026',
            label: t('related.securite_label'),
            hint: t('related.securite_hint'),
          },
          {
            slug: 'lutte-daghestanaise-guide-complet',
            label: t('related.lutte_label'),
            hint: t('related.lutte_hint'),
          },
        ]}
      />

      {/* Logistique resume */}
      <section className="logi-section fx-grid fx-stack-5">
        <div className="inner">
          <div className="group-card reveal">
            <h2>{t('logistique.title')}</h2>
            <p>{t('logistique.body')}</p>
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              {t('logistique.cta')}
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/programme/lutte"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
