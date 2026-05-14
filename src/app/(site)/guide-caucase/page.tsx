import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHero from '@/components/PageHero'
import GuideForm from '@/components/GuideForm'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'

export const metadata: Metadata = {
  title: 'Guide gratuit Caucase : Lutte au Daghestan, MMA en Tchetchenie | MKR',
  description: "Guide complet de 20 pages pour partir t'entrainer au Caucase. Visa, vols, budget, preparation, equipement, culture. Telechargement instantane, gratuit.",
  alternates: { canonical: 'https://mkrcamp.com/guide-caucase' },
}

const GUIDE_CONTENTS = [
  { title: 'Visa Russie pas à pas', desc: 'Formalités pour FR, CH, BE, CA. Documents, délais, frais, lettre d’invitation MKR.' },
  { title: 'Vols et itinéraires', desc: 'Istanbul vers Makhachkala (Lutte) ou Grozny (MMA). Comparatif, fenêtres de prix.' },
  { title: 'Budget réel et complet', desc: 'Tous les postes détaillés : package, vol intl, visa, assurance, équipement.' },
  { title: 'Prép physique 6 semaines', desc: 'Cardio, force, endurance spécifique, affûtage. Adapté selon discipline.' },
  { title: 'Équipement complet', desc: 'Liste exhaustive : vêtements, protection, hygiène, admin. Pas de superflu.' },
  { title: 'Culture et immersion', desc: 'Codes à connaître, mots avar et tchétchènes utiles, gastronomie locale.' },
]

const PERSONAS = [
  { tag: 'SOLO', title: 'Tu pars seul', desc: 'Le guide t’aide à structurer ton voyage de A à Z. Pas de stress logistique, juste l’entraînement.' },
  { tag: 'FAMILLE', title: 'Tu pars en famille', desc: 'Section dédiée : encadrement enfant 8 à 17 ans, hébergement adapté, sécurité.' },
  { tag: 'CLUB', title: 'Tu pars avec ton club', desc: 'Tarifs dégressifs, organisation collective, brief équipe inclus dans le guide.' },
]

const FAQ_QUICK = [
  { q: 'C’est vraiment gratuit ?', a: 'Oui, totalement gratuit. Aucun paiement, pas de version premium cachée.' },
  { q: 'Je le reçois quand ?', a: 'Instantanément. Le bouton de téléchargement apparaît dès que tu valides ton email.' },
  { q: 'Quel format ?', a: 'PDF de 20 pages, optimisé impression A4 et lecture mobile.' },
  { q: 'Disponible en anglais ?', a: 'Pas encore. Version française uniquement pour le moment.' },
]

const TESTIMONIAL_QUICK = [
  { who: 'Karim D., 28 ans, MMA amateur', quote: 'Le guide m’a évité trois erreurs visa. Le calendrier prép m’a remis en forme avant le camp.' },
  { who: 'Sophie L., parent + enfant 12 ans', quote: 'On a tout préparé en suivant les checklists. À l’arrivée, zéro mauvaise surprise.' },
]

const digitalDocumentJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DigitalDocument',
  name: 'Guide Caucase MKR',
  description: 'Guide pratique de 20 pages pour partir s’entrainer au Caucase avec MKR Caucasian Camp.',
  about: 'Voyage et entrainement combat au Daghestan et en Tchetchenie',
  inLanguage: 'fr',
  isAccessibleForFree: true,
  publisher: { '@type': 'Organization', name: 'MKR Caucasian Camp', url: 'https://mkrcamp.com' },
}

export default function GuideCaucasePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Guide Caucase', url: 'https://mkrcamp.com/guide-caucase' },
      ]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(digitalDocumentJsonLd) }} />

      <PageHero
        label="GUIDE GRATUIT"
        title="LE CAUCASE,<br/>SANS DETOUR."
        subtitle="20 pages pour préparer ton camp Lutte au Daghestan ou MMA en Tchétchénie. Visa, vols, budget, prép, équipement, culture. Tout dedans."
        compact
      />

      <section className="guide-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="guide-layout reveal">
            <div>
              <figure className="photo-card" style={{ marginBottom: '1.5rem' }}>
                <img
                  src="/images/guide-caucase/guide-caucase-mockup-openbook.webp"
                  alt="Guide Caucase ouvert sur deux pages, couverture et sommaire"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                  style={{ width: '100%', maxWidth: '520px', display: 'block', margin: '0 auto' }}
                />
              </figure>
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
                  src="/images/guide-caucase/guide-caucase-cover.webp"
                  alt="Couverture du Guide Caucase MKR"
                  width={400}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                  style={{ maxWidth: '280px', margin: '0 auto', display: 'block' }}
                />
              </figure>
              <Suspense fallback={<div className="guide-form-card"><p>Chargement…</p></div>}>
                <GuideForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <CinematicReveal
        image="/images/environment/dagestan-panorama.webp"
        alt="Montagnes du Caucase, vue panoramique"
        label="CAUCASE"
        title="DEUX TERRES DE COMBAT"
        tagline="Le Daghestan a produit plus de champions de lutte que toute autre région du monde. La Tchétchénie redessine la carte du MMA. Tu choisis la tienne."
      />

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">POUR QUI C&apos;EST</h2>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {PERSONAS.map((p, i) => (
              <div key={i} className="content-card fx-grain reveal">
                <span className="label-tag" style={{ color: 'var(--primary)' }}>{p.tag}</span>
                <h3 className="card-title" style={{ marginTop: '0.5rem' }}>{p.title}</h3>
                <p className="card-body">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">UN APERCU DU GUIDE</h2>
          <div className="grid-3" style={{ marginTop: '2rem' }}>
            {[
              { src: '/images/guide-caucase/guide-page-carte-caucase.webp', alt: 'Carte du Caucase, Daghestan et Tchétchénie' },
              { src: '/images/guide-caucase/guide-page-visa.webp', alt: 'Page visa du guide' },
              { src: '/images/guide-caucase/guide-page-budget.webp', alt: 'Page budget du guide' },
            ].map((img, i) => (
              <figure key={i} className="photo-card reveal" style={{ aspectRatio: '2/3' }}>
                <img src={img.src} alt={img.alt} loading="lazy" className="section-photo-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">CE QU&apos;ILS EN ONT FAIT</h2>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            {TESTIMONIAL_QUICK.map((t, i) => (
              <blockquote key={i} className="content-card reveal" style={{ fontStyle: 'italic' }}>
                <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>« {t.quote} »</p>
                <footer style={{ marginTop: '1rem', fontStyle: 'normal' }} className="label-tag">{t.who}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-stack-1">
        <div className="inner">
          <h2 className="section-heading reveal">QUESTIONS FREQUENTES</h2>
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            {FAQ_QUICK.map((f, i) => (
              <div key={i} className="content-card reveal">
                <h3 className="card-title">{f.q}</h3>
                <p className="card-body">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="guide-section fx-grid fx-glow fx-stack-1">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner" style={{ maxWidth: '480px' }}>
          <h2 className="section-heading reveal" style={{ textAlign: 'center' }}>PRENDS LE GUIDE</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }} className="reveal">
            Pas de spam. 1 email max. Désinscription en 1 clic.
          </p>
          <Suspense fallback={<div className="guide-form-card"><p>Chargement…</p></div>}>
            <GuideForm />
          </Suspense>
        </div>
      </section>
    </>
  )
}
