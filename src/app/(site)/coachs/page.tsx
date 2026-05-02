import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Coachs MMA et Lutte au Daghestan | MKR Caucasian Camp',
  description: "Formés dans les salles du Caucase. Nos coachs enseignent ce qu'ils vivent. Champions de lutte libre, vétérans MMA et un staff complet de 9 coachs expérimentés.",
  alternates: { canonical: 'https://mkrcamp.com/coachs' },
}

const COACHES = [
  {
    name: 'Magomed Magomedov',
    role: 'Coach Lutte libre',
    experience: '18 ans',
    bio: "Champion du Daghestan en lutte libre. Formé dans les académies de Makhachkala, Magomed enseigne les techniques ancestrales du Caucase. Sa méthode se concentre sur le contrôle au corps-à-corps et les projections de hanche qui ont fait la réputation du Daghestan.",
    palmares: 'Champion du Daghestan en lutte libre, Formateur équipe junior',
  },
  {
    name: 'Khasan Akhmedov',
    role: 'Coach MMA',
    experience: '14 ans',
    bio: "Vétéran du circuit MMA caucasien. Khasan combine une expertise en striking et en grappling. Sa philosophie : chaque combattant doit être dangereux debout et au sol. Il dirige les sessions de sparring au Daghestan avec une attention particulière à l'intelligence tactique.",
    palmares: '22 combats pro, Formateur fighters Eagle FC',
  },
  {
    name: 'Akhmed Bashaev',
    role: 'Coach Boxe',
    experience: '20 ans',
    bio: "Ancien boxeur professionnel, Akhmed est respecté dans tout le Caucase pour sa technique de frappe pure. Il travaille les fondamentaux : placement, timing, gestion de la distance. Ses sessions de pads au Daghestan sont redoutées et adulées en parts égales.",
    palmares: 'Champion régional boxe, 30+ combats pro',
  },
  {
    name: 'Shamil Khalilov',
    role: 'Coach Sambo',
    experience: '16 ans',
    bio: "Maître de Sambo sportif et combat, Shamil apporte une dimension rare au programme MKR. Ses techniques de soumission debout et ses transitions sol-debout sont un avantage compétitif pour tout fighter. Héritier de la grande école de Sambo daghestanaise.",
    palmares: 'Multiple médaillé Sambo, Instructeur fédéral',
  },
]

export default function CoachsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Nos Coachs', url: 'https://mkrcamp.com/coachs' },
      ]} />

      <PageHero
        label="NOS ENTRAÎNEURS"
        title="FORMÉS DANS LES<br/>SALLES DU CAUCASE"
        subtitle="Ils enseignent ce qu'ils vivent. Champions, vétérans, maîtres."
      />

      {/* Grille de coachs */}
      <section className="coachs-page-section fx-grid fx-glow fx-mask-a fx-stack-2">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="coachs-grid-extended">
            {COACHES.map((coach, i) => (
              <div key={i} className="coach-extended-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="coach-ext-photo">
                  <img
                    src={`/images/coaches/${coach.name.toLowerCase().replace(/\s+/g, '-')}.webp`}
                    alt={`${coach.name}, ${coach.role} au MKR Caucasian Camp`}
                    width={600}
                    height={800}
                    loading="lazy"
                    className="coach-photo-img"
                  />
                </div>
                <div className="coach-ext-info">
                  <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem' }}>
                    {coach.role.toUpperCase()}
                  </span>
                  <h3>{coach.name}</h3>
                  <span className="coach-ext-exp">{coach.experience} d&apos;expérience</span>
                  <p className="coach-ext-bio">{coach.bio}</p>
                  <span className="coach-ext-palmares">{coach.palmares}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/action/takedown-wrestling.webp"
        alt="Takedown de lutte au Caucase"
        label="TECHNIQUE"
        title="LA LUTTE DANS LE SANG"
        tagline="Des coachs formés dans la tradition caucasienne. Chaque takedown raconte une histoire."
      />

      {/* Methodologie */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-c fx-stack-4">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>MÉTHODE</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                LA MÉTHODE DAGHESTANAISE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                En Occident, on forme des athlètes. Au Caucase, on forge des combattants. La différence est dans la méthode :
                répétition jusqu&apos;à l&apos;automatisme, sparring quotidien contre des adversaires qui ne font pas semblant,
                et une culture où abandonner n&apos;est tout simplement pas une option.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Les techniques transmises ici n&apos;existent dans aucun manuel occidental. Elles se transmettent sur le tapis,
                de génération en génération. C&apos;est ce savoir que nos coachs partagent avec toi.
              </p>
              <p className="pull-quote">
                &laquo; Magomed t&apos;apprend des prises que tu ne verras nulle part en Europe. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Karim D. · MMA · Genève</span>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/action/sparring-mma-wall.webp"
                  alt="Sparring MMA dans une salle du Caucase"
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

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VIENS T'ENTRAÎNER AVEC EUX"
        ghostHref="/programme"
        ghostLabel="VOIR LE PROGRAMME"
      />
    </>
  )
}
