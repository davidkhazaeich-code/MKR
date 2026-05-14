import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'
import { PRICING_TIERS } from '@/data/pricing'

const TRIO_PRICE_1WEEK_NUM = PRICING_TIERS.trio.perAdult[1].toLocaleString('fr-FR').replace(/ /g, ' ')

export const metadata: Metadata = {
  title: 'Camp Sur Mesure | MKR Caucasian Camp | Tes dates au Caucase',
  description: 'Camp individuel sur mesure au Caucase. Lutte au Daghestan, MMA en Tchétchénie, ou combo Daghestan + Tchétchénie (sur-mesure uniquement). Tu choisis tes dates, ta durée. Délai 90 jours min.',
  alternates: { canonical: 'https://mkrcamp.com/sur-mesure' },
}

const PROFILES = [
  {
    title: 'Pro ou semi-pro en préparation',
    desc: "Tu prépares un combat ou un tournoi à une date précise. Le sur mesure te permet de caler le camp pile dans ta fenêtre de prep, sans compromis sur le calendrier.",
  },
  {
    title: 'Athlète au planning serré',
    desc: "Les dates de la session officielle ne tombent pas bien (vacances, boulot, école des enfants). Tu choisis 1, 2 ou 3 semaines au moment qui marche pour toi.",
  },
  {
    title: 'Duo, trio ou quatuor d\'amis',
    desc: "Vous êtes 2 à 4 adultes qui voulez partir ensemble. Vous choisissez les dates, vous vivez le camp à plusieurs sans avoir à constituer un club entier.",
  },
]

const PROCESS = [
  { num: '01', title: 'Tu remplis le formulaire', desc: 'Composition (1 à 4 adultes), dates souhaitées (90 jours min avant), durée (1, 2 ou 3 sem), niveau, objectifs.' },
  { num: '02', title: 'Validation MKR sous 48h', desc: 'On valide la disponibilité des coachs et de l\'hébergement à tes dates. Appel vidéo de qualification.' },
  { num: '03', title: 'Validation et lettre visa', desc: 'Tu reçois la lettre d\'invitation officielle pour ton dossier visa Russie et le RIB pour le paiement intégral du package par virement bancaire.' },
  { num: '04', title: 'Préparation 6 semaines', desc: 'Programme de prep physique à distance. Tout est réglé, tu n\'as plus qu\'à te concentrer sur l\'entraînement.' },
  { num: '05', title: 'Départ et camp', desc: 'Vol intérieur depuis Istanbul inclus (Makhachkala pour Daghestan, Grozny pour Tchétchénie). Véhicule MKR à l\'aéroport. Tu n\'as qu\'à t\'entraîner.' },
]

export default function SurMesurePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Sur Mesure', url: 'https://mkrcamp.com/sur-mesure' },
      ]} />

      <PageHero
        label="SUR MESURE · 1 À 4 ADULTES"
        title="TES DATES.<br/>TON AVENTURE."
        subtitle="Camp individuel ou en petit groupe d'amis (1 à 4 adultes). Tu choisis tes dates, ta durée et ta ou tes destinations : Lutte au Daghestan, MMA en Tchétchénie, ou combo des deux (sur-mesure uniquement)."
        image="/images/ruslan/coaches/Antoine-portrait-makhachkala-mkr.webp"
        imageAlt="Athlète MMA solo en immersion à Makhachkala, camp sur mesure MKR"
      />

      {/* Stats clés */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">1-4</span>
            <span className="parents-stat-label">Adultes par camp</span>
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
            <span className="parents-stat-num">{TRIO_PRICE_1WEEK_NUM}</span>
            <span className="parents-stat-label">€ · 1 sem · à partir de 3 pers</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/action/mma-cercle-session-demo-mkr.webp"
        alt="Cercle de combattants en démonstration grappling au Daghestan"
        label="POUR QUI"
        title="POUR CEUX QUI<br/>FIXENT LEURS DATES."
        tagline="Tu as un objectif clair et un créneau précis. On adapte le camp à ton agenda, pas l'inverse."
      />

      {/* Combo Daghestan + Tchétchénie */}
      <section className="logi-section fx-texture-concrete fx-glow fx-mask-a fx-stack-1b">
        <div className="fx-glow-orb fx-glow-orb--top" />
        <div className="inner">
          <div className="reveal" style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              EXCLUSIVITÉ SUR MESURE
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
              COMBINE DAGHESTAN ET TCHÉTCHÉNIE
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginTop: '1.2rem' }}>
              Sur les sessions officielles, c&apos;est <strong>Lutte au Daghestan</strong> OU <strong>MMA en Tchétchénie</strong>.
              Sur le sur mesure, tu peux combiner les deux : une partie du camp à Makhachkala pour la lutte,
              une autre partie à Grozny pour le MMA. La logistique de transfert entre les deux régions est gérée par MKR.
              Idéal pour les athlètes MMA qui veulent renforcer leur lutte chez les Daghestanais.
            </p>
          </div>
        </div>
      </section>

      {/* Profils */}
      <section className="logi-section fx-grid fx-stack-2 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              PROFILS RECOMMANDÉS
            </span>
            <h2>3 RAISONS DE CHOISIR LE SUR MESURE</h2>
          </div>
          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {PROFILES.map((p, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <h3 className="card-title">{p.title}</h3>
                <p className="card-body">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MKR organise tout (réutilisé) */}
      <FacilitatorBand withHeader={true} />

      {/* Pricing */}
      <PricingTable withHeader={true} />

      {/* Processus */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-5">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              PROCESSUS
            </span>
            <h2>5 ÉTAPES, 90 JOURS</h2>
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
              CE N&apos;EST PAS LE BON TUNNEL ?
            </span>
            <h2>EXPLORE LES AUTRES FORMATS</h2>
          </div>
          <div className="grid-3 reveal" style={{ gap: '1.5rem' }}>
            <Link href="/sessions" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>SESSIONS OFFICIELLES</span>
              <h3 className="card-title">4 sessions par an</h3>
              <p className="card-body">Tu veux rejoindre un groupe constitué par MKR ? Quatre sessions calées sur les vacances scolaires : Été 2026, Toussaint 2026, Hiver 2027, Pâques 2027.</p>
            </Link>
            <Link href="/familles" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>FAMILLE</span>
              <h3 className="card-title">Camp Famille</h3>
              <p className="card-body">Tu pars avec un enfant 8-17 ans ? Le tunnel Famille te propose un programme parent + enfant.</p>
            </Link>
            <Link href="/clubs-groupes" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>CLUB ET GROUPE</span>
              <h3 className="card-title">Clubs et groupes</h3>
              <p className="card-body">Tu fédères 5+ personnes (club ou groupe organisé) ? Camp dédié, hébergement bloc.</p>
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=custom"
        primaryLabel="ORGANISER MON CAMP SUR MESURE"
        ghostHref="/contact"
        ghostLabel="POSER UNE QUESTION"
      />
    </>
  )
}
