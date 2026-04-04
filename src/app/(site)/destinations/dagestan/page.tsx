import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'

export const metadata: Metadata = {
  title: 'Dagestan | MKR Caucasian Camp | Camps MMA au coeur du Caucase',
  description: "Tout savoir sur le Dagestan : salles d'entrainement, securite, culture, excursions. La terre qui forge les champions du MMA.",
  alternates: { canonical: 'https://mkrcaucasiancamp.com/destinations/dagestan' },
}

export default function DagestanPage() {
  return (
    <>
      <PageHero
        label="DAGESTAN"
        title="LA TERRE QUI FORGE<br/>LES CHAMPIONS"
        subtitle="Berceau du MMA mondial. Khabib, Makhachev, et des centaines de champions olympiques de lutte."
        breadcrumb={[
          { href: '/destinations', label: 'Destinations' },
          { href: '/destinations/dagestan', label: 'Dagestan' },
        ]}
      />

      <DestinationReveal
        image="/images/environment/dagestan-horses.webp"
        alt="Cavaliers sur les montagnes du Dagestan au coucher du soleil"
        label="CAUCASE · RUSSIE"
        title="LES MONTAGNES<br/>DU DAGESTAN"
        facts={[
          { label: 'Capitale', value: 'Makhachkala' },
          { label: 'Altitude moyenne', value: '1 000 m' },
          { label: 'Champions olympiques', value: '30+' },
          { label: 'Champions UFC', value: '3' },
          { label: 'Salles de combat', value: '100+' },
          { label: 'Population', value: '3.1 millions' },
        ]}
        badges={['TERRE DU MMA', 'BERCEAU DE LA LUTTE', 'KHABIB NURMAGOMEDOV']}
      />

      {/* Presentation */}
      <section className="logi-section fx-grid fx-stack-1">
        <div className="inner">
          <div className="layout-split reveal">
            <div>
              <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PRESENTATION</span>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', textTransform: 'uppercase' }}>LE DAGESTAN</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Republique du Caucase russe, le Dagestan est une terre de montagnes et de traditions.
                C&apos;est ici que la lutte se transmet de pere en fils depuis des siecles. Les villages de montagne
                ont produit plus de champions olympiques par habitant que n&apos;importe quel autre endroit sur Terre.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Makhachkala, la capitale, abrite des dizaines de salles de combat ou s&apos;entrainent quotidiennement
                des centaines d&apos;athletes de niveau international. C&apos;est dans ces salles que MKR t&apos;emmene.
              </p>
            </div>
            <div className="content-card">
              <h3 className="card-title">CHIFFRES CLES</h3>
              <div className="dag-stat"><span>Surface</span><strong>50 300 km2</strong></div>
              <div className="dag-stat"><span>Population</span><strong>3.1 millions</strong></div>
              <div className="dag-stat"><span>Altitude moyenne</span><strong>1 000 m</strong></div>
              <div className="dag-stat"><span>Champions olympiques</span><strong>30+</strong></div>
              <div className="dag-stat"><span>Champions UFC</span><strong>3</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section securite */}
      <section className="dag-security fx-texture-concrete fx-glow fx-glow-breathe fx-mask-b fx-stack-2">
        <div className="fx-glow-orb" />
        <div className="inner">
          <div className="reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SECURITE</span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', textTransform: 'uppercase' }}>
              LA QUESTION QUE TOUT LE MONDE POSE
            </h2>
          </div>
          <div className="layout-split reveal" style={{ marginTop: '2rem' }}>
            <div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                On ne va pas te rassurer avec des formules creuses. La realite du terrain en 2026 :
                la region ou se deroule le camp est stable et frequentee par des athletes du monde entier.
                Les villes d&apos;entrainement (Makhachkala, Kaspiysk) sont des zones urbanisees normales.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
                Le Quai d&apos;Orsay deconseille certaines zones frontalieres, pas les zones urbaines ou nous operons.
                Chaque participant est informe en detail avant le depart.
              </p>
              <p className="pull-quote">
                &laquo; Je suis parti seul, sans parler russe. L&apos;accueil est incroyable. Sur le tapis, le niveau est brutal. &raquo;
              </p>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Romain V. · Sambo · Toulouse</span>
            </div>
            <div>
              <div className="content-card">
                <h3 className="card-title">PROTOCOLE MKR</h3>
                <ul className="logi-check-list">
                  <li>Contact d&apos;urgence 24/7 sur place</li>
                  <li>Equipe francophone permanente</li>
                  <li>Assurance rapatriement obligatoire</li>
                  <li>Briefing securite avant depart</li>
                  <li>Suivi Quai d&apos;Orsay en continu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lieux d'entrainement */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SALLES</span>
            <h2>LIEUX D&apos;ENTRAINEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Salle d'entrainement principale a Makhachkala, Dagestan"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle principale, Makhachkala. Tapis olympiques, espace frappe.</figcaption>
            </figure>
            <figure className="photo-card reveal" style={{ transitionDelay: '0.1s' }}>
              <img
                src="/images/action/sparring-mma-wall.webp"
                alt="Entrainement MMA a Kaspiysk, Dagestan"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle secondaire, Kaspiysk. MMA, cage, equipement complet.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Culture & excursions */}
      <section className="logi-section fx-texture-basalt fx-mask-c fx-stack-4 fx-glow">
        <div className="fx-glow-orb fx-glow-orb--right" />
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>CULTURE</span>
            <h2>EXCURSIONS ET DECOUVERTE</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Canyon de Sulak', desc: "Plus profond que le Grand Canyon. Randonnee spectaculaire le jour de repos.", img: '/images/environment/canyon-sulak.webp' },
              { title: 'Dune de Sarykum', desc: "La plus grande dune d'Europe. Paysage surreal a quelques kilometres de Makhachkala.", img: '/images/environment/sarykum-dune.webp' },
              { title: 'Village de Gamsutl', desc: "Village fantome perche dans les montagnes. Temoignage d'un Dagestan ancestral.", img: '/images/environment/gamsutl-village.webp' },
            ].map((exc, i) => (
              <div key={i} className="content-card fx-grain fx-corner-glow reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <img
                  src={exc.img}
                  alt={exc.title}
                  width={800}
                  height={600}
                  loading="lazy"
                  className="section-photo-img"
                />
                <h3 className="card-title">{exc.title}</h3>
                <p className="card-body">{exc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Atmospheric banner */}
      <section className="cinematic-banner">
        <div className="inner">
          <img
            src="/images/environment/mountain-road.webp"
            alt="Route de montagne au Dagestan"
            width={1200}
            height={514}
            loading="lazy"
            className="section-photo-img"
          />
        </div>
      </section>

      {/* Logistique resume */}
      <section className="logi-section fx-grid fx-stack-5">
        <div className="inner">
          <div className="group-card reveal">
            <h2>LOGISTIQUE DAGESTAN</h2>
            <p>Aeroport : Makhachkala (MCX). Transfert MKR depuis l&apos;aeroport inclus. Hebergement en logement de camp.</p>
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              DETAIL COMPLET
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/sessions"
        primaryLabel="VOIR LES SESSIONS DAGESTAN"
        ghostHref="/destinations/tchetchenie"
        ghostLabel="VOIR AUSSI : TCHETCHENIE"
      />
    </>
  )
}
