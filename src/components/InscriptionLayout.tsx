'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { REGISTRATION_TYPES, type RegistrationTypeId, getRegistrationType } from '@/data/registration-types'
import { calculatePrice, formatCHF, type Duration } from '@/data/pricing'

const StoryCard = dynamic(() => import('./StoryCard'))

/* ─────────────── DATA ─────────────── */

const STEPS = ['Identité', 'Expérience', 'Santé', 'Logistique', 'Confirmation'] as const

const DISCIPLINES = [
  'MMA', 'Lutte Libre', 'Lutte Gréco-Romaine', 'Boxe Anglaise',
  'Kickboxing / K-1', 'Muay Thaï', 'Grappling / No-Gi', 'Sambo',
  'Jiu-Jitsu Brésilien', 'Judo', 'Autre',
]

type FormData = {
  prenom: string; nom: string; dateNaissance: string; pays: string; email: string; telephone: string
  disciplinePrincipale: string; disciplinesSecondaires: string[]; anneesPratique: string
  niveau: string; club: string; coach: string; palmares: string; lienVideo: string
  conditionPhysique: string; blessuresRecentes: string; blessuresDetail: string
  contreIndications: string; contreIndicationsDetail: string; deuxFoisJour: string
  session: string; duree: string; villeDepart: string; disponibleEntretien: string
  sourceDecouverte: string; message: string
  certifMedical: boolean; accepteConditions: boolean; pret: boolean
  // Champs camp sur mesure (audience='custom' ou 'groupe')
  dateDebutSouhaitee: string
  // Champs famille (tous tunnels)
  vientAvecFamille: boolean
  nombreEnfants: string
  enfantsAges: string
  // Champs groupe (audience='groupe')
  nomClub: string
  nombreParticipants: string
  niveauGroupe: string
}

const INITIAL: FormData = {
  prenom: '', nom: '', dateNaissance: '', pays: '', email: '', telephone: '',
  disciplinePrincipale: '', disciplinesSecondaires: [], anneesPratique: '',
  niveau: '', club: '', coach: '', palmares: '', lienVideo: '',
  conditionPhysique: '', blessuresRecentes: '', blessuresDetail: '',
  contreIndications: '', contreIndicationsDetail: '', deuxFoisJour: '',
  session: '', duree: '', villeDepart: '', disponibleEntretien: '',
  sourceDecouverte: '', message: '',
  certifMedical: false, accepteConditions: false, pret: false,
  dateDebutSouhaitee: '',
  vientAvecFamille: false, nombreEnfants: '', enfantsAges: '',
  nomClub: '', nombreParticipants: '', niveauGroupe: '',
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
}

export default function InscriptionLayout({ initialAudience }: InscriptionLayoutProps) {
  const [audience, setAudience] = useState<RegistrationTypeId | null>(initialAudience)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [form, setForm] = useState<FormData>(() => {
    const init = { ...INITIAL }
    // Si on rejoint la session, pré-remplir
    if (initialAudience === 'session') {
      init.session = 'aout-2026'
      init.duree = '3-semaines'
    }
    return init
  })
  const [errors, setErrors] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

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

  const validate = (): boolean => {
    const e: string[] = []
    if (step === 0) {
      if (!form.prenom.trim()) e.push('Prénom requis')
      if (!form.nom.trim()) e.push('Nom requis')
      if (!form.dateNaissance) e.push('Date de naissance requise')
      else {
        const age = new Date().getFullYear() - new Date(form.dateNaissance).getFullYear()
        if (age < 18) e.push('Tu dois avoir au moins 18 ans')
      }
      if (!form.pays.trim()) e.push('Pays de résidence requis')
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.push('Email invalide')
    }
    if (step === 1) {
      if (!form.disciplinePrincipale) e.push('Discipline principale requise')
      if (!form.anneesPratique) e.push('Années de pratique requises')
      if (!form.niveau) e.push('Niveau requis')
    }
    if (step === 2) {
      if (!form.conditionPhysique) e.push('Évalue ta condition physique')
      if (!form.blessuresRecentes) e.push('Indique si tu as des blessures récentes')
      if (!form.contreIndications) e.push('Indique si tu as des contre-indications médicales')
      if (!form.deuxFoisJour) e.push('Confirme ta disponibilité pour les doubles séances')
    }
    if (step === 3) {
      if (audience === 'session') {
        if (!form.duree) e.push('Durée requise')
      }
      if (audience === 'custom') {
        if (!form.dateDebutSouhaitee) {
          e.push('Date de début souhaitée requise')
        } else {
          // Vérifier délai minimum 90 jours
          const target = new Date(form.dateDebutSouhaitee)
          const now = new Date()
          const diffDays = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays < 90) e.push('La date de début doit être au moins 90 jours après aujourd\'hui')
        }
        if (!form.duree) e.push('Durée requise')
      }
      if (audience === 'groupe') {
        if (!form.nomClub.trim()) e.push('Nom du club / groupe requis')
        if (!form.nombreParticipants) e.push('Nombre de participants requis')
        if (!form.dateDebutSouhaitee) {
          e.push('Date de début souhaitée requise')
        } else {
          const target = new Date(form.dateDebutSouhaitee)
          const now = new Date()
          const diffDays = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays < 90) e.push('La date de début doit être au moins 90 jours après aujourd\'hui')
        }
        if (!form.duree) e.push('Durée requise')
      }
      if (!form.villeDepart.trim()) e.push('Ville de départ requise')
      if (!form.disponibleEntretien) e.push('Disponibilité pour l\'entretien requise')
    }
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    console.log('Candidature soumise:', form)
    setSubmitted(true)
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
                  onClick={() => setAudience(type.id)}
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
    const SESSION_MAP: Record<string, { name: string; destination: string }> = {
      'aout-2026': { name: 'CAMP DAGHESTANAIS', destination: 'Dagestan' },
    }
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
              {step === 0 && 'Qui es-tu ?'}
              {step === 1 && 'Ton parcours sportif'}
              {step === 2 && 'Condition physique & Santé'}
              {step === 3 && 'Disponibilités & logistique'}
              {step === 4 && 'Confirme ta candidature'}
            </h1>
          </div>

          <form key={`form-${step}`} className={`insc-form insc-anim-${dir}`} onSubmit={handleSubmit} noValidate>

            {/* ── STEP 1 ── */}
            {step === 0 && (
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
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 1 && (
              <div className="cand-panel">
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

            {/* ── STEP 3 ── */}
            {step === 2 && (
              <div className="cand-panel">
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

            {/* ── STEP 4 ── adapté par audience ── */}
            {step === 3 && (
              <div className="cand-panel">

                {/* Bandeau audience active */}
                {audienceConfig && (
                  <div className="insc-audience-banner">
                    <span className="insc-audience-banner-label">{audienceConfig.badge}</span>
                    <strong>{audienceConfig.label}</strong>
                    <span>{audienceConfig.longDescription}</span>
                  </div>
                )}

                {/* Audience: SESSION GROUPE — date verrouillée */}
                {audience === 'session' && (
                  <div className="cand-row">
                    <Field label="Session" hint="Camp officiel 2026 (3 semaines fixes)">
                      <input className="cand-input" type="text" disabled
                        value="17 Août - 5 Septembre 2026 · 3 semaines" />
                    </Field>
                    <Field label="Tarif" hint="Adulte 3 semaines">
                      <input className="cand-input" type="text" disabled
                        value="2 900 CHF" />
                    </Field>
                  </div>
                )}

                {/* Audience: CAMP SUR MESURE — date + durée libres */}
                {audience === 'custom' && (
                  <>
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
                          <option value="1-semaine">1 semaine · 1 500 CHF</option>
                          <option value="2-semaines">2 semaines · 2 200 CHF</option>
                          <option value="3-semaines">3 semaines · 2 900 CHF</option>
                        </select>
                      </Field>
                    </div>
                  </>
                )}

                {/* Audience: GROUPE / CLUB — données collectives */}
                {audience === 'groupe' && (
                  <>
                    <div className="cand-row">
                      <Field label="Nom du club / groupe">
                        <input className="cand-input" type="text"
                          placeholder="Ex : Geneva Fight Club"
                          value={form.nomClub}
                          onChange={e => set('nomClub', e.target.value)} />
                      </Field>
                      <Field label="Nombre de participants" hint="Adultes et enfants confondus">
                        <select className="cand-select" value={form.nombreParticipants}
                          onChange={e => set('nombreParticipants', e.target.value)}>
                          <option value="" disabled>Sélectionner</option>
                          <option value="2-4">2 à 4 personnes</option>
                          <option value="5-9">5 à 9 personnes</option>
                          <option value="10-15">10 à 15 personnes</option>
                          <option value="16-20">16 à 20 personnes</option>
                        </select>
                      </Field>
                    </div>
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
                          <option value="3-semaines">3 semaines (recommandé)</option>
                        </select>
                      </Field>
                    </div>
                    <Field label="Niveau global du groupe">
                      <select className="cand-select" value={form.niveauGroupe}
                        onChange={e => set('niveauGroupe', e.target.value)}>
                        <option value="" disabled>Sélectionner</option>
                        <option value="debutant">Mixte débutant / intermédiaire</option>
                        <option value="intermediaire">Intermédiaire homogène</option>
                        <option value="avance">Avancé / compétiteurs</option>
                        <option value="mixte">Mixte (à préciser dans message)</option>
                      </select>
                    </Field>
                  </>
                )}

                {/* Famille (option pour session ou custom, pas pour groupe) */}
                {audience !== 'groupe' && (
                  <Field label="Tu viens avec ta famille ?" hint="Enfants 8-17 ans avec parent obligatoire (1 900 CHF / 3 sem par enfant)">
                    <div className="cand-radios">
                      <label className={`cand-radio${!form.vientAvecFamille ? ' selected' : ''}`}>
                        <input type="radio" name="famille" checked={!form.vientAvecFamille}
                          onChange={() => set('vientAvecFamille', false)} />
                        Non, je viens seul(e)
                      </label>
                      <label className={`cand-radio${form.vientAvecFamille ? ' selected' : ''}`}>
                        <input type="radio" name="famille" checked={form.vientAvecFamille}
                          onChange={() => set('vientAvecFamille', true)} />
                        Oui, avec mon/mes enfant(s)
                      </label>
                    </div>
                    {form.vientAvecFamille && (
                      <div className="cand-row" style={{ marginTop: '1rem' }}>
                        <Field label="Nombre d'enfants">
                          <select className="cand-select" value={form.nombreEnfants}
                            onChange={e => set('nombreEnfants', e.target.value)}>
                            <option value="" disabled>Sélectionner</option>
                            <option value="1">1 enfant</option>
                            <option value="2">2 enfants</option>
                            <option value="3">3 enfants</option>
                          </select>
                        </Field>
                        <Field label="Âges des enfants" hint="Entre 8 et 17 ans">
                          <input className="cand-input" type="text"
                            placeholder="Ex : 10, 13"
                            value={form.enfantsAges}
                            onChange={e => set('enfantsAges', e.target.value)} />
                        </Field>
                      </div>
                    )}
                  </Field>
                )}

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
                      { val: 'oui-delai', label: 'Oui, mais avec un délai (plus d\'un mois)' },
                      { val: 'non', label: 'Non, problème de disponibilité' },
                    ]}
                  />
                </Field>
                <Field label="Comment as-tu connu le camp ?">
                  <select className="cand-select" value={form.sourceDecouverte}
                    onChange={e => set('sourceDecouverte', e.target.value)}>
                    <option value="" disabled>Sélectionner</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="bouche-a-oreille">Bouche à oreille</option>
                    <option value="coach">Recommandation de mon coach</option>
                    <option value="google">Recherche Google</option>
                    <option value="autre">Autre</option>
                  </select>
                </Field>
                <Field label="Questions ou informations complémentaires">
                  <textarea className="cand-textarea" rows={4}
                    placeholder="Tes objectifs, tes attentes, toute information utile..."
                    value={form.message} onChange={e => set('message', e.target.value)} />
                </Field>
              </div>
            )}

            {/* ── STEP 5 ── */}
            {step === 4 && (
              <div className="cand-panel">
                <div className="cand-recap">
                  <div className="cand-recap-row"><span>Type</span><strong>{audienceConfig?.label}</strong></div>
                  <div className="cand-recap-row"><span>Candidat</span><strong>{form.prenom} {form.nom}</strong></div>
                  <div className="cand-recap-row"><span>Pays</span><strong>{form.pays}</strong></div>
                  <div className="cand-recap-row"><span>Email</span><strong>{form.email}</strong></div>
                  <div className="cand-recap-row"><span>Discipline</span><strong>{form.disciplinePrincipale}</strong></div>
                  <div className="cand-recap-row"><span>Niveau</span><strong>{form.niveau}</strong></div>
                  <div className="cand-recap-row"><span>Pratique</span><strong>{form.anneesPratique} ans</strong></div>
                  {audience === 'session' && (
                    <div className="cand-recap-row"><span>Session</span><strong>17 Août - 5 Septembre 2026 (3 sem)</strong></div>
                  )}
                  {(audience === 'custom' || audience === 'groupe') && form.dateDebutSouhaitee && (
                    <div className="cand-recap-row"><span>Date début</span><strong>{form.dateDebutSouhaitee}</strong></div>
                  )}
                  {form.duree && (
                    <div className="cand-recap-row"><span>Durée</span><strong>{form.duree.replace('-', ' ')}</strong></div>
                  )}
                  {audience === 'groupe' && form.nomClub && (
                    <div className="cand-recap-row"><span>Club</span><strong>{form.nomClub}</strong></div>
                  )}
                  {audience === 'groupe' && form.nombreParticipants && (
                    <div className="cand-recap-row"><span>Participants</span><strong>{form.nombreParticipants}</strong></div>
                  )}
                  {form.vientAvecFamille && form.nombreEnfants && (
                    <div className="cand-recap-row"><span>Famille</span><strong>{form.nombreEnfants} enfant(s) — {form.enfantsAges}</strong></div>
                  )}
                  <div className="cand-recap-row"><span>Départ</span><strong>{form.villeDepart}</strong></div>
                  {(() => {
                    // Calcul prix indicatif
                    const weeks = form.duree === '1-semaine' ? 1 : form.duree === '2-semaines' ? 2 : 3
                    const enfants = form.vientAvecFamille ? parseInt(form.nombreEnfants || '0', 10) : 0
                    const adults = audience === 'groupe' ? 0 : 1
                    if (audience !== 'groupe' && weeks) {
                      const total = calculatePrice({ adults, children: enfants, weeks: weeks as Duration })
                      return <div className="cand-recap-row"><span>Tarif estimé</span><strong style={{ color: 'var(--primary)' }}>{formatCHF(total)}</strong></div>
                    }
                    return null
                  })()}
                </div>

                <div className="cand-confirms">
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
                <button type="submit" className="cand-btn-submit">ENVOYER MA CANDIDATURE</button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
