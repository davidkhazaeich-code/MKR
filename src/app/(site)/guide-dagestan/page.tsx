import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import GuideForm from '@/components/GuideForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Guide Dagestan | MKR Caucasian Camp | Telecharger gratuitement',
  description: "Guide complet : partir s'entrainer au Dagestan. Visa, vols, budget, preparation physique, equipement. Telechargement gratuit.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/guide-dagestan' },
}

const GUIDE_CONTENTS = [
  { title: 'Visa etape par etape', desc: 'Formalites pour FR, CH, BE, CA. E-visa, delais, documents.' },
  { title: 'Vols et prix', desc: 'Comparatif des vols depuis Paris, Geneve, Bruxelles. Meilleures periodes.' },
  { title: 'Budget realiste', desc: 'Cout total detaille : camp, vol, visa, assurance, equipement.' },
  { title: 'Programme prep 6 semaines', desc: 'Cardio, force, mobilite. Semaine par semaine.' },
  { title: 'Equipement complet', desc: 'Liste exhaustive : vetements, protection, hygiene, admin.' },
  { title: 'Conseils anciens participants', desc: "Retours d'experience et astuces de ceux qui y sont alles." },
]

export default function GuideDagestanPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Guide Dagestan', url: 'https://mkrcaucasiancamp.com/guide-dagestan' },
      ]} />
      <PageHero
        label="GUIDE GRATUIT"
        title="PARTIR S'ENTRAINER<br/>AU DAGESTAN"
        subtitle="Visa, vols, budget, preparation. Tout dans un guide de 20 pages."
        compact
      />

      {/* Cinematic banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/environment/dagestan-panorama.webp"
            alt="Montagnes du Dagestan, vue panoramique"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

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
