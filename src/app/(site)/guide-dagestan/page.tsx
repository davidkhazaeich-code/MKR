import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import GuideForm from '@/components/GuideForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Guide gratuit : partir s\'entraîner au Daghestan | MKR',
  description: "Guide complet pour partir s'entraîner au Daghestan. Visa, vols, budget, préparation physique, équipement. Téléchargement gratuit.",
  alternates: { canonical: 'https://mkrcamp.com/guide-dagestan' },
}

const GUIDE_CONTENTS = [
  { title: 'Visa étape par étape', desc: 'Formalités pour FR, CH, BE, CA. E-visa, délais, documents.' },
  { title: 'Vols et prix', desc: 'Comparatif des vols depuis Paris, Genève, Bruxelles. Meilleures périodes.' },
  { title: 'Budget réaliste', desc: 'Coût total détaillé : camp, vol, visa, assurance, équipement.' },
  { title: 'Programme prep 6 semaines', desc: 'Cardio, force, mobilité. Semaine par semaine.' },
  { title: 'Équipement complet', desc: 'Liste exhaustive : vêtements, protection, hygiène, admin.' },
  { title: 'Conseils anciens participants', desc: "Retours d'expérience et astuces de ceux qui y sont allés." },
]

export default function GuideDagestanPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Guide Daghestan', url: 'https://mkrcamp.com/guide-dagestan' },
      ]} />
      <PageHero
        label="GUIDE GRATUIT"
        title="TU PARS T'ENTRAÎNER<br/>AU DAGHESTAN."
        subtitle="Visa, vols, budget, préparation. Tout dans un guide de 20 pages."
        compact
      />

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/dagestan-panorama.webp"
        alt="Montagnes du Daghestan, vue panoramique"
        label="DAGHESTAN"
        title="TERRE DE CHAMPIONS"
        tagline="Le Daghestan a produit plus de champions de lutte que n'importe quelle région au monde."
      />

      <section className="guide-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="guide-layout reveal">
            <div>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                CE QUE CONTIENT LE GUIDE
              </h2>
              <div className="grid-3x2">
                {GUIDE_CONTENTS.map((item, i) => (
                  <div key={i} className="content-card fx-grain fx-corner-glow">
                    <h3 className="card-title" style={{ fontSize: '0.9rem' }}>{item.title}</h3>
                    <p className="card-body" style={{ fontSize: '0.82rem' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="guide-form-wrap">
              <figure className="photo-card" style={{ marginBottom: '1.5rem' }}>
                <img
                  src="/images/textures/guide-cover.webp"
                  alt="Couverture du guide gratuit MKR Caucasian Camp"
                  width={400}
                  height={560}
                  loading="lazy"
                  className="section-photo-img"
                  style={{ maxWidth: '280px', margin: '0 auto', display: 'block' }}
                />
              </figure>
              <GuideForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
