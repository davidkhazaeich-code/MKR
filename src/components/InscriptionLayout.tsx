'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { REGISTRATION_TYPES, type RegistrationTypeId, getRegistrationType } from '@/data/registration-types'
import {
  calculatePrice,
  formatEUR,
  pricePerAdult,
  parseDuration,
  isOnQuote,
  FAMILY_PRICING,
  PRICING_TIERS,
  type Duration,
} from '@/data/pricing'
import { SESSIONS } from '@/data/sessions'
import PlacesRestantes from '@/components/PlacesRestantes'
import IconLutte from '@/components/icons/IconLutte'
import IconMMA from '@/components/icons/IconMMA'
import IconCombo from '@/components/icons/IconCombo'
import IconFamille from '@/components/icons/IconFamille'

const DEFAULT_SESSION_ID = SESSIONS[0]?.id ?? 'aout-2026'
const SESSION_IDS = SESSIONS.map(s => s.id)

const StoryCard = dynamic(() => import('./StoryCard'))

/* ─────────────── DATA ─────────────── */

// Le pipeline d'inscription depend du tunnel choisi :
// - session / custom / famille : 5 etapes (Le camp / Identite / Experience / Sante / Confirmation)
// - groupe : 4 etapes (Le camp / Ton club / Contact / Confirmation), pas de qualif individuelle
//   ni de sante (c'est une demande de devis, Ruslan recontacte pour cadrer).
const STEPS_BY_TUNNEL: Record<RegistrationTypeId, readonly string[]> = {
  session: ['Le camp', 'Identité', 'Expérience', 'Santé', 'Confirmation'],
  custom:  ['Le camp', 'Identité', 'Expérience', 'Santé', 'Confirmation'],
  famille: ['Le camp', 'Identité', 'Expérience', 'Santé', 'Confirmation'],
  groupe:  ['Le camp', 'Ton club', 'Contact', 'Confirmation'],
} as const

// Fallback affichage pre-selection (audience pas encore choisie).
const STEPS_DEFAULT = STEPS_BY_TUNNEL.session

const DISCIPLINES = [
  'MMA', 'Lutte Libre', 'Lutte Gréco-Romaine', 'Boxe Anglaise',
  'Kickboxing / K-1', 'Muay Thaï', 'Grappling / No-Gi', 'Sambo',
  'Jiu-Jitsu Brésilien', 'Judo', 'Autre',
]

// Participant individuel pour tunnel custom (Duo/Trio/Quatuor)
export type CustomParticipant = {
  prenom: string
  niveau: string // 'debutant' | 'intermediaire' | 'avance' | 'competiteur'
  discipline: string
}

// Enfant 8-17 ans pour tunnel famille
export type FamilyChild = {
  prenom: string
  age: string // 8 à 17
  pratiqueDeja: string // 'oui' | 'non'
  anneesPratique: string // optionnel si pratiqueDeja='oui'
  contreIndications: string // 'non' | 'oui'
  contreIndicationsDetail: string
}

type FormData = {
  // Identité (responsable / inscrit principal)
  prenom: string; nom: string; dateNaissance: string; pays: string; email: string; telephone: string
  // Expérience individuelle (session, custom responsable, famille parent)
  disciplinePrincipale: string; disciplinesSecondaires: string[]; anneesPratique: string
  niveau: string; club: string; coach: string; palmares: string; lienVideo: string
  // Santé individuelle (session, custom responsable, famille parent)
  conditionPhysique: string; blessuresRecentes: string; blessuresDetail: string
  contreIndications: string; contreIndicationsDetail: string; deuxFoisJour: string
  // Logistique commune
  session: string; duree: string; villeDepart: string; disponibleEntretien: string
  sourceDecouverte: string; message: string
  // Discipline du camp (choix Lutte/MMA/Combo).
  // - tunnel 'session' : 'lutte' (Daghestan, 15 places) ou 'mma' (Tchétchénie, 15 places, avancé min.)
  // - tunnel 'custom' / 'groupe' : 'lutte', 'mma', ou 'combo_quote' (combo Lutte+MMA, sur devis)
  // - tunnel 'famille' : forcé à 'lutte' (parent + enfants sur le même camp Daghestan)
  campDiscipline: '' | 'lutte' | 'mma' | 'combo_quote'
  // Confirmations
  certifMedical: boolean; accepteConditions: boolean; pret: boolean
  // Camp sur mesure (audience='custom' ou 'groupe' ou famille sur-mesure)
  dateDebutSouhaitee: string
  // Famille
  vientAvecFamille: boolean
  nombreEnfants: string
  enfantsAges: string // legacy: garde pour compat, mais on remplit aussi enfants[]
  enfants: FamilyChild[]
  // Famille — conjoint(e) qui participe aussi (tarif Duo 1490/2290/2790 par parent + enfants à 790/sem)
  conjointParticipe: boolean
  // Groupe (audience='groupe')
  nomClub: string
  nombreParticipants: string
  niveauGroupe: string
  palmaresClub: string // collectif, optionnel
  // Custom Duo/Trio/Quatuor — autres participants que le responsable
  autresParticipants: CustomParticipant[]
}

// Niveaux acceptés pour le camp MMA. Le form bloque le passage si discipline=mma
// et niveau en-dessous d'avancé. Ruslan filtre ensuite en visio.
const MMA_ACCEPTED_LEVELS = new Set(['avance', 'competiteur-regional', 'competiteur-national', 'competiteur-international'])

// Icônes des disciplines (composants dédiés dans @/components/icons/)
// IconLutte = vectorisation de la ref PNG (2 lutteurs en stance)
// IconMMA = gant ouvert MMA stroke
// IconCombo = Lutte + Gant côte à côte dans un viewBox 48x24
const ICON_LUTTE = <IconLutte />
const ICON_MMA = <IconMMA />
const ICON_COMBO = <IconCombo />

const INITIAL: FormData = {
  prenom: '', nom: '', dateNaissance: '', pays: '', email: '', telephone: '',
  disciplinePrincipale: '', disciplinesSecondaires: [], anneesPratique: '',
  niveau: '', club: '', coach: '', palmares: '', lienVideo: '',
  conditionPhysique: '', blessuresRecentes: '', blessuresDetail: '',
  contreIndications: '', contreIndicationsDetail: '', deuxFoisJour: '',
  session: '', duree: '', villeDepart: '', disponibleEntretien: '',
  sourceDecouverte: '', message: '',
  campDiscipline: '',
  certifMedical: false, accepteConditions: false, pret: false,
  dateDebutSouhaitee: '',
  vientAvecFamille: false, nombreEnfants: '', enfantsAges: '',
  enfants: [],
  conjointParticipe: false,
  nomClub: '', nombreParticipants: '', niveauGroupe: '',
  palmaresClub: '',
  autresParticipants: [],
}

// Helpers pour ajuster dynamiquement les listes
function makeChild(): FamilyChild {
  return { prenom: '', age: '', pratiqueDeja: '', anneesPratique: '', contreIndications: '', contreIndicationsDetail: '' }
}
function makeParticipant(): CustomParticipant {
  return { prenom: '', niveau: '', discipline: '' }
}

/* ─────────────── HELPERS ─────────────── */

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="cand-field">
      <label className="cand-label">{label}</label>
      {children}
      {hint && <span className="cand-hint">{hint}</span>}
    </div>
  )
}

function RadioGroup({ name, options, value, onChange }: {
  name: string; options: { val: string; label: string }[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="cand-radios">
      {options.map(o => (
        <label key={o.val} className={`cand-radio${value === o.val ? ' selected' : ''}`}>
          <input type="radio" name={name} value={o.val} checked={value === o.val}
            onChange={() => onChange(o.val)} />
          {o.label}
        </label>
      ))}
    </div>
  )
}

/* ─────────────── COMPONENT ─────────────── */

interface InscriptionLayoutProps {
  initialAudience: RegistrationTypeId | null
  initialSessionId?: string | null
}

export default function InscriptionLayout({ initialAudience, initialSessionId }: InscriptionLayoutProps) {
  const [audience, setAudience] = useState<RegistrationTypeId | null>(initialAudience)
  const STEPS = audience ? STEPS_BY_TUNNEL[audience] : STEPS_DEFAULT
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [form, setForm] = useState<FormData>(() => {
    const init = { ...INITIAL }
    const requestedSession = initialSessionId && SESSION_IDS.includes(initialSessionId)
      ? initialSessionId
      : DEFAULT_SESSION_ID
    // Si on rejoint la session, pré-remplir
    if (initialAudience === 'session') {
      init.session = requestedSession
      init.duree = '3-semaines'
    }
    // Si famille : checkbox famille pré-coché, par défaut sur la session demandée (ou la prochaine), 1 enfant minimum
    if (initialAudience === 'famille') {
      init.vientAvecFamille = true
      init.session = requestedSession
      init.duree = '3-semaines'
      init.enfants = [makeChild()]
      init.nombreEnfants = '1'
    }
    return init
  })
  const [errors, setErrors] = useState<string[]>([])
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Honeypot anti-bot — rempli uniquement par bots (champ caché humainement)
  const [hp, setHp] = useState('')
  // Mobile stepper accordion (révèle la liste des steps)
  const [mobileStepsOpen, setMobileStepsOpen] = useState(false)

  // Refs pour scroll & focus management
  const mainRef = useRef<HTMLDivElement | null>(null)
  const errorsRef = useRef<HTMLDivElement | null>(null)
  const submitErrorRef = useRef<HTMLParagraphElement | null>(null)

  // Scroll-to-top du form area à chaque changement de step (UX mobile critique)
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  // Scroll errors en vue + shake
  useEffect(() => {
    if (errors.length > 0 && errorsRef.current) {
      errorsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors])

  // Scroll submit error en vue (erreur réseau)
  useEffect(() => {
    if (submitError && submitErrorRef.current) {
      submitErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [submitError])

  const audienceConfig = audience ? getRegistrationType(audience) : null

  const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors([])
    setErrorFields(prev => {
      if (!prev.has(field as string)) return prev
      const next = new Set(prev)
      next.delete(field as string)
      return next
    })
  }

  const toggleDiscipline = (d: string) => {
    setForm(prev => ({
      ...prev,
      disciplinesSecondaires: prev.disciplinesSecondaires.includes(d)
        ? prev.disciplinesSecondaires.filter(x => x !== d)
        : [...prev.disciplinesSecondaires, d],
    }))
  }

  const updateChild = (idx: number, patch: Partial<FamilyChild>) => {
    setForm(prev => ({
      ...prev,
      enfants: prev.enfants.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }))
    setErrors([])
  }
  const addChild = () => {
    if (form.enfants.length >= 4) return
    setForm(prev => {
      const next = [...prev.enfants, makeChild()]
      return { ...prev, enfants: next, nombreEnfants: String(next.length) }
    })
  }
  const removeChild = (idx: number) => {
    setForm(prev => {
      if (prev.enfants.length <= 1) return prev
      const next = prev.enfants.filter((_, i) => i !== idx)
      return { ...prev, enfants: next, nombreEnfants: String(next.length) }
    })
  }

  // Sélection d'un tunnel depuis le picker — applique les pré-remplissages adéquats
  const selectAudience = (id: RegistrationTypeId) => {
    setAudience(id)
    setForm(prev => {
      const next = { ...prev }
      // Réutilise la session déjà choisie si elle est valide, sinon la prochaine session
      const sessionToKeep = SESSION_IDS.includes(prev.session) ? prev.session : DEFAULT_SESSION_ID
      if (id === 'session') {
        next.session = sessionToKeep
        next.duree = '3-semaines'
        next.vientAvecFamille = false
        next.enfants = []
        next.nombreEnfants = ''
        // Pas de default : le candidat doit choisir explicitement Lutte ou MMA.
        next.campDiscipline = ''
      } else if (id === 'famille') {
        next.session = sessionToKeep
        next.duree = '3-semaines'
        next.vientAvecFamille = true
        if (prev.enfants.length === 0) {
          next.enfants = [makeChild()]
          next.nombreEnfants = '1'
        }
        // Famille = camp Lutte forcé (parent + enfants au Daghestan, programme jeunesse).
        next.campDiscipline = 'lutte'
      } else if (id === 'custom') {
        next.session = ''
        next.duree = ''
        next.vientAvecFamille = false
        next.enfants = []
        next.nombreEnfants = ''
        next.campDiscipline = ''
        // Solo par défaut
        if (!prev.nombreParticipants) {
          next.nombreParticipants = '1'
          next.autresParticipants = []
        }
      } else if (id === 'groupe') {
        next.session = ''
        next.duree = ''
        next.vientAvecFamille = false
        next.enfants = []
        next.nombreEnfants = ''
        next.autresParticipants = []
        next.campDiscipline = ''
      }
      return next
    })
  }

  const updateParticipant = (idx: number, patch: Partial<CustomParticipant>) => {
    setForm(prev => ({
      ...prev,
      autresParticipants: prev.autresParticipants.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }))
    setErrors([])
  }
  // Synchronise autresParticipants[] avec nombreParticipants pour custom (responsable + N-1 autres)
  const syncCustomParticipants = (composition: string) => {
    const total = parseInt(composition, 10) || 1
    const others = Math.max(0, total - 1)
    setForm(prev => {
      const current = prev.autresParticipants
      let next: CustomParticipant[]
      if (current.length === others) next = current
      else if (current.length < others) {
        next = [...current]
        while (next.length < others) next.push(makeParticipant())
      } else {
        next = current.slice(0, others)
      }
      return { ...prev, nombreParticipants: composition, autresParticipants: next }
    })
    setErrors([])
  }

  const validate = (): boolean => {
    const e: string[] = []
    const fields = new Set<string>()
    const push = (message: string, field?: string) => {
      e.push(message)
      if (field) fields.add(field)
    }

    // ───────────────────────────────────────────────────────────
    // PIPELINE pour session / custom / famille : 5 etapes
    //   step 0 = Le camp · step 1 = Identite · step 2 = Experience
    //   step 3 = Sante · step 4 = Confirmation
    // PIPELINE pour groupe : 4 etapes
    //   step 0 = Le camp · step 1 = Ton club · step 2 = Contact
    //   step 3 = Confirmation
    // ───────────────────────────────────────────────────────────

    // ── STEP 0 — Le camp (par tunnel) ──
    if (step === 0) {
      if (audience === 'session') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma') {
          push('Choisis ta discipline (Lutte ou MMA)', 'campDiscipline')
        }
        if (!form.session) push('Choisis ta session officielle', 'session')
        if (!form.duree) push('Choisis la durée du séjour', 'duree')
      }
      if (audience === 'custom') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          push('Choisis la discipline (Lutte, MMA ou Combo sur devis)', 'campDiscipline')
        }
        if (!form.nombreParticipants) push('Choisis ta composition (1 à 4 adultes)', 'nombreParticipants')
        if (!form.dateDebutSouhaitee) {
          push('Date de début souhaitée requise', 'dateDebutSouhaitee')
        } else {
          const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (diffDays < 90) push('La date de début doit être au moins 90 jours après aujourd\'hui', 'dateDebutSouhaitee')
        }
        if (!form.duree) push('Durée requise', 'duree')
      }
      if (audience === 'famille') {
        if (!form.session) push('Choisis le format (session officielle ou sur mesure)', 'session')
        if (!form.duree) push('Durée requise', 'duree')
        if (!form.nombreEnfants || form.enfants.length === 0) push('Indique au moins un enfant', 'nombreEnfants')
        if (form.session === 'sur-mesure') {
          if (!form.dateDebutSouhaitee) {
            push('Date de début souhaitée requise', 'dateDebutSouhaitee')
          } else {
            const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            if (diffDays < 90) push('La date de début doit être au moins 90 jours après aujourd\'hui', 'dateDebutSouhaitee')
          }
        }
      }
      if (audience === 'groupe') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          push('Choisis la discipline visée par ton groupe (Lutte, MMA ou Combo sur devis)', 'campDiscipline')
        }
        if (!form.dateDebutSouhaitee) {
          push('Date de début indicative requise (modifiable en visio)', 'dateDebutSouhaitee')
        }
        if (!form.duree) push('Durée indicative requise (1, 2 ou 3 semaines)', 'duree')
      }
    }

    // ── STEP 1 — Identite (session/custom/famille) OU Ton club (groupe) ──
    if (step === 1) {
      if (audience !== 'groupe') {
        if (!form.prenom.trim()) push('Prénom requis', 'prenom')
        if (!form.nom.trim()) push('Nom requis', 'nom')
        if (!form.dateNaissance) push('Date de naissance requise', 'dateNaissance')
        else {
          const age = new Date().getFullYear() - new Date(form.dateNaissance).getFullYear()
          if (age < 18) push('Tu dois avoir au moins 18 ans', 'dateNaissance')
        }
        if (!form.pays.trim()) push('Pays de résidence requis', 'pays')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) push('Email invalide', 'email')
        if (!form.villeDepart.trim()) push('Ville de départ requise', 'villeDepart')
        if (!form.disponibleEntretien) push('Disponibilité pour l\'entretien requise', 'disponibleEntretien')
      } else {
        if (!form.nomClub.trim()) push('Nom du club / groupe requis', 'nomClub')
        if (!form.nombreParticipants) push('Nombre approximatif de participants requis', 'nombreParticipants')
        if (!form.niveauGroupe) push('Niveau global du groupe requis', 'niveauGroupe')
      }
    }

    // ── STEP 2 — Experience (session/custom/famille) OU Contact (groupe) ──
    if (step === 2) {
      if (audience !== 'groupe') {
        if (!form.disciplinePrincipale) push('Discipline principale requise', 'disciplinePrincipale')
        if (!form.anneesPratique) push('Années de pratique requises', 'anneesPratique')
        if (!form.niveau) push('Niveau requis', 'niveau')
        if (audience === 'custom') {
          form.autresParticipants.forEach((p, i) => {
            if (!p.prenom.trim()) push(`Participant ${i + 2} : prénom requis`, `autresParticipants.${i}.prenom`)
            if (!p.niveau) push(`Participant ${i + 2} : niveau requis`, `autresParticipants.${i}.niveau`)
          })
        }
        if (form.campDiscipline === 'mma' && !MMA_ACCEPTED_LEVELS.has(form.niveau)) {
          push('Le camp MMA exige un niveau Avancé minimum. Ajuste ton niveau ou retourne au Step 0 pour choisir Lutte.', 'niveau')
        }
      } else {
        if (!form.prenom.trim()) push('Prénom requis', 'prenom')
        if (!form.nom.trim()) push('Nom requis', 'nom')
        if (!form.pays.trim()) push('Pays de résidence requis', 'pays')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) push('Email invalide', 'email')
        if (!form.villeDepart.trim()) push('Ville de départ requise', 'villeDepart')
        if (!form.disponibleEntretien) push('Disponibilité pour l\'appel requise', 'disponibleEntretien')
      }
    }

    // ── STEP 3 — Sante (session/custom/famille) OU Confirmation (groupe) ──
    if (step === 3) {
      if (audience === 'session' || audience === 'custom') {
        if (!form.conditionPhysique) push('Évalue ta condition physique', 'conditionPhysique')
        if (!form.blessuresRecentes) push('Indique si tu as des blessures récentes', 'blessuresRecentes')
        if (!form.contreIndications) push('Indique si tu as des contre-indications médicales', 'contreIndications')
        if (!form.deuxFoisJour) push('Confirme ta disponibilité pour les doubles séances', 'deuxFoisJour')
      } else if (audience === 'famille') {
        if (!form.conditionPhysique) push('Évalue ta condition physique', 'conditionPhysique')
        if (!form.blessuresRecentes) push('Indique si tu as des blessures récentes', 'blessuresRecentes')
        if (!form.contreIndications) push('Indique si tu as des contre-indications médicales', 'contreIndications')
        form.enfants.forEach((c, i) => {
          if (!c.prenom.trim()) push(`Enfant ${i + 1} : prénom requis`, `enfants.${i}.prenom`)
          if (!c.age) push(`Enfant ${i + 1} : âge requis`, `enfants.${i}.age`)
          else {
            const a = parseInt(c.age, 10)
            if (Number.isNaN(a) || a < 8 || a > 17) push(`Enfant ${i + 1} : âge entre 8 et 17 ans`, `enfants.${i}.age`)
          }
          if (!c.contreIndications) push(`Enfant ${i + 1} : contre-indications requises`, `enfants.${i}.contreIndications`)
        })
      } else if (audience === 'groupe') {
        if (!form.accepteConditions) push('Accepter les conditions est requis', 'accepteConditions')
      }
    }

    // ── STEP 4 — Confirmation (session/custom/famille uniquement) ──
    if (step === 4) {
      if (!form.certifMedical) push('Certificat médical requis', 'certifMedical')
      if (!form.accepteConditions) push('Accepter les conditions est requis', 'accepteConditions')
      if (!form.pret) push('Confirme être prêt pour la sélection', 'pret')
    }

    setErrors(e)
    setErrorFields(fields)
    return e.length === 0
  }

  const next = () => {
    if (validate()) {
      setDir('next')
      setStep(s => s + 1)
      setMobileStepsOpen(false)
    }
  }
  const prev = () => {
    setDir('prev')
    setStep(s => s - 1)
    setErrors([])
    setErrorFields(new Set())
    setMobileStepsOpen(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (isSubmitting) return
    // Payload normalisé snake_case prêt pour backend Supabase (table candidatures + form_data jsonb)
    const payload = {
      tunnel_type: audience,
      // Honeypot anti-bot. Si rempli côté serveur → 200 fake, candidature non créée.
      _hp: hp,
      candidate: {
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        date_naissance: form.dateNaissance,
        pays: form.pays,
        ville_depart: form.villeDepart,
      },
      session_id: (audience === 'session' && SESSION_IDS.includes(form.session))
        || (audience === 'famille' && SESSION_IDS.includes(form.session))
        ? form.session
        : null,
      duree_semaines: form.duree === '1-semaine' ? 1 : form.duree === '2-semaines' ? 2 : form.duree === '3-semaines' ? 3 : null,
      date_debut_souhaitee: form.dateDebutSouhaitee || null,
      camp_discipline: form.campDiscipline || null,
      form_data: {
        // Données spécifiques par tunnel — remontent toutes en JSONB côté Supabase
        experience: audience !== 'groupe' ? {
          discipline_principale: form.disciplinePrincipale,
          disciplines_secondaires: form.disciplinesSecondaires,
          annees_pratique: form.anneesPratique,
          niveau: form.niveau,
          club: form.club,
          coach: form.coach,
          palmares: form.palmares,
          lien_video: form.lienVideo,
        } : null,
        sante: audience === 'session' || audience === 'custom' || audience === 'famille' ? {
          condition_physique: form.conditionPhysique,
          blessures_recentes: form.blessuresRecentes,
          blessures_detail: form.blessuresDetail,
          contre_indications: form.contreIndications,
          contre_indications_detail: form.contreIndicationsDetail,
          deux_fois_jour: audience === 'famille' ? null : form.deuxFoisJour,
        } : null,
        groupe: audience === 'groupe' ? {
          nom_club: form.nomClub,
          nombre_participants: form.nombreParticipants,
          niveau_groupe: form.niveauGroupe,
          disciplines: form.disciplinesSecondaires,
          palmares_club: form.palmaresClub,
          lien_video: form.lienVideo,
          // Demande sur devis : santé individuelle + certificats médicaux gérés
          // après acceptation du devis. À ce stade, on ne collecte rien à ce niveau.
        } : null,
        famille: audience === 'famille' ? {
          format: form.session, // 'aout-2026' ou 'sur-mesure'
          enfants: form.enfants,
          conjoint_participe: form.conjointParticipe,
          nombre_parents: form.conjointParticipe ? 2 : 1,
        } : null,
        custom: audience === 'custom' ? {
          composition: form.nombreParticipants,
          autres_participants: form.autresParticipants,
        } : null,
        logistique: {
          source_decouverte: form.sourceDecouverte,
          disponible_entretien: form.disponibleEntretien,
          message: form.message,
        },
        confirmations: {
          // Pour groupe : seul accepte_conditions (accord pour être recontacté) est requis.
          // Pour session/custom/famille : tous les 3 sont requis.
          certif_medical: audience === 'groupe' ? null : form.certifMedical,
          accepte_conditions: form.accepteConditions,
          pret: audience === 'groupe' ? null : form.pret,
        },
      },
    }
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setSubmitError(data.error || 'Une erreur est survenue. Reessaie ou ecris-nous via le formulaire de contact.')
        return
      }
      setSubmitted(true)
    } catch {
      setSubmitError('Connexion impossible. Verifie ton reseau et reessaie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Audience Selector (avant les steps) ── */
  if (!audience) {
    return (
      <div className="insc-wrapper">
        <div className="insc-success-page" style={{ paddingTop: '4rem' }}>
          <Link href="/" className="insc-back-home">← Retour au site</Link>
          <div className="insc-audience-selector">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              ÉTAPE PRÉLIMINAIRE
            </span>
            <h1 className="cand-success-title">CHOISIS TON INSCRIPTION</h1>
            <p className="cand-success-sub">
              MKR organise tout. Sélectionne le format qui te correspond et on adapte le formulaire.
            </p>
            <div className="audience-grid" style={{ marginTop: '2.5rem' }}>
              {REGISTRATION_TYPES.map((type, i) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => selectAudience(type.id)}
                  className={`audience-card audience-card--clickable audience-card--photo${type.recommended ? ' audience-card--recommended' : ''}`}
                  style={{ transitionDelay: `${i * 0.06}s`, textAlign: 'left' }}
                >
                  <div className="audience-card-photo" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={type.image}
                      alt={type.imageAlt}
                      className="audience-card-photo-img"
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                    <div className="audience-card-photo-overlay" />
                  </div>
                  {type.recommended && (
                    <span className="audience-card-flag">RECOMMANDÉ</span>
                  )}
                  <span className="audience-card-badge">{type.badge}</span>
                  <h3 className="audience-card-title">{type.label}</h3>
                  <p className="audience-card-desc">{type.description}</p>
                  <ul className="audience-card-meta">
                    <li>
                      <span className="audience-card-meta-label">Dates</span>
                      <span className="audience-card-meta-value">{type.dates}</span>
                    </li>
                    <li>
                      <span className="audience-card-meta-label">Durée</span>
                      <span className="audience-card-meta-value">{type.duration}</span>
                    </li>
                    <li>
                      <span className="audience-card-meta-label">À partir de</span>
                      <span className="audience-card-meta-value">
                        {type.minPersons === 1 ? '1 personne' : `${type.minPersons} personnes`}
                      </span>
                    </li>
                  </ul>
                  <span className="audience-card-cta" style={{ width: '100%', justifyContent: 'center' }}>
                    {type.cta}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14" aria-hidden="true">
                      <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                      <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Success ── */
  if (submitted) {
    const SESSION_MAP: Record<string, { name: string; destination: string }> = SESSIONS.reduce(
      (acc, s) => {
        acc[s.id] = { name: s.name, destination: s.destination }
        return acc
      },
      {} as Record<string, { name: string; destination: string }>,
    )
    const sel = SESSION_MAP[form.session] || { name: form.session, destination: 'Dagestan' }

    return (
      <div className="insc-wrapper">
        <div className="insc-success-page">
          <Link href="/" className="insc-back-home">← Retour au site</Link>
          <div className="cand-success">
            <div className="cand-success-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="23" stroke="var(--primary)" strokeWidth="2" />
                <polyline points="14,24 21,31 34,16" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="label-tag" style={{ color: 'var(--primary)' }}>INSCRIPTION RECUE</span>
            <h2 className="cand-success-title">DOSSIER ENVOYÉ</h2>
            <p className="cand-success-sub">
              Nous étudions ta candidature et te répondons sous 48h.<br />
              Prépare-toi pour l&apos;entretien vidéo de sélection.
            </p>

            <StoryCard
              prenom={form.prenom}
              discipline={form.disciplinePrincipale}
              session={sel.name}
              destination={sel.destination}
            />

            <Link href="/" className="insc-back-btn" style={{ marginTop: '1.5rem' }}>RETOUR À L&apos;ACCUEIL</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="insc-wrapper">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="insc-sidebar">
        <div className="insc-sidebar-top">
          <Link href="/" className="insc-logo" aria-label="Retour à l'accueil">
            <span className="insc-logo-mkr">MKR</span>
            <span className="insc-logo-sub">Caucasian Camp</span>
          </Link>
          {audienceConfig && (
            <button
              type="button"
              onClick={() => { setAudience(null); setStep(0); setErrors([]); setErrorFields(new Set()) }}
              className="insc-audience-tag"
              aria-label="Changer le type d'inscription"
            >
              <span className="insc-audience-tag-label">{audienceConfig.shortLabel}</span>
              <span className="insc-audience-tag-change">Changer</span>
            </button>
          )}
        </div>

        <div className="insc-sidebar-mid">
          <nav className="insc-steps" aria-label="Étapes du formulaire">
            {STEPS.map((label, i) => (
              <div key={i} className={`insc-step${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}>
                <div className="insc-step-dot">
                  {i < step ? (
                    <svg viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className="insc-step-label">{label}</span>
              </div>
            ))}
          </nav>

          {/* Récap sticky : visible dès qu'un choix est fait pour rassurer pendant le form */}
          {step >= 1 && (form.campDiscipline || form.session || form.duree) && (
            <div className="insc-sidebar-recap" role="status" aria-label="Récap de ton inscription">
              <span className="insc-sidebar-recap-title">Ton inscription</span>
              {form.campDiscipline && (
                <div className="insc-sidebar-recap-row">
                  <span>Camp</span>
                  <strong>
                    {form.campDiscipline === 'lutte' && 'Lutte · Daghestan'}
                    {form.campDiscipline === 'mma' && 'MMA · Tchétchénie'}
                    {form.campDiscipline === 'combo_quote' && 'Combo (sur devis)'}
                  </strong>
                </div>
              )}
              {audience === 'session' && form.session && (() => {
                const sel = SESSIONS.find(s => s.id === form.session)
                return sel ? (
                  <div className="insc-sidebar-recap-row">
                    <span>Session</span>
                    <strong>{sel.season} {sel.startDate.slice(0, 4)}</strong>
                  </div>
                ) : null
              })()}
              {audience === 'famille' && form.session === 'sur-mesure' && (
                <div className="insc-sidebar-recap-row">
                  <span>Format</span>
                  <strong>Sur mesure</strong>
                </div>
              )}
              {audience === 'famille' && SESSION_IDS.includes(form.session) && (() => {
                const sel = SESSIONS.find(s => s.id === form.session)
                return sel ? (
                  <div className="insc-sidebar-recap-row">
                    <span>Format</span>
                    <strong>{sel.season}</strong>
                  </div>
                ) : null
              })()}
              {form.duree && (
                <div className="insc-sidebar-recap-row">
                  <span>Durée</span>
                  <strong>{form.duree.replace('-', ' ')}</strong>
                </div>
              )}
              {audience === 'custom' && form.nombreParticipants && (
                <div className="insc-sidebar-recap-row">
                  <span>Composition</span>
                  <strong>{form.nombreParticipants === '1' ? 'Solo' : form.nombreParticipants === '2' ? 'Duo' : form.nombreParticipants === '3' ? 'Trio' : 'Quatuor'}</strong>
                </div>
              )}
              {audience === 'famille' && form.enfants.length > 0 && (
                <div className="insc-sidebar-recap-row">
                  <span>Famille</span>
                  <strong>{form.conjointParticipe ? 2 : 1}P + {form.enfants.length}E</strong>
                </div>
              )}
              {audience === 'groupe' && form.nombreParticipants && (
                <div className="insc-sidebar-recap-row">
                  <span>Groupe</span>
                  <strong>{form.nombreParticipants === '5' ? '5 pers.' : form.nombreParticipants}</strong>
                </div>
              )}
              {/* Tarif live si dispo */}
              {(() => {
                const weeks = parseDuration(form.duree)
                if (!weeks) return null
                if (form.campDiscipline === 'combo_quote') {
                  return (
                    <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total">
                      <span>Tarif</span>
                      <strong>Sur devis</strong>
                    </div>
                  )
                }
                let adults = 0
                let children = 0
                if (audience === 'session') adults = 1
                else if (audience === 'custom') adults = parseInt(form.nombreParticipants || '0', 10)
                else if (audience === 'famille') { adults = form.conjointParticipe ? 2 : 1; children = form.enfants.length }
                else if (audience === 'groupe') {
                  if (form.nombreParticipants === '5') adults = 5
                  else if (form.nombreParticipants === '6-10') adults = 6
                  else return <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total"><span>Tarif</span><strong>Sur devis</strong></div>
                }
                if (!adults) return null
                if (isOnQuote(adults)) {
                  return <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total"><span>Tarif</span><strong>Sur devis</strong></div>
                }
                const total = calculatePrice({ adults, children, weeks })
                if (total <= 0) return null
                return (
                  <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total">
                    <span>{audience === 'groupe' && form.nombreParticipants === '6-10' ? 'À partir de' : 'Total estimé'}</span>
                    <strong>{formatEUR(total)}</strong>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        <div className="insc-sidebar-bottom">
          <div className="insc-badges">
            <span className="insc-badge">15 LUTTE + 15 MMA / SESSION</span>
            <span className="insc-badge">RÉPONSE SOUS 48H</span>
            <span className="insc-badge">ENTRETIEN VIDÉO 20 MIN</span>
          </div>
          <Link href="/" className="insc-back-link">← Retour au site</Link>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="insc-mobile-header">
        <Link href="/" className="insc-logo" aria-label="Retour à l'accueil">
          <span className="insc-logo-mkr">MKR</span>
        </Link>
        <button
          type="button"
          className={`insc-mobile-progress${mobileStepsOpen ? ' is-open' : ''}`}
          onClick={() => setMobileStepsOpen(o => !o)}
          aria-expanded={mobileStepsOpen}
          aria-controls="insc-mobile-steps-panel"
          aria-label={`Étape ${step + 1} sur ${STEPS.length} : ${STEPS[step]}. Toucher pour voir toutes les étapes.`}
        >
          <div className="insc-mobile-progress-top">
            <span className="insc-mobile-step-label">Étape {step + 1}/{STEPS.length} · {STEPS[step]}</span>
            <svg className="insc-mobile-chevron" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <polyline points="3,4 6,8 9,4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="insc-mobile-bar">
            <div className="insc-mobile-bar-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </button>
        {mobileStepsOpen && (
          <div id="insc-mobile-steps-panel" className="insc-mobile-steps-panel" role="region" aria-label="Toutes les étapes">
            <ol className="insc-mobile-steps-list">
              {STEPS.map((label, i) => (
                <li
                  key={i}
                  className={`insc-mobile-step${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}
                >
                  <span className="insc-mobile-step-num">
                    {i < step ? (
                      <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <polyline points="2,6 5,9 10,3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : i + 1}
                  </span>
                  <span className="insc-mobile-step-text">{label}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </header>

      {/* ── MAIN FORM AREA ── */}
      <main ref={mainRef} className="insc-main">
        <div className="insc-form-wrap">

          <div key={`header-${step}`} className={`insc-panel-header insc-anim-${dir}`}>
            <span className="label-tag" style={{ color: 'var(--primary)' }}>
              ÉTAPE {step + 1} / {STEPS.length}
            </span>
            <h1 id="insc-form-title" className="insc-panel-title">
              {/* Step 0 : Le camp */}
              {step === 0 && audience === 'session' && 'Quelle session, quelle discipline ?'}
              {step === 0 && audience === 'custom' && 'Ton camp sur mesure'}
              {step === 0 && audience === 'famille' && 'Le camp de la famille'}
              {step === 0 && audience === 'groupe' && 'Le camp de ton groupe'}
              {/* Step 1 : Identite OU Ton club */}
              {step === 1 && audience !== 'groupe' && 'Qui es-tu ?'}
              {step === 1 && audience === 'groupe' && 'Parle-nous de ton club'}
              {/* Step 2 : Experience OU Contact */}
              {step === 2 && audience !== 'groupe' && 'Ton parcours sportif'}
              {step === 2 && audience === 'groupe' && 'Contact du responsable'}
              {/* Step 3 : Sante OU Confirmation (groupe) */}
              {step === 3 && audience === 'famille' && 'Santé parent et enfants'}
              {step === 3 && (audience === 'session' || audience === 'custom') && 'Condition physique & Santé'}
              {step === 3 && audience === 'groupe' && 'Confirme ta demande de devis'}
              {/* Step 4 : Confirmation (session/custom/famille) */}
              {step === 4 && 'Confirme ta candidature'}
            </h1>
          </div>

          <form key={`form-${step}`} className={`insc-form insc-anim-${dir}`} onSubmit={handleSubmit} noValidate aria-labelledby="insc-form-title">
            {/* Honeypot anti-bot — invisible humainement, lu par robots */}
            <div className="insc-hp" aria-hidden="true">
              <label>
                Si tu vois ce champ, laisse-le vide
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={e => setHp(e.target.value)}
                />
              </label>
            </div>


            {/* ── STEP 1 — Identité + logistique perso (session/custom/famille) ── */}
            {step === 1 && audience !== 'groupe' && (
              <div className="cand-panel">
                <div className="cand-row">
                  <Field label="Prénom">
                    <input
                      className={`cand-input${errorFields.has('prenom') ? ' has-error' : ''}`}
                      type="text" autoComplete="given-name"
                      placeholder="Ton prénom" value={form.prenom}
                      aria-invalid={errorFields.has('prenom') || undefined}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label="Nom">
                    <input
                      className={`cand-input${errorFields.has('nom') ? ' has-error' : ''}`}
                      type="text" autoComplete="family-name"
                      placeholder="Ton nom" value={form.nom}
                      aria-invalid={errorFields.has('nom') || undefined}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Date de naissance" hint="Tu dois avoir au moins 18 ans">
                    <input
                      className={`cand-input${errorFields.has('dateNaissance') ? ' has-error' : ''}`}
                      type="date"
                      max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                      value={form.dateNaissance}
                      aria-invalid={errorFields.has('dateNaissance') || undefined}
                      onChange={e => set('dateNaissance', e.target.value)} />
                  </Field>
                  <Field label="Pays de résidence">
                    <input
                      className={`cand-input${errorFields.has('pays') ? ' has-error' : ''}`}
                      type="text" autoComplete="country-name" list="insc-pays-list"
                      placeholder="France, Suisse, Belgique..." value={form.pays}
                      aria-invalid={errorFields.has('pays') || undefined}
                      onChange={e => set('pays', e.target.value)} />
                    <datalist id="insc-pays-list">
                      <option value="France" />
                      <option value="Suisse" />
                      <option value="Belgique" />
                      <option value="Luxembourg" />
                      <option value="Canada" />
                      <option value="Maroc" />
                      <option value="Algérie" />
                      <option value="Tunisie" />
                      <option value="Sénégal" />
                      <option value="Côte d'Ivoire" />
                      <option value="Allemagne" />
                      <option value="Espagne" />
                      <option value="Italie" />
                      <option value="Portugal" />
                      <option value="Royaume-Uni" />
                      <option value="Pays-Bas" />
                    </datalist>
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Email">
                    <input
                      className={`cand-input${errorFields.has('email') ? ' has-error' : ''}`}
                      type="email" autoComplete="email" inputMode="email"
                      placeholder="ton@email.com" value={form.email}
                      aria-invalid={errorFields.has('email') || undefined}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Téléphone" hint="Avec indicatif international">
                    <input
                      className="cand-input"
                      type="tel" autoComplete="tel" inputMode="tel"
                      placeholder="+33 6 12 34 56 78" value={form.telephone}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                <Field label="Ville / pays de départ" hint="Utilisé pour estimer les vols">
                  <input
                    className={`cand-input${errorFields.has('villeDepart') ? ' has-error' : ''}`}
                    type="text" placeholder="Ex : Paris, Genève, Montréal..."
                    value={form.villeDepart}
                    aria-invalid={errorFields.has('villeDepart') || undefined}
                    onChange={e => set('villeDepart', e.target.value)} />
                </Field>
                <Field label="Es-tu disponible pour un entretien vidéo de sélection ?"
                  hint="L'entretien dure 20 min. Il est obligatoire pour valider ta candidature.">
                  <div className={errorFields.has('disponibleEntretien') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="entretien" value={form.disponibleEntretien}
                      onChange={v => set('disponibleEntretien', v)}
                      options={[
                        { val: 'oui', label: 'Disponible dans les 4 semaines' },
                        { val: 'oui-delai', label: 'Disponible sous 1 à 3 mois' },
                        { val: 'non', label: 'Plus de 3 mois ou ne sait pas' },
                      ]}
                    />
                  </div>
                </Field>
              </div>
            )}

            {/* ── STEP 2 — Contact (audience=groupe uniquement) ── */}
            {step === 2 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="insc-banner insc-banner--quote">
                  <strong>Demande de devis personnalisé</strong>
                  <span>Tes coordonnées pour que Ruslan te recontacte et envoie un devis adapté. Aucun paiement n&apos;est demandé à cette étape.</span>
                </p>
                <div className="cand-row">
                  <Field label="Prénom du responsable">
                    <input
                      className={`cand-input${errorFields.has('prenom') ? ' has-error' : ''}`}
                      type="text" autoComplete="given-name"
                      placeholder="Ton prénom" value={form.prenom}
                      aria-invalid={errorFields.has('prenom') || undefined}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label="Nom">
                    <input
                      className={`cand-input${errorFields.has('nom') ? ' has-error' : ''}`}
                      type="text" autoComplete="family-name"
                      placeholder="Ton nom" value={form.nom}
                      aria-invalid={errorFields.has('nom') || undefined}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Email">
                    <input
                      className={`cand-input${errorFields.has('email') ? ' has-error' : ''}`}
                      type="email" autoComplete="email" inputMode="email"
                      placeholder="ton@email.com" value={form.email}
                      aria-invalid={errorFields.has('email') || undefined}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Téléphone / WhatsApp" hint="Pour un échange direct si besoin">
                    <input
                      className="cand-input"
                      type="tel" autoComplete="tel" inputMode="tel"
                      placeholder="+33 6 12 34 56 78" value={form.telephone}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Pays de résidence">
                    <input
                      className={`cand-input${errorFields.has('pays') ? ' has-error' : ''}`}
                      type="text" autoComplete="country-name" list="insc-pays-list"
                      placeholder="France, Suisse, Belgique..." value={form.pays}
                      aria-invalid={errorFields.has('pays') || undefined}
                      onChange={e => set('pays', e.target.value)} />
                  </Field>
                  <Field label="Ville de départ" hint="Origine principale du groupe">
                    <input
                      className={`cand-input${errorFields.has('villeDepart') ? ' has-error' : ''}`}
                      type="text"
                      placeholder="Ex : Paris, Lyon, Genève..."
                      value={form.villeDepart}
                      aria-invalid={errorFields.has('villeDepart') || undefined}
                      onChange={e => set('villeDepart', e.target.value)} />
                  </Field>
                </div>
                <Field label="Es-tu disponible pour un appel de cadrage avec Ruslan ?"
                  hint="L'appel dure ~30 min : objectifs, dates, niveau, budget. On envoie le devis ensuite.">
                  <div className={errorFields.has('disponibleEntretien') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="entretienGroupe" value={form.disponibleEntretien}
                      onChange={v => set('disponibleEntretien', v)}
                      options={[
                        { val: 'oui', label: 'Disponible dans les 4 semaines' },
                        { val: 'oui-delai', label: 'Disponible sous 1 à 3 mois' },
                        { val: 'non', label: 'Préfère un échange par email d\'abord' },
                      ]}
                    />
                  </div>
                </Field>
              </div>
            )}

            {/* ── STEP 2 — Expérience individuelle (session/custom/famille) ── */}
            {step === 2 && audience !== 'groupe' && (
              <div className="cand-panel">
                {audience === 'famille' && (
                  <p className="insc-banner insc-banner--info">
                    <span>Cette étape concerne <strong>uniquement le parent participant</strong>. On collectera les infos des enfants à l&apos;étape Santé.</span>
                  </p>
                )}
                {audience === 'custom' && (
                  <p className="insc-banner insc-banner--info">
                    <span>Tu réponds pour toi (<strong>responsable de l&apos;inscription</strong>). Pour Duo/Trio/Quatuor, les autres participants sont listés ci-dessous.</span>
                  </p>
                )}

                <Field label="Discipline principale">
                  <select
                    className={`cand-select${errorFields.has('disciplinePrincipale') ? ' has-error' : ''}`}
                    value={form.disciplinePrincipale}
                    aria-invalid={errorFields.has('disciplinePrincipale') || undefined}
                    onChange={e => set('disciplinePrincipale', e.target.value)}>
                    <option value="" disabled>Sélectionner</option>
                    {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>

                <Field label="Disciplines secondaires" hint={`Sélectionne tout ce qui s'applique${form.disciplinesSecondaires.length > 0 ? ` · ${form.disciplinesSecondaires.length} sélectionnée${form.disciplinesSecondaires.length > 1 ? 's' : ''}` : ''}`}>
                  <div className="cand-checks">
                    {DISCIPLINES.filter(d => d !== form.disciplinePrincipale).map(d => (
                      <label key={d} className={`cand-check${form.disciplinesSecondaires.includes(d) ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.disciplinesSecondaires.includes(d)}
                          onChange={() => toggleDiscipline(d)} />
                        {d}
                      </label>
                    ))}
                  </div>
                </Field>

                <div className="cand-row">
                  <Field label="Années de pratique">
                    <select
                      className={`cand-select${errorFields.has('anneesPratique') ? ' has-error' : ''}`}
                      value={form.anneesPratique}
                      aria-invalid={errorFields.has('anneesPratique') || undefined}
                      onChange={e => set('anneesPratique', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="1-2">1 à 2 ans</option>
                      <option value="2-5">2 à 5 ans</option>
                      <option value="5-10">5 à 10 ans</option>
                      <option value="10+">10 ans et plus</option>
                    </select>
                  </Field>
                  <Field
                    label="Niveau actuel"
                    hint={form.campDiscipline === 'mma' ? 'Camp MMA : niveau Avancé minimum exigé' : undefined}>
                    <select
                      className={`cand-select${errorFields.has('niveau') ? ' has-error' : ''}`}
                      value={form.niveau}
                      aria-invalid={errorFields.has('niveau') || undefined}
                      onChange={e => set('niveau', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="intermediaire" disabled={form.campDiscipline === 'mma'}>
                        Intermédiaire{form.campDiscipline === 'mma' ? ' (insuffisant pour MMA)' : ''}
                      </option>
                      <option value="avance">Avancé</option>
                      <option value="competiteur-regional">Compétiteur régional</option>
                      <option value="competiteur-national">Compétiteur national</option>
                      <option value="competiteur-international">Compétiteur international</option>
                    </select>
                  </Field>
                </div>

                <div className="cand-row">
                  <Field label="Club / Salle actuelle">
                    <input className="cand-input" type="text" placeholder="Nom de ton club"
                      value={form.club} onChange={e => set('club', e.target.value)} />
                  </Field>
                  <Field label="Coach / Instructeur">
                    <input className="cand-input" type="text" placeholder="Nom de ton coach"
                      value={form.coach} onChange={e => set('coach', e.target.value)} />
                  </Field>
                </div>

                <Field label="Palmarès & compétitions" hint="Titres, classements, résultats récents">
                  <textarea className="cand-textarea" rows={3}
                    placeholder="Ex : Champion régional Lutte 2024, 2e au tournoi de Paris MMA..."
                    value={form.palmares} onChange={e => set('palmares', e.target.value)} />
                </Field>

                <Field label="Lien vidéo" hint="Instagram, Vimeo, footage de compétition">
                  <input className="cand-input" type="url" placeholder="https://instagram.com/..."
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 1 — Ton club (audience=groupe uniquement) ── */}
            {step === 1 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="insc-banner insc-banner--info">
                  <span>On qualifie ici le <strong>collectif</strong>, pas le responsable individuel. Les infos perso de chaque participant seront collectées après validation du devis.</span>
                </p>

                <Field label="Nom du club ou du groupe">
                  <input
                    className={`cand-input${errorFields.has('nomClub') ? ' has-error' : ''}`}
                    type="text"
                    placeholder="Ex : Geneva Fight Club, Académie Krav Magabec..."
                    value={form.nomClub}
                    aria-invalid={errorFields.has('nomClub') || undefined}
                    onChange={e => set('nomClub', e.target.value)} />
                </Field>
                <div className="cand-row">
                  <Field label="Nombre approximatif de participants" hint="Tu pourras affiner après la visio. À partir de 11 personnes ou pour privatiser une session entière, le format est ajusté.">
                    <select
                      className={`cand-select${errorFields.has('nombreParticipants') ? ' has-error' : ''}`}
                      value={form.nombreParticipants}
                      aria-invalid={errorFields.has('nombreParticipants') || undefined}
                      onChange={e => set('nombreParticipants', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="5">5 personnes</option>
                      <option value="6-10">6 à 10 personnes</option>
                      <option value="11-20">11 personnes et plus</option>
                      <option value="20+">Plus de 20 (privatisation totale)</option>
                    </select>
                  </Field>
                  <Field label="Niveau global du groupe">
                    <select
                      className={`cand-select${errorFields.has('niveauGroupe') ? ' has-error' : ''}`}
                      value={form.niveauGroupe}
                      aria-invalid={errorFields.has('niveauGroupe') || undefined}
                      onChange={e => set('niveauGroupe', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="debutant">Mixte débutant / intermédiaire</option>
                      <option value="intermediaire">Intermédiaire homogène</option>
                      <option value="avance">Avancé / compétiteurs</option>
                      <option value="mixte">Mixte (à préciser)</option>
                    </select>
                  </Field>
                </div>

                <Field
                  label="Discipline(s) principale(s) du club"
                  hint={`Sélectionne ce qui s'applique au collectif${form.disciplinesSecondaires.length > 0 ? ` · ${form.disciplinesSecondaires.length} sélectionnée${form.disciplinesSecondaires.length > 1 ? 's' : ''}` : ''}`}>
                  <div className="cand-checks">
                    {DISCIPLINES.map(d => (
                      <label key={d} className={`cand-check${form.disciplinesSecondaires.includes(d) ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.disciplinesSecondaires.includes(d)}
                          onChange={() => toggleDiscipline(d)} />
                        {d}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Palmarès collectif du club" hint="Optionnel — 1 ou 2 phrases suffisent">
                  <textarea className="cand-textarea" rows={3}
                    placeholder="Ex : 3 champions de France juniors en 2025, 2 internationaux espoirs..."
                    value={form.palmaresClub} onChange={e => set('palmaresClub', e.target.value)} />
                </Field>

                <Field label="Lien vidéo ou réseau du club" hint="Optionnel : Instagram, site du club">
                  <input className="cand-input" type="url" inputMode="url" placeholder="https://instagram.com/..."
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 3 — Santé (session/custom/famille uniquement) ── */}
            {/* Variant individuel : session + custom */}
            {step === 3 && (audience === 'session' || audience === 'custom') && (
              <div className="cand-panel">
                {audience === 'custom' && (
                  <p className="insc-banner insc-banner--info">
                    <span>Cette étape concerne <strong>uniquement toi</strong> (responsable). On collectera la santé des autres participants après validation du devis.</span>
                  </p>
                )}
                <Field label="Comment évalues-tu ta condition physique actuelle ?">
                  <div className={errorFields.has('conditionPhysique') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="condition" value={form.conditionPhysique}
                      onChange={v => set('conditionPhysique', v)}
                      options={[
                        { val: '2', label: 'Moyenne · reprise récente' },
                        { val: '3', label: 'Bonne · entraînement régulier' },
                        { val: '4', label: 'Très bonne · entraînement intensif' },
                        { val: '5', label: 'Excellente · niveau compétition' },
                      ]}
                    />
                  </div>
                </Field>
                <Field label="As-tu eu des blessures significatives ces 3 derniers mois ?">
                  <div className={errorFields.has('blessuresRecentes') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="blessures" value={form.blessuresRecentes}
                      onChange={v => set('blessuresRecentes', v)}
                      options={[
                        { val: 'non', label: 'Non, aucune blessure' },
                        { val: 'mineure', label: 'Mineure, entièrement guérie' },
                        { val: 'oui', label: 'Oui, à préciser' },
                      ]}
                    />
                  </div>
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Décris la nature et l'état actuel de la blessure..."
                      value={form.blessuresDetail}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="As-tu des contre-indications médicales à l'effort intense ?">
                  <div className={errorFields.has('contreIndications') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="contre" value={form.contreIndications}
                      onChange={v => set('contreIndications', v)}
                      options={[
                        { val: 'non', label: 'Non' },
                        { val: 'oui', label: 'Oui, à préciser' },
                      ]}
                    />
                  </div>
                  {form.contreIndications === 'oui' && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Précise la nature des contre-indications..."
                      value={form.contreIndicationsDetail}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="Es-tu capable de t'entraîner deux fois par jour, 6 jours sur 7 ?"
                  hint="Les sessions durent 2 à 3h. C'est le rythme standard du camp.">
                  <div className={errorFields.has('deuxFoisJour') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="deuxfois" value={form.deuxFoisJour}
                      onChange={v => set('deuxFoisJour', v)}
                      options={[
                        { val: 'oui', label: 'Oui, je suis prêt(e)' },
                        { val: 'avec-adaptation', label: 'Oui, avec quelques adaptations' },
                        { val: 'non', label: 'Non, je préfère un rythme allégé' },
                      ]}
                    />
                  </div>
                </Field>
              </div>
            )}

            {/* Variant FAMILLE : santé parent (sans 2x/jour) + santé enfants */}
            {step === 3 && audience === 'famille' && (
              <div className="cand-panel">
                <h3 className="insc-section-title">Santé du parent participant</h3>
                <Field label="Comment évalues-tu ta condition physique actuelle ?">
                  <div className={errorFields.has('conditionPhysique') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="condition" value={form.conditionPhysique}
                      onChange={v => set('conditionPhysique', v)}
                      options={[
                        { val: '2', label: 'Moyenne · reprise récente' },
                        { val: '3', label: 'Bonne · entraînement régulier' },
                        { val: '4', label: 'Très bonne · entraînement intensif' },
                        { val: '5', label: 'Excellente · niveau compétition' },
                      ]}
                    />
                  </div>
                </Field>
                <Field label="As-tu eu des blessures significatives ces 3 derniers mois ?">
                  <div className={errorFields.has('blessuresRecentes') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="blessures" value={form.blessuresRecentes}
                      onChange={v => set('blessuresRecentes', v)}
                      options={[
                        { val: 'non', label: 'Non, aucune blessure' },
                        { val: 'mineure', label: 'Mineure, entièrement guérie' },
                        { val: 'oui', label: 'Oui, à préciser' },
                      ]}
                    />
                  </div>
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Décris la nature et l'état actuel de la blessure..."
                      value={form.blessuresDetail}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="As-tu des contre-indications médicales à l'effort intense ?">
                  <div className={errorFields.has('contreIndications') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="contre" value={form.contreIndications}
                      onChange={v => set('contreIndications', v)}
                      options={[
                        { val: 'non', label: 'Non' },
                        { val: 'oui', label: 'Oui, à préciser' },
                      ]}
                    />
                  </div>
                  {form.contreIndications === 'oui' && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Précise la nature des contre-indications..."
                      value={form.contreIndicationsDetail}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>

                <h3 className="insc-section-title insc-section-title--spacer">Tes enfants (8 à 17 ans)</h3>
                <p className="insc-banner insc-banner--info">
                  <span>Le programme jeunesse a son propre rythme (sessions à 10h30 et 17h30). Chaque enfant doit fournir un certificat médical pédiatrique avant le départ.</span>
                </p>

                {form.enfants.map((c, i) => (
                  <div key={i} className="insc-child-card">
                    <div className="insc-child-card-head">
                      <strong>Enfant {i + 1}</strong>
                      {form.enfants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(i)}
                          className="insc-child-remove"
                          aria-label={`Retirer l'enfant ${i + 1}`}
                        >
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <line x1="4" y1="4" x2="12" y2="12" strokeLinecap="round" />
                            <line x1="12" y1="4" x2="4" y2="12" strokeLinecap="round" />
                          </svg>
                          Retirer
                        </button>
                      )}
                    </div>
                    <div className="cand-row">
                      <Field label="Prénom">
                        <input
                          className={`cand-input${errorFields.has(`enfants.${i}.prenom`) ? ' has-error' : ''}`}
                          type="text" placeholder="Prénom de l'enfant"
                          value={c.prenom}
                          aria-invalid={errorFields.has(`enfants.${i}.prenom`) || undefined}
                          onChange={e => updateChild(i, { prenom: e.target.value })} />
                      </Field>
                      <Field label="Âge" hint="Entre 8 et 17 ans">
                        <input
                          className={`cand-input${errorFields.has(`enfants.${i}.age`) ? ' has-error' : ''}`}
                          type="number" inputMode="numeric" min="8" max="17" placeholder="Ex : 12"
                          value={c.age}
                          aria-invalid={errorFields.has(`enfants.${i}.age`) || undefined}
                          onChange={e => updateChild(i, { age: e.target.value })}
                          onBlur={e => {
                            const n = parseInt(e.target.value, 10)
                            if (!Number.isNaN(n)) {
                              const clamped = Math.min(17, Math.max(8, n))
                              if (clamped !== n) updateChild(i, { age: String(clamped) })
                            }
                          }} />
                      </Field>
                    </div>
                    <Field label="Pratique déjà la lutte, le MMA ou un sport de combat ?">
                      <RadioGroup name={`enfant-${i}-pratique`} value={c.pratiqueDeja}
                        onChange={v => updateChild(i, { pratiqueDeja: v })}
                        options={[
                          { val: 'non', label: 'Non, première expérience' },
                          { val: 'oui', label: 'Oui, déjà pratiquant' },
                        ]}
                      />
                      {c.pratiqueDeja === 'oui' && (
                        <input className="cand-input cand-sub-field" type="text"
                          placeholder="Combien d'années ? (Ex : 2 ans de judo)"
                          value={c.anneesPratique}
                          onChange={e => updateChild(i, { anneesPratique: e.target.value })} />
                      )}
                    </Field>
                    <Field label="Contre-indications médicales connues ?">
                      <div className={errorFields.has(`enfants.${i}.contreIndications`) ? 'insc-radios-error' : ''}>
                        <RadioGroup name={`enfant-${i}-contre`} value={c.contreIndications}
                          onChange={v => updateChild(i, { contreIndications: v })}
                          options={[
                            { val: 'non', label: 'Non, aucune' },
                            { val: 'oui', label: 'Oui, à préciser' },
                          ]}
                        />
                      </div>
                      {c.contreIndications === 'oui' && (
                        <textarea className="cand-textarea cand-sub-field" rows={2}
                          placeholder="Allergies, asthme, blessure récente, traitement en cours..."
                          value={c.contreIndicationsDetail}
                          onChange={e => updateChild(i, { contreIndicationsDetail: e.target.value })} />
                      )}
                    </Field>
                  </div>
                ))}

                {form.enfants.length < 4 && (
                  <button
                    type="button"
                    onClick={addChild}
                    className="insc-child-add"
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <line x1="8" y1="3" x2="8" y2="13" strokeLinecap="round" />
                      <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                    </svg>
                    Ajouter un enfant
                  </button>
                )}
              </div>
            )}


            {/* ── STEP 0 — Le camp (la PREMIÈRE question : session+discipline / composition+discipline / format+enfants / discipline-groupe) ── */}
            {step === 0 && (
              <div className="cand-panel insc-camp-step">

                {/* Bandeau audience active */}
                {audienceConfig && (
                  <div className="insc-audience-banner">
                    <span className="insc-audience-banner-label">{audienceConfig.badge}</span>
                    <strong>{audienceConfig.label}</strong>
                    <span>{audienceConfig.longDescription}</span>
                  </div>
                )}

                {/* ───────────────────────────────────────────────
                    AUDIENCE: SESSION OFFICIELLE
                    1) Choix session (4 cards visuelles)
                    2) Choix discipline (2 cards avec compteur places live)
                    3) Choix durée
                    ─────────────────────────────────────────────── */}
                {audience === 'session' && (
                  <>
                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">Choisis ta session</h2>
                      <p className="insc-camp-section-help">Quatre sessions par an, calées sur les vacances scolaires francophones (FR · CH · BE).</p>
                      <div className="insc-session-grid">
                        {SESSIONS.map(s => {
                          const year = s.startDate.slice(0, 4)
                          return (
                            <label
                              key={s.id}
                              className={`insc-session-card${form.session === s.id ? ' is-active' : ''}`}
                            >
                              <input
                                type="radio"
                                name="sessionPick"
                                value={s.id}
                                checked={form.session === s.id}
                                onChange={() => set('session', s.id)}
                                className="insc-sr"
                              />
                              <span className="insc-session-card-month">{s.monthAbbr}</span>
                              <span className="insc-session-card-season">{s.season} {year}</span>
                              <span className="insc-session-card-dates">{s.dates}</span>
                              <span className="insc-session-card-intensity">Intensité {s.intensity.toLowerCase()}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">Choisis ta discipline</h2>
                      <p className="insc-camp-section-help">C&apos;est exclusif sur les sessions officielles : Lutte (Daghestan) <strong>OU</strong> MMA (Tchétchénie). Pour combiner les deux, passe par <Link href="/inscription?type=custom" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Sur Mesure</Link>.</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input
                            type="radio"
                            name="campDiscipline"
                            value="lutte"
                            checked={form.campDiscipline === 'lutte'}
                            onChange={() => set('campDiscipline', 'lutte')}
                            className="insc-sr"
                          />
                          <span className="insc-discipline-card-icon">{ICON_LUTTE}</span>
                          <span className="insc-discipline-card-name">LUTTE</span>
                          <span className="insc-discipline-card-place">Daghestan · Makhachkala</span>
                          <span className="insc-discipline-card-meta">15 places · ouvert à tous les niveaux</span>
                          {form.session && (
                            <PlacesRestantes
                              sessionId={form.session}
                              discipline="lutte"
                              variant="badge"
                              className="insc-discipline-card-badge"
                            />
                          )}
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input
                            type="radio"
                            name="campDiscipline"
                            value="mma"
                            checked={form.campDiscipline === 'mma'}
                            onChange={() => set('campDiscipline', 'mma')}
                            className="insc-sr"
                          />
                          <span className="insc-discipline-card-icon">{ICON_MMA}</span>
                          <span className="insc-discipline-card-name">MMA</span>
                          <span className="insc-discipline-card-place">Tchétchénie · Grozny</span>
                          <span className="insc-discipline-card-meta">15 places · niveau Avancé minimum</span>
                          {form.session && (
                            <PlacesRestantes
                              sessionId={form.session}
                              discipline="mma"
                              variant="badge"
                              className="insc-discipline-card-badge"
                            />
                          )}
                        </label>
                      </div>
                      {form.campDiscipline === 'mma' && (
                        form.niveau && !MMA_ACCEPTED_LEVELS.has(form.niveau) ? (
                          <div className="insc-banner insc-banner--warn">
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M8 1.5L15 14H1L8 1.5z" strokeLinejoin="round" />
                              <line x1="8" y1="6" x2="8" y2="10" strokeLinecap="round" />
                              <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                            </svg>
                            <span>Le camp MMA exige un niveau <strong>Avancé</strong> ou <strong>Compétiteur</strong>. Ton niveau actuel ({form.niveau}) ne permet pas l&apos;inscription. Choisis Lutte, ou ajuste ton niveau à l&apos;étape Expérience.</span>
                          </div>
                        ) : (
                          <div className="insc-banner insc-banner--warn-light">
                            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <circle cx="8" cy="8" r="7" />
                              <line x1="8" y1="4" x2="8" y2="9" strokeLinecap="round" />
                              <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                            </svg>
                            <span>Niveau Avancé minimum exigé pour le camp MMA. Tu confirmeras ton niveau à l&apos;étape Expérience.</span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">3</span>
                      <h2 className="insc-camp-section-label">Combien de temps ?</h2>
                      <p className="insc-camp-section-help">Tu choisis 1, 2 ou 3 semaines au sein de la fenêtre de session officielle.</p>
                      <div className="insc-duration-grid">
                        {[
                          { val: '1-semaine', weeks: 1, label: '1 semaine', sub: 'Initiation intense' },
                          { val: '2-semaines', weeks: 2, label: '2 semaines', sub: 'Vraie progression' },
                          { val: '3-semaines', weeks: 3, label: '3 semaines', sub: 'Immersion complète' },
                        ].map(opt => (
                          <label key={opt.val} className={`insc-duration-card${form.duree === opt.val ? ' is-active' : ''}`}>
                            <input
                              type="radio"
                              name="duree"
                              value={opt.val}
                              checked={form.duree === opt.val}
                              onChange={() => set('duree', opt.val)}
                              className="insc-sr"
                            />
                            <span className="insc-duration-card-label">{opt.label}</span>
                            <span className="insc-duration-card-sub">{opt.sub}</span>
                            <span className="insc-duration-card-price">{formatEUR(PRICING_TIERS.duo.perAdult[opt.weeks as 1|2|3])} / adulte</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Audience: CAMP SUR MESURE — discipline + composition + dates en cards visuelles */}
                {audience === 'custom' && (
                  <>
                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">Quelle discipline ?</h2>
                      <p className="insc-camp-section-help">Lutte au Daghestan, MMA en Tchétchénie, ou le combo des deux destinations. Le combo se vit en séquentiel (X jours Daghestan puis Y jours Tchétchénie) et est tarifé sur devis.</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_LUTTE}</span>
                          <span className="insc-discipline-card-name">LUTTE</span>
                          <span className="insc-discipline-card-place">Daghestan · Makhachkala</span>
                          <span className="insc-discipline-card-meta">Tarifs publics · tous niveaux</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_MMA}</span>
                          <span className="insc-discipline-card-name">MMA</span>
                          <span className="insc-discipline-card-place">Tchétchénie · Grozny</span>
                          <span className="insc-discipline-card-meta">Niveau Avancé minimum · tarifs publics</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--combo${form.campDiscipline === 'combo_quote' ? ' is-active' : ''}`} style={{ gridColumn: '1 / -1' }}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_COMBO}</span>
                          <span className="insc-discipline-card-name">COMBO LUTTE + MMA</span>
                          <span className="insc-discipline-card-place">Daghestan puis Tchétchénie</span>
                          <span className="insc-discipline-card-meta">Durée mini 2 semaines · tarif fixé en visio</span>
                        </label>
                      </div>
                      {form.campDiscipline === 'mma' && (
                        <div className="insc-banner insc-banner--warn-light">
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <circle cx="8" cy="8" r="7" />
                            <line x1="8" y1="4" x2="8" y2="9" strokeLinecap="round" />
                            <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                          </svg>
                          <span>Niveau Avancé minimum exigé pour le camp MMA. Tu confirmeras ton niveau à l&apos;étape Expérience.</span>
                        </div>
                      )}
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">Vous êtes combien ?</h2>
                      <p className="insc-camp-section-help">1 à 4 adultes. Pour 5+ : <Link href="/inscription?type=groupe" className="insc-inline-link">Club & Groupe</Link>. Avec un enfant : <Link href="/inscription?type=famille" className="insc-inline-link">Famille</Link>.</p>
                      <div className="insc-compo-grid">
                        {[
                          { val: '1', label: 'Solo', sub: '1 adulte' },
                          { val: '2', label: 'Duo', sub: '2 adultes' },
                          { val: '3', label: 'Trio', sub: '3 adultes' },
                          { val: '4', label: 'Quatuor', sub: '4 adultes' },
                        ].map(opt => (
                          <label key={opt.val} className={`insc-compo-card${form.nombreParticipants === opt.val ? ' is-active' : ''}`}>
                            <input
                              type="radio"
                              name="nombreParticipants"
                              value={opt.val}
                              checked={form.nombreParticipants === opt.val}
                              onChange={() => syncCustomParticipants(opt.val)}
                              className="insc-sr"
                            />
                            <span className="insc-compo-card-label">{opt.label}</span>
                            <span className="insc-compo-card-sub">{opt.sub}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {form.autresParticipants.length > 0 && (
                      <div className="insc-camp-section">
                        <span className="insc-camp-section-num">{form.autresParticipants.length > 0 ? '·' : '3'}</span>
                        <h2 className="insc-camp-section-label">Les autres participants</h2>
                        <p className="insc-camp-section-help">Prénom et niveau pour chaque accompagnant. Santé collectée après validation du devis.</p>
                        {form.autresParticipants.map((p, i) => (
                          <div key={i} className="insc-child-card">
                            <div className="insc-child-card-head">
                              <strong>Participant {i + 2}</strong>
                            </div>
                            <div className="cand-row">
                              <Field label="Prénom">
                                <input
                                  className={`cand-input${errorFields.has(`autresParticipants.${i}.prenom`) ? ' has-error' : ''}`}
                                  type="text" placeholder="Prénom"
                                  value={p.prenom}
                                  aria-invalid={errorFields.has(`autresParticipants.${i}.prenom`) || undefined}
                                  onChange={e => updateParticipant(i, { prenom: e.target.value })} />
                              </Field>
                              <Field label="Niveau">
                                <select
                                  className={`cand-select${errorFields.has(`autresParticipants.${i}.niveau`) ? ' has-error' : ''}`}
                                  value={p.niveau}
                                  aria-invalid={errorFields.has(`autresParticipants.${i}.niveau`) || undefined}
                                  onChange={e => updateParticipant(i, { niveau: e.target.value })}>
                                  <option value="" disabled>Sélectionner</option>
                                  <option value="debutant">Débutant</option>
                                  <option value="intermediaire">Intermédiaire</option>
                                  <option value="avance">Avancé</option>
                                  <option value="competiteur">Compétiteur</option>
                                </select>
                              </Field>
                            </div>
                            <Field label="Discipline principale" hint="Optionnel">
                              <select className="cand-select" value={p.discipline}
                                onChange={e => updateParticipant(i, { discipline: e.target.value })}>
                                <option value="">Sélectionner (optionnel)</option>
                                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </Field>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">{form.autresParticipants.length > 0 ? '4' : '3'}</span>
                      <h2 className="insc-camp-section-label">Quand et combien de temps ?</h2>
                      <p className="insc-camp-section-help">Réservation 90 jours minimum avant le départ pour gérer visa, vol et organisation.</p>
                      <div className="cand-row">
                        <Field label="Date de début souhaitée">
                          <input
                            className={`cand-input${errorFields.has('dateDebutSouhaitee') ? ' has-error' : ''}`}
                            type="date"
                            min={(() => {
                              const d = new Date()
                              d.setDate(d.getDate() + 90)
                              return d.toISOString().split('T')[0]
                            })()}
                            value={form.dateDebutSouhaitee}
                            aria-invalid={errorFields.has('dateDebutSouhaitee') || undefined}
                            onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                        </Field>
                        <Field label="Durée">
                          {(() => {
                            const adults = Math.max(1, parseInt(form.nombreParticipants || '1', 10))
                            return (
                              <select
                                className={`cand-select${errorFields.has('duree') ? ' has-error' : ''}`}
                                value={form.duree}
                                aria-invalid={errorFields.has('duree') || undefined}
                                onChange={e => set('duree', e.target.value)}>
                                <option value="" disabled>Sélectionner</option>
                                <option value="1-semaine">1 semaine · {formatEUR(pricePerAdult(adults, 1))} / adulte</option>
                                <option value="2-semaines">2 semaines · {formatEUR(pricePerAdult(adults, 2))} / adulte</option>
                                <option value="3-semaines">3 semaines · {formatEUR(pricePerAdult(adults, 3))} / adulte</option>
                              </select>
                            )
                          })()}
                        </Field>
                      </div>

                      {/* Estimation tarif live custom */}
                      {(() => {
                        const adults = Math.max(1, parseInt(form.nombreParticipants || '0', 10))
                        const weeks = parseDuration(form.duree)
                        if (!adults || !weeks || form.campDiscipline === 'combo_quote') return null
                        const total = calculatePrice({ adults, children: 0, weeks })
                        if (total <= 0) return null
                        return (
                          <div className="insc-banner insc-banner--success">
                            <strong>Estimation : {formatEUR(total)}</strong>
                            <span>{adults} adulte{adults > 1 ? 's' : ''} × {formatEUR(pricePerAdult(adults, weeks))} sur {weeks} semaine{weeks > 1 ? 's' : ''}. Tarif définitif confirmé en visio.</span>
                          </div>
                        )
                      })()}
                      {form.campDiscipline === 'combo_quote' && form.duree && (
                        <div className="insc-banner insc-banner--quote">
                          <strong>Combo sur devis</strong>
                          <span>Le split Daghestan / Tchétchénie et le tarif final sont fixés en visio de cadrage avec Ruslan.</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ───────────────────────────────────────────────
                    AUDIENCE: GROUPE / CLUB
                    100% devis : Ruslan recontacte.
                    1) Discipline visée
                    2) Dates indicatives + durée (modifiables en visio)
                    ─────────────────────────────────────────────── */}
                {audience === 'groupe' && (
                  <>
                    <div className="insc-banner insc-banner--quote">
                      <strong>Demande de devis personnalisé</strong>
                      <span>Aucun paiement à ce stade. On collecte juste l&apos;essentiel pour que Ruslan te recontacte avec une offre adaptée. Dates, composition et santé seront affinées après acceptation du devis.</span>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">Discipline visée</h2>
                      <p className="insc-camp-section-help">Lutte au Daghestan, MMA en Tchétchénie, ou un combo des deux destinations. MKR adapte le programme et la destination selon ton choix.</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_LUTTE}</span>
                          <span className="insc-discipline-card-name">LUTTE</span>
                          <span className="insc-discipline-card-place">Daghestan · Makhachkala</span>
                          <span className="insc-discipline-card-meta">Tout le club au camp Lutte, ouvert à tous les niveaux</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_MMA}</span>
                          <span className="insc-discipline-card-name">MMA</span>
                          <span className="insc-discipline-card-place">Tchétchénie · Grozny</span>
                          <span className="insc-discipline-card-meta">Profil avancé requis pour tout le groupe</span>
                        </label>
                        <label className={`insc-discipline-card${form.campDiscipline === 'combo_quote' ? ' is-active' : ''}`} style={{ gridColumn: '1 / -1' }}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_COMBO}</span>
                          <span className="insc-discipline-card-name">COMBO LUTTE + MMA</span>
                          <span className="insc-discipline-card-place">Daghestan puis Tchétchénie</span>
                          <span className="insc-discipline-card-meta">Tarif et split fixés après cadrage visio</span>
                        </label>
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">Quand, et combien de temps ?</h2>
                      <p className="insc-camp-section-help">Indique tes <strong>dates idéales</strong> et ta durée cible. Tout est modifiable pendant la visio de cadrage. On a besoin de 90 jours minimum entre l&apos;inscription et le départ pour gérer visas, vols et organisation.</p>
                      <div className="cand-row">
                        <Field label="Date de début indicative">
                          <input className="cand-input" type="date"
                            min={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0] })()}
                            value={form.dateDebutSouhaitee}
                            onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                        </Field>
                        <Field label="Durée cible">
                          <select className="cand-select" value={form.duree}
                            onChange={e => set('duree', e.target.value)}>
                            <option value="" disabled>Sélectionner</option>
                            <option value="1-semaine">1 semaine</option>
                            <option value="2-semaines">2 semaines</option>
                            <option value="3-semaines">3 semaines (immersion complète)</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* Audience: FAMILLE — cards visuelles harmonisées (format + composition + durée) */}
                {audience === 'famille' && (
                  <>
                    <div className="insc-famille-hero">
                      <span className="insc-famille-hero-icon" aria-hidden="true">
                        <IconFamille />
                      </span>
                      <div className="insc-famille-hero-content">
                        <span className="insc-famille-hero-label">TUNNEL FAMILLE</span>
                        <strong className="insc-famille-hero-title">Camp Lutte au Daghestan (parent + enfant)</strong>
                        <span className="insc-famille-hero-help">Lutte adultes + programme jeunesse 8-17 ans, sur le même camp. Pas de MMA en Famille (programme jeunesse Lutte uniquement). Pour une demande combo ou MMA, passe par <Link href="/inscription?type=custom" className="insc-inline-link">Sur Mesure</Link>.</span>
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">Choisis ton format</h2>
                      <p className="insc-camp-section-help">Une de nos sessions officielles (calées sur les vacances scolaires) ou tes propres dates. Durée 1, 2 ou 3 semaines.</p>
                      <div className="insc-format-grid">
                        {SESSIONS.map(s => {
                          const year = s.startDate.slice(0, 4)
                          return (
                            <label key={s.id} className={`insc-session-card${form.session === s.id ? ' is-active' : ''}`}>
                              <input
                                type="radio"
                                name="formatFamille"
                                value={s.id}
                                checked={form.session === s.id}
                                onChange={() => {
                                  set('session', s.id)
                                  if (!form.duree) set('duree', '3-semaines')
                                  set('dateDebutSouhaitee', '')
                                }}
                                className="insc-sr"
                              />
                              <span className="insc-session-card-month">{s.monthAbbr}</span>
                              <span className="insc-session-card-season">{s.season} {year}</span>
                              <span className="insc-session-card-dates">{s.dates}</span>
                              <span className="insc-session-card-intensity">Vacances scolaires</span>
                            </label>
                          )
                        })}
                        <label className={`insc-session-card insc-session-card--custom${form.session === 'sur-mesure' ? ' is-active' : ''}`}>
                          <input
                            type="radio"
                            name="formatFamille"
                            value="sur-mesure"
                            checked={form.session === 'sur-mesure'}
                            onChange={() => { set('session', 'sur-mesure'); set('duree', '') }}
                            className="insc-sr"
                          />
                          <span className="insc-session-card-month">SUR MESURE</span>
                          <span className="insc-session-card-season">Vos dates</span>
                          <span className="insc-session-card-dates">90 jours minimum</span>
                          <span className="insc-session-card-intensity">Format adapté famille</span>
                        </label>
                      </div>
                      {form.session === 'sur-mesure' && (
                        <div className="cand-row" style={{ marginTop: '1rem' }}>
                          <Field label="Date de début souhaitée" hint="Réservation 90 jours minimum avant">
                            <input
                              className={`cand-input${errorFields.has('dateDebutSouhaitee') ? ' has-error' : ''}`}
                              type="date"
                              min={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0] })()}
                              value={form.dateDebutSouhaitee}
                              aria-invalid={errorFields.has('dateDebutSouhaitee') || undefined}
                              onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                          </Field>
                          <div />
                        </div>
                      )}
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">Combien de temps ?</h2>
                      <p className="insc-camp-section-help">Tu peux choisir 1, 2 ou 3 semaines.</p>
                      <div className="insc-duration-grid">
                        {[
                          { val: '1-semaine', weeks: 1, label: '1 semaine', sub: 'Initiation famille' },
                          { val: '2-semaines', weeks: 2, label: '2 semaines', sub: 'Vraie progression' },
                          { val: '3-semaines', weeks: 3, label: '3 semaines', sub: 'Immersion complète' },
                        ].map(opt => (
                          <label key={opt.val} className={`insc-duration-card${form.duree === opt.val ? ' is-active' : ''}`}>
                            <input
                              type="radio"
                              name="duree"
                              value={opt.val}
                              checked={form.duree === opt.val}
                              onChange={() => set('duree', opt.val)}
                              className="insc-sr"
                            />
                            <span className="insc-duration-card-label">{opt.label}</span>
                            <span className="insc-duration-card-sub">{opt.sub}</span>
                            <span className="insc-duration-card-price">Forfait dès {formatEUR(FAMILY_PRICING.base[opt.weeks as 1|2|3])}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">3</span>
                      <h2 className="insc-camp-section-label">Qui participe au camp ?</h2>
                      <p className="insc-camp-section-help">Au moins un parent obligatoire. Enfants de 8 à 17 ans.</p>
                      <div className="insc-toggle-grid">
                        <label className={`insc-toggle-card${!form.conjointParticipe ? ' is-active' : ''}`}>
                          <input type="radio" name="parents" value="solo" checked={!form.conjointParticipe} onChange={() => set('conjointParticipe', false)} className="insc-sr" />
                          <span className="insc-toggle-card-label">1 parent</span>
                          <span className="insc-toggle-card-sub">Forfait Parent + Enfant dès {formatEUR(FAMILY_PRICING.base[1])} (1er enfant inclus)</span>
                        </label>
                        <label className={`insc-toggle-card${form.conjointParticipe ? ' is-active' : ''}`}>
                          <input type="radio" name="parents" value="duo" checked={form.conjointParticipe} onChange={() => set('conjointParticipe', true)} className="insc-sr" />
                          <span className="insc-toggle-card-label">2 parents</span>
                          <span className="insc-toggle-card-sub">2 × {formatEUR(PRICING_TIERS.duo.perAdult[1])} (Solo/Duo) + {formatEUR(FAMILY_PRICING.extraChildPerWeek[1])}/enfant/sem</span>
                        </label>
                      </div>

                      <div className="insc-stepper">
                        <span className="insc-stepper-label">Nombre d&apos;enfants</span>
                        <div className="insc-stepper-controls">
                          <button
                            type="button"
                            className="insc-stepper-btn"
                            onClick={() => { if (form.enfants.length > 1) removeChild(form.enfants.length - 1) }}
                            disabled={form.enfants.length <= 1}
                            aria-label="Retirer un enfant"
                          >−</button>
                          <span className="insc-stepper-value" aria-live="polite">{form.enfants.length}</span>
                          <button
                            type="button"
                            className="insc-stepper-btn"
                            onClick={addChild}
                            disabled={form.enfants.length >= 4}
                            aria-label="Ajouter un enfant"
                          >+</button>
                        </div>
                        <span className="insc-stepper-hint">Détails de chaque enfant à l&apos;étape Santé</span>
                      </div>
                    </div>

                    {/* Estimation tarif live famille */}
                    {(() => {
                      const weeks = parseDuration(form.duree)
                      if (!weeks || form.enfants.length === 0) return null
                      const adults = form.conjointParticipe ? 2 : 1
                      const total = calculatePrice({ adults, children: form.enfants.length, weeks })
                      if (total <= 0) return null
                      return (
                        <div className="insc-banner insc-banner--primary">
                          <strong>Estimation : {formatEUR(total)}</strong>
                          <span>{adults} parent{adults > 1 ? 's' : ''} + {form.enfants.length} enfant{form.enfants.length > 1 ? 's' : ''} sur {weeks} semaine{weeks > 1 ? 's' : ''}.{' '}
                            {adults === 1
                              ? `Forfait ${formatEUR(FAMILY_PRICING.base[weeks])} (1P+1E inclus)${form.enfants.length > 1 ? ` + ${form.enfants.length - 1} × ${formatEUR(FAMILY_PRICING.extraChildPerWeek[weeks])}` : ''}`
                              : `2 × ${formatEUR(PRICING_TIERS.duo.perAdult[weeks])} + ${form.enfants.length} × ${formatEUR(FAMILY_PRICING.extraChildPerWeek[weeks])}`}
                          </span>
                        </div>
                      )
                    })()}
                  </>
                )}

                {/* Note redirection pour Session : pas de famille ici */}
                {audience === 'session' && (
                  <div className="insc-banner insc-banner--info">
                    <span>Tu viens avec ton enfant 8-17 ans ? <Link href="/inscription?type=famille" className="insc-inline-link">Choisis le tunnel Famille</Link> à la place : le formulaire est adapté (forfait Parent + Enfant dès {formatEUR(FAMILY_PRICING.base[1])} pour 1 semaine, 1er enfant inclus).</span>
                  </div>
                )}

              </div>
            )}

            {/* ── STEP FINAL — Confirmation/Recap (par tunnel) ──
                  session/custom/famille : step 4 (apres Sante)
                  groupe : step 3 (apres Contact, pas de Sante) */}
            {((step === 4 && audience !== 'groupe') || (step === 3 && audience === 'groupe')) && (() => {
              // Calcul tarif unifié
              const weeks = parseDuration(form.duree)
              let adults = 0
              let enfants = 0
              let isQuoteOnly = false
              if (audience === 'famille') {
                adults = form.conjointParticipe ? 2 : 1
                enfants = form.enfants.length
              } else if (audience === 'session') adults = 1
              else if (audience === 'custom') adults = parseInt(form.nombreParticipants || '1', 10)
              else if (audience === 'groupe') {
                if (form.nombreParticipants === '5') adults = 5
                else if (form.nombreParticipants === '6-10') adults = 6
                else isQuoteOnly = true
              }
              if (form.campDiscipline === 'combo_quote') isQuoteOnly = true
              const isQuote = isQuoteOnly || (adults > 0 && isOnQuote(adults))
              const totalAmount = (!isQuote && weeks && adults > 0) ? calculatePrice({ adults, children: enfants, weeks }) : 0
              const isPriceFromOnly = audience === 'groupe' && form.nombreParticipants === '6-10'

              return (
              <div className="cand-panel">
                {/* Tarif en encart visuel HAUT */}
                <div className="insc-recap-price">
                  <div className="insc-recap-price-head">
                    <span className="insc-recap-price-label">{isQuote ? 'Tarif' : isPriceFromOnly ? 'Estimation à partir de' : 'Total estimé'}</span>
                    <strong className="insc-recap-price-value">
                      {isQuote ? 'Sur devis' : totalAmount > 0 ? formatEUR(totalAmount) : '—'}
                    </strong>
                  </div>
                  {!isQuote && totalAmount > 0 && weeks && (
                    <span className="insc-recap-price-breakdown">
                      {adults} adulte{adults > 1 ? 's' : ''}
                      {enfants > 0 ? ` + ${enfants} enfant${enfants > 1 ? 's' : ''}` : ''}
                      {' '}sur {weeks} semaine{weeks > 1 ? 's' : ''}
                      {audience === 'famille' && adults === 1 ? ' · forfait Parent + Enfant' : ''}
                    </span>
                  )}
                  {isQuote && (
                    <span className="insc-recap-price-breakdown">
                      {form.campDiscipline === 'combo_quote'
                        ? 'Le tarif et le split Daghestan / Tchétchénie sont fixés en visio.'
                        : 'À partir de 11 personnes : devis personnalisé en visio.'}
                    </span>
                  )}
                </div>

                {/* 3 cartes récap : Identité · Camp · Détails */}
                <div className="insc-recap-grid">

                  <section className="insc-recap-card" aria-label="Identité">
                    <header className="insc-recap-card-head">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <circle cx="8" cy="6" r="3" />
                        <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" strokeLinecap="round" />
                      </svg>
                      <span>{audience === 'groupe' ? 'Responsable' : 'Candidat'}</span>
                    </header>
                    <dl>
                      <div><dt>Nom</dt><dd>{form.prenom} {form.nom}</dd></div>
                      <div><dt>Email</dt><dd>{form.email}</dd></div>
                      {form.telephone && <div><dt>Téléphone</dt><dd>{form.telephone}</dd></div>}
                      <div><dt>Pays</dt><dd>{form.pays}</dd></div>
                      {form.villeDepart && <div><dt>Départ</dt><dd>{form.villeDepart}</dd></div>}
                    </dl>
                  </section>

                  <section className="insc-recap-card" aria-label="Camp">
                    <header className="insc-recap-card-head">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <path d="M8 2l5 9H3l5-9z" strokeLinejoin="round" />
                        <line x1="3" y1="14" x2="13" y2="14" strokeLinecap="round" />
                      </svg>
                      <span>Camp</span>
                    </header>
                    <dl>
                      <div><dt>Type</dt><dd>{audienceConfig?.label}</dd></div>
                      {form.campDiscipline && (
                        <div><dt>Discipline</dt><dd>
                          {form.campDiscipline === 'lutte' && 'Lutte · Daghestan'}
                          {form.campDiscipline === 'mma' && 'MMA · Tchétchénie'}
                          {form.campDiscipline === 'combo_quote' && 'Combo Lutte + MMA'}
                        </dd></div>
                      )}
                      {audience === 'session' && (() => {
                        const sel = SESSIONS.find(s => s.id === form.session)
                        return sel ? <div><dt>Session</dt><dd>{sel.season} · {sel.dates}</dd></div> : null
                      })()}
                      {audience === 'famille' && SESSION_IDS.includes(form.session) && (() => {
                        const sel = SESSIONS.find(s => s.id === form.session)
                        return sel ? <div><dt>Format</dt><dd>Session {sel.season}</dd></div> : null
                      })()}
                      {audience === 'famille' && form.session === 'sur-mesure' && (
                        <div><dt>Format</dt><dd>Sur mesure</dd></div>
                      )}
                      {(audience === 'custom' || audience === 'groupe' || (audience === 'famille' && form.session === 'sur-mesure')) && form.dateDebutSouhaitee && (
                        <div><dt>Date</dt><dd>{form.dateDebutSouhaitee}</dd></div>
                      )}
                      {form.duree && <div><dt>Durée</dt><dd>{form.duree.replace('-', ' ')}</dd></div>}
                    </dl>
                  </section>

                  <section className="insc-recap-card" aria-label="Détails">
                    <header className="insc-recap-card-head">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" />
                        <line x1="8" y1="4" x2="8" y2="9" strokeLinecap="round" />
                        <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                      </svg>
                      <span>{audience === 'groupe' ? 'Club' : 'Profil'}</span>
                    </header>
                    <dl>
                      {audience !== 'groupe' && form.disciplinePrincipale && (
                        <>
                          <div><dt>Discipline d&apos;origine</dt><dd>{form.disciplinePrincipale}</dd></div>
                          <div><dt>Niveau</dt><dd>{form.niveau}</dd></div>
                          <div><dt>Années</dt><dd>{form.anneesPratique} ans</dd></div>
                        </>
                      )}
                      {audience === 'custom' && form.nombreParticipants && (
                        <div><dt>Composition</dt><dd>
                          {form.nombreParticipants === '1' && 'Solo'}
                          {form.nombreParticipants === '2' && 'Duo'}
                          {form.nombreParticipants === '3' && 'Trio'}
                          {form.nombreParticipants === '4' && 'Quatuor'}
                        </dd></div>
                      )}
                      {audience === 'custom' && form.autresParticipants.length > 0 && (
                        <div><dt>Avec</dt><dd>{form.autresParticipants.map(p => `${p.prenom || '?'} (${p.niveau || '?'})`).join(', ')}</dd></div>
                      )}
                      {audience === 'famille' && (
                        <>
                          <div><dt>Parents</dt><dd>{form.conjointParticipe ? '2' : '1'}</dd></div>
                          {form.enfants.length > 0 && (
                            <div><dt>Enfants</dt><dd>{form.enfants.map((c, i) => `${c.prenom || `E${i+1}`} (${c.age || '?'}a)`).join(', ')}</dd></div>
                          )}
                        </>
                      )}
                      {audience === 'groupe' && (
                        <>
                          {form.nomClub && <div><dt>Nom</dt><dd>{form.nomClub}</dd></div>}
                          {form.nombreParticipants && <div><dt>Effectif</dt><dd>{form.nombreParticipants}</dd></div>}
                          {form.niveauGroupe && <div><dt>Niveau</dt><dd>{form.niveauGroupe}</dd></div>}
                        </>
                      )}
                    </dl>
                  </section>
                </div>

                {/* Source découverte + message — collapsible pour ne pas alourdir */}
                <details className="insc-extra-details" open={!!form.sourceDecouverte || !!form.message}>
                  <summary>Détails supplémentaires (optionnel)</summary>
                  <div className="insc-extra-details-body">
                    <Field label="Comment as-tu connu le camp ?">
                      <select className="cand-select" value={form.sourceDecouverte}
                        onChange={e => set('sourceDecouverte', e.target.value)}>
                        <option value="">— Optionnel —</option>
                        <option value="instagram">Instagram</option>
                        <option value="bouche-a-oreille">Bouche à oreille</option>
                        <option value="coach">Recommandation de mon coach</option>
                        <option value="google">Recherche Google</option>
                        <option value="autre">Autre</option>
                      </select>
                    </Field>
                    <Field label={audience === 'groupe' ? 'Brief de ta demande (utile pour le devis)' : 'Questions ou informations complémentaires'}>
                      <textarea className="cand-textarea" rows={4}
                        placeholder={audience === 'groupe'
                          ? 'Détaille ton projet : objectifs du séjour, périodes envisagées, niveau hétérogène ou homogène, contraintes calendrier ou budget...'
                          : 'Tes objectifs, tes attentes, toute information utile...'}
                        value={form.message}
                        onChange={e => set('message', e.target.value)} />
                    </Field>
                  </div>
                </details>

                <div className="cand-confirms insc-confirms">
                  {audience === 'groupe' ? (
                    <>
                      <label className={`cand-confirm${form.accepteConditions ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.accepteConditions}
                          aria-invalid={errorFields.has('accepteConditions') || undefined}
                          onChange={e => set('accepteConditions', e.target.checked)}
                        />
                        <span>J&apos;autorise Ruslan (MKR) à me contacter par email, téléphone ou WhatsApp pour cadrer le séjour et m&apos;envoyer un devis personnalisé. Aucun paiement n&apos;est prélevé à cette étape. J&apos;accepte les <Link href="/politique-de-confidentialite" target="_blank" rel="noopener" className="insc-inline-link">conditions de traitement de mes données</Link>.</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={`cand-confirm${form.certifMedical ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.certifMedical}
                          aria-invalid={errorFields.has('certifMedical') || undefined}
                          onChange={e => set('certifMedical', e.target.checked)}
                        />
                        <span>Je m&apos;engage à fournir un certificat médical d&apos;aptitude à la pratique sportive intensive avant le départ.</span>
                      </label>
                      <label className={`cand-confirm${form.accepteConditions ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.accepteConditions}
                          aria-invalid={errorFields.has('accepteConditions') || undefined}
                          onChange={e => set('accepteConditions', e.target.checked)}
                        />
                        <span>J&apos;accepte les <Link href="/cgv" target="_blank" rel="noopener" className="insc-inline-link">conditions générales du camp</Link> (rythme intensif, règles de vie collective, discipline de groupe) et la <Link href="/politique-de-confidentialite" target="_blank" rel="noopener" className="insc-inline-link">politique de confidentialité</Link>.</span>
                      </label>
                      <label className={`cand-confirm${form.pret ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.pret}
                          aria-invalid={errorFields.has('pret') || undefined}
                          onChange={e => set('pret', e.target.checked)}
                        />
                        <span>Je suis prêt(e) à passer l&apos;entretien vidéo de sélection et à fournir une vidéo de ma pratique si demandé.</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
              )
            })()}

            {errors.length > 0 && (
              <div ref={errorsRef} className="cand-errors insc-errors" role="alert" aria-live="assertive">
                <div className="insc-errors-head">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <circle cx="8" cy="8" r="7" />
                    <line x1="8" y1="4" x2="8" y2="9" strokeLinecap="round" />
                    <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                  </svg>
                  <strong>{errors.length === 1 ? 'Un champ à compléter' : `${errors.length} champs à compléter`}</strong>
                </div>
                <ul className="insc-errors-list">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="cand-nav insc-nav-sticky">
              {step > 0 && (
                <button type="button" className="cand-btn-back" onClick={prev}>
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <line x1="13" y1="8" x2="3" y2="8" strokeLinecap="round" />
                    <polyline points="7,4 3,8 7,12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Retour
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="cand-btn-next insc-btn-primary" onClick={next}>
                  Étape suivante
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <line x1="3" y1="8" x2="13" y2="8" strokeLinecap="round" />
                    <polyline points="9,4 13,8 9,12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  className="cand-btn-submit insc-btn-primary"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting || undefined}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="insc-spinner" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeDasharray="20 30" strokeLinecap="round" />
                      </svg>
                      ENVOI EN COURS…
                    </>
                  ) : (
                    <>
                      ENVOYER MA CANDIDATURE
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <polyline points="3,8 7,12 13,4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
            {submitError && (
              <p ref={submitErrorRef} className="insc-submit-error" role="alert">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" />
                  <line x1="8" y1="4" x2="8" y2="9" strokeLinecap="round" />
                  <circle cx="8" cy="12" r="0.6" fill="currentColor" />
                </svg>
                <span>{submitError}</span>
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
