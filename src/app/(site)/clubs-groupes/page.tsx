import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { PRICING_TIERS, formatEUR } from '@/data/pricing'

export const metadata = buildMetadata({
  title: 'Camp Clubs et Groupes au Caucase | MKR Caucasian Camp',
  description: "Camp dédié à ton club ou groupe (5 à 20 personnes). Lutte au Daghestan, MMA en Tchétchénie ou combo sur devis. Hébergement bloc, devis personnalisé.",
  path: '/clubs-groupes',
})
const ADVANTAGES = [
  {
    title: 'Hébergement bloc',
    desc: "Ton groupe est logé ensemble : chambres adjacentes ou bâtiment dédié selon la taille. Tu dors et tu manges avec ton équipe, pas avec d'autres camps en parallèle.",
  },
  {
    title: 'Transferts groupés',
    desc: "Un seul véhicule MKR pour tout le groupe à l'aéroport de Makhachkala (Lutte au Daghestan) ou de Grozny (MMA en Tchétchénie). Pas d'attente, pas de logistique éclatée.",
  },
  {
    title: 'Programme adapté au niveau',
    desc: "Le coaching s'ajuste au niveau collectif (débutant, intermédiaire, avancé, mixte). Pas de séance générique calée sur la moyenne du groupe.",
  },
  {
    title: 'Coach dédié',
    desc: "Un coach principal MKR est attribué à ton groupe pour toute la durée du camp. Tu gardes le même interlocuteur de la première à la dernière session.",
  },
  {
    title: 'Tarif dégressif par tête',
    desc: `Plus vous êtes nombreux, plus le tarif par personne baisse. Palier Trio à 5 (${formatEUR(PRICING_TIERS.trio.perAdult[1])} / sem / pers), palier Club 6 à 10 (${formatEUR(PRICING_TIERS.club.perAdult[1])} / sem / pers), 11+ ou salle entière sur devis personnalisé.`,
  },
  {
    title: 'Bilan groupe',
    desc: "Compte-rendu collectif en fin de camp et bilan individuel pour chaque membre. Tu repars avec un livrable structuré pour la suite.",
  },
]

const PROCESS = [
  { num: '01', title: 'Demande de devis', desc: 'Tu remplis le formulaire : nom du club, nombre de participants (5 à 20), niveau collectif, dates souhaitées, durée.' },
  { num: '02', title: 'Appel de cadrage', desc: 'On organise un appel avec le responsable du groupe pour cadrer le programme, les attentes, la logistique.' },
  { num: '03', title: 'Devis détaillé', desc: 'Tu reçois un devis ferme : tarif par tête × nombre de membres + détail des prestations.' },
  { num: '04', title: 'Validation et virement', desc: 'À la signature du devis, virement bancaire intégral du groupe sur le compte MKR. Lettres d\'invitation visa pour chaque membre.' },
  { num: '05', title: 'Préparation', desc: 'Programme prep physique 6 semaines transmis à chaque membre. Tout est réglé en amont du départ.' },
  { num: '06', title: 'Camp dédié', desc: 'Ton groupe arrive ensemble, vit ensemble, s\'entraîne ensemble. Coach dédié, programme adapté.' },
]

export default function ClubsGroupesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Clubs et Groupes', url: 'https://mkrcamp.com/clubs-groupes' },
      ]} />

      <PageHero
        label="CLUBS ET GROUPES · 5 À 20 PERSONNES"
        title="TON CLUB<br/>AU CAUCASE."
        subtitle="Camp dédié pour ton club ou groupe organisé (5 à 20 personnes). Lutte au Daghestan, MMA en Tchétchénie ou combo sur devis. Hébergement bloc, transferts groupés, programme adapté au niveau."
        image="/images/ruslan/action/mma-adultes-cercle.webp"
        imageAlt="Cercle de fighters caucasiens en formation, équipe et fraternité du tapis"
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">5-20</span>
            <span className="parents-stat-label">Personnes par groupe</span>
          </div>
          <div>
            <span className="parents-stat-num">90j</span>
            <span className="parents-stat-label">Délai minimum réservation</span>
          </div>
          <div>
            <span className="parents-stat-num">1/2/3</span>
            <span className="parents-stat-label">Semaines au choix</span>
          </div>
          <div>
            <span className="parents-stat-num">Devis</span>
            <span className="parents-stat-label">Sur mesure selon configuration</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/heritage/priere-collective-mkr.webp"
        alt="Athlètes alignés sur le tapis, fraternité collective au camp MKR"
        label="CAMP DÉDIÉ"
        title="TON GROUPE.<br/>TON RYTHME."
        tagline="Vous êtes 5, 10 ou 20, avec un objectif commun. On organise un camp pensé pour votre niveau et vos dates."
      />

      {/* Avantages */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              CE QUI CHANGE EN GROUPE
            </span>
            <h2>6 AVANTAGES LOGISTIQUES</h2>
          </div>
          <div className="grid-3x2">
            {ADVANTAGES.map((a, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3 className="card-title" style={{ fontSize: '0.95rem' }}>{a.title}</h3>
                <p className="card-body" style={{ fontSize: '0.85rem' }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Processus devis */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              PROCESSUS DEVIS GROUPE
            </span>
            <h2>6 ÉTAPES, 90 JOURS</h2>
          </div>
          <div className="logi-visa-steps reveal">
            {PROCESS.map((step) => (
              <div key={step.num} className="logi-step">
                <span className="logi-step-num">{step.num}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-sell autres tunnels */}
      <section className="logi-section fx-grid fx-stack-6">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              MOINS DE 5 PERSONNES ?
            </span>
            <h2>EXPLORE LES AUTRES FORMATS</h2>
          </div>
          <div className="grid-3 reveal" style={{ gap: '1.5rem' }}>
            <Link href="/sur-mesure" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>1 À 4 ADULTES</span>
              <h3 className="card-title">Sur Mesure</h3>
              <p className="card-body">Vous êtes 1 à 4 amis adultes ? Sur Mesure est le bon tunnel : tes dates, durée au choix.</p>
            </Link>
            <Link href="/sessions" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>SESSIONS OFFICIELLES</span>
              <h3 className="card-title">4 sessions par an</h3>
              <p className="card-body">Tu veux rejoindre un groupe constitué par MKR ? Quatre sessions calées sur les vacances scolaires : Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027.</p>
            </Link>
            <Link href="/familles" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>FAMILLE</span>
              <h3 className="card-title">Camp Famille</h3>
              <p className="card-body">Tu pars avec un enfant 8-17 ans ? Programme parent + enfant adapté.</p>
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=groupe"
        primaryLabel="DEMANDER UN DEVIS GROUPE"
        ghostHref="/contact"
        ghostLabel="POSER UNE QUESTION"
      />
    </>
  )
}
