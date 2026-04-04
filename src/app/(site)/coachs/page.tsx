import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Nos Coachs | MKR Caucasian Camp | Entraineurs MMA & Lutte du Caucase',
  description: "Formes dans les salles du Caucase. Nos coachs enseignent ce qu'ils vivent. Champions de lutte, veterans MMA, maitres du Sambo.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/coachs' },
}

const COACHES = [
  {
    name: 'Zurab Khabelov',
    role: 'Coach Lutte Greco-romaine',
    experience: '18 ans',
    bio: "Champion national de lutte greco-romaine. Forme dans les academies de Makhachkala, Zurab enseigne les techniques ancestrales du Caucase. Sa methode se concentre sur le controle au corps-a-corps et les projections de hanche qui ont fait la reputation du Dagestan.",
    palmares: 'Champion national lutte, Formateur equipe olympique junior',
  },
  {
    name: 'Giorgi Meladze',
    role: 'Coach MMA',
    experience: '14 ans',
    bio: "Veteran du circuit MMA professionnel georgien. Giorgi combine une expertise en striking et en grappling. Sa philosophie : chaque combattant doit etre dangereux debout et au sol. Il dirige les sessions de sparring avec une attention particuliere a l'intelligence tactique.",
    palmares: '22 combats pro, Formateur fighters Eagle FC',
  },
  {
    name: 'Tamaz Kvaratskhelia',
    role: 'Coach Boxe',
    experience: '20 ans',
    bio: "Ancien boxeur professionnel, Tamaz est respecte dans tout le Caucase pour sa technique de frappe pure. Il travaille les fondamentaux : placement, timing, gestion de la distance. Ses sessions de pads sont redoutees et adulees en parts egales.",
    palmares: 'Champion regional boxe, 30+ combats pro',
  },
  {
    name: 'Levan Skhirtladze',
    role: 'Coach Sambo',
    experience: '16 ans',
    bio: "Maitre de Sambo sportif et combat, Levan apporte une dimension unique au programme MKR. Ses techniques de soumission debout et ses transitions sol-debout sont un avantage competitif pour tout fighter. Forme a Tbilissi et perfectionne au Dagestan.",
    palmares: 'Multiple medaille Sambo, Instructeur federal',
  },
]

export default function CoachsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Nos Coachs', url: 'https://mkrcaucasiancamp.com/coachs' },
      ]} />

      <PageHero
        label="NOS ENTRAINEURS"
        title="FORMES DANS LES<br/>SALLES DU CAUCASE"
        subtitle="Ils enseignent ce qu'ils vivent. Champions, veterans, maitres."
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
                  <span className="coach-ext-exp">{coach.experience} d&apos;experience</span>
                  <p className="coach-ext-bio">{coach.bio}</p>
                  <span className="coach-ext-palmares">{coach.palmares}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic action banner */}
      <section className="cinematic-banner fx-grid fx-stack-3">
        <div className="inner">
          <img
            src="/images/action/takedown-wrestling.webp"
            alt="Takedown de lutte au Caucase"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

      {/* Methodologie */}
      <section className="dag-security fx-texture-concrete fx-glow fx-mask-c fx-stack-4">
        <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" />
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>METHODE</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
                LA METHODE DAGHESTANAISE
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1.5rem' }}>
                En Occident, on forme des athletes. Au Caucase, on forge des combattants. La difference est dans la methode :
                repetition jusqu&apos;a l&apos;automatisme, sparring quotidien contre des adversaires qui ne font pas semblant,
                et une culture ou abandonner n&apos;est tout simplement pas une option.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Les techniques transmises ici n&apos;existent dans aucun manuel occidental. Elles se transmettent sur le tapis,
                de generation en generation. C&apos;est ce savoir que nos coachs partagent avec toi.
              </p>
              <p className="pull-quote">
                &laquo; Zurab t&apos;apprend des prises que tu ne verras nulle part en Europe. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Karim D. · MMA · Geneve</span>
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
        primaryLabel="VIENS T'ENTRAINER AVEC EUX"
        ghostHref="/programme"
        ghostLabel="VOIR LE PROGRAMME"
      />
    </>
  )
}
