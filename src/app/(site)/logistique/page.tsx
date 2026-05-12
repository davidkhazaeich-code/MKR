import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import {
  PACKAGE_PER_ADULT_RANGE_LABEL,
  FAMILY_BASE_RANGE_LABEL,
} from '@/lib/pricing-copy'

export const metadata: Metadata = {
  title: 'Logistique Camp Daghestan et Tchétchénie : Visa, Vol, Budget | MKR',
  description: "Guide pratique complet : visa Russie, vols depuis Paris, Bruxelles ou Genève via Istanbul vers Makhachkala (Lutte) ou Grozny (MMA), budget, assurance. Tout pour partir au Caucase en confiance.",
  alternates: { canonical: 'https://mkrcamp.com/logistique' },
}

export default function LogistiquePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Logistique', url: 'https://mkrcamp.com/logistique' },
      ]} />
      <PageHero
        label="LOGISTIQUE"
        title="TOUT CE QUE TU DOIS<br/>SAVOIR AVANT DE PARTIR"
        subtitle="Visa, vols, budget, assurance. Pour le camp Lutte (Daghestan, aéroport Makhachkala) ou MMA (Tchétchénie, aéroport Grozny)."
      />

      {/* Budget total */}
      <section className="logi-section fx-grid fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>BUDGET</span>
            <h2>BUDGET TOTAL ESTIMÉ</h2>
          </div>
          <div className="layout-split reveal" style={{ transitionDelay: '0.1s' }}>
            <div>
              <table className="table-tonal">
                <thead><tr><th>Poste</th><th>Estimation</th></tr></thead>
                <tbody>
                  <tr><td>Package MKR par adulte (selon taille de groupe et durée)</td><td>{PACKAGE_PER_ADULT_RANGE_LABEL}</td></tr>
                  <tr><td>Forfait Famille (1 parent + 1 enfant)</td><td>{FAMILY_BASE_RANGE_LABEL}</td></tr>
                  <tr><td>Vol international A/R</td><td>400 - 700 EUR</td></tr>
                  <tr><td>Visa (si nécessaire)</td><td>60 - 100 EUR</td></tr>
                  <tr><td>Assurance voyage</td><td>80 - 150 EUR</td></tr>
                  <tr><td>Équipement personnel</td><td>100 - 200 EUR</td></tr>
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
                Estimations basées sur les départs depuis l&apos;Europe francophone. Prix sujets à variation.
              </p>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">CE QUI EST INCLUS</h3>
              <ul className="logi-check-list">
                <li>Hébergement de camp</li>
                <li>2 repas par jour</li>
                <li>2 sessions d&apos;entraînement par jour</li>
                <li>Transferts aéroport-camp</li>
                <li>Excursions culturelles (en option)</li>
                <li>Suivi préparatoire à distance</li>
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
            <h2>FORMALITÉS D&apos;ENTRÉE</h2>
          </div>
          <div className="logi-visa-steps reveal">
            {[
              { num: '01', title: 'Vérifier ton passeport', desc: 'Passeport valide au moins 6 mois après la date de retour.' },
              { num: '02', title: 'Visa Russie obligatoire', desc: "Que tu partes au Daghestan (Lutte) ou en Tchétchénie (MMA), tu rentres en Fédération de Russie : un visa russe est nécessaire pour la majorité des nationalités. Pour les ressortissants UE, MKR fournit un questionnaire visa à remplir avec ton passeport (validité 6 mois minimum)." },
              { num: '03', title: "Lettre d'invitation MKR", desc: "MKR fournit la lettre d'invitation officielle après confirmation de ta candidature. C'est le document central du dossier visa." },
              { num: '04', title: 'Documents à emporter', desc: "Passeport, confirmation de réservation MKR, attestation d'assurance, billet retour." },
            ].map((step) => (
              <div key={step.num} className="logi-step">
                <span className="logi-step-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
            <p className="logi-updated">Mis à jour : avril 2026</p>
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
          <p className="reveal" style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '780px', marginBottom: '1.5rem' }}>
            Toutes les routes passent par Istanbul puis par un vol intérieur inclus dans le package MKR : <strong>Istanbul - Makhachkala (MCX)</strong> pour le camp Lutte au Daghestan, ou <strong>Istanbul - Grozny (GRV)</strong> pour le camp MMA en Tchétchénie. Le bon vol est réservé selon ta destination confirmée.
          </p>
          <div className="grid-3">
            {[
              { city: 'Paris CDG', connections: 'Via Istanbul (Turkish Airlines) vers Makhachkala (MCX, Daghestan) ou Grozny (GRV, Tchétchénie). Vol intérieur inclus dans le package MKR.', price: '450 - 700 EUR', duration: '~7-9h avec escale' },
              { city: 'Genève / Zurich', connections: 'Via Istanbul (Turkish Airlines) vers Makhachkala (MCX) ou Grozny (GRV). Vol intérieur inclus dans le package MKR.', price: '500 - 750 EUR', duration: '~8-10h avec escale' },
              { city: 'Bruxelles', connections: 'Via Istanbul (Turkish Airlines) vers Makhachkala (MCX) ou Grozny (GRV). Vol intérieur inclus dans le package MKR.', price: '480 - 720 EUR', duration: '~8-10h avec escale' },
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
                  <span className="logi-flight-label">Durée</span>
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
              <li>Rapatriement médical</li>
              <li>Pratique de sports de contact (MMA, lutte)</li>
              <li>Frais médicaux à l&apos;étranger</li>
              <li>Responsabilité civile</li>
            </ul>
            <p style={{ marginTop: '1rem' }}>Prestataires recommandés : Chapka Direct, ACS, World Nomads, Allianz Travel.</p>
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
                Le transfert depuis l&apos;aéroport est inclus dans le package. Un véhicule MKR t&apos;attend à ton arrivée.
                Trajet aéroport - camp d&apos;environ 1h30 depuis Makhachkala (Daghestan, camp Lutte) ou environ 30 minutes
                depuis Grozny (Tchétchénie, camp MMA). Tous les déplacements pendant le camp sont pris en charge.
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
                <figcaption>La route vers le camp. Le voyage fait partie de l&apos;expérience.</figcaption>
              </figure>
            </div>
            <div className="content-card fx-grain fx-corner-glow">
              <h3 className="card-title">INFOS PRATIQUES</h3>
              <p className="card-body">Aéroport Lutte (Daghestan) : Makhachkala (MCX)</p>
              <p className="card-body">Aéroport MMA (Tchétchénie) : Grozny (GRV)</p>
              <p className="card-body">Accueil à l&apos;aéroport par l&apos;équipe MKR</p>
              <p className="card-body">Véhicule privé camp et salle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Infos pratiques mini-cards */}
      <section className="logi-section fx-texture-basalt fx-glow fx-mask-d fx-stack-6">
        <div className="fx-glow-orb fx-glow-orb--top fx-glow-breathe" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>BON À SAVOIR</span>
            <h2>INFOS PRATIQUES</h2>
          </div>
          <div className="grid-3x2">
            {[
              { title: 'Décalage horaire', desc: 'GMT+3 (heure de Moscou). +2h par rapport à Paris.' },
              { title: 'Monnaie', desc: 'Rouble russe (RUB). 1 EUR ≈ 100 RUB. Espèces recommandées, CB internationales souvent inutilisables.' },
              { title: 'Internet', desc: 'Wi-Fi au logement. Carte SIM locale Russie recommandée (~5 EUR).' },
              { title: 'Climat', desc: 'Continental. Printemps 12-20°C, été 25-35°C, automne 10-18°C.' },
              { title: 'Langue', desc: 'Russe principal. Avar au Daghestan, tchétchène/vaïnakh en Tchétchénie selon la salle. Interprète MKR francophone sur place.' },
              { title: 'Alimentation', desc: 'Cuisine caucasienne : riche en protéines, viande, légumes, pain. Régime adapté aux athlètes.' },
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
        ghostLabel="TÉLÉCHARGER LE GUIDE PDF"
      />
    </>
  )
}
