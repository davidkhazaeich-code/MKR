import Link from 'next/link'
import type { Metadata } from 'next'
import PageHero from '@/components/PageHero'
import SectionCTA from '@/components/SectionCTA'
import DestinationReveal from '@/components/DestinationReveal'
import CinematicReveal from '@/components/CinematicReveal'
import DestinationSafetyProtocol from '@/components/DestinationSafetyProtocol'
import TldrBox from '@/components/TldrBox'

export const metadata: Metadata = {
  title: 'Daghestan : Camps MMA et Lutte au cœur du Caucase | MKR',
  description: "Tout savoir sur le Daghestan : salles d'entraînement, sécurité, culture, excursions. La terre qui forge les champions du MMA et de la lutte mondiale.",
  alternates: { canonical: 'https://mkrcamp.com/destinations/dagestan' },
}

export default function DagestanPage() {
  return (
    <>
      <PageHero
        label="DAGHESTAN"
        title="LA TERRE QUI FORGE LES CHAMPIONS"
        subtitle="Berceau du MMA mondial. Khabib, Makhachev, et des centaines de champions olympiques de lutte."
        breadcrumb={[
          { href: '/destinations', label: 'Destinations' },
          { href: '/destinations/dagestan', label: 'Daghestan' },
        ]}
      />

      <div className="inner">
        <TldrBox
          title="En bref · Daghestan"
          facts={[
            "Région du Caucase Nord (Fédération de Russie), capitale Makhachkala, 3,1 millions d'habitants.",
            "Berceau du MMA mondial : Khabib Nurmagomedov, Islam Makhachev, Magomed Ankalaev (3 champions UFC actuels).",
            "Plus de 30 médailles olympiques de lutte rapportées par la région, méthode daghestanaise mondialement reconnue.",
            "Camp MKR : salles de Makhachkala et Kaspiysk, vol intérieur Istanbul-Makhachkala inclus, transfert 1h30.",
            "Lutte (adultes et enfants 8-17 avec parent) — pour le MMA, voir la Tchétchénie.",
          ]}
        />
      </div>

      <DestinationReveal
        image="/images/environment/dagestan-horses.webp"
        alt="Cavaliers sur les montagnes du Daghestan au coucher du soleil"
        label="CAUCASE · RUSSIE"
        title="LES MONTAGNES<br/>DU DAGHESTAN"
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
          <div className="reveal" style={{ maxWidth: '780px', margin: '0 auto' }}>
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>PRÉSENTATION</span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)', textTransform: 'uppercase' }}>LE DAGHESTAN</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              République du Caucase russe, le Daghestan est une terre de montagnes et de traditions.
              C&apos;est ici que la lutte se transmet de père en fils depuis des siècles. Les villages de montagne
              ont produit plus de champions olympiques par habitant que n&apos;importe quel autre endroit sur Terre.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              Makhachkala, la capitale, abrite des dizaines de salles de combat où s&apos;entraînent quotidiennement
              des centaines d&apos;athlètes de niveau international. C&apos;est dans ces salles que MKR t&apos;emmène.
            </p>
          </div>
        </div>
      </section>

      <DestinationSafetyProtocol
        narrative={
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Pas de formule creuse. La réalité du terrain en 2026 :
              la région où se déroule le camp est stable et fréquentée par des athlètes du monde entier.
              Les villes d&apos;entraînement (Makhachkala, Kaspiysk) sont des zones urbaines normales.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '1rem' }}>
              Le Quai d&apos;Orsay déconseille certaines zones frontalières, pas les zones urbaines où nous opérons.
              Chaque participant est informé en détail avant le départ.
            </p>
          </>
        }
        testimonial={{
          quote: "Je suis parti seul, sans parler russe. L'accueil est incroyable. Sur le tapis, le niveau est brutal.",
          author: 'Romain V. · Sambo · Toulouse',
        }}
      />

      {/* Lieux d'entraînement */}
      <section className="logi-section fx-grid fx-stack-3">
        <div className="inner">
          <div className="logi-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>SALLES</span>
            <h2>LIEUX D&apos;ENTRAÎNEMENT</h2>
          </div>
          <div className="grid-2">
            <figure className="photo-card reveal">
              <img
                src="/images/environment/gym-interior.webp"
                alt="Salle d'entraînement principale à Makhachkala, Daghestan"
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
                alt="Entraînement MMA à Kaspiysk, Daghestan"
                width={800}
                height={600}
                loading="lazy"
                className="section-photo-img"
              />
              <figcaption>Salle secondaire, Kaspiysk. MMA, cage, équipement complet.</figcaption>
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
            <h2>EXCURSIONS ET DÉCOUVERTE</h2>
          </div>
          <div className="grid-3">
            {[
              { title: 'Canyon de Sulak', desc: "Plus profond que le Grand Canyon. Randonnée spectaculaire le jour de repos.", img: '/images/environment/canyon-sulak.webp' },
              { title: 'Dune de Sarykum', desc: "La plus grande dune d'Europe. Paysage surréel à quelques kilomètres de Makhachkala.", img: '/images/environment/sarykum-dune.webp' },
              { title: 'Village de Gamsutl', desc: "Village fantôme perché dans les montagnes. Témoignage d'un Daghestan ancestral.", img: '/images/environment/gamsutl-village.webp' },
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

      {/* Cinematic reveal */}
      <CinematicReveal
        image="/images/environment/mountain-road.webp"
        alt="Route de montagne au Daghestan"
        label="DAGHESTAN"
        title="LA ROUTE DU CHAMPION"
        tagline="Des montagnes qui forgent le caractère. Chaque virage rapproche du camp."
      />

      {/* Logistique resume */}
      <section className="logi-section fx-grid fx-stack-5">
        <div className="inner">
          <div className="group-card reveal">
            <h2>LOGISTIQUE DAGHESTAN</h2>
            <p>Aéroport : Makhachkala (MCX). Transfert MKR depuis l&apos;aéroport inclus. Hébergement en logement de camp.</p>
            <Link href="/logistique" className="btn-ghost" style={{ marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem 1.5rem' }}>
              DÉTAIL COMPLET
            </Link>
          </div>
        </div>
      </section>

      <SectionCTA
        primaryHref="/inscription?type=session"
        primaryLabel="POSTULER · CAMP LUTTE DAGHESTAN"
        ghostHref="/destinations/tchetchenie"
        ghostLabel="VOIR LA TCHÉTCHÉNIE · MMA"
      />
    </>
  )
}
