import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import PricingTable from '@/components/PricingTable'
import FacilitatorBand from '@/components/FacilitatorBand'

export const metadata: Metadata = {
  title: 'Camp Sur Mesure | MKR Caucasian Camp | Tes dates au Daghestan',
  description: 'Camp individuel sur mesure au Daghestan. Tu choisis tes dates, ta durée (1, 2 ou 3 sem), ton format (solo, duo, trio, quatuor). MKR coordonne tout. Délai 90 jours min.',
  alternates: { canonical: 'https://mkrcaucasiancamp.com/sur-mesure' },
}

const PROFILES = [
  {
    title: 'Pro / semi-pro en prep compétition',
    desc: "Tu prépares un combat ou un tournoi. Tu cibles des dates précises de prep. Le sur mesure te donne le calage parfait.",
  },
  {
    title: 'Athlète au planning serré',
    desc: "La session officielle ne te convient pas (vacances, contraintes pro). Tu choisis 1, 2 ou 3 semaines aux dates qui te vont.",
  },
  {
    title: 'Duo, trio, quatuor d\'amis',
    desc: "Tu pars avec 1 à 3 amis adultes. Vous choisissez ensemble les dates, vivez l'expérience à plusieurs sans être un club entier.",
  },
]

const PROCESS = [
  { num: '01', title: 'Tu remplis le formulaire', desc: 'Composition (1 à 4 adultes), dates souhaitées (90 jours min avant), durée (1, 2 ou 3 sem), niveau, objectifs.' },
  { num: '02', title: 'Validation MKR sous 48h', desc: 'On valide la disponibilité des coachs et de l\'hébergement à tes dates. Appel vidéo de qualification.' },
  { num: '03', title: 'Acompte 30% + lettre visa', desc: 'Tu reçois la lettre d\'invitation officielle pour ton dossier visa Russie. Acompte 30% versé.' },
  { num: '04', title: 'Préparation 6 semaines', desc: 'Programme de prep physique à distance. Solde 30 jours avant le départ.' },
  { num: '05', title: 'Départ et camp', desc: 'Vol intérieur Istanbul-Makhachkala inclus. Véhicule MKR à l\'aéroport. Tu n\'as qu\'à t\'entraîner.' },
]

export default function SurMesurePage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcaucasiancamp.com/' },
        { name: 'Sur Mesure', url: 'https://mkrcaucasiancamp.com/sur-mesure' },
      ]} />

      <PageHero
        label="SUR MESURE · 1 À 4 ADULTES"
        title="TES DATES.<br/>TON AVENTURE."
        subtitle="Camp individuel ou en petit groupe d'amis (1 à 4 adultes). Tu choisis tes dates, ta durée. MKR coordonne tout sur place."
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
            <span className="parents-stat-num">1 500</span>
            <span className="parents-stat-label">CHF · 1 sem · à partir de</span>
          </div>
        </div>
      </section>

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/ruslan/action/mma-cercle-session-demo-mkr.webp"
        alt="Cercle de combattants en démonstration grappling au Daghestan"
        label="POUR QUI"
        title="LE TUNNEL FAIT POUR TOI<br/>SI TU VEUX MAÎTRISER TES DATES."
        tagline="Tu connais déjà ton objectif. Tu sais quand tu peux partir. MKR adapte tout autour de ton agenda."
      />

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
            <Link href="/mkr-camp-2026" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>SESSION OFFICIELLE</span>
              <h3 className="card-title">MKR Camp 2026</h3>
              <p className="card-body">Tu veux rejoindre la session du 17 août - 5 sept 2026 ? Groupe constitué, esprit collectif.</p>
            </Link>
            <Link href="/familles" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>FAMILLE</span>
              <h3 className="card-title">Camp Famille</h3>
              <p className="card-body">Tu pars avec un enfant 8-17 ans ? Le tunnel Famille te propose un programme parent + enfant.</p>
            </Link>
            <Link href="/clubs-groupes" className="content-card fx-grain fx-corner-glow" style={{ textDecoration: 'none', display: 'block' }}>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}>CLUB & GROUPE</span>
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
