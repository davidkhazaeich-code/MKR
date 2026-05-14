import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { SOLO_PRICE_1WEEK_LABEL, SOLO_PRICE_1WEEK_EUR } from '@/lib/pricing-copy'

export const metadata: Metadata = {
  title: 'MKR Camp 2026 · Session 17 août - 5 sept au Daghestan',
  description: `Session officielle 17 août - 5 septembre 2026 au Daghestan. 1, 2 ou 3 semaines. Adultes, 15 places. Dès ${SOLO_PRICE_1WEEK_LABEL} tout inclus.`,
  alternates: { canonical: 'https://mkrcamp.com/mkr-camp-2026' },
}

const REASONS = [
  {
    title: 'Esprit collectif',
    desc: "Tu intègres un groupe d'athlètes adultes venus de France, Suisse, Belgique et plus loin. En 48h, on s'entraîne, on mange et on récupère ensemble. La camaraderie du tapis fait le reste.",
  },
  {
    title: 'Dates fixes, organisation rodée',
    desc: "Du 17 août au 5 septembre 2026, fenêtre de 3 semaines. Tu choisis ta durée (1, 2 ou 3 semaines) selon tes contraintes. MKR a calé visa, vols, hébergement, programme et coachs il y a déjà plusieurs mois.",
  },
  {
    title: 'Le format historique',
    desc: "C'est notre session phare depuis le début. La plupart des anciens reviennent l'année suivante, parfois avec un ami, parfois avec leur ado. Quand quelqu'un dit qu'il a fait MKR, c'est en général ce camp.",
  },
]

const TIMELINE = [
  { time: 'J-90', label: 'Inscription', desc: 'Tu remplis le formulaire. Réponse sous 48h.' },
  { time: 'J-60', label: 'Visio + paiement', desc: 'Visio de validation avec Ruslan. Si validé : RIB envoyé, paiement intégral par virement. Lettre d\'invitation visa Russie déclenchée.' },
  { time: 'J-45', label: 'Programme prep 6 sem', desc: 'Tu reçois le programme prep physique à distance. Visa russe en cours de finalisation.' },
  { time: 'J-30', label: 'Visa finalisé', desc: 'Visa russe en main. Tu peux acheter ton vol international en confiance.' },
  { time: 'J-7', label: 'Briefing final', desc: 'Brief logistique, vol, transferts, packing list confirmée.' },
  { time: 'JOUR J', label: 'Départ', desc: 'Vol intl à charge. Vol intérieur Istanbul-Makhachkala inclus. Véhicule MKR à l\'aéroport.' },
]

export default function MkrCamp2026Page() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'MKR Camp 2026', url: 'https://mkrcamp.com/mkr-camp-2026' },
      ]} />

      <PageHero
        label="SESSION OFFICIELLE 2026"
        title="LE MKR CAMP 2026<br/>T&apos;ATTEND."
        subtitle="Du 17 août au 5 septembre 2026 au Daghestan. Tu choisis 1, 2 ou 3 semaines au sein de la fenêtre. Adultes uniquement, 15 places, esprit collectif. Les inscriptions sont ouvertes."
        image="/images/ruslan/action/mma-cercle-session-demo-mkr.webp"
        imageAlt="Cercle de combattants au MKR Camp 2026, démonstration grappling"
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">1-3</span>
            <span className="parents-stat-label">Semaines au choix · 17 août - 5 sept</span>
          </div>
          <div>
            <span className="parents-stat-num">15</span>
            <span className="parents-stat-label">Places maximum (sélection sur dossier)</span>
          </div>
          <div>
            <span className="parents-stat-num">9</span>
            <span className="parents-stat-label">Coachs expérimentés</span>
          </div>
          <div>
            <span className="parents-stat-num">{SOLO_PRICE_1WEEK_EUR.toLocaleString('fr-FR').replace(/ /g, ' ')}</span>
            <span className="parents-stat-label">€ minimum · adulte · 1 sem</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/action/mma-adultes-cercle.webp"
        alt="Groupe d'athlètes en formation au MKR Camp"
        label="LA SESSION HISTORIQUE"
        title="UN CAMP. UN GROUPE.<br/>1 À 3 SEMAINES."
        tagline="Tu pars avec des athlètes adultes du monde entier. Tu choisis 1, 2 ou 3 semaines. Tu rentres avec un niveau et une famille de combat."
      />

      {/* Pourquoi rejoindre */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              POURQUOI LA SESSION OFFICIELLE
            </span>
            <h2>3 RAISONS DE REJOINDRE LE GROUPE</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {REASONS.map((r, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{r.title}</h3>
                <p className="card-body">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Timeline réservation */}
      <section className="logi-section fx-texture-concrete fx-mask-b fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              CALENDRIER D&apos;INSCRIPTION
            </span>
            <h2>DE J-90 AU JOUR J</h2>
          </div>
          <div className="daily-timeline">
            {TIMELINE.map((slot, i) => (
              <div key={i} className="daily-step reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="daily-time">{slot.time}</span>
                <div className="daily-step-content">
                  <h3>{slot.label}</h3>
                  <p>{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Cross-sell autres tunnels */}
      <section className="logi-section fx-grid fx-stack-7">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              LE FORMAT NE COLLE PAS ?
            </span>
            <h2>EXPLORE LES AUTRES FORMATS</h2>
          </div>
          <div className="grid-3 reveal" style={{ gap: '1.5rem' }}>
            <Link href="/sur-mesure" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>SUR MESURE</span>
              <h3 className="card-title">Tes propres dates</h3>
              <p className="card-body">Tu veux choisir tes dates ? 1 à 4 adultes, durée au choix, délai 90 jours minimum.</p>
            </Link>
            <Link href="/familles" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>FAMILLE</span>
              <h3 className="card-title">Camp Famille</h3>
              <p className="card-body">Tu pars avec un enfant 8-17 ans ? Programme parent + enfant adapté.</p>
            </Link>
            <Link href="/clubs-groupes" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>CLUB ET GROUPE</span>
              <h3 className="card-title">Ton club au Caucase</h3>
              <p className="card-body">Tu fédères 5+ personnes (club ou groupe organisé) ? Camp dédié, Lutte au Daghestan ou MMA en Tchétchénie. Devis sur mesure.</p>
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session&session=aout-2026"
        primaryLabel="M'INSCRIRE AU MKR CAMP 2026"
        ghostHref="/contact"
        ghostLabel="POSER UNE QUESTION"
      />
    </>
  )
}
