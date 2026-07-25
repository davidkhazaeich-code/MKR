import { getTranslations, setRequestLocale } from 'next-intl/server'
import { localizedMetadata } from '@/lib/i18n-helpers'
import type { Locale } from '@/i18n/routing'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import SceneBand from '@/components/SceneBand'
import PhotoStrip, { type PhotoStripItem } from '@/components/PhotoStrip'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import TldrBox from '@/components/TldrBox'
import UpdatedAt from '@/components/UpdatedAt'
import KeyFactsBand from '@/components/KeyFactsBand'
import AudienceFit from '@/components/AudienceFit'
import ProcessStrip, { type ProcessStep } from '@/components/ProcessStrip'
import PageFaq from '@/components/PageFaq'
import PriceAnchor from '@/components/PriceAnchor'
import VerticalVideoSplit from '@/components/VerticalVideoSplit'
import { getAntoineParcoursProps } from '@/data/antoine-parcours'
import type { IconName } from '@/components/Icon'
import type { FAQItem } from '@/components/FAQAccordion'

const UPDATED = '2026-07-06'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'programme.mma' })
  return localizedMetadata('/programme/mma', locale as Locale, t('meta.title'), t('meta.description'))
}

const KEY_FACT_KEYS: { key: string; icon: IconName }[] = [
  { key: 'visa', icon: 'passport' },
  { key: 'flight', icon: 'plane' },
  { key: 'training', icon: 'fire' },
  { key: 'level', icon: 'shield-check' },
  { key: 'spots', icon: 'team' },
]

const TECHNIQUE_KEYS = [
  'stand_up',
  'clinch',
  'takedowns',
  'ground_pound',
  'soumissions',
  'transitions',
] as const

const SESSION_FLOW_KEYS = [
  'echauffement',
  'technique',
  'drills',
  'sparring',
  'debrief',
] as const

export default async function ProgrammeMMAPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('programme.mma')
  const tAntoine = await getTranslations('data.antoine-parcours')
  const antoineProps = getAntoineParcoursProps('mma', tAntoine as never)

  const facts = t.raw('tldr.facts') as string[]
  const techniques = TECHNIQUE_KEYS.map((key) => ({
    title: t(`techniques.items.${key}.title`),
    desc: t(`techniques.items.${key}.desc`),
  }))
  const sessionFlow = SESSION_FLOW_KEYS.map((key) => ({
    time: t(`session_flow.steps.${key}.time`),
    activity: t(`session_flow.steps.${key}.activity`),
    desc: t(`session_flow.steps.${key}.desc`),
  }))
  const fitFor = t.raw('fit.for_items') as string[]
  const fitNot = t.raw('fit.not_items') as string[]
  const processSteps = t.raw('process.steps') as ProcessStep[]
  const faqItems = t.raw('faq.items') as FAQItem[]
  const galleryItems = t.raw('gallery.items') as PhotoStripItem[]

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: t('breadcrumb.home'), url: 'https://mkrcamp.com/' },
        { name: t('breadcrumb.programme'), url: 'https://mkrcamp.com/programme' },
        { name: t('breadcrumb.current'), url: 'https://mkrcamp.com/programme/mma' },
      ]} />
      {/* Hero illustre : photo reelle de la salle partenaire de Grozny. La page
          ouvrait sur un mur de texte, sans aucune preuve visuelle pour le
          visiteur venu de Google. */}
      <PageHero
        label={t('hero.label')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        image="/images/mma-tchechenie/sparring-cage-turquoise.webp"
        imageAlt={t('hero.image_alt')}
        breadcrumb={[
          { href: '/programme', label: t('breadcrumb.programme') },
          { href: '/programme/mma', label: t('breadcrumb.current') },
        ]}
      />

      {/* Message match avec les annonces (visa, vol, niveau, places) */}
      <KeyFactsBand
        facts={KEY_FACT_KEYS.map(({ key, icon }) => ({
          icon,
          label: t(`key_facts.${key}.label`),
          sub: t(`key_facts.${key}.sub`),
        }))}
      />

      <VerticalVideoSplit {...antoineProps} />

      <div className="inner">
        <TldrBox
          title={t('tldr.title')}
          facts={facts}
        />
        <UpdatedAt date={UPDATED} />
      </div>

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('description.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>{t('description.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('description.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('description.p2')}
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/mma-tchechenie/pads-akhmat-power-fairtex.webp"
                  alt={t('description.img1_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/mma-tchechenie/crochet-rca-coach.webp"
                  alt={t('description.img2_alt')}
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

      {/* Bande d'ambiance bornee a 44vh (remplace CinematicReveal et ses
          2,1 viewports de scroll sticky pour une seule photo). */}
      <SceneBand
        image="/images/mma-tchechenie/sparring-face-a-face.webp"
        alt={t('cinematic.alt')}
        label={t('cinematic.label')}
        title={t('cinematic.title')}
        tagline={t('cinematic.tagline')}
      />

      {/* Preuve sociale ecurie (photo reelle, nom uniquement en legende factuelle) */}
      <section className="logi-section fx-grid fx-stack-1" style={{ paddingBlock: '4rem 3rem' }}>
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('chimaev.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>{t('chimaev.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('chimaev.p1_before')}
                <strong>{t('chimaev.p1_name')}</strong>
                {t('chimaev.p1_after')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('chimaev.p2')}
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/mma-tchechenie/chimaev-ceinture-ufc.webp"
                  alt={t('chimaev.img_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <figcaption style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {t('chimaev.img_caption')}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Briefing & encadrement */}
      <section className="logi-section fx-grid fx-stack-1" style={{ paddingBlock: '3rem 4rem' }}>
        <div className="inner">
          <div className="layout-split layout-split--balanced reveal" style={{ alignItems: 'center' }}>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/mma-tchechenie/briefing-coach-4-combattants.webp"
                  alt={t('briefing.img_alt')}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>{t('briefing.label')}</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>{t('briefing.title')}</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('briefing.p1')}
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                {t('briefing.p2')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <DisciplineTechniques items={techniques} />

      {/* Densite photo : 6 vraies photos du club de Grozny, bandeau swipe en mobile. */}
      <PhotoStrip
        items={galleryItems}
        label={t('gallery.label')}
        title={t('gallery.title')}
        intro={t('gallery.intro')}
        scrollAriaLabel={t('gallery.scroll_aria')}
        variant="grid"
      />

      <DisciplineSessionFlow
        steps={sessionFlow}
        hoursNote={
          <>
            {t('session_flow.hours_note_prefix')}<strong>{t('session_flow.hours_note_morning')}</strong>{t('session_flow.hours_note_and')}<strong>{t('session_flow.hours_note_afternoon')}</strong>{t('session_flow.hours_note_suffix')}
          </>
        }
      />

      {/* Prix transparent + prochaine session + places live */}
      <PriceAnchor discipline="mma" href="/inscription?type=session" />

      {/* Qualification self-select (niveau Avance) */}
      <AudienceFit
        label={t('fit.label')}
        title={t('fit.title')}
        forTitle={t('fit.for_title')}
        forItems={fitFor}
        notTitle={t('fit.not_title')}
        notItems={fitNot}
        note={t('fit.note')}
      />

      {/* Parcours candidature -> depart */}
      <ProcessStrip
        label={t('process.label')}
        title={t('process.title')}
        steps={processSteps}
        note={t('process.note')}
      />

      {/* Objections + JSON-LD FAQPage */}
      <PageFaq
        label={t('faq.label')}
        title={t('faq.title')}
        items={faqItems}
        id="faq-mma"
      />

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel={t('section_cta.primary_label')}
        ghostHref="/destinations/tchetchenie"
        ghostLabel={t('section_cta.ghost_label')}
      />
    </>
  )
}
