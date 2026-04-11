import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Temoignages | MKR Caucasian Camp | Avis Athletes',
  description: "Ils sont venus, ils racontent. Temoignages video et ecrits d'athletes qui ont vecu l'experience MKR au Caucase.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/temoignages' },
}

const VIDEO_TESTIMONIALS = [
  { img: '/images/testimonials/video-thumb-1.webp', name: 'Mehdi R.', discipline: 'Lutte Libre · Paris', label: 'Interview post-camp' },
  { img: '/images/testimonials/video-thumb-2.webp', name: 'Thomas B. & Karim D.', discipline: 'Boxe · MMA', label: 'Retour de session' },
  { img: '/images/testimonials/video-thumb-3.webp', name: 'Yassine K.', discipline: 'Grappling · Bruxelles', label: 'Coulisses du camp' },
  { img: '/images/testimonials/video-thumb-4.webp', name: 'Le groupe', discipline: 'Session Automne 2025', label: 'Bilan collectif' },
]

const TESTIMONIALS = [
  { name: 'Mehdi R.', discipline: 'Lutte Libre · Paris', quote: "Trois semaines qui ont change ma facon de me battre. La durete des entrainements m'a oblige a aller chercher ce que je n'avais jamais touche.", img: '/images/testimonials/mehdi-r.webp' },
  { name: 'Karim D.', discipline: 'MMA · Geneve', quote: "Le niveau des coachs est inegalable. Zurab t'apprend des prises que tu ne verras nulle part en Europe. J'y retourne l'annee prochaine.", img: '/images/testimonials/karim-d.webp' },
  { name: 'Thomas B.', discipline: 'Boxe · Lyon', quote: "Deux semaines apres le retour, j'ai remporte mon premier titre regional. Ce que j'ai construit la-bas, aucun gym en France ne pouvait me donner.", img: '/images/testimonials/thomas-b.webp' },
  { name: 'Yassine K.', discipline: 'Grappling · Bruxelles', quote: "Un mois de camp qui vaut deux ans de salle. Les Dagestanais t'apprennent a souffrir avec le sourire. Je suis revenu transforme.", img: '/images/testimonials/yassine-k.webp' },
  { name: 'Romain V.', discipline: 'Sambo · Toulouse', quote: "Je suis parti seul, sans parler russe. L'accueil est incroyable. Sur le tapis, le niveau est brutal. Exactement ce que je cherchais.", img: '/images/testimonials/romain-v.webp' },
  { name: 'Adam S.', discipline: 'Lutte · Montreal', quote: "Le Caucase, c'est une autre planete. Les entrainements du matin a 6h t'apprennent ce que c'est que la discipline. Je repars l'ete prochain.", img: '/images/testimonials/adam-s.webp' },
  { name: 'Lucas M.', discipline: 'MMA · Zurich', quote: "Trois semaines, six kilos de transpiration et une vision du combat totalement differente. Ce camp m'a redonne faim de competition.", img: '/images/testimonials/lucas-m.webp' },
  { name: 'Amine B.', discipline: 'Jiu-Jitsu · Lyon', quote: "Les coachs du camp connaissent des techniques que tu ne trouveras dans aucun livre. Une experience sportive et humaine que je conseille a tout competiteur.", img: '/images/testimonials/amine-b.webp' },
  { name: 'Pierre L.', discipline: 'Kickboxing · Nantes', quote: "Le groupe, l'ambiance, les montagnes en fond de tapis. On touche quelque chose de rare. Revenu avec une medaille et des souvenirs pour la vie.", img: '/images/testimonials/pierre-l.webp' },
]

function Stars() {
  return (
    <div className="testi-stars" role="img" aria-label="5 etoiles sur 5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="7,1 9,5 13,5.5 10,8.5 10.5,13 7,11 3.5,13 4,8.5 1,5.5 5,5" />
        </svg>
      ))}
    </div>
  )
}

export default function TemoignagesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Temoignages', url: 'https://mkrcaucasiancamp.com/temoignages' },
      ]} />

      <PageHero
        label="TEMOIGNAGES"
        title="ILS SONT VENUS.<br/>ILS RACONTENT."
        subtitle="Des athletes de toute l'Europe. Un seul verdict."
      />

      {/* Videos */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VIDEOS</span>
            <h2>TEMOIGNAGES VIDEO</h2>
          </div>
          <div className="grid-2">
            {VIDEO_TESTIMONIALS.map((v, i) => (
              <div key={i} className="content-card reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img
                    src={v.img}
                    alt={`Temoignage video de ${v.name}`}
                    width={800}
                    height={450}
                    loading="lazy"
                    className="section-photo-img"
                    style={{ aspectRatio: '16/9', objectFit: 'cover', width: '100%' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <svg viewBox="0 0 40 40" width="48" height="48" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="#F8F8F8" strokeWidth="1.5" />
                      <polygon points="16,12 30,20 16,28" fill="#F8F8F8" />
                    </svg>
                  </div>
                  <span style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', fontFamily: 'var(--font-barlow-condensed)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2em 0.6em', fontWeight: 600 }}>{v.label}</span>
                </div>
                <span className="testi-name">{v.name}</span>
                <span className="testi-discipline">{v.discipline}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/communal-meal.webp"
        alt="Athletes et coachs reunis autour d'un repas au camp"
        label="FRATERNITE"
        title="CE QU&apos;ILS EN DISENT"
        tagline="Des liens forges sur le tapis et autour de la table. Une experience qui marque."
      />

      {/* Grid temoignages texte */}
      <section className="logi-section logi-alt fx-texture-concrete fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>ECRITS</span>
            <h2>TEMOIGNAGES</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testi-page-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <div className="testi-page-header">
                  <img
                    src={t.img}
                    alt={`${t.name}, ${t.discipline}`}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="testi-avatar"
                  />
                  <div>
                    <span className="testi-name">{t.name}</span>
                    <span className="testi-discipline">{t.discipline}</span>
                  </div>
                </div>
                <Stars />
                <p className="testi-quote">&laquo; {t.quote} &raquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-band fx-glow fx-glow-breathe fx-stack-4">
        <div className="fx-glow-orb" />
        <div className="stat-item">
          <span className="stat-num">240+</span>
          <span className="stat-label">Athletes formes</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">12</span>
          <span className="stat-label">Pays representes</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">87%</span>
          <span className="stat-label">Taux de retour</span>
        </div>
      </div>

      <SectionCTA
        primaryHref="/inscription"
        primaryLabel="A TON TOUR"
        ghostHref="/sessions"
        ghostLabel="VOIR LES SESSIONS"
      />
    </>
  )
}
