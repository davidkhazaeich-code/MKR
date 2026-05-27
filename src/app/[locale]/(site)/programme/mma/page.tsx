import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import TldrBox from '@/components/TldrBox'
import VerticalVideoSplit from '@/components/VerticalVideoSplit'
import {
  ANTOINE_PARCOURS_ASSETS,
  ANTOINE_PARCOURS_VARIANTS,
} from '@/data/antoine-parcours'

export const metadata = buildMetadata({
  title: 'Programme MMA en Tchétchénie | MKR Caucasian Camp',
  description: "Programme MMA complet à Grozny : stand-up, clinch, takedowns, soumissions, transitions. Sparring quotidien avec les combattants Akhmat.",
  path: '/programme/mma',
})
const TECHNIQUES = [
  { title: 'Stand-up', desc: 'Boxe, kickboxing, coups de coude et de genou. Travail de distance et de timing.' },
  { title: 'Clinch', desc: 'Contrôle mural, dirty boxing, projections depuis le clinch. Spécialité caucasienne.' },
  { title: 'Takedowns', desc: 'Singles, doubles, body locks. Intégration des techniques de lutte dans le MMA.' },
  { title: 'Ground et Pound', desc: 'Contrôle au sol, frappe en position dominante. Gestion de la garde.' },
  { title: 'Soumissions', desc: 'Étranglements, clés de bras et de jambes. Enchaînements depuis les transitions.' },
  { title: 'Transitions', desc: 'Passage debout-sol fluide. Scrambles, reprises de position. Le point fort du Caucase.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Échauffement', desc: 'Mobilité, activation, shadow boxing.' },
  { time: '30 min', activity: 'Technique', desc: 'Démonstration et répétition par paires. Focus du jour.' },
  { time: '20 min', activity: 'Drills', desc: 'Situations de combat, enchaînements, timing.' },
  { time: '30 min', activity: 'Sparring', desc: 'Rounds de 5 minutes. Intensité adaptée au niveau.' },
  { time: '10 min', activity: 'Débrief', desc: 'Retour du coach, points clés, feedback individuel.' },
]

export default function ProgrammeMMAPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Programme', url: 'https://mkrcamp.com/programme' },
        { name: 'MMA', url: 'https://mkrcamp.com/programme/mma' },
      ]} />
      <PageHero
        label="MMA · TCHÉTCHÉNIE"
        title="FRAPPE. PROJETTE. SOUMETS."
        subtitle="Programme MMA complet à Grozny, Tchétchénie. Les méthodes de l'écurie Akhmat et de la nouvelle génération du combat."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/mma', label: 'MMA' },
        ]}
      />

      <VerticalVideoSplit
        {...ANTOINE_PARCOURS_ASSETS}
        {...ANTOINE_PARCOURS_VARIANTS.mma}
      />

      <div className="inner">
        <TldrBox
          title="En bref · Programme MMA"
          facts={[
            "Camp MMA exclusif à Grozny, Tchétchénie. 15 places par session officielle.",
            "Niveau Avancé minimum exigé (5+ ans de pratique régulière ou compétiteur).",
            "6 modules techniques : stand-up, clinch, takedowns, ground & pound, soumissions, transitions.",
            "Sparring quotidien avec les combattants de l'écurie Akhmat Fight Club et de la scène MMA tchétchène.",
            "Horaires : sessions à 11h00 et 18h00, 6 jours sur 7. Combo Lutte + MMA disponible en Sur Mesure.",
          ]}
        />
      </div>

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>MMA EN TCHÉTCHÉNIE</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                La Tchétchénie est l&apos;un des écosystèmes MMA les plus durs au monde. Les coachs partenaires de
                MKR enseignent un MMA complet, hérité de la tradition de la lutte et enrichi par des années de
                compétition internationale au sein de l&apos;Akhmat Fight Club et des structures de Grozny.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Chaque session est structurée : technique, drills, sparring. Le niveau s&apos;adapte à chaque
                participant, mais l&apos;intensité reste élevée pour tous. Le camp MMA est exclusivement basé à Grozny.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/mma-tchechenie/pads-direct-kadyrov.webp"
                  alt="Sparring pads MMA dans la salle Akhmat Fight Club de Grozny, Tchétchénie, devant le portrait de Ramzan Kadyrov"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/mma-tchechenie/crochet-rca-coach.webp"
                  alt="Combattant exécute un crochet précis sur pads de coach, équipement RCA, salle de Grozny"
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
        image="/images/mma-tchechenie/sparring-face-a-face.webp"
        alt="Sparring MMA intense face à face dans la salle Akhmat de Grozny, gants rouges, regards concentrés"
        label="LE NIVEAU TCHÉTCHÈNE"
        title="SPARRER AVEC LES MEILLEURS"
        tagline="Sessions partagées avec les combattants Akhmat Fight Club et la nouvelle vague de Grozny. L'intensité que tu ne reproduiras nulle part en Europe."
      />

      {/* Preuve sociale Chimaev */}
      <section className="logi-section fx-grid fx-stack-1" style={{ paddingBlock: '4rem 3rem' }}>
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>NIVEAU DU SPARRING</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>L&apos;ÉCURIE DES CHAMPIONS</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                La salle d&apos;Akhmat Fight Club entraîne plusieurs combattants du top mondial, dont
                <strong> Khamzat Chimaev</strong>, top 5 UFC poids welters. Nos coachs partenaires sont les
                mêmes qui forment cette génération.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Pendant ton camp, tu partages le tapis avec des combattants qui ont ce niveau dans le sang
                et qui calibrent leur sparring à ton niveau. La pression et la précision technique sont
                immédiatement perceptibles.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/mma-tchechenie/chimaev-ceinture-ufc.webp"
                  alt="Khamzat Chimaev, top 5 UFC poids welters, dans la salle Akhmat Fight Club de Grozny avec un coach tenant une ceinture UFC interim"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <figcaption style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Khamzat Chimaev (top 5 UFC welters) · salle Akhmat Fight Club, Grozny
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
                  alt="Coach Akhmat Power en briefing avec 4 combattants après la session technique"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ENCADREMENT</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>DÉBRIEF APRÈS CHAQUE SESSION</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Les coachs Akhmat ne te laissent jamais finir une session sans débrief technique. Les
                corrections sont précises, individuelles, et reposent sur des milliers de versions du
                même geste observées et corrigées.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Cette boucle technique courte (technique, drills, sparring, débrief) est l&apos;ADN
                de l&apos;école tchétchène et explique pourquoi les combattants de Grozny progressent
                aussi vite.
              </p>
            </div>
          </div>
        </div>
      </section>

      <DisciplineTechniques items={TECHNIQUES} />

      <DisciplineSessionFlow
        steps={SESSION_FLOW}
        hoursNote={<>Horaires officiels MMA : <strong>matin 11h00</strong> et <strong>après-midi 18h00</strong>. Pas de chevauchement avec les sessions Lutte.</>}
      />

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="POSTULER · MMA TCHÉTCHÉNIE"
        ghostHref="/destinations/tchetchenie"
        ghostLabel="DÉCOUVRIR LA DESTINATION"
      />
    </>
  )
}
