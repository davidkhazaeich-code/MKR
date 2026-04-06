import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'Logistique | MKR Caucasian Camp | Visa, Vol, Budget Dagestan',
  description: "Guide pratique complet : visa, vols depuis Paris/Bruxelles/Geneve, budget total, assurance voyage. Tout ce qu'il faut savoir avant de partir au Dagestan.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/logistique' },
}

export default function LogistiquePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Logistique', url: 'https://mkrcaucasiancamp.com/logistique' },
      ]} />
      <PageHero
        label="LOGISTIQUE"
        title="TOUT CE QUE TU DOIS<br/>SAVOIR AVANT DE PARTIR"
        subtitle="Visa, vols, budget, assurance. On t'explique tout."
      />

      {/* Budget total */}
      <section className="logi-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>BUDGET</span>
            <h2>BUDGET TOTAL ESTIME</h2>
          </div>
          <div className="layout-split reveal" style={{ transitionDelay: '0.1s' }}>
            <div>
              <table className="table-tonal">
                <thead><tr><th>Poste</th><th>Estimation</th></tr></thead>
                <tbody>
                  <tr><td>Package MKR (camp complet)</td><td>2 750 - 3 200 CHF</td></tr>
                  <tr><td>Vol international A/R</td><td>400 - 700 EUR</td></tr>
                  <tr><td>Visa (si necessaire)</td><td>60 - 100 EUR</td></tr>
                  <tr><td>Assurance voyage</td><td>80 - 150 EUR</td></tr>
                  <tr><td>Equipement personnel</td><td>100 - 200 EUR</td></tr>
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                Estimations basees sur les departs depuis l&apos;Europe francophone. Prix sujets a variation.
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">CE QUI EST INCLUS</h3>
              <ul className="logi-check-list">
                <li>Hebergement de camp</li>
                <li>3 repas par jour</li>
                <li>2 sessions d&apos;entrainement/jour</li>
                <li>Transferts aeroport-camp</li>
                <li>Excursions culturelles</li>
                <li>Suivi preparatoire a distance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Visa */}
      <section className="logi-section fx-texture-basalt fx-mask-b fx-stack-3">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VISA</span>
            <h2>FORMALITES D&apos;ENTREE</h2>
          </div>
          <div className="logi-visa-steps reveal">
            {[
              { num: '01', title: 'Verifier ton passeport', desc: 'Passeport valide au moins 6 mois apres la date de retour.' },
              { num: '02', title: 'Ressortissants UE/CH/CA', desc: "Pas de visa necessaire pour la Georgie (sejour < 365 jours). Entree avec le passeport uniquement." },
              { num: '03', title: 'Autres nationalites', desc: "Consulter le site du Ministere des Affaires Etrangeres de Georgie pour les conditions de visa." },
              { num: '04', title: 'Documents a emporter', desc: "Passeport, confirmation de reservation MKR, attestation d'assurance, billet retour." },
            ].map((step) => (
              <div key={step.num} className="logi-step">
                <span className="logi-step-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
            <p className="logi-updated">Mis a jour : avril 2026</p>
          </div>
        </div>
      </section>

      {/* Vols */}
      <section className="logi-section fx-grid fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>VOLS</span>
            <h2>COMMENT S&apos;Y RENDRE</h2>
          </div>
          <div className="grid-3">
            {[
              { city: 'Paris CDG', connections: 'Via Istanbul (Turkish Airlines) ou Tbilissi direct', price: '350 - 550 EUR', duration: '~6-8h avec escale' },
              { city: 'Geneve / Zurich', connections: 'Via Istanbul ou Dubai. Wizz Air pour Kutaisi.', price: '400 - 650 EUR', duration: '~6-9h avec escale' },
              { city: 'Bruxelles', connections: 'Via Istanbul (Turkish Airlines) ou Munich', price: '380 - 600 EUR', duration: '~7-9h avec escale' },
            ].map((flight, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{flight.city}</h3>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">Connexions</span>
                  <p>{flight.connections}</p>
                </div>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">Prix moyen A/R</span>
                  <p style={{ color: 'var(--primary)' }}>{flight.price}</p>
                </div>
                <div className="logi-flight-detail">
                  <span className="logi-flight-label">Duree</span>
                  <p>{flight.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assurance */}
      <section className="logi-section fx-texture-concrete fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left fx-glow-breathe" />
        <div className="inner">
          <div className="group-card fx-grain fx-corner-glow reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>OBLIGATOIRE</span>
            <h2>ASSURANCE VOYAGE</h2>
            <p>L&apos;assurance voyage est obligatoire pour participer au camp. Elle doit couvrir :</p>
            <ul className="logi-check-list" style={{ marginTop: '1rem' }}>
              <li>Rapatriement medical</li>
              <li>Pratique de sports de contact (MMA, lutte)</li>
              <li>Frais medicaux a l&apos;etranger</li>
              <li>Responsabilite civile</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>Prestataires recommandes : Chapka Direct, ACS, World Nomads, Allianz Travel.</p>
          </div>
        </div>
      </section>

      {/* Transferts */}
      <section className="logi-section fx-grid fx-mask-a fx-stack-2">
        <div className="inner">
          <div className="layout-split layout-split--balanced layout-split--center reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SUR PLACE</span>
              <h2>TRANSFERTS</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le transfert depuis l&apos;aeroport est inclus dans le package. Un vehicule MKR t&apos;attend a ton arrivee.
                Le trajet vers le lieu d&apos;entrainement dure 2 a 3 heures selon la destination. Tous les deplacements
                pendant le camp sont pris en charge.
              </p>
              <figure className="photo-card" style={{ marginTop: '1.5rem' }}>
                <img
                  src="/images/environment/mountain-road.webp"
                  alt="Route de montagne vers le camp au Caucase"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <figcaption>La route vers le camp. Le voyage fait partie de l&apos;experience.</figcaption>
              </figure>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">INFOS PRATIQUES</h3>
              <p className="card-body">Aeroport : Tbilissi (TBS) ou Kutaisi (KUT)</p>
              <p className="card-body">Accueil a l&apos;aeroport par l&apos;equipe MKR</p>
              <p className="card-body">Vehicule prive camp &lt;&gt; salle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Infos pratiques mini-cards */}
      <section className="logi-section fx-texture-basalt fx-glow fx-mask-d fx-stack-6">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>BON A SAVOIR</span>
            <h2>INFOS PRATIQUES</h2>
          </div>
          <div className="grid-3x2">
            {[
              { title: 'Decalage horaire', desc: 'GMT+4 (Georgie). +3h par rapport a Paris.' },
              { title: 'Monnaie', desc: 'Lari georgien (GEL). 1 EUR ≈ 2.9 GEL. CB acceptees en ville.' },
              { title: 'Internet', desc: 'Wi-Fi au logement. Carte SIM locale recommandee (~5 EUR).' },
              { title: 'Climat', desc: 'Continental. Printemps 15-22°C, ete 25-35°C, automne 12-20°C.' },
              { title: 'Langue', desc: 'Georgien, russe. Anglais dans les zones touristiques. Interprete MKR sur place.' },
              { title: 'Alimentation', desc: 'Cuisine caucasienne : riche en proteines, viande, legumes, pain. Regime adapte aux athletes.' },
            ].map((info, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{info.title}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{info.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/faq"
        primaryLabel="DES QUESTIONS ?"
        ghostHref="/guide-dagestan"
        ghostLabel="TELECHARGER LE GUIDE PDF"
      />
    </>
  )
}
