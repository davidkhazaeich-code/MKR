import type { ReactNode } from 'react'
import { frSessionDisplayFromId } from '@/lib/session-display-fr'

/**
 * FormAnswers — rendu lisible des reponses du formulaire d'inscription sur la
 * fiche candidat admin.
 *
 * Probleme resolu : le `form_data` (JSON Supabase) stocke des codes bruts
 * (`niveau: "avance"`, `condition_physique: "4"`, `deux_fois_jour: "avec-adaptation"`)
 * et des tableaux d'objets (`enfants`, `autres_participants`). L'ancien rendu
 * affichait ces codes tels quels sous un libelle court, sans rappeler la QUESTION
 * posee au candidat. Resultat : en lisant une fiche, on ne savait plus ce qui
 * avait ete demande ni ce que le code voulait dire.
 *
 * Ici, pour CHAQUE reponse on affiche : la question exacte vue par le candidat
 * (verbatim du formulaire FR), un rappel de contexte eventuel, puis la reponse
 * DECODEE en clair (le libelle de l'option choisie, pas le code).
 *
 * Source de verite des libelles/options : `messages/fr/inscription.json` +
 * `src/components/InscriptionLayout.tsx`. Les CLES d'option sont les valeurs
 * REELLEMENT stockees (verifiees en base) : ex. `competiteur-regional` (tiret)
 * et `avec-adaptation` (tiret), la ou l'i18n utilise des underscores pour ses
 * propres cles. On mappe donc sur la valeur stockee, avec les deux variantes
 * quand un doute existe.
 *
 * Admin = 100% FR (cf. AGENTS.md, proxy.ts bloque /en/admin). Aucune cle i18n
 * ici, ce sont des strings FR inline comme le reste du dashboard.
 */

type FieldType = 'text' | 'textarea' | 'url' | 'select' | 'multiselect' | 'boolean' | 'number'

interface FieldDef {
  key: string
  question: string
  help?: string
  type: FieldType
  /** Map valeur-stockee -> libelle affiche au candidat. */
  options?: Record<string, string>
  /** Resolveur dynamique, quand les valeurs possibles ne sont pas connues d'avance
   *  (ex. un id de session, qui depend de l'annee du dossier). */
  resolve?: (value: string) => string | undefined
  /** Champ facultatif : masque si vide (ne pas polluer la fiche). */
  optional?: boolean
  /** Champ conditionnel (depend d'une reponse precedente) : masque si vide. */
  conditional?: boolean
}

interface ArrayDef {
  key: string
  /** Titre singulier de chaque sous-carte, ex. "Enfant", "Participant". */
  title: string
  /** Numerotation de depart (le responsable custom est le participant 1). */
  startIndex?: number
  fields: FieldDef[]
}

interface SectionDef {
  key: string
  label: string
  fields: FieldDef[]
  arrays?: ArrayDef[]
  /** Cles a ignorer dans le rendu "extras" (deja couvertes autrement). */
  skipKeys?: string[]
  /** Section de bas de page, style attenue. */
  muted?: boolean
}

/* ─────────────── Maps d'options (valeur stockee -> libelle candidat) ─────────────── */

const ANNEES_PRATIQUE: Record<string, string> = {
  '1-2': '1 à 2 ans',
  '2-5': '2 à 5 ans',
  '5-10': '5 à 10 ans',
  '10+': '10 ans et plus',
}

// Union des niveaux (responsable session/famille/groupe + custom). On accepte
// les variantes tiret ET underscore pour les competiteurs par securite.
const NIVEAU: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  competiteur: 'Compétiteur',
  'competiteur-regional': 'Compétiteur régional',
  'competiteur-national': 'Compétiteur national',
  'competiteur-international': 'Compétiteur international',
  competiteur_regional: 'Compétiteur régional',
  competiteur_national: 'Compétiteur national',
  competiteur_international: 'Compétiteur international',
}

const NIVEAU_CUSTOM: Record<string, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
  competiteur: 'Compétiteur',
}

const CONDITION_PHYSIQUE: Record<string, string> = {
  '2': 'Moyenne · reprise récente',
  '3': 'Bonne · entraînement régulier',
  '4': 'Très bonne · entraînement intensif',
  '5': 'Excellente · niveau compétition',
}

const BLESSURES: Record<string, string> = {
  non: 'Non, aucune blessure',
  mineure: 'Mineure, entièrement guérie',
  oui: 'Oui, à préciser',
}

const CONTRE_INDICATIONS: Record<string, string> = {
  non: 'Non',
  oui: 'Oui, à préciser',
}

const DEUX_FOIS_JOUR: Record<string, string> = {
  oui: 'Oui, je suis prêt(e)',
  'avec-adaptation': 'Oui, avec quelques adaptations',
  avec_adaptation: 'Oui, avec quelques adaptations',
  non: 'Non, je préfère un rythme allégé',
}

const SOURCE_DECOUVERTE: Record<string, string> = {
  instagram: 'Instagram',
  bouche_a_oreille: 'Bouche à oreille',
  coach: 'Recommandation de mon coach',
  influenceur: "Recommandation d'un influenceur",
  google: 'Recherche Google',
  autre: 'Autre',
}

const NOMBRE_PARTICIPANTS_GROUPE: Record<string, string> = {
  '5': '5 personnes',
  '6-10': '6 à 10 personnes',
  '11-20': '11 personnes et plus',
  '20+': 'Plus de 20 (privatisation totale)',
}

const NIVEAU_GROUPE: Record<string, string> = {
  debutant: 'Mixte débutant / intermédiaire',
  intermediaire: 'Intermédiaire homogène',
  avance: 'Avancé / compétiteurs',
  mixte: 'Mixte (à préciser)',
}

const COMPOSITION: Record<string, string> = {
  '1': 'Solo · 1 personne',
  '2': 'Duo · 2 personnes',
  '3': 'Trio · 3 personnes',
  '4': 'Quatuor · 4 personnes',
}

// Le format famille est soit une session officielle (libelle reconstruit depuis
// l'id, meme pour une session passee), soit le camp sur mesure.
const FORMAT_FAMILLE_CUSTOM = 'Camp famille sur mesure (dates libres)'
function formatFamilleLabel(value: string): string | undefined {
  if (value === 'sur-mesure') return FORMAT_FAMILLE_CUSTOM
  const display = frSessionDisplayFromId(value)
  return display ? `Session officielle · ${display.season_label}` : undefined
}

const NOMBRE_PARENTS: Record<string, string> = {
  '1': '1 parent participant',
  '2': '2 parents participants',
}

const OUI_NON: Record<string, string> = { non: 'Non, première expérience', oui: 'Oui, déjà pratiquant' }
const CONTRE_INDIC_ENFANT: Record<string, string> = { non: 'Non, aucune', oui: 'Oui, à préciser' }

/* ─────────────── Sous-catalogues des tableaux d'objets ─────────────── */

const CHILD_FIELDS: FieldDef[] = [
  { key: 'prenom', question: 'Prénom de l\'enfant', type: 'text' },
  { key: 'age', question: 'Âge', type: 'number' },
  {
    key: 'pratiqueDeja',
    question: 'Pratique déjà la lutte, le MMA ou un sport de combat ?',
    type: 'select',
    options: OUI_NON,
  },
  { key: 'anneesPratique', question: 'Depuis combien d\'années ?', type: 'text', conditional: true },
  {
    key: 'contreIndications',
    question: 'Contre-indications médicales connues ?',
    type: 'select',
    options: CONTRE_INDIC_ENFANT,
  },
  {
    key: 'contreIndicationsDetail',
    question: 'Détail des contre-indications',
    type: 'textarea',
    conditional: true,
  },
]

const PARTICIPANT_FIELDS: FieldDef[] = [
  { key: 'prenom', question: 'Prénom', type: 'text' },
  { key: 'niveau', question: 'Niveau', type: 'select', options: NIVEAU_CUSTOM },
  { key: 'discipline', question: 'Discipline principale', type: 'select', optional: true },
]

/* ─────────────── Catalogue par section ─────────────── */

const CGV_SENTENCE =
  "J'accepte les conditions générales du camp (rythme intensif, règles de vie collective, discipline de groupe) et la politique de confidentialité."
const GROUPE_SENTENCE =
  "J'autorise Ruslan (MKR) à me contacter par email, téléphone ou WhatsApp pour cadrer le séjour et m'envoyer un devis personnalisé. Aucun paiement n'est prélevé à cette étape. J'accepte les conditions de traitement de mes données."

function buildCatalog(tunnel: string): SectionDef[] {
  return [
    {
      key: 'experience',
      label: 'Expérience sportive',
      fields: [
        { key: 'discipline_principale', question: 'Quelle est ta discipline principale ?', type: 'select' },
        {
          key: 'disciplines_secondaires',
          question: 'Quelles autres disciplines pratiques-tu ?',
          type: 'multiselect',
          optional: true,
        },
        { key: 'annees_pratique', question: 'Depuis combien d\'années pratiques-tu ?', type: 'select', options: ANNEES_PRATIQUE },
        { key: 'niveau', question: 'Quel est ton niveau actuel ?', type: 'select', options: NIVEAU },
        { key: 'club', question: 'Club / salle actuelle', type: 'text', optional: true },
        { key: 'coach', question: 'Coach / instructeur', type: 'text', optional: true },
        { key: 'palmares', question: 'Palmarès et compétitions', type: 'textarea', optional: true },
        { key: 'lien_video', question: 'Lien vidéo (démo, compétition)', type: 'url', optional: true },
      ],
    },
    {
      key: 'sante',
      label: 'Santé et aptitude',
      fields: [
        {
          key: 'condition_physique',
          question: 'Comment évalues-tu ta condition physique actuelle ?',
          type: 'select',
          options: CONDITION_PHYSIQUE,
        },
        {
          key: 'blessures_recentes',
          question: 'As-tu eu des blessures significatives ces 3 derniers mois ?',
          type: 'select',
          options: BLESSURES,
        },
        { key: 'blessures_detail', question: 'Détail de la blessure', type: 'textarea', conditional: true },
        {
          key: 'contre_indications',
          question: 'As-tu des contre-indications médicales à l\'effort intense ?',
          type: 'select',
          options: CONTRE_INDICATIONS,
        },
        {
          key: 'contre_indications_detail',
          question: 'Détail des contre-indications',
          type: 'textarea',
          conditional: true,
        },
        {
          key: 'deux_fois_jour',
          question: 'Es-tu capable de t\'entraîner deux fois par jour, 6 jours sur 7 ?',
          help: 'Les sessions durent 2 à 3h. C\'est le rythme standard du camp.',
          type: 'select',
          options: DEUX_FOIS_JOUR,
        },
      ],
    },
    {
      key: 'groupe',
      label: 'Club / Groupe',
      fields: [
        { key: 'nom_club', question: 'Nom du club ou du groupe', type: 'text' },
        {
          key: 'nombre_participants',
          question: 'Nombre approximatif de participants',
          type: 'select',
          options: NOMBRE_PARTICIPANTS_GROUPE,
        },
        { key: 'niveau_groupe', question: 'Niveau global du groupe', type: 'select', options: NIVEAU_GROUPE },
        { key: 'disciplines', question: 'Discipline(s) principale(s) du club', type: 'multiselect', optional: true },
        { key: 'palmares_club', question: 'Palmarès collectif du club', type: 'textarea', optional: true },
        { key: 'lien_video', question: 'Lien vidéo ou réseau du club', type: 'url', optional: true },
      ],
    },
    {
      key: 'custom',
      label: 'Composition (sur mesure)',
      fields: [
        { key: 'composition', question: 'Vous êtes combien ?', type: 'select', options: COMPOSITION },
      ],
      arrays: [
        { key: 'autres_participants', title: 'Participant', startIndex: 2, fields: PARTICIPANT_FIELDS },
      ],
    },
    {
      key: 'famille',
      label: 'Famille',
      fields: [
        { key: 'format', question: 'Format choisi', type: 'select', resolve: formatFamilleLabel },
        { key: 'nombre_parents', question: 'Combien de parents participent ?', type: 'select', options: NOMBRE_PARENTS },
      ],
      arrays: [
        { key: 'enfants', title: 'Enfant', startIndex: 1, fields: CHILD_FIELDS },
      ],
      // conjoint_participe est deja resume par nombre_parents.
      skipKeys: ['conjoint_participe'],
    },
    {
      key: 'logistique',
      label: 'Découverte et message',
      fields: [
        { key: 'source_decouverte', question: 'Comment as-tu connu le camp ?', type: 'select', options: SOURCE_DECOUVERTE, optional: true },
        { key: 'message', question: 'Questions ou informations complémentaires', type: 'textarea', optional: true },
      ],
    },
    {
      key: 'confirmations',
      label: 'Engagements du candidat',
      fields: [
        {
          key: 'certif_medical',
          question: 'Certificat médical d\'aptitude',
          help: 'Je m\'engage à fournir un certificat médical d\'aptitude à la pratique sportive intensive avant le départ.',
          type: 'boolean',
        },
        {
          key: 'accepte_conditions',
          question: 'Conditions générales et données personnelles',
          help: tunnel === 'groupe' ? GROUPE_SENTENCE : CGV_SENTENCE,
          type: 'boolean',
        },
        {
          key: 'pret',
          question: 'Prêt pour l\'entretien de sélection',
          help: 'Je suis prêt(e) à passer l\'entretien vidéo de sélection et à fournir une vidéo de ma pratique si demandé.',
          type: 'boolean',
        },
      ],
    },
    {
      key: '_meta',
      label: 'Métadonnées techniques',
      muted: true,
      fields: [
        { key: 'ip', question: 'Adresse IP', type: 'text' },
        { key: 'ua', question: 'Navigateur (User-Agent)', type: 'text' },
      ],
    },
  ]
}

/* ─────────────── Helpers de rendu ─────────────── */

function isBlank(v: unknown): boolean {
  return v === '' || (Array.isArray(v) && v.length === 0)
}

// null/undefined = champ non applicable pour ce tunnel -> on masque totalement.
// ''/[] = champ propose mais laisse vide -> masque si optionnel/conditionnel,
// sinon affiche "Non renseigné" (drapeau utile pour un champ requis).
function shouldSkip(field: FieldDef, value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (isBlank(value) && (field.optional || field.conditional)) return true
  return false
}

function renderAnswer(field: FieldDef, value: unknown): ReactNode {
  if (isBlank(value)) {
    return <p className="adm-qa-a adm-qa-a--empty">Non renseigné</p>
  }

  if (field.type === 'boolean') {
    return value === true ? (
      <p className="adm-qa-a adm-qa-a--yes">Oui, accepté</p>
    ) : (
      <p className="adm-qa-a adm-qa-a--no">Non</p>
    )
  }

  if (field.type === 'multiselect' && Array.isArray(value)) {
    return (
      <div className="adm-qa-chips">
        {value.map((v, i) => (
          <span key={i} className="adm-qa-chip">
            {field.resolve?.(String(v)) ?? field.options?.[String(v)] ?? String(v)}
          </span>
        ))}
      </div>
    )
  }

  if (field.type === 'url' && typeof value === 'string') {
    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`
    return (
      <p className="adm-qa-a">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      </p>
    )
  }

  const display = field.resolve?.(String(value)) ?? field.options?.[String(value)] ?? String(value)
  return <p className="adm-qa-a">{display}</p>
}

function QA({ field, value }: { field: FieldDef; value: unknown }) {
  return (
    <div className="adm-qa">
      <p className="adm-qa-q">{field.question}</p>
      {field.help && <p className="adm-qa-help">{field.help}</p>}
      {renderAnswer(field, value)}
    </div>
  )
}

function humanizeKey(key: string): string {
  const s = key.replace(/[_-]+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function GenericAnswer({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <p className="adm-qa-a adm-qa-a--empty">Non renseigné</p>
  }
  if (typeof value === 'boolean') return <p className="adm-qa-a">{value ? 'Oui' : 'Non'}</p>
  if (Array.isArray(value)) {
    return (
      <p className="adm-qa-a">
        {value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ')}
      </p>
    )
  }
  if (typeof value === 'object') {
    return <pre className="adm-pre">{JSON.stringify(value, null, 2)}</pre>
  }
  return <p className="adm-qa-a">{String(value)}</p>
}

/* ─────────────── Composant ─────────────── */

export default function FormAnswers({
  formData,
  tunnelType,
}: {
  formData: Record<string, unknown>
  tunnelType: string
}) {
  const catalog = buildCatalog(tunnelType)
  const renderedSectionKeys = new Set(catalog.map((s) => s.key))

  const sections: ReactNode[] = []

  for (const section of catalog) {
    const data = formData[section.key]
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue
    const row = data as Record<string, unknown>

    const visibleFields = section.fields.filter((f) => !shouldSkip(f, row[f.key]))
    const arrayBlocks = (section.arrays ?? []).filter(
      (a) => Array.isArray(row[a.key]) && (row[a.key] as unknown[]).length > 0,
    )

    // Cles couvertes (champs + tableaux + skip explicites) pour ne pas doublonner
    // dans le rendu "extras".
    const covered = new Set<string>([
      ...section.fields.map((f) => f.key),
      ...(section.arrays ?? []).map((a) => a.key),
      ...(section.skipKeys ?? []),
    ])
    const extraKeys = Object.keys(row).filter((k) => !covered.has(k) && row[k] !== null && row[k] !== '')

    if (visibleFields.length === 0 && arrayBlocks.length === 0 && extraKeys.length === 0) continue

    sections.push(
      <section key={section.key} className={`adm-card${section.muted ? ' adm-card--muted' : ''}`}>
        <h2 className="adm-card-title">{section.label}</h2>
        <div className="adm-qa-list">
          {visibleFields.map((f) => (
            <QA key={f.key} field={f} value={row[f.key]} />
          ))}

          {arrayBlocks.map((a) => {
            const items = row[a.key] as Record<string, unknown>[]
            return items.map((item, idx) => {
              const subFields = a.fields.filter((f) => !shouldSkip(f, item[f.key]))
              if (subFields.length === 0) return null
              return (
                <div key={`${a.key}-${idx}`} className="adm-qa-group">
                  <p className="adm-qa-group-title">
                    {a.title} {(a.startIndex ?? 1) + idx}
                  </p>
                  <div className="adm-qa-sublist">
                    {subFields.map((f) => (
                      <QA key={f.key} field={f} value={item[f.key]} />
                    ))}
                  </div>
                </div>
              )
            })
          })}

          {extraKeys.map((k) => (
            <div key={k} className="adm-qa">
              <p className="adm-qa-q">{humanizeKey(k)}</p>
              <GenericAnswer value={row[k]} />
            </div>
          ))}
        </div>
      </section>,
    )
  }

  // Sections inconnues (defensif : si le form ajoute une section non cataloguee,
  // on l'affiche brute plutot que de la perdre).
  for (const key of Object.keys(formData)) {
    if (renderedSectionKeys.has(key)) continue
    const val = formData[key]
    if (!val || typeof val !== 'object') continue
    sections.push(
      <section key={key} className="adm-card adm-card--muted">
        <h2 className="adm-card-title">{humanizeKey(key)}</h2>
        <pre className="adm-pre">{JSON.stringify(val, null, 2)}</pre>
      </section>,
    )
  }

  return <>{sections}</>
}
