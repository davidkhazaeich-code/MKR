'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
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
  certifsGroupeConfirme: string // 'oui' | 'partiel' | 'inconnu'
  restrictionsGroupe: string // texte libre, optionnel
  // Custom Duo/Trio/Quatuor — autres participants que le responsable
  autresParticipants: CustomParticipant[]
}

// Niveaux acceptés pour le camp MMA. Le form bloque le passage si discipline=mma
// et niveau en-dessous d'avancé. Ruslan filtre ensuite en visio.
const MMA_ACCEPTED_LEVELS = new Set(['avance', 'competiteur-regional', 'competiteur-national', 'competiteur-international'])

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
  palmaresClub: '', certifsGroupeConfirme: '', restrictionsGroupe: '',
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
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const audienceConfig = audience ? getRegistrationType(audience) : null

  const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors([])
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
      // Discipline obligatoire (sauf famille auto-set 'lutte')
      if (audience === 'session') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma') {
          e.push('Choisis ta discipline (Lutte ou MMA)')
        }
        if (!form.session) e.push('Choisis ta session officielle')
        if (!form.duree) e.push('Choisis la durée du séjour')
      }
      if (audience === 'custom') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          e.push('Choisis la discipline (Lutte, MMA ou Combo sur devis)')
        }
        if (!form.nombreParticipants) e.push('Choisis ta composition (1 à 4 adultes)')
        if (!form.dateDebutSouhaitee) {
          e.push('Date de début souhaitée requise')
        } else {
          const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (diffDays < 90) e.push('La date de début doit être au moins 90 jours après aujourd\'hui')
        }
        if (!form.duree) e.push('Durée requise')
      }
      if (audience === 'famille') {
        // session ou 'sur-mesure'
        if (!form.session) e.push('Choisis le format (session officielle ou sur mesure)')
        if (!form.duree) e.push('Durée requise')
        if (!form.nombreEnfants) e.push('Nombre d\'enfants requis')
        if (form.session === 'sur-mesure') {
          if (!form.dateDebutSouhaitee) {
            e.push('Date de début souhaitée requise')
          } else {
            const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            if (diffDays < 90) e.push('La date de début doit être au moins 90 jours après aujourd\'hui')
          }
        }
      }
      if (audience === 'groupe') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          e.push('Choisis la discipline visée par ton groupe (Lutte, MMA ou Combo sur devis)')
        }
        if (!form.dateDebutSouhaitee) {
          e.push('Date de début indicative requise (modifiable en visio)')
        }
        if (!form.duree) e.push('Durée indicative requise (1, 2 ou 3 semaines)')
      }
    }

    // ── STEP 1 — Identite (session/custom/famille) OU Ton club (groupe) ──
    if (step === 1) {
      if (audience !== 'groupe') {
        // Identite + logistique perso (ville + entretien)
        if (!form.prenom.trim()) e.push('Prénom requis')
        if (!form.nom.trim()) e.push('Nom requis')
        if (!form.dateNaissance) e.push('Date de naissance requise')
        else {
          const age = new Date().getFullYear() - new Date(form.dateNaissance).getFullYear()
          if (age < 18) e.push('Tu dois avoir au moins 18 ans')
        }
        if (!form.pays.trim()) e.push('Pays de résidence requis')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.push('Email invalide')
        if (!form.villeDepart.trim()) e.push('Ville de départ requise')
        if (!form.disponibleEntretien) e.push('Disponibilité pour l\'entretien requise')
      } else {
        // Groupe : Ton club (qualification collective)
        if (!form.nomClub.trim()) e.push('Nom du club / groupe requis')
        if (!form.nombreParticipants) e.push('Nombre approximatif de participants requis')
        if (!form.niveauGroupe) e.push('Niveau global du groupe requis')
      }
    }

    // ── STEP 2 — Experience (session/custom/famille) OU Contact (groupe) ──
    if (step === 2) {
      if (audience !== 'groupe') {
        // Experience individuelle du responsable / parent
        if (!form.disciplinePrincipale) e.push('Discipline principale requise')
        if (!form.anneesPratique) e.push('Années de pratique requises')
        if (!form.niveau) e.push('Niveau requis')
        // Custom Duo/Trio/Quatuor : prenom + niveau pour chaque autre participant
        if (audience === 'custom') {
          form.autresParticipants.forEach((p, i) => {
            if (!p.prenom.trim()) e.push(`Participant ${i + 2} : prénom requis`)
            if (!p.niveau) e.push(`Participant ${i + 2} : niveau requis`)
          })
        }
        // Validation niveau MMA : on bloque si discipline MMA mais niveau insuffisant.
        // Affichage anticipe : un message s'affiche aussi en Step 0 quand l'utilisateur clique MMA.
        if (form.campDiscipline === 'mma' && !MMA_ACCEPTED_LEVELS.has(form.niveau)) {
          e.push('Le camp MMA exige un niveau Avancé minimum. Ajuste ton niveau ou retourne au step 1 pour choisir Lutte.')
        }
      } else {
        // Groupe : Contact responsable (identite simple)
        if (!form.prenom.trim()) e.push('Prénom requis')
        if (!form.nom.trim()) e.push('Nom requis')
        if (!form.pays.trim()) e.push('Pays de résidence requis')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.push('Email invalide')
        if (!form.villeDepart.trim()) e.push('Ville de départ requise')
        if (!form.disponibleEntretien) e.push('Disponibilité pour l\'appel requise')
      }
    }

    // ── STEP 3 — Sante (session/custom/famille) OU Confirmation (groupe) ──
    if (step === 3) {
      if (audience === 'session' || audience === 'custom') {
        if (!form.conditionPhysique) e.push('Évalue ta condition physique')
        if (!form.blessuresRecentes) e.push('Indique si tu as des blessures récentes')
        if (!form.contreIndications) e.push('Indique si tu as des contre-indications médicales')
        if (!form.deuxFoisJour) e.push('Confirme ta disponibilité pour les doubles séances')
      } else if (audience === 'famille') {
        // Parent : sante individuelle (sans 2x/jour)
        if (!form.conditionPhysique) e.push('Évalue ta condition physique')
        if (!form.blessuresRecentes) e.push('Indique si tu as des blessures récentes')
        if (!form.contreIndications) e.push('Indique si tu as des contre-indications médicales')
        form.enfants.forEach((c, i) => {
          if (!c.prenom.trim()) e.push(`Enfant ${i + 1} : prénom requis`)
          if (!c.age) e.push(`Enfant ${i + 1} : âge requis`)
          else {
            const a = parseInt(c.age, 10)
            if (Number.isNaN(a) || a < 8 || a > 17) e.push(`Enfant ${i + 1} : âge entre 8 et 17 ans`)
          }
          if (!c.contreIndications) e.push(`Enfant ${i + 1} : contre-indications requises`)
        })
      } else if (audience === 'groupe') {
        // Confirmation groupe : juste acceptation conditions + contact pour devis.
        // Pas de certif medical (collectif gere apres devis), pas de "pret".
        if (!form.accepteConditions) e.push('Accepter les conditions est requis')
      }
    }

    // ── STEP 4 — Confirmation (session/custom/famille uniquement) ──
    if (step === 4) {
      if (!form.certifMedical) e.push('Certificat médical requis')
      if (!form.accepteConditions) e.push('Accepter les conditions est requis')
      if (!form.pret) e.push('Confirme être prêt pour la sélection')
    }

    setErrors(e)
    return e.length === 0
  }

  const next = () => { if (validate()) { setDir('next'); setStep(s => s + 1) } }
  const prev = () => { setDir('prev'); setStep(s => s - 1); setErrors([]) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (isSubmitting) return
    // Payload normalisé snake_case prêt pour backend Supabase (table candidatures + form_data jsonb)
    const payload = {
      tunnel_type: audience,
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
        setSubmitError(data.error || 'Une erreur est survenue. Reessaie ou ecris-nous a contact@mkrcamp.com')
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
              onClick={() => { setAudience(null); setStep(0); setErrors([]) }}
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
        </div>

        <div className="insc-sidebar-bottom">
          <div className="insc-badges">
            <span className="insc-badge">15 PLACES / SESSION</span>
            <span className="insc-badge">RÉPONSE SOUS 48H</span>
            <span className="insc-badge">ENTRETIEN VIDÉO</span>
          </div>
          <Link href="/" className="insc-back-link">← Retour au site</Link>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="insc-mobile-header">
        <Link href="/" className="insc-logo" aria-label="Retour à l'accueil">
          <span className="insc-logo-mkr">MKR</span>
        </Link>
        <div className="insc-mobile-progress">
          <span className="insc-mobile-step-label">Étape {step + 1}/{STEPS.length}</span>
          <div className="insc-mobile-bar">
            <div className="insc-mobile-bar-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </header>

      {/* ── MAIN FORM AREA ── */}
      <main className="insc-main">
        <div className="insc-form-wrap">

          <div key={`header-${step}`} className={`insc-panel-header insc-anim-${dir}`}>
            <span className="label-tag" style={{ color: 'var(--primary)' }}>
              ÉTAPE {step + 1} / {STEPS.length}
            </span>
            <h1 className="insc-panel-title">
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

          <form key={`form-${step}`} className={`insc-form insc-anim-${dir}`} onSubmit={handleSubmit} noValidate>

            {/* ── STEP 1 — Identité + logistique perso (session/custom/famille) ── */}
            {step === 1 && audience !== 'groupe' && (
              <div className="cand-panel">
                <div className="cand-row">
                  <Field label="Prénom">
                    <input className="cand-input" type="text" autoComplete="given-name"
                      placeholder="Ton prénom" value={form.prenom}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label="Nom">
                    <input className="cand-input" type="text" autoComplete="family-name"
                      placeholder="Ton nom" value={form.nom}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Date de naissance" hint="Tu dois avoir au moins 18 ans">
                    <input className="cand-input" type="date" value={form.dateNaissance}
                      onChange={e => set('dateNaissance', e.target.value)} />
                  </Field>
                  <Field label="Pays de résidence">
                    <input className="cand-input" type="text" autoComplete="country-name"
                      placeholder="France, Suisse, Canada..." value={form.pays}
                      onChange={e => set('pays', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Email">
                    <input className="cand-input" type="email" autoComplete="email"
                      placeholder="ton@email.com" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Téléphone">
                    <input className="cand-input" type="tel" autoComplete="tel"
                      placeholder="+33 6 XX XX XX XX" value={form.telephone}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                <Field label="Ville / pays de départ" hint="Utilisé pour estimer les vols">
                  <input className="cand-input" type="text" placeholder="Ex : Paris, Genève, Montréal..."
                    value={form.villeDepart} onChange={e => set('villeDepart', e.target.value)} />
                </Field>
                <Field label="Es-tu disponible pour un entretien vidéo de sélection ?"
                  hint="L'entretien dure 20 min. Il est obligatoire pour valider ta candidature.">
                  <RadioGroup name="entretien" value={form.disponibleEntretien}
                    onChange={v => set('disponibleEntretien', v)}
                    options={[
                      { val: 'oui', label: 'Oui, disponible dans les prochaines semaines' },
                      { val: 'oui-delai', label: "Oui, mais avec un délai (plus d'un mois)" },
                      { val: 'non', label: 'Non, problème de disponibilité' },
                    ]}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 2 — Contact (audience=groupe uniquement) ── */}
            {step === 2 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  Tes coordonnées pour que Ruslan te recontacte et envoie un devis personnalisé. Aucun paiement n&apos;est demandé à cette étape.
                </p>
                <div className="cand-row">
                  <Field label="Prénom du responsable">
                    <input className="cand-input" type="text" autoComplete="given-name"
                      placeholder="Ton prénom" value={form.prenom}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label="Nom">
                    <input className="cand-input" type="text" autoComplete="family-name"
                      placeholder="Ton nom" value={form.nom}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Email">
                    <input className="cand-input" type="email" autoComplete="email"
                      placeholder="ton@email.com" value={form.email}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label="Téléphone / WhatsApp" hint="Pour un échange direct si besoin">
                    <input className="cand-input" type="tel" autoComplete="tel"
                      placeholder="+33 6 XX XX XX XX" value={form.telephone}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label="Pays de résidence">
                    <input className="cand-input" type="text" autoComplete="country-name"
                      placeholder="France, Suisse, Belgique..." value={form.pays}
                      onChange={e => set('pays', e.target.value)} />
                  </Field>
                  <Field label="Ville de départ" hint="Origine principale du groupe">
                    <input className="cand-input" type="text"
                      placeholder="Ex : Paris, Lyon, Genève..."
                      value={form.villeDepart} onChange={e => set('villeDepart', e.target.value)} />
                  </Field>
                </div>
                <Field label="Es-tu disponible pour un appel de cadrage avec Ruslan ?"
                  hint="L'appel dure ~30 min : objectifs, dates, niveau, budget. On envoie le devis ensuite.">
                  <RadioGroup name="entretienGroupe" value={form.disponibleEntretien}
                    onChange={v => set('disponibleEntretien', v)}
                    options={[
                      { val: 'oui', label: 'Oui, disponible dans les prochaines semaines' },
                      { val: 'oui-delai', label: "Oui, mais avec un délai (plus d'un mois)" },
                      { val: 'non', label: 'Préférons un échange par email d\'abord' },
                    ]}
                  />
                </Field>
              </div>
            )}

            {/* ── STEP 2 — Expérience individuelle (session/custom/famille) ── */}
            {step === 2 && audience !== 'groupe' && (
              <div className="cand-panel">
                {audience === 'famille' && (
                  <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                    Cette étape concerne <strong>uniquement le parent participant</strong>. On collectera les infos des enfants à l&apos;étape Santé.
                  </p>
                )}
                {audience === 'custom' && (
                  <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                    Tu réponds pour toi (<strong>responsable de l&apos;inscription</strong>). Si tu pars en Duo/Trio/Quatuor, tu pourras lister les autres participants à l&apos;étape Logistique.
                  </p>
                )}

                <Field label="Discipline principale">
                  <select className="cand-select" value={form.disciplinePrincipale}
                    onChange={e => set('disciplinePrincipale', e.target.value)}>
                    <option value="" disabled>Sélectionner</option>
                    {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>

                <Field label="Disciplines secondaires" hint="Sélectionne tout ce qui s'applique">
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
                    <select className="cand-select" value={form.anneesPratique}
                      onChange={e => set('anneesPratique', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="1-2">1 -2 ans</option>
                      <option value="2-5">2 -5 ans</option>
                      <option value="5-10">5 -10 ans</option>
                      <option value="10+">10 ans et plus</option>
                    </select>
                  </Field>
                  <Field label="Niveau actuel">
                    <select className="cand-select" value={form.niveau}
                      onChange={e => set('niveau', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="intermediaire">Intermédiaire</option>
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

                <Field label="Lien vidéo" hint="YouTube, Instagram, footage de compétition">
                  <input className="cand-input" type="url" placeholder="https://youtube.com/..."
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 1 — Ton club (audience=groupe uniquement) ── */}
            {step === 1 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  On qualifie ici le <strong>collectif</strong>, pas le responsable individuel. Les infos perso de chaque participant seront collectées après validation du devis.
                </p>

                <Field label="Nom du club ou du groupe">
                  <input className="cand-input" type="text"
                    placeholder="Ex : Geneva Fight Club, Académie Krav Magabec..."
                    value={form.nomClub}
                    onChange={e => set('nomClub', e.target.value)} />
                </Field>
                <div className="cand-row">
                  <Field label="Nombre approximatif de participants" hint="Tu pourras affiner après la visio. À partir de 11 personnes ou pour privatiser une session entière, le format est ajusté.">
                    <select className="cand-select" value={form.nombreParticipants}
                      onChange={e => set('nombreParticipants', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="5">5 personnes</option>
                      <option value="6-10">6 à 10 personnes</option>
                      <option value="11-20">11 personnes et plus</option>
                      <option value="20+">Plus de 20 (privatisation totale)</option>
                    </select>
                  </Field>
                  <Field label="Niveau global du groupe">
                    <select className="cand-select" value={form.niveauGroupe}
                      onChange={e => set('niveauGroupe', e.target.value)}>
                      <option value="" disabled>Sélectionner</option>
                      <option value="debutant">Mixte débutant / intermédiaire</option>
                      <option value="intermediaire">Intermédiaire homogène</option>
                      <option value="avance">Avancé / compétiteurs</option>
                      <option value="mixte">Mixte (à préciser)</option>
                    </select>
                  </Field>
                </div>

                <Field label="Discipline(s) principale(s) du club" hint="Sélectionne ce qui s'applique au collectif">
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

                <Field label="Palmarès collectif du club" hint="Optionnel : titres, classements, dimension nationale, athlètes notables">
                  <textarea className="cand-textarea" rows={4}
                    placeholder="Ex : 3 champions de France juniors en 2025, 2 internationaux espoirs, club affilié FFL..."
                    value={form.palmaresClub} onChange={e => set('palmaresClub', e.target.value)} />
                </Field>

                <Field label="Lien vidéo / réseau du club" hint="Optionnel : Instagram, YouTube, site du club">
                  <input className="cand-input" type="url" placeholder="https://instagram.com/..."
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 3 — Santé (session/custom/famille uniquement) ── */}
            {/* Variant individuel : session + custom */}
            {step === 3 && (audience === 'session' || audience === 'custom') && (
              <div className="cand-panel">
                {audience === 'custom' && (
                  <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                    Cette étape concerne <strong>uniquement toi</strong> (responsable). On collectera la santé des autres participants après validation du devis.
                  </p>
                )}
                <Field label="Comment évalues-tu ta condition physique actuelle ?">
                  <RadioGroup name="condition" value={form.conditionPhysique}
                    onChange={v => set('conditionPhysique', v)}
                    options={[
                      { val: '2', label: 'Moyenne -reprise récente' },
                      { val: '3', label: 'Bonne -entraînement régulier' },
                      { val: '4', label: 'Très bonne -entraînement intensif' },
                      { val: '5', label: 'Excellente -niveau compétition' },
                    ]}
                  />
                </Field>
                <Field label="As-tu eu des blessures significatives ces 3 derniers mois ?">
                  <RadioGroup name="blessures" value={form.blessuresRecentes}
                    onChange={v => set('blessuresRecentes', v)}
                    options={[
                      { val: 'non', label: 'Non, aucune blessure' },
                      { val: 'mineure', label: 'Mineure, entièrement guérie' },
                      { val: 'oui', label: 'Oui, à préciser' },
                    ]}
                  />
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Décris la nature et l'état actuel de la blessure..."
                      value={form.blessuresDetail}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="As-tu des contre-indications médicales à l'effort intense ?">
                  <RadioGroup name="contre" value={form.contreIndications}
                    onChange={v => set('contreIndications', v)}
                    options={[
                      { val: 'non', label: 'Non' },
                      { val: 'oui', label: 'Oui, à préciser' },
                    ]}
                  />
                  {form.contreIndications === 'oui' && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Précise la nature des contre-indications..."
                      value={form.contreIndicationsDetail}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="Es-tu capable de t'entraîner deux fois par jour, 6 jours sur 7 ?"
                  hint="Les sessions durent 2 à 3h. C'est le rythme standard du camp.">
                  <RadioGroup name="deuxfois" value={form.deuxFoisJour}
                    onChange={v => set('deuxFoisJour', v)}
                    options={[
                      { val: 'oui', label: 'Oui, je suis prêt' },
                      { val: 'avec-adaptation', label: 'Oui, avec quelques adaptations' },
                      { val: 'non', label: 'Non, je préfère un rythme allégé' },
                    ]}
                  />
                </Field>
              </div>
            )}

            {/* Variant FAMILLE : santé parent (sans 2x/jour) + santé enfants */}
            {step === 3 && audience === 'famille' && (
              <div className="cand-panel">
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>Santé du parent participant</h3>
                <Field label="Comment évalues-tu ta condition physique actuelle ?">
                  <RadioGroup name="condition" value={form.conditionPhysique}
                    onChange={v => set('conditionPhysique', v)}
                    options={[
                      { val: '2', label: 'Moyenne -reprise récente' },
                      { val: '3', label: 'Bonne -entraînement régulier' },
                      { val: '4', label: 'Très bonne -entraînement intensif' },
                      { val: '5', label: 'Excellente -niveau compétition' },
                    ]}
                  />
                </Field>
                <Field label="As-tu eu des blessures significatives ces 3 derniers mois ?">
                  <RadioGroup name="blessures" value={form.blessuresRecentes}
                    onChange={v => set('blessuresRecentes', v)}
                    options={[
                      { val: 'non', label: 'Non, aucune blessure' },
                      { val: 'mineure', label: 'Mineure, entièrement guérie' },
                      { val: 'oui', label: 'Oui, à préciser' },
                    ]}
                  />
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Décris la nature et l'état actuel de la blessure..."
                      value={form.blessuresDetail}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label="As-tu des contre-indications médicales à l'effort intense ?">
                  <RadioGroup name="contre" value={form.contreIndications}
                    onChange={v => set('contreIndications', v)}
                    options={[
                      { val: 'non', label: 'Non' },
                      { val: 'oui', label: 'Oui, à préciser' },
                    ]}
                  />
                  {form.contreIndications === 'oui' && (
                    <textarea className="cand-textarea cand-sub-field" rows={2}
                      placeholder="Précise la nature des contre-indications..."
                      value={form.contreIndicationsDetail}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>

                <h3 className="card-title" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Tes enfants (8-17 ans)</h3>
                <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1.5rem' }}>
                  Le programme jeunesse a son propre rythme (sessions à 10h30 et 17h30). Chaque enfant doit fournir un certificat médical pédiatrique avant le départ.
                </p>

                {form.enfants.map((c, i) => (
                  <div key={i} className="content-card" style={{ marginBottom: '1.25rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <strong style={{ color: 'var(--primary)' }}>Enfant {i + 1}</strong>
                      {form.enfants.length > 1 && (
                        <button type="button" onClick={() => removeChild(i)}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-secondary)', padding: '0.3rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '2px' }}>
                          Retirer
                        </button>
                      )}
                    </div>
                    <div className="cand-row">
                      <Field label="Prénom">
                        <input className="cand-input" type="text" placeholder="Prénom de l'enfant"
                          value={c.prenom} onChange={e => updateChild(i, { prenom: e.target.value })} />
                      </Field>
                      <Field label="Âge" hint="Entre 8 et 17 ans">
                        <input className="cand-input" type="number" min="8" max="17" placeholder="Ex : 12"
                          value={c.age} onChange={e => updateChild(i, { age: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="Pratique-t-il déjà la lutte, le MMA ou un sport de combat ?">
                      <RadioGroup name={`enfant-${i}-pratique`} value={c.pratiqueDeja}
                        onChange={v => updateChild(i, { pratiqueDeja: v })}
                        options={[
                          { val: 'non', label: 'Non, ce sera sa première expérience' },
                          { val: 'oui', label: 'Oui, il pratique déjà' },
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
                      <RadioGroup name={`enfant-${i}-contre`} value={c.contreIndications}
                        onChange={v => updateChild(i, { contreIndications: v })}
                        options={[
                          { val: 'non', label: 'Non, aucune' },
                          { val: 'oui', label: 'Oui, à préciser' },
                        ]}
                      />
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
                  <button type="button" onClick={addChild}
                    style={{ background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', cursor: 'pointer', width: '100%', borderRadius: '3px', fontSize: '0.9rem' }}>
                    + Ajouter un enfant
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
                              <PlacesRestantes
                                sessionId={s.id}
                                variant="dual"
                                className="insc-session-card-places"
                              />
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
                          <span className="insc-discipline-card-emoji" aria-hidden="true">🤼</span>
                          <span className="insc-discipline-card-name">LUTTE</span>
                          <span className="insc-discipline-card-place">Daghestan · Makhachkala</span>
                          <span className="insc-discipline-card-meta">15 places · tous niveaux à partir de 2 ans de pratique</span>
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
                          <span className="insc-discipline-card-emoji" aria-hidden="true">🥊</span>
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
                      {form.campDiscipline === 'mma' && form.niveau && !MMA_ACCEPTED_LEVELS.has(form.niveau) && (
                        <div className="logi-updated" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1rem', borderRadius: '3px', textAlign: 'left', marginTop: '0.6rem', color: '#fca5a5' }}>
                          ⚠ Le camp MMA exige un niveau <strong>Avancé</strong> ou <strong>Compétiteur</strong>. Ton niveau actuel ({form.niveau}) ne permet pas l&apos;inscription MMA. Choisis Lutte, ou ajuste ton niveau à l&apos;étape Expérience.
                        </div>
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

                {/* Audience: CAMP SUR MESURE — discipline + composition + autres participants + dates */}
                {audience === 'custom' && (
                  <>
                    <Field label="Quelle discipline pratiquer pendant le camp ?" hint="Tu peux choisir Lutte uniquement (Daghestan), MMA uniquement (Tchétchénie) ou le combo des deux. Le combo se vit en mode séquentiel (X jours Daghestan puis Y jours Tchétchénie) et est tarifé sur devis pendant la visio.">
                      <div className="cand-radios">
                        <label className={`cand-radio${form.campDiscipline === 'lutte' ? ' selected' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} />
                          <span>
                            <strong>Lutte uniquement (Daghestan)</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Makhachkala / Kaspiysk · tarifs publics par palier
                            </span>
                          </span>
                        </label>
                        <label className={`cand-radio${form.campDiscipline === 'mma' ? ' selected' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} />
                          <span>
                            <strong>MMA uniquement (Tchétchénie)</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Grozny · niveau Avancé minimum · tarifs publics par palier
                            </span>
                          </span>
                        </label>
                        <label className={`cand-radio${form.campDiscipline === 'combo_quote' ? ' selected' : ''}`}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} />
                          <span>
                            <strong>Combo Lutte + MMA (sur devis)</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              Partie au Daghestan + partie en Tchétchénie · durée mini 2 semaines · tarif fixé en visio
                            </span>
                          </span>
                        </label>
                      </div>
                      {form.campDiscipline === 'mma' && !MMA_ACCEPTED_LEVELS.has(form.niveau) && (
                        <div className="logi-updated" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.75rem 1rem', borderRadius: '3px', textAlign: 'left', marginTop: '0.6rem', color: '#fca5a5' }}>
                          ⚠ Le camp MMA exige un niveau <strong>Avancé</strong> ou <strong>Compétiteur</strong>. Choisis Lutte ou Combo, ou reviens à l&apos;étape Expérience.
                        </div>
                      )}
                    </Field>

                    <Field label="Composition de ton inscription" hint="1 à 4 adultes uniquement. Pour 5+ : Club & Groupe. Pour partir avec un enfant : Famille.">
                      <select className="cand-select" value={form.nombreParticipants}
                        onChange={e => syncCustomParticipants(e.target.value)}>
                        <option value="" disabled>Sélectionner</option>
                        <option value="1">Solo (1 adulte)</option>
                        <option value="2">Duo (2 adultes)</option>
                        <option value="3">Trio (3 adultes)</option>
                        <option value="4">Quatuor (4 adultes)</option>
                      </select>
                    </Field>

                    {/* Liste des autres participants (Duo/Trio/Quatuor) */}
                    {form.autresParticipants.length > 0 && (
                      <>
                        <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', marginTop: '1rem', marginBottom: '1rem' }}>
                          Renseigne le prénom et le niveau de chaque autre participant. On collectera leur santé en détail après validation du devis.
                        </p>
                        {form.autresParticipants.map((p, i) => (
                          <div key={i} className="content-card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.85rem' }}>Participant {i + 2}</strong>
                            <div className="cand-row">
                              <Field label="Prénom">
                                <input className="cand-input" type="text" placeholder="Prénom"
                                  value={p.prenom}
                                  onChange={e => updateParticipant(i, { prenom: e.target.value })} />
                              </Field>
                              <Field label="Niveau">
                                <select className="cand-select" value={p.niveau}
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
                      </>
                    )}

                    <div className="cand-row">
                      <Field label="Date de début souhaitée" hint="Réservation 90 jours minimum avant">
                        <input className="cand-input" type="date"
                          min={(() => {
                            const d = new Date()
                            d.setDate(d.getDate() + 90)
                            return d.toISOString().split('T')[0]
                          })()}
                          value={form.dateDebutSouhaitee}
                          onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                      </Field>
                      <Field label="Durée souhaitée" hint={`Tarif par adulte selon la composition (1-2 personnes : palier Solo/Duo · 3 à 4 personnes : palier Trio/Quatuor).`}>
                        {(() => {
                          const adults = Math.max(1, parseInt(form.nombreParticipants || '1', 10))
                          return (
                            <select className="cand-select" value={form.duree}
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
                    <div className="logi-updated" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#a78bfa' }}>Demande de devis personnalisé</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Aucun paiement à ce stade. On ne te demande que les infos essentielles pour que Ruslan puisse te recontacter avec une offre adaptée à ton club. Tu pourras affiner les dates, la composition et la santé après acceptation du devis.
                      </span>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">Discipline visée</h2>
                      <p className="insc-camp-section-help">Lutte au Daghestan, MMA en Tchétchénie, ou un combo des deux destinations. MKR adapte le programme et la destination selon ton choix.</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} className="insc-sr" />
                          <span className="insc-discipline-card-emoji" aria-hidden="true">🤼</span>
                          <span className="insc-discipline-card-name">LUTTE</span>
                          <span className="insc-discipline-card-place">Daghestan · Makhachkala</span>
                          <span className="insc-discipline-card-meta">Tout le club au camp Lutte</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} className="insc-sr" />
                          <span className="insc-discipline-card-emoji" aria-hidden="true">🥊</span>
                          <span className="insc-discipline-card-name">MMA</span>
                          <span className="insc-discipline-card-place">Tchétchénie · Grozny</span>
                          <span className="insc-discipline-card-meta">Profil avancé requis pour tout le groupe</span>
                        </label>
                        <label className={`insc-discipline-card${form.campDiscipline === 'combo_quote' ? ' is-active' : ''}`} style={{ gridColumn: '1 / -1' }}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} className="insc-sr" />
                          <span className="insc-discipline-card-emoji" aria-hidden="true">🔀</span>
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

                {/* Audience: FAMILLE — discipline Lutte forcée + sub-choix parmi les 4 sessions ou sur mesure */}
                {audience === 'famille' && (
                  <>
                    <div className="logi-updated" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', padding: '0.75rem 1rem', borderRadius: '3px', textAlign: 'left', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#4ade80' }}>Camp Lutte au Daghestan</strong>
                      <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Le tunnel Famille se déroule exclusivement au Daghestan (Lutte adultes + programme jeunesse Lutte enfants 8-17 ans). Pas de MMA en Famille : le programme jeunesse n&apos;existe qu&apos;en Lutte et la sécurité enfants impose un parent sur le même camp. Pour une demande spécifique (combo, MMA), <a href="/inscription?type=custom" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>passe par Sur Mesure</a>.
                      </span>
                    </div>

                    <Field label="Format de ton camp famille" hint="Tu peux rejoindre une de nos sessions officielles (calées sur les vacances scolaires) ou choisir tes propres dates. Durée 1, 2 ou 3 semaines dans tous les cas.">
                      <RadioGroup
                        name="formatFamille"
                        value={form.session === 'sur-mesure' ? 'sur-mesure' : (SESSION_IDS.includes(form.session) ? form.session : DEFAULT_SESSION_ID)}
                        onChange={v => {
                          if (v === 'sur-mesure') {
                            set('session', 'sur-mesure')
                            set('duree', '')
                          } else {
                            set('session', v)
                            // Garder le choix de durée existant ou défaut 3-semaines
                            if (!form.duree) set('duree', '3-semaines')
                            set('dateDebutSouhaitee', '')
                          }
                        }}
                        options={[
                          ...SESSIONS.map(s => ({
                            val: s.id,
                            label: `Rejoindre la session ${s.season} (${s.dates}, 1 à 3 semaines au choix)`,
                          })),
                          { val: 'sur-mesure', label: 'Camp famille sur mesure (vos dates, durée au choix, 90j minimum)' },
                        ]}
                      />
                    </Field>

                    {SESSION_IDS.includes(form.session) && (
                      <Field label="Durée souhaitée" hint="Tu choisis 1, 2 ou 3 semaines au sein de la fenêtre de session officielle">
                        <select className="cand-select" value={form.duree}
                          onChange={e => set('duree', e.target.value)}>
                          <option value="" disabled>Sélectionner</option>
                          <option value="1-semaine">1 semaine</option>
                          <option value="2-semaines">2 semaines</option>
                          <option value="3-semaines">3 semaines (immersion complète)</option>
                        </select>
                      </Field>
                    )}

                    {form.session === 'sur-mesure' && (
                      <div className="cand-row">
                        <Field label="Date de début souhaitée" hint="Réservation 90 jours minimum avant">
                          <input className="cand-input" type="date"
                            min={(() => {
                              const d = new Date()
                              d.setDate(d.getDate() + 90)
                              return d.toISOString().split('T')[0]
                            })()}
                            value={form.dateDebutSouhaitee}
                            onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                        </Field>
                        <Field label="Durée souhaitée">
                          <select className="cand-select" value={form.duree}
                            onChange={e => set('duree', e.target.value)}>
                            <option value="" disabled>Sélectionner</option>
                            <option value="1-semaine">1 semaine</option>
                            <option value="2-semaines">2 semaines</option>
                            <option value="3-semaines">3 semaines (immersion complète)</option>
                          </select>
                        </Field>
                      </div>
                    )}

                    <Field label="Ton conjoint(e) participe aussi ?" hint={`Si les deux parents participent : les deux passent au tarif Solo/Duo (${formatEUR(PRICING_TIERS.duo.perAdult[1])} par adulte et par semaine) et chaque enfant est ajouté à ${formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} par semaine. Sinon : forfait Parent + Enfant à ${formatEUR(FAMILY_PRICING.base[1])} (1 sem) avec 1er enfant inclus, +${formatEUR(FAMILY_PRICING.extraChildPerWeek[1])} par enfant supplémentaire.`}>
                      <label className={`cand-confirm${form.conjointParticipe ? ' selected' : ''}`} style={{ marginTop: '0.4rem' }}>
                        <input type="checkbox" checked={form.conjointParticipe}
                          onChange={e => set('conjointParticipe', e.target.checked)} />
                        <span>Oui, mon conjoint(e) participe aussi au camp</span>
                      </label>
                    </Field>

                    {(() => {
                      const weeks = parseDuration(form.duree)
                      if (!weeks || form.enfants.length === 0) return null
                      const adults = form.conjointParticipe ? 2 : 1
                      const total = calculatePrice({ adults, children: form.enfants.length, weeks })
                      if (total <= 0) return null
                      return (
                        <div className="logi-updated" style={{ background: 'rgba(200,75,49,0.08)', border: '1px solid rgba(200,75,49,0.3)', padding: '0.9rem 1rem', borderRadius: '3px', textAlign: 'left', marginTop: '0.85rem' }}>
                          <strong style={{ color: 'var(--primary)' }}>Estimation : {formatEUR(total)}</strong>
                          {' '}pour {adults} parent{adults > 1 ? 's' : ''} + {form.enfants.length} enfant{form.enfants.length > 1 ? 's' : ''} sur {weeks} semaine{weeks > 1 ? 's' : ''}.
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {adults === 1
                              ? `Forfait base ${formatEUR(FAMILY_PRICING.base[weeks])} (1P+1E inclus)${form.enfants.length > 1 ? ` + ${form.enfants.length - 1} × ${formatEUR(FAMILY_PRICING.extraChildPerWeek[weeks])}` : ''}`
                              : `2 × ${formatEUR(PRICING_TIERS.duo.perAdult[weeks])} (tarif Solo/Duo) + ${form.enfants.length} × ${formatEUR(FAMILY_PRICING.extraChildPerWeek[weeks])} (enfant)`}
                          </span>
                        </div>
                      )
                    })()}

                    <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left' }}>
                      <strong>{form.enfants.length}</strong> enfant{form.enfants.length > 1 ? 's' : ''} à inscrire (collecté à l&apos;étape Santé). Tu peux revenir en arrière pour ajuster.
                    </p>
                  </>
                )}

                {/* Note redirection pour Session : pas de famille ici */}
                {audience === 'session' && (
                  <p className="logi-updated" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '3px', textAlign: 'left' }}>
                    Tu viens avec ton enfant 8-17 ans ? <Link href="/inscription?type=famille" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Choisis le tunnel Famille</Link> à la place : le formulaire est adapté (forfait Parent + Enfant à {formatEUR(FAMILY_PRICING.base[1])} pour 1 semaine, 1er enfant inclus).
                  </p>
                )}

              </div>
            )}

            {/* ── STEP FINAL — Confirmation/Recap (par tunnel) ──
                  session/custom/famille : step 4 (apres Sante)
                  groupe : step 3 (apres Contact, pas de Sante) */}
            {((step === 4 && audience !== 'groupe') || (step === 3 && audience === 'groupe')) && (
              <div className="cand-panel">
                <div className="cand-recap">
                  {/* Commun */}
                  <div className="cand-recap-row"><span>Type</span><strong>{audienceConfig?.label}</strong></div>
                  <div className="cand-recap-row">
                    <span>{audience === 'groupe' ? 'Responsable' : 'Candidat'}</span>
                    <strong>{form.prenom} {form.nom}</strong>
                  </div>
                  <div className="cand-recap-row"><span>Pays</span><strong>{form.pays}</strong></div>
                  <div className="cand-recap-row"><span>Email</span><strong>{form.email}</strong></div>

                  {/* Expérience individuelle (session, custom, famille) */}
                  {audience !== 'groupe' && form.disciplinePrincipale && (
                    <>
                      <div className="cand-recap-row"><span>Discipline</span><strong>{form.disciplinePrincipale}</strong></div>
                      <div className="cand-recap-row"><span>Niveau</span><strong>{form.niveau}</strong></div>
                      <div className="cand-recap-row"><span>Pratique</span><strong>{form.anneesPratique} ans</strong></div>
                    </>
                  )}

                  {/* Groupe : qualification club */}
                  {audience === 'groupe' && (
                    <>
                      {form.nomClub && <div className="cand-recap-row"><span>Club</span><strong>{form.nomClub}</strong></div>}
                      {form.nombreParticipants && <div className="cand-recap-row"><span>Participants</span><strong>{form.nombreParticipants}</strong></div>}
                      {form.niveauGroupe && <div className="cand-recap-row"><span>Niveau groupe</span><strong>{form.niveauGroupe}</strong></div>}
                      {form.certifsGroupeConfirme && (
                        <div className="cand-recap-row">
                          <span>Certificats</span>
                          <strong>
                            {form.certifsGroupeConfirme === 'oui' && 'Tous OK'}
                            {form.certifsGroupeConfirme === 'partiel' && 'En partie / à confirmer'}
                            {form.certifsGroupeConfirme === 'inconnu' && 'Au cas par cas'}
                          </strong>
                        </div>
                      )}
                    </>
                  )}

                  {/* Custom : composition + autres participants */}
                  {audience === 'custom' && form.nombreParticipants && (
                    <div className="cand-recap-row">
                      <span>Composition</span>
                      <strong>
                        {form.nombreParticipants === '1' && 'Solo (1 adulte)'}
                        {form.nombreParticipants === '2' && 'Duo (2 adultes)'}
                        {form.nombreParticipants === '3' && 'Trio (3 adultes)'}
                        {form.nombreParticipants === '4' && 'Quatuor (4 adultes)'}
                      </strong>
                    </div>
                  )}
                  {audience === 'custom' && form.autresParticipants.length > 0 && (
                    <div className="cand-recap-row">
                      <span>Autres participants</span>
                      <strong>{form.autresParticipants.map(p => `${p.prenom || '?'} (${p.niveau || '?'})`).join(', ')}</strong>
                    </div>
                  )}

                  {/* Famille : enfants détaillés + conjoint */}
                  {audience === 'famille' && form.enfants.length > 0 && (
                    <div className="cand-recap-row">
                      <span>Enfants</span>
                      <strong>
                        {form.enfants.map((c, i) => `${c.prenom || `Enfant ${i+1}`} (${c.age || '?'} ans)`).join(', ')}
                      </strong>
                    </div>
                  )}
                  {audience === 'famille' && (
                    <div className="cand-recap-row">
                      <span>Parents participants</span>
                      <strong>{form.conjointParticipe ? '2 (toi + conjoint·e)' : '1 (toi seul·e)'}</strong>
                    </div>
                  )}

                  {/* Discipline du camp — affiché pour tous les tunnels sauf si pas encore choisie */}
                  {form.campDiscipline && (
                    <div className="cand-recap-row">
                      <span>Camp</span>
                      <strong>
                        {form.campDiscipline === 'lutte' && 'Lutte · Daghestan'}
                        {form.campDiscipline === 'mma' && 'MMA · Tchétchénie'}
                        {form.campDiscipline === 'combo_quote' && 'Combo Lutte + MMA (sur devis)'}
                      </strong>
                    </div>
                  )}

                  {/* Dates / durée */}
                  {audience === 'session' && (() => {
                    const sel = SESSIONS.find(s => s.id === form.session)
                    return sel ? (
                      <div className="cand-recap-row"><span>Session</span><strong>{sel.dates} {sel.startDate.slice(0, 4)} (3 sem)</strong></div>
                    ) : null
                  })()}
                  {audience === 'famille' && SESSION_IDS.includes(form.session) && (() => {
                    const sel = SESSIONS.find(s => s.id === form.session)
                    return sel ? (
                      <div className="cand-recap-row"><span>Format</span><strong>Session {sel.season} ({sel.dates})</strong></div>
                    ) : null
                  })()}
                  {(audience === 'custom' || audience === 'groupe' || (audience === 'famille' && form.session === 'sur-mesure')) && form.dateDebutSouhaitee && (
                    <div className="cand-recap-row"><span>Date début</span><strong>{form.dateDebutSouhaitee}</strong></div>
                  )}
                  {form.duree && (
                    <div className="cand-recap-row"><span>Durée</span><strong>{form.duree.replace('-', ' ')}</strong></div>
                  )}

                  <div className="cand-recap-row"><span>Départ</span><strong>{form.villeDepart}</strong></div>

                  {/* Tarif estimé : devis sur mesure si Club 11+ ou config indéterminée */}
                  {(() => {
                    const weeks = parseDuration(form.duree)
                    let enfants = 0
                    let adults = 0
                    let isQuoteOnly = false

                    if (audience === 'famille') {
                      adults = form.conjointParticipe ? 2 : 1
                      enfants = form.enfants.length
                    } else if (audience === 'session') {
                      adults = 1
                    } else if (audience === 'custom') {
                      adults = parseInt(form.nombreParticipants || '1', 10)
                    } else if (audience === 'groupe') {
                      // Range based : "5" = exact ; "6-10" = on prend 6 comme minimum estimé ; "11-20" = devis
                      if (form.nombreParticipants === '5') {
                        adults = 5
                      } else if (form.nombreParticipants === '6-10') {
                        adults = 6
                      } else {
                        isQuoteOnly = true
                      }
                    }

                    if (isQuoteOnly || isOnQuote(adults)) {
                      return (
                        <div className="cand-recap-row">
                          <span>Tarif</span>
                          <strong style={{ color: 'var(--primary)' }}>Devis sur mesure</strong>
                        </div>
                      )
                    }
                    if (weeks && adults > 0) {
                      const total = calculatePrice({ adults, children: enfants, weeks })
                      if (total <= 0) return null
                      const label = audience === 'groupe' && form.nombreParticipants === '6-10'
                        ? 'Tarif estimé (à partir de)'
                        : 'Tarif estimé'
                      return <div className="cand-recap-row"><span>{label}</span><strong style={{ color: 'var(--primary)' }}>{formatEUR(total)}</strong></div>
                    }
                    return null
                  })()}
                </div>

                {/* Source de decouverte + message libre — pour tous les tunnels */}
                <div style={{ marginTop: '1.5rem' }}>
                  <Field label="Comment as-tu connu le camp ?">
                    <select className="cand-select" value={form.sourceDecouverte}
                      onChange={e => set('sourceDecouverte', e.target.value)}>
                      <option value="" disabled>Sélectionner (optionnel)</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
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

                <div className="cand-confirms" style={{ marginTop: '1rem' }}>
                  {audience === 'groupe' ? (
                    <>
                      <label className={`cand-confirm${form.accepteConditions ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.accepteConditions}
                          onChange={e => set('accepteConditions', e.target.checked)} />
                        <span>J&apos;autorise Ruslan (MKR) à me contacter par email, téléphone ou WhatsApp pour cadrer le séjour et m&apos;envoyer un devis personnalisé. Aucun paiement n&apos;est prélevé à cette étape.</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <label className={`cand-confirm${form.certifMedical ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.certifMedical}
                          onChange={e => set('certifMedical', e.target.checked)} />
                        <span>Je m&apos;engage à fournir un certificat médical d&apos;aptitude à la pratique sportive intensive avant le départ.</span>
                      </label>
                      <label className={`cand-confirm${form.accepteConditions ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.accepteConditions}
                          onChange={e => set('accepteConditions', e.target.checked)} />
                        <span>J&apos;accepte les conditions du camp : rythme intensif, règles de vie collective, discipline de groupe.</span>
                      </label>
                      <label className={`cand-confirm${form.pret ? ' selected' : ''}`}>
                        <input type="checkbox" checked={form.pret}
                          onChange={e => set('pret', e.target.checked)} />
                        <span>Je suis prêt(e) à passer l&apos;entretien vidéo de sélection et à fournir une vidéo de ma pratique si demandé.</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="cand-errors" role="alert">
                {errors.map((e, i) => <span key={i}>{e}</span>)}
              </div>
            )}

            <div className="cand-nav">
              {step > 0 && (
                <button type="button" className="cand-btn-back" onClick={prev}>← Retour</button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="cand-btn-next" onClick={next}>Étape suivante →</button>
              ) : (
                <button type="submit" className="cand-btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'ENVOI EN COURS…' : 'ENVOYER MA CANDIDATURE'}
                </button>
              )}
            </div>
            {submitError && (
              <p className="cand-error" role="alert" style={{ marginTop: '1rem', color: '#c1392b', fontWeight: 600 }}>
                {submitError}
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
