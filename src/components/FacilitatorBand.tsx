import Icon, { type IconName } from './Icon'

type FacilitatorItem = { title: string; desc: string; icon: IconName }

const FACILITATOR_ITEMS: FacilitatorItem[] = [
  {
    title: 'Visa Russie inclus',
    desc: "Frais consulaires, lettre d'invitation officielle, questionnaire UE et accompagnement complet du dossier. Tu fournis ton passeport, MKR pilote la procédure.",
    icon: 'passport',
  },
  {
    title: 'Vol intérieur',
    desc: "Depuis Istanbul vers Makhachkala (Lutte au Daghestan) ou Grozny (MMA en Tchétchénie), inclus dans le package. Tu n'organises que le vol international jusqu'à Istanbul.",
    icon: 'plane',
  },
  {
    title: 'Transferts',
    desc: 'Véhicule MKR à ton arrivée : ~1h30 depuis Makhachkala (Daghestan) ou ~30 min depuis Grozny (Tchétchénie). Tous les déplacements sont inclus.',
    icon: 'taxi',
  },
  {
    title: 'Hébergement',
    desc: 'Logement de camp confortable, chambre famille disponible. Tu dors et tu manges avec ton groupe.',
    icon: 'hotel',
  },
  {
    title: '2 repas par jour',
    desc: 'Petit-déjeuner et déjeuner inclus. Cuisine caucasienne adaptée aux athlètes : protéines, légumes, pain frais.',
    icon: 'food',
  },
  {
    title: 'Encadrement',
    desc: 'Coachs locaux expérimentés au Daghestan (Lutte) et en Tchétchénie (MMA). Coach jeunesse dédié pour les 8-17 ans en Lutte enfants.',
    icon: 'team',
  },
]

interface FacilitatorBandProps {
  /** Affiche le titre + eyebrow au-dessus */
  withHeader?: boolean
}

export default function FacilitatorBand({ withHeader = true }: FacilitatorBandProps) {
  return (
    <section
      id="facilitator"
      className="facilitator-band fx-texture-concrete fx-glow fx-mask-c fx-stack-3"
      aria-labelledby="facilitator-heading"
    >
      <div className="fx-glow-orb fx-glow-orb--right fx-glow-breathe" aria-hidden="true" />
      <div className="inner">
        {withHeader && (
          <div className="facilitator-header reveal">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              TOUT EST INCLUS
            </span>
            <h2 id="facilitator-heading" className="facilitator-title">
              ON S&apos;OCCUPE DE TOUT.<br/>
              TOI, TU T&apos;ENTRAÎNES.
            </h2>
            <p className="facilitator-sub">
              Visa, vol intérieur, navette, hébergement, repas et entraînement : six prestations incluses dans chaque camp,
              quel que soit le format choisi. Tu organises uniquement ton vol jusqu&apos;à Istanbul.
            </p>
          </div>
        )}

        <div className="facilitator-grid">
          {FACILITATOR_ITEMS.map((item, i) => (
            <article
              key={i}
              className="facilitator-card reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="facilitator-card-icon" aria-hidden="true">
                <Icon name={item.icon} size={32} />
              </div>
              <h3 className="facilitator-card-title">{item.title}</h3>
              <p className="facilitator-card-desc">{item.desc}</p>
            </article>
          ))}
        </div>

        <div className="facilitator-force reveal" aria-labelledby="facilitator-force-heading">
          <div className="facilitator-force-col">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>NOTRE FORCE</span>
            <h3 id="facilitator-force-heading" className="facilitator-force-title">UNE ÉQUIPE EN FRANCE, DES RÉFÉRENTS SUR PLACE</h3>
          </div>
          <div className="facilitator-force-col">
            <p className="facilitator-force-text">
              Toute l&apos;administration et les réseaux sont gérés depuis la France, par une équipe francophone qui prend ton dossier en main de A à Z.
              Sur le terrain, des référents locaux t&apos;accompagnent dans les salles avec Ruslan Mukhtarov, fondateur et entraîneur de Lutte et MMA.
            </p>
          </div>
        </div>

        <p className="facilitator-footnote reveal">
          Tu n&apos;as qu&apos;une chose à faire : préparer ton sac. Le reste, on s&apos;en charge.
        </p>
      </div>
    </section>
  )
}
