'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useMemo, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { useLocale, useTranslations } from 'next-intl'
import Icon from './Icon'
import {
  REGISTRATION_TYPES,
  type RegistrationTypeId,
  getRegistrationType,
  hydrateRegistrationTypes,
  hydrateRegistrationType,
} from '@/data/registration-types'
import {
  calculatePrice,
  formatEUR,
  pricePerAdult,
  parseDuration,
  isOnQuote,
  FAMILY_PRICING,
  PRICING_TIERS,
} from '@/data/pricing'
import { SESSIONS } from '@/data/sessions'
import { hydrateSession, hydrateSessions } from '@/lib/session-display'
import {
  FAMILY_BASE_1WEEK_LABEL,
  FAMILY_EXTRA_CHILD_1WEEK_LABEL,
} from '@/lib/pricing-copy'
import { findReferralCode, findCodeBySourceValue } from '@/data/referral-codes'
import PlacesRestantes from '@/components/PlacesRestantes'
import IconLutte from '@/components/icons/IconLutte'
import IconMMA from '@/components/icons/IconMMA'
import IconCombo from '@/components/icons/IconCombo'
import IconFamille from '@/components/icons/IconFamille'

const DEFAULT_SESSION_ID = SESSIONS[0]?.id ?? 'aout-2026'
const SESSION_IDS = SESSIONS.map(s => s.id)

const StoryCard = dynamic(() => import('./StoryCard'))
const VisioBooking = dynamic(() => import('./VisioBooking'))

/* ─────────────── DATA ─────────────── */

const TUNNEL_IDS: RegistrationTypeId[] = ['session', 'custom', 'famille', 'groupe']

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
  session: string; duree: string; villeDepart: string
  sourceDecouverte: string; message: string
  // Discipline du camp (choix Lutte/MMA/Combo)
  campDiscipline: '' | 'lutte' | 'mma' | 'combo_quote'
  // Confirmations
  certifMedical: boolean; accepteConditions: boolean; pret: boolean
  // Camp sur mesure
  dateDebutSouhaitee: string
  // Famille
  vientAvecFamille: boolean
  nombreEnfants: string
  enfantsAges: string
  enfants: FamilyChild[]
  conjointParticipe: boolean
  // Groupe
  nomClub: string
  nombreParticipants: string
  niveauGroupe: string
  palmaresClub: string
  // Custom Duo/Trio/Quatuor
  autresParticipants: CustomParticipant[]
  codeRecommandation: string
}

const MMA_ACCEPTED_LEVELS = new Set(['avance', 'competiteur-regional', 'competiteur-national', 'competiteur-international'])

const ICON_LUTTE = <IconLutte />
const ICON_MMA = <IconMMA />
const ICON_COMBO = <IconCombo />

const INITIAL: FormData = {
  prenom: '', nom: '', dateNaissance: '', pays: '', email: '', telephone: '',
  disciplinePrincipale: '', disciplinesSecondaires: [], anneesPratique: '',
  niveau: '', club: '', coach: '', palmares: '', lienVideo: '',
  conditionPhysique: '', blessuresRecentes: '', blessuresDetail: '',
  contreIndications: '', contreIndicationsDetail: '', deuxFoisJour: '',
  session: '', duree: '', villeDepart: '',
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
  codeRecommandation: '',
}

function makeChild(): FamilyChild {
  return { prenom: '', age: '', pratiqueDeja: '', anneesPratique: '', contreIndications: '', contreIndicationsDetail: '' }
}
function makeParticipant(): CustomParticipant {
  return { prenom: '', niveau: '', discipline: '' }
}

/* ─────────────── HELPERS ─────────────── */

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="cand-field">
      <label className="cand-label">
        {label}
        {required && <span className="cand-required" aria-hidden="true">*</span>}
      </label>
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
  const locale = useLocale()
  const t = useTranslations('inscription')
  const tSessionsData = useTranslations('data.sessions')
  const tRegTypesData = useTranslations('data.registration-types')

  // Hydrated arrays with translated display copy.
  const hydratedSessions = useMemo(
    () => hydrateSessions(SESSIONS, tSessionsData as never),
    [tSessionsData],
  )
  const regTypePlaceholders = useMemo(
    () => ({
      familyBase1weekLabel: FAMILY_BASE_1WEEK_LABEL,
      familyExtraChild1weekLabel: FAMILY_EXTRA_CHILD_1WEEK_LABEL,
      duoPerAdult1week: formatEUR(PRICING_TIERS.duo.perAdult[1]),
      trioPerAdult1week: formatEUR(PRICING_TIERS.trio.perAdult[1]),
      clubPerAdult1week: formatEUR(PRICING_TIERS.club.perAdult[1]),
    }),
    [],
  )
  const hydratedRegistrationTypes = useMemo(
    () => hydrateRegistrationTypes(tRegTypesData as never, regTypePlaceholders),
    [tRegTypesData, regTypePlaceholders],
  )

  // Steps derivés des traductions
  const STEPS_BY_TUNNEL = useMemo<Record<RegistrationTypeId, string[]>>(() => {
    const out = {} as Record<RegistrationTypeId, string[]>
    for (const id of TUNNEL_IDS) {
      out[id] = t.raw(`steps_by_tunnel.${id}`) as string[]
    }
    return out
  }, [t])
  const STEPS_DEFAULT = STEPS_BY_TUNNEL.session

  const [audience, setAudience] = useState<RegistrationTypeId | null>(initialAudience)
  const STEPS = audience ? STEPS_BY_TUNNEL[audience] : STEPS_DEFAULT
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [form, setForm] = useState<FormData>(() => {
    const init = { ...INITIAL }
    const requestedSession = initialSessionId && SESSION_IDS.includes(initialSessionId)
      ? initialSessionId
      : DEFAULT_SESSION_ID
    if (initialAudience === 'session') {
      init.session = requestedSession
      init.duree = '3-semaines'
    }
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
  // Ecran de succes : l'image Instagram a partager n'apparait qu'une fois la visio
  // Cal.com reservee (visioBooked), ou a la demande explicite du candidat (forceShare).
  const [visioBooked, setVisioBooked] = useState(false)
  const [forceShare, setForceShare] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hp, setHp] = useState('')
  const [mobileStepsOpen, setMobileStepsOpen] = useState(false)
  // Time-trap anti-spam : horodatage du montage du formulaire, envoye au submit.
  // Le serveur rejette les envois quasi instantanes (bots). Invisible cote UX.
  const [formStartedAt] = useState(() => Date.now())

  const mainRef = useRef<HTMLDivElement | null>(null)
  const errorsRef = useRef<HTMLDivElement | null>(null)
  const submitErrorRef = useRef<HTMLParagraphElement | null>(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [step])

  useEffect(() => {
    if (errors.length > 0 && errorsRef.current) {
      errorsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors])

  useEffect(() => {
    if (submitError && submitErrorRef.current) {
      submitErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [submitError])

  const referralFeedback = useMemo(() => {
    const raw = form.codeRecommandation.trim()
    if (!raw) return { tone: 'neutral' as const, message: null as string | null }
    const match = findReferralCode(raw)
    if (match) {
      return { tone: 'success' as const, message: t('referral_field.feedback_success', { partner: match.partnerName }) }
    }
    return { tone: 'warning' as const, message: t('referral_field.feedback_warning') }
  }, [form.codeRecommandation, t])

  const sourceCodeConflict = useMemo(() => {
    const sourcePartner = findCodeBySourceValue(form.sourceDecouverte)
    const codePartner = findReferralCode(form.codeRecommandation)
    if (!sourcePartner || !codePartner) return null
    if (sourcePartner.code === codePartner.code) return null
    return {
      sourcePartnerName: sourcePartner.partnerName,
      codePartnerCode: codePartner.code,
      codePartnerName: codePartner.partnerName,
    }
  }, [form.sourceDecouverte, form.codeRecommandation])

  // Lecture du cookie d'attribution mkr_ref (pose par proxy.ts depuis ?ref=<code>).
  // Pre-remplit le code de recommandation et synchronise le menu "Comment as-tu connu le camp ?".
  // Ne s'execute qu'au montage et seulement si le candidat n'a encore rien saisi.
  useEffect(() => {
    if (form.codeRecommandation.trim()) return
    const match = document.cookie.match(/(?:^|;\s*)mkr_ref=([^;]+)/)
    if (!match) return
    const code = decodeURIComponent(match[1])
    const partner = findReferralCode(code)
    if (!partner) return
    setForm(prev => ({
      ...prev,
      codeRecommandation: partner.code,
      // ne pas ecraser un choix deja fait par le candidat
      sourceDecouverte: prev.sourceDecouverte || partner.sourceDecouverteValue || prev.sourceDecouverte,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const audienceConfigStructural = audience ? getRegistrationType(audience) : null
  const audienceConfig = audience && audienceConfigStructural
    ? hydrateRegistrationType(audienceConfigStructural, tRegTypesData as never, regTypePlaceholders)
    : null

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

  const selectAudience = (id: RegistrationTypeId) => {
    setAudience(id)
    setForm(prev => {
      const next = { ...prev }
      const sessionToKeep = SESSION_IDS.includes(prev.session) ? prev.session : DEFAULT_SESSION_ID
      if (id === 'session') {
        next.session = sessionToKeep
        next.duree = '3-semaines'
        next.vientAvecFamille = false
        next.enfants = []
        next.nombreEnfants = ''
        next.campDiscipline = ''
      } else if (id === 'famille') {
        next.session = sessionToKeep
        next.duree = '3-semaines'
        next.vientAvecFamille = true
        if (prev.enfants.length === 0) {
          next.enfants = [makeChild()]
          next.nombreEnfants = '1'
        }
        next.campDiscipline = 'lutte'
      } else if (id === 'custom') {
        next.session = ''
        next.duree = ''
        next.vientAvecFamille = false
        next.enfants = []
        next.nombreEnfants = ''
        next.campDiscipline = ''
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
    const E = (key: string, values?: Record<string, string | number>) => t(`errors.by_field.${key}`, values)

    // STEP 0
    if (step === 0) {
      if (audience === 'session') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma') {
          push(E('campDiscipline_session'), 'campDiscipline')
        }
        if (!form.session) push(E('session_required'), 'session')
        if (!form.duree) push(E('duree_required'), 'duree')
      }
      if (audience === 'custom') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          push(E('campDiscipline_custom_or_groupe'), 'campDiscipline')
        }
        if (!form.nombreParticipants) push(E('nombreParticipants_custom'), 'nombreParticipants')
        if (!form.dateDebutSouhaitee) {
          push(E('dateDebut_required'), 'dateDebutSouhaitee')
        } else {
          const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          if (diffDays < 90) push(E('dateDebut_90j'), 'dateDebutSouhaitee')
        }
        if (!form.duree) push(E('duree_required_short'), 'duree')
      }
      if (audience === 'famille') {
        if (!form.session) push(E('format_famille'), 'session')
        if (!form.duree) push(E('duree_required_short'), 'duree')
        if (!form.nombreEnfants || form.enfants.length === 0) push(E('enfants_min'), 'nombreEnfants')
        if (form.session === 'sur-mesure') {
          if (!form.dateDebutSouhaitee) {
            push(E('dateDebut_required'), 'dateDebutSouhaitee')
          } else {
            const diffDays = Math.floor((new Date(form.dateDebutSouhaitee).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            if (diffDays < 90) push(E('dateDebut_90j'), 'dateDebutSouhaitee')
          }
        }
      }
      if (audience === 'groupe') {
        if (form.campDiscipline !== 'lutte' && form.campDiscipline !== 'mma' && form.campDiscipline !== 'combo_quote') {
          push(E('campDiscipline_groupe'), 'campDiscipline')
        }
        if (!form.dateDebutSouhaitee) {
          push(E('dateDebut_groupe'), 'dateDebutSouhaitee')
        }
        if (!form.duree) push(E('duree_groupe'), 'duree')
      }
    }

    // STEP 1
    if (step === 1) {
      if (audience !== 'groupe') {
        if (!form.prenom.trim()) push(E('prenom_required'), 'prenom')
        if (!form.nom.trim()) push(E('nom_required'), 'nom')
        if (!form.dateNaissance) push(E('dateNaissance_required'), 'dateNaissance')
        else {
          const age = new Date().getFullYear() - new Date(form.dateNaissance).getFullYear()
          if (age < 18) push(E('dateNaissance_18plus'), 'dateNaissance')
        }
        if (!form.pays.trim()) push(E('pays_required'), 'pays')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) push(E('email_invalid'), 'email')
        if (!form.telephone.trim()) push(E('telephone_required'), 'telephone')
        else if (form.telephone.replace(/\D/g, '').length < 6) push(E('telephone_invalid'), 'telephone')
        if (!form.villeDepart.trim()) push(E('villeDepart_required'), 'villeDepart')
      } else {
        if (!form.nomClub.trim()) push(E('nomClub_required'), 'nomClub')
        if (!form.nombreParticipants) push(E('nombreParticipants_groupe'), 'nombreParticipants')
        if (!form.niveauGroupe) push(E('niveauGroupe_required'), 'niveauGroupe')
      }
    }

    // STEP 2
    if (step === 2) {
      if (audience !== 'groupe') {
        if (!form.disciplinePrincipale) push(E('disciplinePrincipale_required'), 'disciplinePrincipale')
        if (!form.anneesPratique) push(E('anneesPratique_required'), 'anneesPratique')
        if (!form.niveau) push(E('niveau_required'), 'niveau')
        if (audience === 'custom') {
          form.autresParticipants.forEach((p, i) => {
            if (!p.prenom.trim()) push(E('participant_prenom', { n: i + 2 }), `autresParticipants.${i}.prenom`)
            if (!p.niveau) push(E('participant_niveau', { n: i + 2 }), `autresParticipants.${i}.niveau`)
          })
        }
        if (form.campDiscipline === 'mma' && !MMA_ACCEPTED_LEVELS.has(form.niveau)) {
          push(E('niveau_mma'), 'niveau')
        }
      } else {
        if (!form.prenom.trim()) push(E('prenom_required'), 'prenom')
        if (!form.nom.trim()) push(E('nom_required'), 'nom')
        if (!form.pays.trim()) push(E('pays_required'), 'pays')
        if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) push(E('email_invalid'), 'email')
        if (!form.telephone.trim()) push(E('telephone_required'), 'telephone')
        else if (form.telephone.replace(/\D/g, '').length < 6) push(E('telephone_invalid'), 'telephone')
        if (!form.villeDepart.trim()) push(E('villeDepart_required'), 'villeDepart')
      }
    }

    // STEP 3
    if (step === 3) {
      if (audience === 'session' || audience === 'custom') {
        if (!form.conditionPhysique) push(E('conditionPhysique_required'), 'conditionPhysique')
        if (!form.blessuresRecentes) push(E('blessuresRecentes_required'), 'blessuresRecentes')
        else if ((form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && !form.blessuresDetail.trim()) push(E('blessuresDetail_required'), 'blessuresDetail')
        if (!form.contreIndications) push(E('contreIndications_required'), 'contreIndications')
        else if (form.contreIndications === 'oui' && !form.contreIndicationsDetail.trim()) push(E('contreIndicationsDetail_required'), 'contreIndicationsDetail')
        if (!form.deuxFoisJour) push(E('deuxFoisJour_required'), 'deuxFoisJour')
      } else if (audience === 'famille') {
        if (!form.conditionPhysique) push(E('conditionPhysique_required'), 'conditionPhysique')
        if (!form.blessuresRecentes) push(E('blessuresRecentes_required'), 'blessuresRecentes')
        else if ((form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && !form.blessuresDetail.trim()) push(E('blessuresDetail_required'), 'blessuresDetail')
        if (!form.contreIndications) push(E('contreIndications_required'), 'contreIndications')
        else if (form.contreIndications === 'oui' && !form.contreIndicationsDetail.trim()) push(E('contreIndicationsDetail_required'), 'contreIndicationsDetail')
        form.enfants.forEach((c, i) => {
          if (!c.prenom.trim()) push(E('enfant_prenom', { n: i + 1 }), `enfants.${i}.prenom`)
          if (!c.age) push(E('enfant_age_required', { n: i + 1 }), `enfants.${i}.age`)
          else {
            const a = parseInt(c.age, 10)
            if (Number.isNaN(a) || a < 8 || a > 17) push(E('enfant_age_range', { n: i + 1 }), `enfants.${i}.age`)
          }
          if (!c.contreIndications) push(E('enfant_contre_indications', { n: i + 1 }), `enfants.${i}.contreIndications`)
          else if (c.contreIndications === 'oui' && !c.contreIndicationsDetail.trim()) push(E('enfant_contre_indications_detail', { n: i + 1 }), `enfants.${i}.contreIndicationsDetail`)
        })
      } else if (audience === 'groupe') {
        if (!form.sourceDecouverte) push(E('source_required'), 'sourceDecouverte')
        if (!form.accepteConditions) push(E('accepteConditions_required'), 'accepteConditions')
      }
    }

    // STEP 4
    if (step === 4) {
      if (!form.sourceDecouverte) push(E('source_required'), 'sourceDecouverte')
      if (!form.certifMedical) push(E('certifMedical_required'), 'certifMedical')
      if (!form.accepteConditions) push(E('accepteConditions_required'), 'accepteConditions')
      if (!form.pret) push(E('pret_required'), 'pret')
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
    const payload = {
      tunnel_type: audience,
      _hp: hp,
      form_started_at: formStartedAt,
      submission_language: locale,
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
      code_recommandation: form.codeRecommandation.trim() || null,
      form_data: {
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
        } : null,
        famille: audience === 'famille' ? {
          format: form.session,
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
          message: form.message,
        },
        confirmations: {
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
        setSubmitError(data.error || t('submit_error_generic'))
        return
      }
      setSubmitted(true)
    } catch {
      setSubmitError(t('submit_error_network'))
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── Audience Selector ── */
  if (!audience) {
    return (
      <div className="insc-wrapper">
        <div className="insc-success-page insc-chooser" style={{ paddingTop: '4rem' }}>
          <Link href="/" className="insc-back-home">← {t('back_to_site')}</Link>
          <div className="insc-audience-selector">
            <span className="label-tag" style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.8rem' }}>
              {t('audience_selector.label')}
            </span>
            <h1 className="cand-success-title">{t('audience_selector.title')}</h1>
            <p className="cand-success-sub">
              {t('audience_selector.subtitle')}
            </p>
            <div className="audience-grid">
              {hydratedRegistrationTypes.map((type, i) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => selectAudience(type.id)}
                  className={`audience-card audience-card--clickable audience-card--photo${type.recommended ? ' audience-card--recommended' : ''}`}
                  style={{ textAlign: 'left' }}
                >
                  <div className="audience-card-photo" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={type.image}
                      alt={type.image_alt}
                      className="audience-card-photo-img"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                    <div className="audience-card-photo-overlay" />
                  </div>
                  {type.recommended && (
                    <span className="audience-card-flag">{t('audience_selector.flag_recommended')}</span>
                  )}
                  <span className="audience-card-badge">{type.badge}</span>
                  <h3 className="audience-card-title">{type.label}</h3>
                  <p className="audience-card-desc">{type.description}</p>
                  <ul className="audience-card-meta">
                    <li>
                      <span className="audience-card-meta-label">{t('audience_selector.meta_labels.dates')}</span>
                      <span className="audience-card-meta-value">{type.dates}</span>
                    </li>
                    <li>
                      <span className="audience-card-meta-label">{t('audience_selector.meta_labels.duration')}</span>
                      <span className="audience-card-meta-value">{type.duration}</span>
                    </li>
                    <li>
                      <span className="audience-card-meta-label">{t('audience_selector.meta_labels.from')}</span>
                      <span className="audience-card-meta-value">
                        {type.minPersons === 1 ? t('audience_selector.persons.one') : t('audience_selector.persons.other', { count: type.minPersons })}
                      </span>
                    </li>
                  </ul>
                  <span className="audience-card-cta" style={{ width: '100%', justifyContent: 'center' }}>
                    {type.cta}
                    <Icon name="arrow-right" size={14} />
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
    const SESSION_MAP: Record<string, { name: string }> = hydratedSessions.reduce(
      (acc, s) => {
        acc[s.id] = { name: s.name }
        return acc
      },
      {} as Record<string, { name: string }>,
    )
    const sel = SESSION_MAP[form.session] || { name: form.session || t('success.session_fallback') }

    return (
      <div className="insc-wrapper">
        <div className="insc-success-page">
          <Link href="/" className="insc-back-home">← {t('back_to_site')}</Link>
          <div className="cand-success">
            <div className="cand-success-icon" style={{ color: 'var(--primary)' }}>
              <Icon name="check-circle" size={48} />
            </div>
            <span className="label-tag" style={{ color: 'var(--primary)' }}>{t('success.label')}</span>
            <h2 className="cand-success-title">{t('success.title')}</h2>
            <p className="cand-success-sub" dangerouslySetInnerHTML={{ __html: t.raw('success.subtitle') as string }} />

            <VisioBooking
              prenom={form.prenom}
              nom={form.nom}
              email={form.email}
              onBooked={() => setVisioBooked(true)}
            />

            {visioBooked || forceShare ? (
              <div className="insc-share-block insc-share-block--revealed">
                {visioBooked && (
                  <span className="insc-booked-badge">
                    <Icon name="check" size={14} />
                    {t('success.booked_badge')}
                  </span>
                )}
                <span className="label-tag insc-share-label" style={{ color: 'var(--primary)' }}>
                  {t('success.share_label')}
                </span>
                <StoryCard
                  prenom={form.prenom}
                  campDiscipline={form.campDiscipline}
                  session={sel.name}
                />
              </div>
            ) : (
              <p className="insc-share-locked">
                {t('success.share_locked_hint')}{' '}
                <button type="button" className="insc-share-reveal" onClick={() => setForceShare(true)}>
                  {t('success.share_reveal_link')}
                </button>
              </p>
            )}

            <Link href="/" className="insc-back-btn" style={{ marginTop: '1.5rem' }}>{t('back_to_home')}</Link>
          </div>
        </div>
      </div>
    )
  }

  const renderReferralCodeField = () => (
    <div className="cand-referral-highlight">
      <Field
        label={t('referral_field.label')}
        hint={t('referral_field.hint')}
      >
        <input
          className={`cand-input${referralFeedback.tone !== 'neutral' ? ` cand-input--${referralFeedback.tone}` : ''}`}
          type="text"
          autoComplete="off"
          placeholder={t('referral_field.placeholder')}
          value={form.codeRecommandation}
          onChange={(e) => set('codeRecommandation', e.target.value)}
          aria-describedby={referralFeedback.message ? 'referral-feedback' : undefined}
          maxLength={40}
        />
        {referralFeedback.message && (
          <span
            id="referral-feedback"
            className={`cand-referral-feedback cand-referral-feedback--${referralFeedback.tone}`}
          >
            {referralFeedback.message}
          </span>
        )}
      </Field>
    </div>
  )

  // Helpers traduits
  const formatDurationLabel = (duree: string) => {
    if (!duree) return ''
    return duree.replace('-', ' ')
  }

  const compositionLabel = (n: string) => {
    if (n === '1') return t('sidebar.compositions.solo')
    if (n === '2') return t('sidebar.compositions.duo')
    if (n === '3') return t('sidebar.compositions.trio')
    return t('sidebar.compositions.quatuor')
  }

  const countryOptions = t.raw('identity.country_options') as string[]

  return (
    <div className="insc-wrapper">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="insc-sidebar">
        <div className="insc-sidebar-top">
          <Link href="/" className="insc-logo" aria-label={t('back_aria')}>
            <span className="insc-logo-mkr">MKR</span>
            <span className="insc-logo-sub">{t('sidebar.logo_sub')}</span>
          </Link>
          {audienceConfig && (
            <button
              type="button"
              onClick={() => { setAudience(null); setStep(0); setErrors([]); setErrorFields(new Set()) }}
              className="insc-audience-tag"
              aria-label={t('sidebar.change_audience_aria')}
            >
              <span className="insc-audience-tag-label">{audienceConfig.short_label}</span>
              <span className="insc-audience-tag-change">{t('sidebar.change_label')}</span>
            </button>
          )}
        </div>

        <div className="insc-sidebar-mid">
          <nav className="insc-steps" aria-label={t('sidebar.steps_aria')}>
            {STEPS.map((label, i) => (
              <div key={i} className={`insc-step${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}>
                <div className="insc-step-dot">
                  {i < step ? (
                    <Icon name="check" size={12} />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className="insc-step-label">{label}</span>
              </div>
            ))}
          </nav>

          {step >= 1 && (form.campDiscipline || form.session || form.duree) && (
            <div className="insc-sidebar-recap" role="status" aria-label={t('sidebar.recap_aria')}>
              <span className="insc-sidebar-recap-title">{t('sidebar.recap_title')}</span>
              {form.campDiscipline && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.camp')}</span>
                  <strong>
                    {form.campDiscipline === 'lutte' && t('summary.camp_disciplines.lutte')}
                    {form.campDiscipline === 'mma' && t('summary.camp_disciplines.mma')}
                    {form.campDiscipline === 'combo_quote' && t('summary.camp_disciplines.combo_quote')}
                  </strong>
                </div>
              )}
              {audience === 'session' && form.session && (() => {
                const sel = SESSIONS.find(s => s.id === form.session)
                return sel ? (
                  <div className="insc-sidebar-recap-row">
                    <span>{t('sidebar.recap_rows.session')}</span>
                    <strong>{sel.season} {sel.startDate.slice(0, 4)}</strong>
                  </div>
                ) : null
              })()}
              {audience === 'famille' && form.session === 'sur-mesure' && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.format')}</span>
                  <strong>{t('sidebar.recap_rows.format_custom')}</strong>
                </div>
              )}
              {audience === 'famille' && SESSION_IDS.includes(form.session) && (() => {
                const sel = SESSIONS.find(s => s.id === form.session)
                return sel ? (
                  <div className="insc-sidebar-recap-row">
                    <span>{t('sidebar.recap_rows.format')}</span>
                    <strong>{sel.season}</strong>
                  </div>
                ) : null
              })()}
              {form.duree && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.duration')}</span>
                  <strong>{formatDurationLabel(form.duree)}</strong>
                </div>
              )}
              {audience === 'custom' && form.nombreParticipants && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.composition')}</span>
                  <strong>{compositionLabel(form.nombreParticipants)}</strong>
                </div>
              )}
              {audience === 'famille' && form.enfants.length > 0 && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.family')}</span>
                  <strong>{t('sidebar.family_units', { adults: form.conjointParticipe ? 2 : 1, children: form.enfants.length })}</strong>
                </div>
              )}
              {audience === 'groupe' && form.nombreParticipants && (
                <div className="insc-sidebar-recap-row">
                  <span>{t('sidebar.recap_rows.groupe')}</span>
                  <strong>{form.nombreParticipants === '5' ? t('sidebar.groupe_5') : form.nombreParticipants}</strong>
                </div>
              )}
              {(() => {
                const weeks = parseDuration(form.duree)
                if (!weeks) return null
                if (form.campDiscipline === 'combo_quote') {
                  return (
                    <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total">
                      <span>{t('sidebar.recap_rows.price')}</span>
                      <strong>{t('sidebar.recap_rows.on_quote')}</strong>
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
                  else return <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total"><span>{t('sidebar.recap_rows.price')}</span><strong>{t('sidebar.recap_rows.on_quote')}</strong></div>
                }
                if (!adults) return null
                if (isOnQuote(adults)) {
                  return <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total"><span>{t('sidebar.recap_rows.price')}</span><strong>{t('sidebar.recap_rows.on_quote')}</strong></div>
                }
                const total = calculatePrice({ adults, children, weeks })
                if (total <= 0) return null
                return (
                  <div className="insc-sidebar-recap-row insc-sidebar-recap-row--total">
                    <span>{audience === 'groupe' && form.nombreParticipants === '6-10' ? t('sidebar.recap_rows.from') : t('sidebar.recap_rows.estimated_total')}</span>
                    <strong>{formatEUR(total)}</strong>
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        <div className="insc-sidebar-bottom">
          <div className="insc-badges">
            <span className="insc-badge">{t('sidebar.badges.places')}</span>
            <span className="insc-badge">{t('sidebar.badges.response')}</span>
            <span className="insc-badge">{t('sidebar.badges.interview')}</span>
          </div>
          <Link href="/" className="insc-back-link">← {t('back_to_site')}</Link>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="insc-mobile-header">
        <Link href="/" className="insc-logo" aria-label={t('back_aria')}>
          <span className="insc-logo-mkr">MKR</span>
        </Link>
        <button
          type="button"
          className={`insc-mobile-progress${mobileStepsOpen ? ' is-open' : ''}`}
          onClick={() => setMobileStepsOpen(o => !o)}
          aria-expanded={mobileStepsOpen}
          aria-controls="insc-mobile-steps-panel"
          aria-label={t('mobile_header.progress_aria', { current: step + 1, total: STEPS.length, step: STEPS[step] })}
        >
          <div className="insc-mobile-progress-top">
            <span className="insc-mobile-step-label">{t('mobile_header.step_label', { current: step + 1, total: STEPS.length, step: STEPS[step] })}</span>
            <span className="insc-mobile-chevron">
              <Icon name="chevron-down" size={12} />
            </span>
          </div>
          <div className="insc-mobile-bar">
            <div className="insc-mobile-bar-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </button>
        {mobileStepsOpen && (
          <div id="insc-mobile-steps-panel" className="insc-mobile-steps-panel" role="region" aria-label={t('mobile_header.panel_aria')}>
            <ol className="insc-mobile-steps-list">
              {STEPS.map((label, i) => (
                <li
                  key={i}
                  className={`insc-mobile-step${i < step ? ' done' : ''}${i === step ? ' active' : ''}`}
                >
                  <span className="insc-mobile-step-num">
                    {i < step ? <Icon name="check" size={11} /> : i + 1}
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
              {t('panel_titles.step_label_prefix', { current: step + 1, total: STEPS.length })}
            </span>
            <h1 id="insc-form-title" className="insc-panel-title">
              {step === 0 && audience === 'session' && t('panel_titles.step0_session')}
              {step === 0 && audience === 'custom' && t('panel_titles.step0_custom')}
              {step === 0 && audience === 'famille' && t('panel_titles.step0_famille')}
              {step === 0 && audience === 'groupe' && t('panel_titles.step0_groupe')}
              {step === 1 && audience !== 'groupe' && t('panel_titles.step1_identity')}
              {step === 1 && audience === 'groupe' && t('panel_titles.step1_club')}
              {step === 2 && audience !== 'groupe' && t('panel_titles.step2_experience')}
              {step === 2 && audience === 'groupe' && t('panel_titles.step2_contact')}
              {step === 3 && audience === 'famille' && t('panel_titles.step3_health_famille')}
              {step === 3 && (audience === 'session' || audience === 'custom') && t('panel_titles.step3_health')}
              {step === 3 && audience === 'groupe' && t('panel_titles.step3_groupe_confirm')}
              {step === 4 && t('panel_titles.step4_confirm')}
            </h1>
          </div>

          <form key={`form-${step}`} className={`insc-form insc-anim-${dir}`} onSubmit={handleSubmit} noValidate aria-labelledby="insc-form-title">
            {/* Honeypot */}
            <div className="insc-hp" aria-hidden="true">
              <label>
                {t('honeypot.label')}
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

            {/* ── STEP 1 — Identité ── */}
            {step === 1 && audience !== 'groupe' && (
              <div className="cand-panel">
                <div className="cand-row">
                  <Field label={t('identity.fields.prenom.label')} required>
                    <input
                      className={`cand-input${errorFields.has('prenom') ? ' has-error' : ''}`}
                      type="text" autoComplete="given-name"
                      placeholder={t('identity.fields.prenom.placeholder')} value={form.prenom}
                      aria-invalid={errorFields.has('prenom') || undefined}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label={t('identity.fields.nom.label')} required>
                    <input
                      className={`cand-input${errorFields.has('nom') ? ' has-error' : ''}`}
                      type="text" autoComplete="family-name"
                      placeholder={t('identity.fields.nom.placeholder')} value={form.nom}
                      aria-invalid={errorFields.has('nom') || undefined}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label={t('identity.fields.date_naissance.label')} required hint={t('identity.fields.date_naissance.hint')}>
                    <input
                      className={`cand-input${errorFields.has('dateNaissance') ? ' has-error' : ''}`}
                      type="date"
                      max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().split('T')[0] })()}
                      value={form.dateNaissance}
                      aria-invalid={errorFields.has('dateNaissance') || undefined}
                      onChange={e => set('dateNaissance', e.target.value)} />
                  </Field>
                  <Field label={t('identity.fields.pays.label')} required>
                    <input
                      className={`cand-input${errorFields.has('pays') ? ' has-error' : ''}`}
                      type="text" autoComplete="country-name" list="insc-pays-list"
                      placeholder={t('identity.fields.pays.placeholder')} value={form.pays}
                      aria-invalid={errorFields.has('pays') || undefined}
                      onChange={e => set('pays', e.target.value)} />
                    <datalist id="insc-pays-list">
                      {countryOptions.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label={t('identity.fields.email.label')} required>
                    <input
                      className={`cand-input${errorFields.has('email') ? ' has-error' : ''}`}
                      type="email" autoComplete="email" inputMode="email"
                      placeholder={t('identity.fields.email.placeholder')} value={form.email}
                      aria-invalid={errorFields.has('email') || undefined}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label={t('identity.fields.telephone.label')} required hint={t('identity.fields.telephone.hint')}>
                    <input
                      className={`cand-input${errorFields.has('telephone') ? ' has-error' : ''}`}
                      type="tel" autoComplete="tel" inputMode="tel"
                      placeholder={t('identity.fields.telephone.placeholder')} value={form.telephone}
                      aria-invalid={errorFields.has('telephone') || undefined}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                {renderReferralCodeField()}
                <Field label={t('identity.fields.ville_depart.label')} required hint={t('identity.fields.ville_depart.hint')}>
                  <input
                    className={`cand-input${errorFields.has('villeDepart') ? ' has-error' : ''}`}
                    type="text" placeholder={t('identity.fields.ville_depart.placeholder')}
                    value={form.villeDepart}
                    aria-invalid={errorFields.has('villeDepart') || undefined}
                    onChange={e => set('villeDepart', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 2 — Contact (groupe) ── */}
            {step === 2 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="insc-banner insc-banner--quote">
                  <strong>{t('groupe_contact.banner.title')}</strong>
                  <span>{t('groupe_contact.banner.body')}</span>
                </p>
                <div className="cand-row">
                  <Field label={t('groupe_contact.fields.prenom_responsable.label')} required>
                    <input
                      className={`cand-input${errorFields.has('prenom') ? ' has-error' : ''}`}
                      type="text" autoComplete="given-name"
                      placeholder={t('groupe_contact.fields.prenom_responsable.placeholder')} value={form.prenom}
                      aria-invalid={errorFields.has('prenom') || undefined}
                      onChange={e => set('prenom', e.target.value)} />
                  </Field>
                  <Field label={t('groupe_contact.fields.nom.label')} required>
                    <input
                      className={`cand-input${errorFields.has('nom') ? ' has-error' : ''}`}
                      type="text" autoComplete="family-name"
                      placeholder={t('groupe_contact.fields.nom.placeholder')} value={form.nom}
                      aria-invalid={errorFields.has('nom') || undefined}
                      onChange={e => set('nom', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label={t('groupe_contact.fields.email.label')} required>
                    <input
                      className={`cand-input${errorFields.has('email') ? ' has-error' : ''}`}
                      type="email" autoComplete="email" inputMode="email"
                      placeholder={t('groupe_contact.fields.email.placeholder')} value={form.email}
                      aria-invalid={errorFields.has('email') || undefined}
                      onChange={e => set('email', e.target.value)} />
                  </Field>
                  <Field label={t('groupe_contact.fields.telephone.label')} required hint={t('groupe_contact.fields.telephone.hint')}>
                    <input
                      className={`cand-input${errorFields.has('telephone') ? ' has-error' : ''}`}
                      type="tel" autoComplete="tel" inputMode="tel"
                      placeholder={t('groupe_contact.fields.telephone.placeholder')} value={form.telephone}
                      aria-invalid={errorFields.has('telephone') || undefined}
                      onChange={e => set('telephone', e.target.value)} />
                  </Field>
                </div>
                <div className="cand-row">
                  <Field label={t('groupe_contact.fields.pays.label')} required>
                    <input
                      className={`cand-input${errorFields.has('pays') ? ' has-error' : ''}`}
                      type="text" autoComplete="country-name" list="insc-pays-list"
                      placeholder={t('groupe_contact.fields.pays.placeholder')} value={form.pays}
                      aria-invalid={errorFields.has('pays') || undefined}
                      onChange={e => set('pays', e.target.value)} />
                  </Field>
                  <Field label={t('groupe_contact.fields.ville_depart.label')} required hint={t('groupe_contact.fields.ville_depart.hint')}>
                    <input
                      className={`cand-input${errorFields.has('villeDepart') ? ' has-error' : ''}`}
                      type="text"
                      placeholder={t('groupe_contact.fields.ville_depart.placeholder')}
                      value={form.villeDepart}
                      aria-invalid={errorFields.has('villeDepart') || undefined}
                      onChange={e => set('villeDepart', e.target.value)} />
                  </Field>
                </div>
                {renderReferralCodeField()}
              </div>
            )}

            {/* ── STEP 2 — Expérience (session/custom/famille) ── */}
            {step === 2 && audience !== 'groupe' && (
              <div className="cand-panel">
                {audience === 'famille' && (
                  <p className="insc-banner insc-banner--info">
                    <span>{t('experience.banner_famille.prefix')}<strong>{t('experience.banner_famille.strong')}</strong>{t('experience.banner_famille.suffix')}</span>
                  </p>
                )}
                {audience === 'custom' && (
                  <p className="insc-banner insc-banner--info">
                    <span>{t('experience.banner_custom.prefix')}<strong>{t('experience.banner_custom.strong')}</strong>{t('experience.banner_custom.suffix')}</span>
                  </p>
                )}

                <Field label={t('experience.fields.discipline_principale.label')} required>
                  <select
                    className={`cand-select${errorFields.has('disciplinePrincipale') ? ' has-error' : ''}`}
                    value={form.disciplinePrincipale}
                    aria-invalid={errorFields.has('disciplinePrincipale') || undefined}
                    onChange={e => set('disciplinePrincipale', e.target.value)}>
                    <option value="" disabled>{t('experience.select_placeholder')}</option>
                    {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>

                <Field
                  label={t('experience.fields.disciplines_secondaires.label')}
                  hint={
                    form.disciplinesSecondaires.length === 0
                      ? t('experience.fields.disciplines_secondaires.hint')
                      : form.disciplinesSecondaires.length === 1
                        ? t('experience.fields.disciplines_secondaires.hint_selected_one')
                        : t('experience.fields.disciplines_secondaires.hint_selected_many', { count: form.disciplinesSecondaires.length })
                  }>
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
                  <Field label={t('experience.fields.annees_pratique.label')} required>
                    <select
                      className={`cand-select${errorFields.has('anneesPratique') ? ' has-error' : ''}`}
                      value={form.anneesPratique}
                      aria-invalid={errorFields.has('anneesPratique') || undefined}
                      onChange={e => set('anneesPratique', e.target.value)}>
                      <option value="" disabled>{t('experience.select_placeholder')}</option>
                      <option value="1-2">{t('experience.annees_options.1-2')}</option>
                      <option value="2-5">{t('experience.annees_options.2-5')}</option>
                      <option value="5-10">{t('experience.annees_options.5-10')}</option>
                      <option value="10+">{t('experience.annees_options.10+')}</option>
                    </select>
                  </Field>
                  <Field
                    label={t('experience.fields.niveau.label')}
                    required
                    hint={form.campDiscipline === 'mma' ? t('experience.fields.niveau.hint_mma') : undefined}>
                    <select
                      className={`cand-select${errorFields.has('niveau') ? ' has-error' : ''}`}
                      value={form.niveau}
                      aria-invalid={errorFields.has('niveau') || undefined}
                      onChange={e => set('niveau', e.target.value)}>
                      <option value="" disabled>{t('experience.select_placeholder')}</option>
                      <option value="intermediaire" disabled={form.campDiscipline === 'mma'}>
                        {form.campDiscipline === 'mma' ? t('experience.niveau_options.intermediaire_mma_blocked') : t('experience.niveau_options.intermediaire')}
                      </option>
                      <option value="avance">{t('experience.niveau_options.avance')}</option>
                      <option value="competiteur-regional">{t('experience.niveau_options.competiteur_regional')}</option>
                      <option value="competiteur-national">{t('experience.niveau_options.competiteur_national')}</option>
                      <option value="competiteur-international">{t('experience.niveau_options.competiteur_international')}</option>
                    </select>
                  </Field>
                </div>

                <div className="cand-row">
                  <Field label={t('experience.fields.club.label')}>
                    <input className="cand-input" type="text" placeholder={t('experience.fields.club.placeholder')}
                      value={form.club} onChange={e => set('club', e.target.value)} />
                  </Field>
                  <Field label={t('experience.fields.coach.label')}>
                    <input className="cand-input" type="text" placeholder={t('experience.fields.coach.placeholder')}
                      value={form.coach} onChange={e => set('coach', e.target.value)} />
                  </Field>
                </div>

                <Field label={t('experience.fields.palmares.label')} hint={t('experience.fields.palmares.hint')}>
                  <textarea className="cand-textarea" rows={3}
                    placeholder={t('experience.fields.palmares.placeholder')}
                    value={form.palmares} onChange={e => set('palmares', e.target.value)} />
                </Field>

                <Field label={t('experience.fields.lien_video.label')} hint={t('experience.fields.lien_video.hint')}>
                  <input className="cand-input" type="url" placeholder={t('experience.fields.lien_video.placeholder')}
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 1 — Ton club (groupe) ── */}
            {step === 1 && audience === 'groupe' && (
              <div className="cand-panel">
                <p className="insc-banner insc-banner--info">
                  <span>{t('club_qualification.banner.prefix')}<strong>{t('club_qualification.banner.strong')}</strong>{t('club_qualification.banner.suffix')}</span>
                </p>

                <Field label={t('club_qualification.fields.nom_club.label')} required>
                  <input
                    className={`cand-input${errorFields.has('nomClub') ? ' has-error' : ''}`}
                    type="text"
                    placeholder={t('club_qualification.fields.nom_club.placeholder')}
                    value={form.nomClub}
                    aria-invalid={errorFields.has('nomClub') || undefined}
                    onChange={e => set('nomClub', e.target.value)} />
                </Field>
                <div className="cand-row">
                  <Field label={t('club_qualification.fields.nombre_participants.label')} required hint={t('club_qualification.fields.nombre_participants.hint')}>
                    <select
                      className={`cand-select${errorFields.has('nombreParticipants') ? ' has-error' : ''}`}
                      value={form.nombreParticipants}
                      aria-invalid={errorFields.has('nombreParticipants') || undefined}
                      onChange={e => set('nombreParticipants', e.target.value)}>
                      <option value="" disabled>{t('experience.select_placeholder')}</option>
                      <option value="5">{t('club_qualification.participants_options.5')}</option>
                      <option value="6-10">{t('club_qualification.participants_options.6-10')}</option>
                      <option value="11-20">{t('club_qualification.participants_options.11-20')}</option>
                      <option value="20+">{t('club_qualification.participants_options.20+')}</option>
                    </select>
                  </Field>
                  <Field label={t('club_qualification.fields.niveau_groupe.label')} required>
                    <select
                      className={`cand-select${errorFields.has('niveauGroupe') ? ' has-error' : ''}`}
                      value={form.niveauGroupe}
                      aria-invalid={errorFields.has('niveauGroupe') || undefined}
                      onChange={e => set('niveauGroupe', e.target.value)}>
                      <option value="" disabled>{t('experience.select_placeholder')}</option>
                      <option value="debutant">{t('club_qualification.niveau_groupe_options.debutant')}</option>
                      <option value="intermediaire">{t('club_qualification.niveau_groupe_options.intermediaire')}</option>
                      <option value="avance">{t('club_qualification.niveau_groupe_options.avance')}</option>
                      <option value="mixte">{t('club_qualification.niveau_groupe_options.mixte')}</option>
                    </select>
                  </Field>
                </div>

                <Field
                  label={t('club_qualification.fields.disciplines_club.label')}
                  hint={
                    form.disciplinesSecondaires.length === 0
                      ? t('club_qualification.fields.disciplines_club.hint')
                      : form.disciplinesSecondaires.length === 1
                        ? t('club_qualification.fields.disciplines_club.hint_selected_one')
                        : t('club_qualification.fields.disciplines_club.hint_selected_many', { count: form.disciplinesSecondaires.length })
                  }>
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

                <Field label={t('club_qualification.fields.palmares_club.label')} hint={t('club_qualification.fields.palmares_club.hint')}>
                  <textarea className="cand-textarea" rows={3}
                    placeholder={t('club_qualification.fields.palmares_club.placeholder')}
                    value={form.palmaresClub} onChange={e => set('palmaresClub', e.target.value)} />
                </Field>

                <Field label={t('club_qualification.fields.lien_video_club.label')} hint={t('club_qualification.fields.lien_video_club.hint')}>
                  <input className="cand-input" type="url" inputMode="url" placeholder={t('club_qualification.fields.lien_video_club.placeholder')}
                    value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 3 — Santé (session/custom) ── */}
            {step === 3 && (audience === 'session' || audience === 'custom') && (
              <div className="cand-panel">
                {audience === 'custom' && (
                  <p className="insc-banner insc-banner--info">
                    <span>{t('sante.banner_custom.prefix')}<strong>{t('sante.banner_custom.strong')}</strong>{t('sante.banner_custom.suffix')}</span>
                  </p>
                )}
                <Field label={t('sante.fields.condition_physique.label')} required>
                  <div className={errorFields.has('conditionPhysique') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="condition" value={form.conditionPhysique}
                      onChange={v => set('conditionPhysique', v)}
                      options={[
                        { val: '2', label: t('sante.fields.condition_physique.options.2') },
                        { val: '3', label: t('sante.fields.condition_physique.options.3') },
                        { val: '4', label: t('sante.fields.condition_physique.options.4') },
                        { val: '5', label: t('sante.fields.condition_physique.options.5') },
                      ]}
                    />
                  </div>
                </Field>
                <Field label={t('sante.fields.blessures.label')} required>
                  <div className={errorFields.has('blessuresRecentes') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="blessures" value={form.blessuresRecentes}
                      onChange={v => set('blessuresRecentes', v)}
                      options={[
                        { val: 'non', label: t('sante.fields.blessures.options.non') },
                        { val: 'mineure', label: t('sante.fields.blessures.options.mineure') },
                        { val: 'oui', label: t('sante.fields.blessures.options.oui') },
                      ]}
                    />
                  </div>
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea
                      className={`cand-textarea cand-sub-field${errorFields.has('blessuresDetail') ? ' has-error' : ''}`}
                      rows={2}
                      placeholder={t('sante.fields.blessures.detail_placeholder')}
                      value={form.blessuresDetail}
                      aria-invalid={errorFields.has('blessuresDetail') || undefined}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label={t('sante.fields.contre_indications.label')} required>
                  <div className={errorFields.has('contreIndications') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="contre" value={form.contreIndications}
                      onChange={v => set('contreIndications', v)}
                      options={[
                        { val: 'non', label: t('sante.fields.contre_indications.options.non') },
                        { val: 'oui', label: t('sante.fields.contre_indications.options.oui') },
                      ]}
                    />
                  </div>
                  {form.contreIndications === 'oui' && (
                    <textarea
                      className={`cand-textarea cand-sub-field${errorFields.has('contreIndicationsDetail') ? ' has-error' : ''}`}
                      rows={2}
                      placeholder={t('sante.fields.contre_indications.detail_placeholder')}
                      value={form.contreIndicationsDetail}
                      aria-invalid={errorFields.has('contreIndicationsDetail') || undefined}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>
                <Field label={t('sante.fields.deux_fois_jour.label')} required
                  hint={t('sante.fields.deux_fois_jour.hint')}>
                  <div className={errorFields.has('deuxFoisJour') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="deuxfois" value={form.deuxFoisJour}
                      onChange={v => set('deuxFoisJour', v)}
                      options={[
                        { val: 'oui', label: t('sante.fields.deux_fois_jour.options.oui') },
                        { val: 'avec-adaptation', label: t('sante.fields.deux_fois_jour.options.avec_adaptation') },
                        { val: 'non', label: t('sante.fields.deux_fois_jour.options.non') },
                      ]}
                    />
                  </div>
                </Field>
              </div>
            )}

            {/* Variant FAMILLE santé */}
            {step === 3 && audience === 'famille' && (
              <div className="cand-panel">
                <h3 className="insc-section-title">{t('sante.famille.section_parent')}</h3>
                <Field label={t('sante.fields.condition_physique.label')} required>
                  <div className={errorFields.has('conditionPhysique') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="condition" value={form.conditionPhysique}
                      onChange={v => set('conditionPhysique', v)}
                      options={[
                        { val: '2', label: t('sante.fields.condition_physique.options.2') },
                        { val: '3', label: t('sante.fields.condition_physique.options.3') },
                        { val: '4', label: t('sante.fields.condition_physique.options.4') },
                        { val: '5', label: t('sante.fields.condition_physique.options.5') },
                      ]}
                    />
                  </div>
                </Field>
                <Field label={t('sante.fields.blessures.label')} required>
                  <div className={errorFields.has('blessuresRecentes') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="blessures" value={form.blessuresRecentes}
                      onChange={v => set('blessuresRecentes', v)}
                      options={[
                        { val: 'non', label: t('sante.fields.blessures.options.non') },
                        { val: 'mineure', label: t('sante.fields.blessures.options.mineure') },
                        { val: 'oui', label: t('sante.fields.blessures.options.oui') },
                      ]}
                    />
                  </div>
                  {(form.blessuresRecentes === 'oui' || form.blessuresRecentes === 'mineure') && (
                    <textarea
                      className={`cand-textarea cand-sub-field${errorFields.has('blessuresDetail') ? ' has-error' : ''}`}
                      rows={2}
                      placeholder={t('sante.fields.blessures.detail_placeholder')}
                      value={form.blessuresDetail}
                      aria-invalid={errorFields.has('blessuresDetail') || undefined}
                      onChange={e => set('blessuresDetail', e.target.value)} />
                  )}
                </Field>
                <Field label={t('sante.fields.contre_indications.label')} required>
                  <div className={errorFields.has('contreIndications') ? 'insc-radios-error' : ''}>
                    <RadioGroup name="contre" value={form.contreIndications}
                      onChange={v => set('contreIndications', v)}
                      options={[
                        { val: 'non', label: t('sante.fields.contre_indications.options.non') },
                        { val: 'oui', label: t('sante.fields.contre_indications.options.oui') },
                      ]}
                    />
                  </div>
                  {form.contreIndications === 'oui' && (
                    <textarea
                      className={`cand-textarea cand-sub-field${errorFields.has('contreIndicationsDetail') ? ' has-error' : ''}`}
                      rows={2}
                      placeholder={t('sante.fields.contre_indications.detail_placeholder')}
                      value={form.contreIndicationsDetail}
                      aria-invalid={errorFields.has('contreIndicationsDetail') || undefined}
                      onChange={e => set('contreIndicationsDetail', e.target.value)} />
                  )}
                </Field>

                <h3 className="insc-section-title insc-section-title--spacer">{t('sante.famille.section_enfants')}</h3>
                <p className="insc-banner insc-banner--info">
                  <span>{t('sante.famille.banner')}</span>
                </p>

                {form.enfants.map((c, i) => (
                  <div key={i} className="insc-child-card">
                    <div className="insc-child-card-head">
                      <strong>{t('sante.famille.child_label', { n: i + 1 })}</strong>
                      {form.enfants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChild(i)}
                          className="insc-child-remove"
                          aria-label={t('sante.famille.remove_aria', { n: i + 1 })}
                        >
                          <Icon name="x" size={14} />
                          {t('sante.famille.remove')}
                        </button>
                      )}
                    </div>
                    <div className="cand-row">
                      <Field label={t('sante.famille.fields.prenom.label')} required>
                        <input
                          className={`cand-input${errorFields.has(`enfants.${i}.prenom`) ? ' has-error' : ''}`}
                          type="text" placeholder={t('sante.famille.fields.prenom.placeholder')}
                          value={c.prenom}
                          aria-invalid={errorFields.has(`enfants.${i}.prenom`) || undefined}
                          onChange={e => updateChild(i, { prenom: e.target.value })} />
                      </Field>
                      <Field label={t('sante.famille.fields.age.label')} required hint={t('sante.famille.fields.age.hint')}>
                        <input
                          className={`cand-input${errorFields.has(`enfants.${i}.age`) ? ' has-error' : ''}`}
                          type="number" inputMode="numeric" min="8" max="17" placeholder={t('sante.famille.fields.age.placeholder')}
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
                    <Field label={t('sante.famille.fields.pratique_deja.label')}>
                      <RadioGroup name={`enfant-${i}-pratique`} value={c.pratiqueDeja}
                        onChange={v => updateChild(i, { pratiqueDeja: v })}
                        options={[
                          { val: 'non', label: t('sante.famille.fields.pratique_deja.options.non') },
                          { val: 'oui', label: t('sante.famille.fields.pratique_deja.options.oui') },
                        ]}
                      />
                      {c.pratiqueDeja === 'oui' && (
                        <input className="cand-input cand-sub-field" type="text"
                          placeholder={t('sante.famille.fields.pratique_deja.annees_placeholder')}
                          value={c.anneesPratique}
                          onChange={e => updateChild(i, { anneesPratique: e.target.value })} />
                      )}
                    </Field>
                    <Field label={t('sante.famille.fields.contre_indications.label')} required>
                      <div className={errorFields.has(`enfants.${i}.contreIndications`) ? 'insc-radios-error' : ''}>
                        <RadioGroup name={`enfant-${i}-contre`} value={c.contreIndications}
                          onChange={v => updateChild(i, { contreIndications: v })}
                          options={[
                            { val: 'non', label: t('sante.famille.fields.contre_indications.options.non') },
                            { val: 'oui', label: t('sante.famille.fields.contre_indications.options.oui') },
                          ]}
                        />
                      </div>
                      {c.contreIndications === 'oui' && (
                        <textarea
                          className={`cand-textarea cand-sub-field${errorFields.has(`enfants.${i}.contreIndicationsDetail`) ? ' has-error' : ''}`}
                          rows={2}
                          placeholder={t('sante.famille.fields.contre_indications.detail_placeholder')}
                          value={c.contreIndicationsDetail}
                          aria-invalid={errorFields.has(`enfants.${i}.contreIndicationsDetail`) || undefined}
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
                    <Icon name="plus" size={16} />
                    {t('sante.famille.add_button')}
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 0 — Le camp ── */}
            {step === 0 && (
              <div className="cand-panel insc-camp-step">

                {audienceConfig && (
                  <div className="insc-audience-banner">
                    <span className="insc-audience-banner-label">{audienceConfig.badge}</span>
                    <strong>{audienceConfig.label}</strong>
                    <span>{audienceConfig.long_description}</span>
                  </div>
                )}

                {/* SESSION */}
                {audience === 'session' && (
                  <>
                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.session.section1_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.session.section1_help')}</p>
                      <div className="insc-session-grid">
                        {hydratedSessions.map(s => {
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
                              <span className="insc-session-card-month">{s.month_abbr}</span>
                              <span className="insc-session-card-season">{s.season} {year}</span>
                              <span className="insc-session-card-dates">{s.dates}</span>
                              <span className="insc-session-card-intensity">{t('step0_camp.session.session_intensity_prefix')} {s.intensity.toLowerCase()}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.session.section2_label')}</h2>
                      <p className="insc-camp-section-help">
                        {t('step0_camp.session.section2_help_prefix')}<strong>{t('step0_camp.session.section2_help_or')}</strong>{t('step0_camp.session.section2_help_suffix')}<Link href="/inscription?type=custom" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{t('step0_camp.session.section2_help_link')}</Link>{t('step0_camp.session.section2_help_end')}
                      </p>
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
                          <span className="insc-discipline-card-name">{t('step0_camp.session.discipline_lutte.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.session.discipline_lutte.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.session.discipline_lutte.meta')}</span>
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
                          <span className="insc-discipline-card-name">{t('step0_camp.session.discipline_mma.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.session.discipline_mma.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.session.discipline_mma.meta')}</span>
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
                            <Icon name="alert" size={16} />
                            <span>
                              {t('step0_camp.session.mma_alert_blocked.prefix')}
                              <strong>{t('step0_camp.session.mma_alert_blocked.strong1')}</strong>
                              {t('step0_camp.session.mma_alert_blocked.middle')}
                              <strong>{t('step0_camp.session.mma_alert_blocked.strong2')}</strong>
                              {t('step0_camp.session.mma_alert_blocked.suffix', { niveau: form.niveau })}
                            </span>
                          </div>
                        ) : (
                          <div className="insc-banner insc-banner--warn-light">
                            <Icon name="info" size={14} />
                            <span>{t('step0_camp.session.mma_alert_warn.prefix')}</span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">3</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.session.section3_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.session.section3_help')}</p>
                      <div className="insc-duration-grid">
                        {[
                          { val: '1-semaine', weeks: 1 as const },
                          { val: '2-semaines', weeks: 2 as const },
                          { val: '3-semaines', weeks: 3 as const },
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
                            <span className="insc-duration-card-label">{t(`step0_camp.session.duration_options.${opt.val}.label`)}</span>
                            <span className="insc-duration-card-sub">{t(`step0_camp.session.duration_options.${opt.val}.sub`)}</span>
                            <span className="insc-duration-card-price">{t('step0_camp.session.duration_per_adult', { price: formatEUR(PRICING_TIERS.duo.perAdult[opt.weeks]) })}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* CUSTOM */}
                {audience === 'custom' && (
                  <>
                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.custom.section1_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.custom.section1_help')}</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_LUTTE}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.custom.discipline_lutte.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.custom.discipline_lutte.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.custom.discipline_lutte.meta')}</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_MMA}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.custom.discipline_mma.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.custom.discipline_mma.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.custom.discipline_mma.meta')}</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--combo${form.campDiscipline === 'combo_quote' ? ' is-active' : ''}`} style={{ gridColumn: '1 / -1' }}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_COMBO}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.custom.discipline_combo.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.custom.discipline_combo.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.custom.discipline_combo.meta')}</span>
                        </label>
                      </div>
                      {form.campDiscipline === 'mma' && (
                        <div className="insc-banner insc-banner--warn-light">
                          <Icon name="info" size={14} />
                          <span>{t('step0_camp.custom.mma_alert_warn')}</span>
                        </div>
                      )}
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.custom.section2_label')}</h2>
                      <p className="insc-camp-section-help">
                        {t('step0_camp.custom.section2_help_prefix')}<Link href="/inscription?type=groupe" className="insc-inline-link">{t('step0_camp.custom.section2_help_link_groupe')}</Link>{t('step0_camp.custom.section2_help_middle')}<Link href="/inscription?type=famille" className="insc-inline-link">{t('step0_camp.custom.section2_help_link_famille')}</Link>{t('step0_camp.custom.section2_help_end')}
                      </p>
                      <div className="insc-compo-grid">
                        {(['1', '2', '3', '4'] as const).map(val => (
                          <label key={val} className={`insc-compo-card${form.nombreParticipants === val ? ' is-active' : ''}`}>
                            <input
                              type="radio"
                              name="nombreParticipants"
                              value={val}
                              checked={form.nombreParticipants === val}
                              onChange={() => syncCustomParticipants(val)}
                              className="insc-sr"
                            />
                            <span className="insc-compo-card-label">{t(`step0_camp.custom.compo_options.${val}.label`)}</span>
                            <span className="insc-compo-card-sub">{t(`step0_camp.custom.compo_options.${val}.sub`)}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {form.autresParticipants.length > 0 && (
                      <div className="insc-camp-section">
                        <span className="insc-camp-section-num">{form.autresParticipants.length > 0 ? '·' : '3'}</span>
                        <h2 className="insc-camp-section-label">{t('step0_camp.custom.participants_section_label')}</h2>
                        <p className="insc-camp-section-help">{t('step0_camp.custom.participants_section_help')}</p>
                        {form.autresParticipants.map((p, i) => (
                          <div key={i} className="insc-child-card">
                            <div className="insc-child-card-head">
                              <strong>{t('step0_camp.custom.participant_label', { n: i + 2 })}</strong>
                            </div>
                            <div className="cand-row">
                              <Field label={t('step0_camp.custom.participant_fields.prenom.label')} required>
                                <input
                                  className={`cand-input${errorFields.has(`autresParticipants.${i}.prenom`) ? ' has-error' : ''}`}
                                  type="text" placeholder={t('step0_camp.custom.participant_fields.prenom.placeholder')}
                                  value={p.prenom}
                                  aria-invalid={errorFields.has(`autresParticipants.${i}.prenom`) || undefined}
                                  onChange={e => updateParticipant(i, { prenom: e.target.value })} />
                              </Field>
                              <Field label={t('step0_camp.custom.participant_fields.niveau.label')} required>
                                <select
                                  className={`cand-select${errorFields.has(`autresParticipants.${i}.niveau`) ? ' has-error' : ''}`}
                                  value={p.niveau}
                                  aria-invalid={errorFields.has(`autresParticipants.${i}.niveau`) || undefined}
                                  onChange={e => updateParticipant(i, { niveau: e.target.value })}>
                                  <option value="" disabled>{t('experience.select_placeholder')}</option>
                                  <option value="debutant">{t('experience.niveau_options_custom.debutant')}</option>
                                  <option value="intermediaire">{t('experience.niveau_options_custom.intermediaire')}</option>
                                  <option value="avance">{t('experience.niveau_options_custom.avance')}</option>
                                  <option value="competiteur">{t('experience.niveau_options_custom.competiteur')}</option>
                                </select>
                              </Field>
                            </div>
                            <Field label={t('step0_camp.custom.participant_fields.discipline.label')} hint={t('step0_camp.custom.participant_fields.discipline.hint')}>
                              <select className="cand-select" value={p.discipline}
                                onChange={e => updateParticipant(i, { discipline: e.target.value })}>
                                <option value="">{t('experience.discipline_options_placeholder_optional')}</option>
                                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </Field>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">{form.autresParticipants.length > 0 ? '4' : '3'}</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.custom.section3_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.custom.section3_help')}</p>
                      <div className="cand-row">
                        <Field label={t('step0_camp.custom.fields.date_debut.label')} required>
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
                        <Field label={t('step0_camp.custom.fields.duree.label')} required>
                          {(() => {
                            const adults = Math.max(1, parseInt(form.nombreParticipants || '1', 10))
                            return (
                              <select
                                className={`cand-select${errorFields.has('duree') ? ' has-error' : ''}`}
                                value={form.duree}
                                aria-invalid={errorFields.has('duree') || undefined}
                                onChange={e => set('duree', e.target.value)}>
                                <option value="" disabled>{t('experience.select_placeholder')}</option>
                                <option value="1-semaine">{t('step0_camp.custom.duration_select_label', { weeks_label: t('step0_camp.custom.duration_labels.1-semaine'), price: formatEUR(pricePerAdult(adults, 1)) })}</option>
                                <option value="2-semaines">{t('step0_camp.custom.duration_select_label', { weeks_label: t('step0_camp.custom.duration_labels.2-semaines'), price: formatEUR(pricePerAdult(adults, 2)) })}</option>
                                <option value="3-semaines">{t('step0_camp.custom.duration_select_label', { weeks_label: t('step0_camp.custom.duration_labels.3-semaines'), price: formatEUR(pricePerAdult(adults, 3)) })}</option>
                              </select>
                            )
                          })()}
                        </Field>
                      </div>

                      {(() => {
                        const adults = Math.max(1, parseInt(form.nombreParticipants || '0', 10))
                        const weeks = parseDuration(form.duree)
                        if (!adults || !weeks || form.campDiscipline === 'combo_quote') return null
                        const total = calculatePrice({ adults, children: 0, weeks })
                        if (total <= 0) return null
                        const breakdownKey = adults === 1 && weeks === 1
                          ? 'estimation_breakdown_one_adult_one_week'
                          : adults === 1
                            ? 'estimation_breakdown_one_adult_weeks'
                            : weeks === 1
                              ? 'estimation_breakdown_adults_one_week'
                              : 'estimation_breakdown_adults_weeks'
                        return (
                          <div className="insc-banner insc-banner--success">
                            <strong>{t('step0_camp.custom.estimation_total_label', { price: formatEUR(total) })}</strong>
                            <span>{t(`step0_camp.custom.${breakdownKey}`, { adults, weeks, price_per_adult: formatEUR(pricePerAdult(adults, weeks)) })}</span>
                          </div>
                        )
                      })()}
                      {form.campDiscipline === 'combo_quote' && form.duree && (
                        <div className="insc-banner insc-banner--quote">
                          <strong>{t('step0_camp.custom.combo_quote.title')}</strong>
                          <span>{t('step0_camp.custom.combo_quote.body')}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* GROUPE */}
                {audience === 'groupe' && (
                  <>
                    <div className="insc-banner insc-banner--quote">
                      <strong>{t('step0_camp.groupe.banner.title')}</strong>
                      <span>{t('step0_camp.groupe.banner.body')}</span>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.groupe.section1_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.groupe.section1_help')}</p>
                      <div className="insc-discipline-grid">
                        <label className={`insc-discipline-card insc-discipline-card--lutte${form.campDiscipline === 'lutte' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="lutte" checked={form.campDiscipline === 'lutte'} onChange={() => set('campDiscipline', 'lutte')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_LUTTE}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.groupe.discipline_lutte.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.groupe.discipline_lutte.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.groupe.discipline_lutte.meta')}</span>
                        </label>
                        <label className={`insc-discipline-card insc-discipline-card--mma${form.campDiscipline === 'mma' ? ' is-active' : ''}`}>
                          <input type="radio" name="campDiscipline" value="mma" checked={form.campDiscipline === 'mma'} onChange={() => set('campDiscipline', 'mma')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_MMA}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.groupe.discipline_mma.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.groupe.discipline_mma.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.groupe.discipline_mma.meta')}</span>
                        </label>
                        <label className={`insc-discipline-card${form.campDiscipline === 'combo_quote' ? ' is-active' : ''}`} style={{ gridColumn: '1 / -1' }}>
                          <input type="radio" name="campDiscipline" value="combo_quote" checked={form.campDiscipline === 'combo_quote'} onChange={() => set('campDiscipline', 'combo_quote')} className="insc-sr" />
                          <span className="insc-discipline-card-icon">{ICON_COMBO}</span>
                          <span className="insc-discipline-card-name">{t('step0_camp.groupe.discipline_combo.name')}</span>
                          <span className="insc-discipline-card-place">{t('step0_camp.groupe.discipline_combo.place')}</span>
                          <span className="insc-discipline-card-meta">{t('step0_camp.groupe.discipline_combo.meta')}</span>
                        </label>
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">2</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.groupe.section2_label')}</h2>
                      <p className="insc-camp-section-help">
                        {t('step0_camp.groupe.section2_help_prefix')}<strong>{t('step0_camp.groupe.section2_help_strong')}</strong>{t('step0_camp.groupe.section2_help_suffix')}
                      </p>
                      <div className="cand-row">
                        <Field label={t('step0_camp.groupe.fields.date_debut.label')} required>
                          <input
                            className={`cand-input${errorFields.has('dateDebutSouhaitee') ? ' has-error' : ''}`}
                            type="date"
                            min={(() => { const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().split('T')[0] })()}
                            value={form.dateDebutSouhaitee}
                            aria-invalid={errorFields.has('dateDebutSouhaitee') || undefined}
                            onChange={e => set('dateDebutSouhaitee', e.target.value)} />
                        </Field>
                        <Field label={t('step0_camp.groupe.fields.duree.label')} required>
                          <select
                            className={`cand-select${errorFields.has('duree') ? ' has-error' : ''}`}
                            value={form.duree}
                            aria-invalid={errorFields.has('duree') || undefined}
                            onChange={e => set('duree', e.target.value)}>
                            <option value="" disabled>{t('experience.select_placeholder')}</option>
                            <option value="1-semaine">{t('step0_camp.groupe.duration_options.1-semaine')}</option>
                            <option value="2-semaines">{t('step0_camp.groupe.duration_options.2-semaines')}</option>
                            <option value="3-semaines">{t('step0_camp.groupe.duration_options.3-semaines')}</option>
                          </select>
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* FAMILLE */}
                {audience === 'famille' && (
                  <>
                    <div className="insc-famille-hero">
                      <span className="insc-famille-hero-icon" aria-hidden="true">
                        <IconFamille />
                      </span>
                      <div className="insc-famille-hero-content">
                        <span className="insc-famille-hero-label">{t('step0_camp.famille.hero_label')}</span>
                        <strong className="insc-famille-hero-title">{t('step0_camp.famille.hero_title')}</strong>
                        <span className="insc-famille-hero-help">
                          {t('step0_camp.famille.hero_help_prefix')}<Link href="/inscription?type=custom" className="insc-inline-link">{t('step0_camp.famille.hero_help_link')}</Link>{t('step0_camp.famille.hero_help_end')}
                        </span>
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">1</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.famille.section1_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.famille.section1_help')}</p>
                      <div className="insc-format-grid">
                        {hydratedSessions.map(s => {
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
                              <span className="insc-session-card-month">{s.month_abbr}</span>
                              <span className="insc-session-card-season">{s.season} {year}</span>
                              <span className="insc-session-card-dates">{s.dates}</span>
                              <span className="insc-session-card-intensity">{t('step0_camp.famille.session_card_intensity')}</span>
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
                          <span className="insc-session-card-month">{t('step0_camp.famille.custom_card.month')}</span>
                          <span className="insc-session-card-season">{t('step0_camp.famille.custom_card.season')}</span>
                          <span className="insc-session-card-dates">{t('step0_camp.famille.custom_card.dates')}</span>
                          <span className="insc-session-card-intensity">{t('step0_camp.famille.custom_card.intensity')}</span>
                        </label>
                      </div>
                      {form.session === 'sur-mesure' && (
                        <div className="cand-row" style={{ marginTop: '1rem' }}>
                          <Field label={t('step0_camp.famille.custom_date_field.label')} required hint={t('step0_camp.famille.custom_date_field.hint')}>
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
                      <h2 className="insc-camp-section-label">{t('step0_camp.famille.section2_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.famille.section2_help')}</p>
                      <div className="insc-duration-grid">
                        {[
                          { val: '1-semaine', weeks: 1 as const },
                          { val: '2-semaines', weeks: 2 as const },
                          { val: '3-semaines', weeks: 3 as const },
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
                            <span className="insc-duration-card-label">{t(`step0_camp.famille.duration_options.${opt.val}.label`)}</span>
                            <span className="insc-duration-card-sub">{t(`step0_camp.famille.duration_options.${opt.val}.sub`)}</span>
                            <span className="insc-duration-card-price">{t('step0_camp.famille.duration_price_prefix', { price: formatEUR(FAMILY_PRICING.base[opt.weeks]) })}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="insc-camp-section">
                      <span className="insc-camp-section-num">3</span>
                      <h2 className="insc-camp-section-label">{t('step0_camp.famille.section3_label')}</h2>
                      <p className="insc-camp-section-help">{t('step0_camp.famille.section3_help')}</p>
                      <div className="insc-toggle-grid">
                        <label className={`insc-toggle-card${!form.conjointParticipe ? ' is-active' : ''}`}>
                          <input type="radio" name="parents" value="solo" checked={!form.conjointParticipe} onChange={() => set('conjointParticipe', false)} className="insc-sr" />
                          <span className="insc-toggle-card-label">{t('step0_camp.famille.parents_options.solo.label')}</span>
                          <span className="insc-toggle-card-sub">{t('step0_camp.famille.parents_options.solo.sub', { price: formatEUR(FAMILY_PRICING.base[1]) })}</span>
                        </label>
                        <label className={`insc-toggle-card${form.conjointParticipe ? ' is-active' : ''}`}>
                          <input type="radio" name="parents" value="duo" checked={form.conjointParticipe} onChange={() => set('conjointParticipe', true)} className="insc-sr" />
                          <span className="insc-toggle-card-label">{t('step0_camp.famille.parents_options.duo.label')}</span>
                          <span className="insc-toggle-card-sub">{t('step0_camp.famille.parents_options.duo.sub', { price_adult: formatEUR(PRICING_TIERS.duo.perAdult[1]), price_child: formatEUR(FAMILY_PRICING.extraChildPerWeek[1]) })}</span>
                        </label>
                      </div>

                      <div className="insc-stepper">
                        <span className="insc-stepper-label">{t('step0_camp.famille.stepper_label')}</span>
                        <div className="insc-stepper-controls">
                          <button
                            type="button"
                            className="insc-stepper-btn"
                            onClick={() => { if (form.enfants.length > 1) removeChild(form.enfants.length - 1) }}
                            disabled={form.enfants.length <= 1}
                            aria-label={t('step0_camp.famille.stepper_remove_aria')}
                          >−</button>
                          <span className="insc-stepper-value" aria-live="polite">{form.enfants.length}</span>
                          <button
                            type="button"
                            className="insc-stepper-btn"
                            onClick={addChild}
                            disabled={form.enfants.length >= 4}
                            aria-label={t('step0_camp.famille.stepper_add_aria')}
                          >+</button>
                        </div>
                        <span className="insc-stepper-hint">{t('step0_camp.famille.stepper_hint')}</span>
                      </div>
                    </div>

                    {(() => {
                      const weeks = parseDuration(form.duree)
                      if (!weeks || form.enfants.length === 0) return null
                      const adults = form.conjointParticipe ? 2 : 1
                      const total = calculatePrice({ adults, children: form.enfants.length, weeks })
                      if (total <= 0) return null
                      const children = form.enfants.length
                      // Pick the right breakdown key
                      let breakdownKey: string
                      if (adults === 1) {
                        if (children === 1) {
                          breakdownKey = weeks === 1 ? 'estimation_breakdown_one_parent_one_child_one_week' : 'estimation_breakdown_one_parent_one_child_weeks'
                        } else {
                          breakdownKey = weeks === 1 ? 'estimation_breakdown_one_parent_children_one_week' : 'estimation_breakdown_one_parent_children_weeks'
                        }
                      } else {
                        if (children === 1) {
                          breakdownKey = weeks === 1 ? 'estimation_breakdown_two_parents_one_child_one_week' : 'estimation_breakdown_two_parents_one_child_weeks'
                        } else {
                          breakdownKey = weeks === 1 ? 'estimation_breakdown_two_parents_children_one_week' : 'estimation_breakdown_two_parents_children_weeks'
                        }
                      }
                      return (
                        <div className="insc-banner insc-banner--primary">
                          <strong>{t('step0_camp.famille.estimation_total_label', { price: formatEUR(total) })}</strong>
                          <span>{t(`step0_camp.famille.${breakdownKey}`, {
                            weeks,
                            children,
                            extra: children - 1,
                            price_forfait: formatEUR(FAMILY_PRICING.base[weeks]),
                            price_extra: formatEUR(FAMILY_PRICING.extraChildPerWeek[weeks]),
                            price_adult: formatEUR(PRICING_TIERS.duo.perAdult[weeks]),
                          })}</span>
                        </div>
                      )
                    })()}
                  </>
                )}

                {/* Note redirection famille pour session */}
                {audience === 'session' && (
                  <div className="insc-banner insc-banner--info">
                    <span>
                      {t('step0_camp.session_redirect_family.prefix')}<Link href="/inscription?type=famille" className="insc-inline-link">{t('step0_camp.session_redirect_family.link')}</Link>{t('step0_camp.session_redirect_family.suffix', { price: formatEUR(FAMILY_PRICING.base[1]) })}
                    </span>
                  </div>
                )}

              </div>
            )}

            {/* ── STEP FINAL — Confirmation/Recap ── */}
            {((step === 4 && audience !== 'groupe') || (step === 3 && audience === 'groupe')) && (() => {
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
                <div className="insc-recap-price">
                  <div className="insc-recap-price-head">
                    <span className="insc-recap-price-label">{isQuote ? t('summary.price_label_quote') : isPriceFromOnly ? t('summary.price_label_from') : t('summary.price_label_total')}</span>
                    <strong className="insc-recap-price-value">
                      {isQuote ? t('sidebar.recap_rows.on_quote') : totalAmount > 0 ? formatEUR(totalAmount) : t('summary.price_dash')}
                    </strong>
                  </div>
                  {!isQuote && totalAmount > 0 && weeks && (
                    <span className="insc-recap-price-breakdown">
                      {adults === 1 ? t('summary.breakdown_adults_one') : t('summary.breakdown_adults_many', { count: adults })}
                      {enfants > 0 ? (enfants === 1 ? t('summary.breakdown_children_one') : t('summary.breakdown_children_many', { count: enfants })) : ''}
                      {weeks === 1 ? t('summary.breakdown_weeks_one') : t('summary.breakdown_weeks_many', { count: weeks })}
                      {audience === 'famille' && adults === 1 ? t('summary.breakdown_family_forfait') : ''}
                    </span>
                  )}
                  {isQuote && (
                    <span className="insc-recap-price-breakdown">
                      {form.campDiscipline === 'combo_quote'
                        ? t('summary.quote_combo')
                        : t('summary.quote_groupe')}
                    </span>
                  )}
                </div>

                <div className="insc-recap-grid">
                  <section className="insc-recap-card" aria-label={audience === 'groupe' ? t('summary.cards.responsible') : t('summary.cards.candidate')}>
                    <header className="insc-recap-card-head">
                      <Icon name="user" size={16} />
                      <span>{audience === 'groupe' ? t('summary.cards.responsible') : t('summary.cards.candidate')}</span>
                    </header>
                    <dl>
                      <div><dt>{t('summary.rows.name')}</dt><dd>{form.prenom} {form.nom}</dd></div>
                      <div><dt>{t('summary.rows.email')}</dt><dd>{form.email}</dd></div>
                      {form.telephone && <div><dt>{t('summary.rows.telephone')}</dt><dd>{form.telephone}</dd></div>}
                      <div><dt>{t('summary.rows.country')}</dt><dd>{form.pays}</dd></div>
                      {form.villeDepart && <div><dt>{t('summary.rows.departure')}</dt><dd>{form.villeDepart}</dd></div>}
                    </dl>
                  </section>

                  <section className="insc-recap-card" aria-label={t('summary.cards.camp')}>
                    <header className="insc-recap-card-head">
                      <Icon name="mountain" size={16} />
                      <span>{t('summary.cards.camp')}</span>
                    </header>
                    <dl>
                      <div><dt>{t('summary.rows.type')}</dt><dd>{audienceConfig?.label}</dd></div>
                      {form.campDiscipline && (
                        <div><dt>{t('summary.rows.discipline')}</dt><dd>
                          {form.campDiscipline === 'lutte' && t('summary.camp_disciplines.lutte')}
                          {form.campDiscipline === 'mma' && t('summary.camp_disciplines.mma')}
                          {form.campDiscipline === 'combo_quote' && t('summary.camp_disciplines.combo_quote')}
                        </dd></div>
                      )}
                      {audience === 'session' && (() => {
                        const sel = hydratedSessions.find(s => s.id === form.session)
                        return sel ? <div><dt>{t('summary.rows.session')}</dt><dd>{sel.season} · {sel.dates}</dd></div> : null
                      })()}
                      {audience === 'famille' && SESSION_IDS.includes(form.session) && (() => {
                        const sel = hydratedSessions.find(s => s.id === form.session)
                        return sel ? <div><dt>{t('summary.rows.format')}</dt><dd>{t('summary.rows.format_session', { season: sel.season })}</dd></div> : null
                      })()}
                      {audience === 'famille' && form.session === 'sur-mesure' && (
                        <div><dt>{t('summary.rows.format')}</dt><dd>{t('summary.rows.format_custom')}</dd></div>
                      )}
                      {(audience === 'custom' || audience === 'groupe' || (audience === 'famille' && form.session === 'sur-mesure')) && form.dateDebutSouhaitee && (
                        <div><dt>{t('summary.rows.date')}</dt><dd>{form.dateDebutSouhaitee}</dd></div>
                      )}
                      {form.duree && <div><dt>{t('summary.rows.duration')}</dt><dd>{formatDurationLabel(form.duree)}</dd></div>}
                    </dl>
                  </section>

                  <section className="insc-recap-card" aria-label={audience === 'groupe' ? t('summary.cards.club') : t('summary.cards.profile')}>
                    <header className="insc-recap-card-head">
                      <Icon name="info" size={16} />
                      <span>{audience === 'groupe' ? t('summary.cards.club') : t('summary.cards.profile')}</span>
                    </header>
                    <dl>
                      {audience !== 'groupe' && form.disciplinePrincipale && (
                        <>
                          <div><dt>{t('summary.rows.origin_discipline')}</dt><dd>{form.disciplinePrincipale}</dd></div>
                          <div><dt>{t('summary.rows.level')}</dt><dd>{form.niveau}</dd></div>
                          <div><dt>{t('summary.rows.years')}</dt><dd>{t('summary.rows.years_value', { years: form.anneesPratique })}</dd></div>
                        </>
                      )}
                      {audience === 'custom' && form.nombreParticipants && (
                        <div><dt>{t('summary.rows.composition')}</dt><dd>{compositionLabel(form.nombreParticipants)}</dd></div>
                      )}
                      {audience === 'custom' && form.autresParticipants.length > 0 && (
                        <div><dt>{t('summary.rows.with')}</dt><dd>{form.autresParticipants.map(p => `${p.prenom || '?'} (${p.niveau || '?'})`).join(', ')}</dd></div>
                      )}
                      {audience === 'famille' && (
                        <>
                          <div><dt>{t('summary.rows.parents')}</dt><dd>{form.conjointParticipe ? '2' : '1'}</dd></div>
                          {form.enfants.length > 0 && (
                            <div><dt>{t('summary.rows.children')}</dt><dd>{form.enfants.map((c, i) => `${c.prenom || `E${i+1}`} (${c.age || '?'}a)`).join(', ')}</dd></div>
                          )}
                        </>
                      )}
                      {audience === 'groupe' && (
                        <>
                          {form.nomClub && <div><dt>{t('summary.rows.name_club')}</dt><dd>{form.nomClub}</dd></div>}
                          {form.nombreParticipants && <div><dt>{t('summary.rows.effectif')}</dt><dd>{form.nombreParticipants}</dd></div>}
                          {form.niveauGroupe && <div><dt>{t('summary.rows.level')}</dt><dd>{form.niveauGroupe}</dd></div>}
                        </>
                      )}
                    </dl>
                  </section>
                </div>

                <details className="insc-extra-details" open={!!form.sourceDecouverte || !!form.message || errorFields.has('sourceDecouverte')}>
                  <summary>{t('summary.extra_details_summary')}</summary>
                  <div className="insc-extra-details-body">
                    <Field
                      label={t('summary.source_field.label')}
                      required
                      hint={t('summary.source_field.hint')}
                    >
                      <select
                        className={`cand-select${errorFields.has('sourceDecouverte') ? ' has-error' : ''}`}
                        value={form.sourceDecouverte}
                        aria-invalid={errorFields.has('sourceDecouverte') || undefined}
                        onChange={e => {
                          const value = e.target.value
                          set('sourceDecouverte', value)
                          const partner = findCodeBySourceValue(value)
                          if (!partner) return
                          const existing = findReferralCode(form.codeRecommandation)
                          if (existing && existing.code !== partner.code) {
                            return
                          }
                          set('codeRecommandation', partner.code)
                        }}
                      >
                        <option value="">{t('summary.source_field.placeholder')}</option>
                        <option value="instagram">{t('summary.source_field.options.instagram')}</option>
                        <option value="bouche-a-oreille">{t('summary.source_field.options.bouche_a_oreille')}</option>
                        <option value="coach">{t('summary.source_field.options.coach')}</option>
                        <option value="influenceur">{t('summary.source_field.options.influenceur')}</option>
                        <option value="google">{t('summary.source_field.options.google')}</option>
                        <option value="autre">{t('summary.source_field.options.autre')}</option>
                      </select>
                      {sourceCodeConflict && (
                        <span
                          className="cand-hint"
                          style={{
                            display: 'block',
                            marginTop: 8,
                            color: 'var(--primary)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {t('summary.source_field.conflict_notice.prefix')}<strong>{sourceCodeConflict.codePartnerCode}</strong>{t('summary.source_field.conflict_notice.code_partner', { partnerName: sourceCodeConflict.codePartnerName })}<strong>{sourceCodeConflict.sourcePartnerName}</strong>{t('summary.source_field.conflict_notice.suffix')}
                        </span>
                      )}
                    </Field>
                    <Field label={audience === 'groupe' ? t('summary.message_field_group.label') : t('summary.message_field_default.label')}>
                      <textarea className="cand-textarea" rows={4}
                        placeholder={audience === 'groupe'
                          ? t('summary.message_field_group.placeholder')
                          : t('summary.message_field_default.placeholder')}
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
                        <span>{t('summary.confirms_groupe.accepte_conditions_prefix')}<Link href="/politique-de-confidentialite" target="_blank" rel="noopener" className="insc-inline-link">{t('summary.confirms_groupe.accepte_conditions_link')}</Link>{t('summary.confirms_groupe.accepte_conditions_suffix')}</span>
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
                        <span>{t('summary.confirms_default.certif_medical')}</span>
                      </label>
                      <label className={`cand-confirm${form.accepteConditions ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.accepteConditions}
                          aria-invalid={errorFields.has('accepteConditions') || undefined}
                          onChange={e => set('accepteConditions', e.target.checked)}
                        />
                        <span>{t('summary.confirms_default.accepte_conditions_prefix')}<Link href="/cgv" target="_blank" rel="noopener" className="insc-inline-link">{t('summary.confirms_default.accepte_conditions_link_cgv')}</Link>{t('summary.confirms_default.accepte_conditions_middle')}<Link href="/politique-de-confidentialite" target="_blank" rel="noopener" className="insc-inline-link">{t('summary.confirms_default.accepte_conditions_link_privacy')}</Link>{t('summary.confirms_default.accepte_conditions_suffix')}</span>
                      </label>
                      <label className={`cand-confirm${form.pret ? ' selected' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.pret}
                          aria-invalid={errorFields.has('pret') || undefined}
                          onChange={e => set('pret', e.target.checked)}
                        />
                        <span>{t('summary.confirms_default.pret')}</span>
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
                  <Icon name="alert" size={16} />
                  <strong>{errors.length === 1 ? t('errors.single') : t('errors.many', { count: errors.length })}</strong>
                </div>
                <ul className="insc-errors-list">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="cand-nav insc-nav-sticky">
              {step > 0 && (
                <button type="button" className="cand-btn-back" onClick={prev}>
                  <Icon name="arrow-left" size={14} />
                  {t('nav.back')}
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" className="cand-btn-next insc-btn-primary" onClick={next}>
                  {t('nav.next')}
                  <Icon name="arrow-right" size={14} />
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
                      <span className="insc-spinner">
                        <Icon name="spinner" size={14} />
                      </span>
                      {t('nav.submit_sending')}
                    </>
                  ) : (
                    <>
                      {t('nav.submit')}
                      <Icon name="check" size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
            {submitError && (
              <p ref={submitErrorRef} className="insc-submit-error" role="alert">
                <Icon name="alert" size={16} />
                <span>{submitError}</span>
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}
