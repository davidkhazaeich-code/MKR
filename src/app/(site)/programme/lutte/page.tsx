import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import TldrBox from '@/components/TldrBox'

export const metadata = buildMetadata({
  title: 'Programme Lutte libre au Daghestan | MKR Caucasian Camp',
  description: "Programme de lutte libre au Caucase. Méthodes daghestanaises ancestrales, leg rides, chain wrestling, sparring quotidien, coachs champions du monde.",
  path: '/programme/lutte',
})
const TECHNIQUES = [
  { title: 'Lutte libre', desc: 'Takedowns explosifs, contrôle des jambes, scrambles. La base du combat au Daghestan.' },
  { title: 'Leg rides', desc: 'Spécialité daghestanaise. Contrôle au sol avec les jambes. Technique introuvable en Europe.' },
  { title: 'Chain wrestling', desc: 'Enchaînement de takedowns. Si le premier échoue, le deuxième est déjà en route.' },
  { title: 'Funk rolls', desc: 'Reprises de position acrobatiques. Transformer une situation défensive en attaque.' },
  { title: 'Mat returns', desc: "Ramener l'adversaire au sol depuis la position debout. Technique de contrôle." },
  { title: 'Défense de takedown', desc: "Sprawl, underhooks, contre-attaques. Annuler l'attaque adverse et reprendre l'initiative." },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Échauffement', desc: 'Course, exercices au sol, mobilité des hanches.' },
  { time: '30 min', activity: 'Technique', desc: 'Démonstration par le coach. Répétition par paires. Corrections individuelles.' },
  { time: '20 min', activity: 'Situations', desc: 'Positions de départ imposées. Attaque-défense chronométrée.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 6 minutes (rythme compétition). Rotation partenaires.' },
  { time: '10 min', activity: 'Conditioning', desc: 'Circuit final : pompes, squats, pont de lutte, gainage.' },
]

export default function ProgrammeLuttePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Programme', url: 'https://mkrcamp.com/programme' },
        { name: 'Lutte', url: 'https://mkrcamp.com/programme/lutte' },
      ]} />
      <PageHero
        label="LUTTE · DAGHESTAN"
        title="LA DISCIPLINE QUI A FORGÉ LE CAUCASE"
        subtitle="Lutte libre uniquement, au cœur du Daghestan. Les méthodes ancestrales transmises dans les salles de Makhachkala et Kaspiysk."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/lutte', label: 'Lutte' },
        ]}
      />

      <div className="inner">
        <TldrBox
          title="En bref · Programme Lutte"
          facts={[
            "Lutte libre exclusivement (pas de gréco-romaine) au Daghestan, Makhachkala et Kaspiysk.",
            "15 places par session officielle. Ouvert aux adultes et enfants 8-17 ans avec parent (tunnel Famille).",
            "6 modules techniques : takedowns, leg rides daghestanais, chain wrestling, funk rolls, mat returns, défense.",
            "Sparring quotidien avec lutteurs locaux issus de la filière qui a produit 30+ médaillés olympiques.",
            "Horaires : sessions à 10h30 et 17h30, 6 jours sur 7. Combo Lutte + MMA disponible en Sur Mesure.",
          ]}
        />
      </div>

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LUTTE AU DAGHESTAN</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Au Daghestan, la lutte n&apos;est pas un sport. C&apos;est une identité. Chaque village a son champion,
                chaque famille transmet ses techniques. Les méthodes daghestanaises ont produit plus de champions
                olympiques de lutte par habitant que n&apos;importe quel autre endroit au monde.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le programme MKR te donne accès à ce savoir : lutte libre exclusivement, et les techniques
                spécifiques du Caucase que tu ne trouveras dans aucune académie européenne.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/takedown-wrestling.webp"
                  alt="Takedown de lutte, entraînement au Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/action/ground-control.webp"
                  alt="Contrôle au sol en lutte, technique daghestanaise"
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

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/takedown-wrestling.webp"
        alt="Takedown de lutte libre en entraînement au Caucase"
        label="PROJECTION"
        title="L'ART DU TAKEDOWN"
        tagline="Lutte libre. Les techniques qui ont forgé les champions du Caucase."
      />

      <DisciplineTechniques items={TECHNIQUES} />

      <DisciplineSessionFlow
        steps={SESSION_FLOW}
        hoursNote={<>Horaires officiels Lutte adultes : <strong>matin 10h30</strong> et <strong>après-midi 17h30</strong>. Pas de chevauchement avec les sessions MMA.</>}
      />

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="POSTULER · LUTTE DAGHESTAN"
        ghostHref="/destinations/dagestan"
        ghostLabel="DÉCOUVRIR LA DESTINATION"
      />
    </>
  )
}
