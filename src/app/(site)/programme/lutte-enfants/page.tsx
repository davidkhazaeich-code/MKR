import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd'
import CinematicReveal from '@/components/CinematicReveal'
import DisciplineTechniques from '@/components/DisciplineTechniques'
import DisciplineSessionFlow from '@/components/DisciplineSessionFlow'
import { FAMILY_BASE_1WEEK_LABEL } from '@/lib/pricing-copy'

export const metadata = buildMetadata({
  title: 'Lutte Enfants 8-17 ans au Daghestan | MKR Caucasian Camp',
  description: "Programme de lutte pour jeunes athlètes 8-17 ans avec parent. Pédagogie progressive, encadrement spécialisé, fondamentaux daghestanais.",
  path: '/programme/lutte-enfants',
})
const PILLARS = [
  { title: 'Pédagogie progressive', desc: "Les fondamentaux d'abord. On construit le geste juste avant l'intensité. Chaque enfant progresse à son rythme." },
  { title: 'Encadrement spécialisé', desc: 'Coachs formés à la pédagogie jeunesse. Sécurité renforcée, communication adaptée, suivi individuel.' },
  { title: 'Héritage daghestanais', desc: 'Les techniques ancestrales du Caucase, transmises avec patience aux nouvelles générations.' },
  { title: 'Esprit du tapis', desc: 'Respect, discipline, persévérance. La lutte forge le caractère autant que le corps.' },
  { title: 'Groupes de niveau', desc: "Sessions par tranche d'âge et de niveau. Apprentissage adapté, sans pression de compétition." },
  { title: 'Cadre sécurisant', desc: 'Salles équipées, tapis homologués, supervision constante. Les parents peuvent assister aux sessions.' },
]

const SESSION_FLOW = [
  { time: '15 min', activity: 'Échauffement ludique', desc: 'Jeux, mobilité, activation. Mise en route progressive et bienveillante.' },
  { time: '20 min', activity: 'Technique de base', desc: 'Démonstration pas à pas. Chutes, postures, premières saisies. Répétition guidée.' },
  { time: '15 min', activity: 'Drills par paires', desc: 'Application en duo, niveaux similaires. Le coach circule et corrige.' },
  { time: '15 min', activity: 'Situations encadrées', desc: 'Mises en situation supervisées. Jamais de sparring libre, toujours sous contrôle du coach.' },
  { time: '10 min', activity: 'Retour au calme', desc: 'Étirements, débrief, points clés. Chaque enfant repart avec un objectif pour la prochaine session.' },
]

export default function ProgrammeLutteEnfantsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://mkrcamp.com/' },
        { name: 'Programme', url: 'https://mkrcamp.com/programme' },
        { name: 'Lutte enfants', url: 'https://mkrcamp.com/programme/lutte-enfants' },
      ]} />
      <PageHero
        label="JEUNESSE 8-17 ANS · DAGHESTAN"
        title="FORME TON ENFANT<br/>À LA SOURCE."
        subtitle="Programme jeunesse au Daghestan, là où la lutte se transmet depuis des générations. Encadrement spécialisé, pédagogie progressive, parent participant obligatoire."
        breadcrumb={[
          { href: '/programme', label: 'Programme' },
          { href: '/programme/lutte-enfants', label: 'Jeunesse' },
        ]}
        image="/images/ruslan/lutte/kids-briefing.webp"
        imageAlt="Jeunes lutteurs daghestanais attentifs aux consignes de leur coach avant la session, vrai briefing en école russe de lutte"
      />

      {/* Stats parents — bande de réassurance */}
      <section className="parents-stats-band reveal">
        <div className="parents-stats-grid">
          <div>
            <span className="parents-stat-num">8-17</span>
            <span className="parents-stat-label">Ans · Avec parent obligatoire</span>
          </div>
          <div>
            <span className="parents-stat-num">1:5</span>
            <span className="parents-stat-label">Ratio coach jeunesse / enfants</span>
          </div>
          <div>
            <span className="parents-stat-num">2</span>
            <span className="parents-stat-label">Sessions/jour à 10h30 et 17h30</span>
          </div>
          <div>
            <span className="parents-stat-num">{FAMILY_BASE_1WEEK_LABEL.replace(/\s*€/, '')}</span>
            <span className="parents-stat-label">Forfait Famille · 1 sem (1 parent + 1 enfant)</span>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="logi-section fx-grid fx-stack-1 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--left" />
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>LE PROGRAMME</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LUTTE POUR LES JEUNES</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Au Daghestan, on commence la lutte très jeune. Les champions du monde y ont tous appris les mêmes
                gestes, dans les mêmes salles, par les mêmes coachs. MKR ouvre cet accès aux jeunes athlètes
                européens, dans un cadre adapté à leur âge.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le programme Lutte enfants est conduit par des coachs formés à la pédagogie jeunesse. La progression
                reste progressive, jamais forcée. L&apos;objectif : transmettre la passion et les fondamentaux,
                sans pression ni compétition prématurée.
              </p>
            </div>
            <div>
              <figure className="photo-card">
                <img
                  src="/images/ruslan/kids/kids-alignes-tapis-vertical.webp"
                  alt="Jeunes lutteurs alignés sur le tapis, école de lutte daghestanaise"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
              <figure className="photo-card" style={{ marginTop: '1.25rem' }}>
                <img
                  src="/images/ruslan/kids/kid-stretching-debout.webp"
                  alt="Jeune lutteur en échauffement individuel, salle de lutte du Daghestan"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic reveal : jeune lutteur en posture */}
      <CinematicReveal
        image="/images/ruslan/kids/kid-lutteur-rouge-rossiya.webp"
        alt="Jeune lutteur daghestanais en posture, salle d'entraînement de Makhachkala"
        label="TRANSMISSION"
        title="LE GESTE JUSTE,<br/>AVANT TOUT"
        tagline="Fondamentaux d&apos;abord. Confiance, technique, respect du tapis. Tout commence là."
      />

      <DisciplineTechniques items={PILLARS} label="PILIERS" title="NOTRE APPROCHE" />

      <DisciplineSessionFlow
        steps={SESSION_FLOW}
        hoursNote={<>Sessions matin à <strong>10h30</strong> et après-midi à <strong>17h30</strong>. Pas de chevauchement avec les sessions adultes.</>}
      />

      {/* Pour les parents : version compacte, le détail vit sur /familles */}
      <section className="logi-section fx-texture-concrete fx-mask-d fx-stack-5">
        <div className="inner">
          <div className="group-card reveal" style={{ textAlign: 'center' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.6rem' }}>POUR LES PARENTS</span>
            <h2 style={{ fontSize: 'clamp(1.4rem, 2.8vw, 1.9rem)' }}>TON ENFANT EST ENTRE DE BONNES MAINS</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', maxWidth: '680px', margin: '0.8rem auto 0', lineHeight: '1.6' }}>
              Coach jeunesse dédié, ratio 1 pour 5, parent participant obligatoire, briefing après chaque session.
              Le détail complet du cadre famille (sécurité, hébergement, programme parallèle, forfait Famille à partir de {FAMILY_BASE_1WEEK_LABEL}) est sur la page Camp Famille.
            </p>
            <div style={{ marginTop: '1.4rem' }}>
              <Link href="/familles" className="btn-ghost" style={{ fontSize: '0.85rem', padding: '0.6rem 1.4rem' }}>
                DÉCOUVRIR LE CAMP FAMILLE
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=famille"
        primaryLabel="INSCRIRE MA FAMILLE"
        ghostHref="/familles"
        ghostLabel="DÉCOUVRIR LE CAMP FAMILLE"
      />
    </>
  )
}
