'use client'

import { useState, FormEvent } from 'react'
import dynamic from 'next/dynamic'
import { DISCIPLINES } from '@/data/disciplines'
import { SESSIONS, sessionFormLabel } from '@/data/sessions'

const StoryCard = dynamic(() => import('./StoryCard'))

const STEPS = [
  'Identité',
  'Expérience',
  'Santé',
  'Logistique',
  'Confirmation',
]

type FormData = {
  prenom: string
  nom: string
  dateNaissance: string
  pays: string
  email: string
  telephone: string
  disciplinePrincipale: string
  disciplinesSecondaires: string[]
  anneesPratique: string
  niveau: string
  club: string
  coach: string
  palmares: string
  lienVideo: string
  conditionPhysique: string
  blessuresRecentes: string
  blessuresDetail: string
  contreIndications: string
  contreIndicationsDetail: string
  deuxFoisJour: string
  session: string
  duree: string
  villeDepart: string
  disponibleEntretien: string
  sourceDecouverte: string
  message: string
  certifMedical: boolean
  accepteConditions: boolean
  pret: boolean
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
}

function Field({ label, required, hint, children }: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="cand-field">
      <label className="cand-label">
        {label}{required && <span className="cand-required">*</span>}
      </label>
      {hint && <span className="cand-hint">{hint}</span>}
      {children}
    </div>
  )
}

function RadioGroup({ name, options, value, onChange }: {
  name: string
  options: { val: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="cand-radios">
      {options.map(o => (
        <label key={o.val} className={`cand-radio${value === o.val ? ' selected' : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.val}
            checked={value === o.val}
            onChange={() => onChange(o.val)}
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

export default function CandidatureForm() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors([])
  }

  const toggleDiscipline = (d: string) => {
    setForm(prev => {
      const list = prev.disciplinesSecondaires
      return {
        ...prev,
        disciplinesSecondaires: list.includes(d)
          ? list.filter(x => x !== d)
          : [...list, d],
      }
    })
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
      if (!form.session) e.push('Session souhaitée requise')
      if (!form.duree) e.push('Durée requise')
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

  const next = () => { if (validate()) setStep(s => s + 1) }
  const prev = () => { setStep(s => s - 1); setErrors([]) }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    console.log('Candidature soumise:', form)
    setSubmitted(true)
  }

  if (submitted) {
    const selectedSession = SESSIONS.find(s => s.id === form.session)
    const sessionLabel = selectedSession?.name || form.session
    const destination = selectedSession?.destination || 'Dagestan'

    return (
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
          session={sessionLabel}
          destination={destination}
        />
      </div>
    )
  }

  return (
    <>
      {/* Progress bar */}
      <div className="cand-progress" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
        {STEPS.map((label, i) => (
          <div key={i} className={`cand-step${i <= step ? ' done' : ''}${i === step ? ' active' : ''}`}>
            <div className="cand-step-dot">
              {i < step ? (
                <svg viewBox="0 0 12 12" fill="none">
                  <polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="cand-step-label">{label}</span>
          </div>
        ))}
      </div>

      <form className="cand-form" onSubmit={handleSubmit} noValidate>

        {/* ── STEP 1 : Identité ── */}
        {step === 0 && (
          <div className="cand-panel">
            <h3 className="cand-panel-title">Qui es-tu ?</h3>
            <div className="cand-row">
              <Field label="Prénom" required>
                <input className="cand-input" type="text" autoComplete="given-name"
                  placeholder="Ton prénom" value={form.prenom}
                  onChange={e => set('prenom', e.target.value)} />
              </Field>
              <Field label="Nom" required>
                <input className="cand-input" type="text" autoComplete="family-name"
                  placeholder="Ton nom" value={form.nom}
                  onChange={e => set('nom', e.target.value)} />
              </Field>
            </div>
            <div className="cand-row">
              <Field label="Date de naissance" required hint="Tu dois avoir au moins 18 ans">
                <input className="cand-input" type="date" value={form.dateNaissance}
                  onChange={e => set('dateNaissance', e.target.value)} />
              </Field>
              <Field label="Pays de résidence" required>
                <input className="cand-input" type="text" autoComplete="country-name"
                  placeholder="France, Suisse, Canada..." value={form.pays}
                  onChange={e => set('pays', e.target.value)} />
              </Field>
            </div>
            <div className="cand-row">
              <Field label="Email" required>
                <input className="cand-input" type="email" autoComplete="email"
                  placeholder="ton@email.com" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="Téléphone" hint="optionnel">
                <input className="cand-input" type="tel" autoComplete="tel"
                  placeholder="+33 6 XX XX XX XX" value={form.telephone}
                  onChange={e => set('telephone', e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Expérience ── */}
        {step === 1 && (
          <div className="cand-panel">
            <h3 className="cand-panel-title">Ton parcours sportif</h3>

            <Field label="Discipline principale" required>
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
              <Field label="Années de pratique" required>
                <select className="cand-select" value={form.anneesPratique}
                  onChange={e => set('anneesPratique', e.target.value)}>
                  <option value="" disabled>Sélectionner</option>
                  <option value="1-2">1 -2 ans</option>
                  <option value="2-5">2 -5 ans</option>
                  <option value="5-10">5 -10 ans</option>
                  <option value="10+">10 ans et plus</option>
                </select>
              </Field>
              <Field label="Niveau actuel" required>
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

            <Field label="Lien vidéo" hint="YouTube, Instagram, footage de compétition -fortement recommandé">
              <input className="cand-input" type="url"
                placeholder="https://youtube.com/..."
                value={form.lienVideo} onChange={e => set('lienVideo', e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── STEP 3 : Santé ── */}
        {step === 2 && (
          <div className="cand-panel">
            <h3 className="cand-panel-title">Condition physique & Santé</h3>

            <Field label="Comment évalues-tu ta condition physique actuelle ?" required>
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

            <Field label="As-tu eu des blessures significatives ces 3 derniers mois ?" required>
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

            <Field label="As-tu des contre-indications médicales à l'effort intense ?" required>
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

            <Field
              label="Es-tu capable de t'entraîner deux fois par jour, 6 jours sur 7 ?"
              required
              hint="Les sessions durent 2 à 3h. C'est le rythme standard du camp."
            >
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

        {/* ── STEP 4 : Logistique ── */}
        {step === 3 && (
          <div className="cand-panel">
            <h3 className="cand-panel-title">Disponibilités & logistique</h3>

            <div className="cand-row">
              <Field label="Session souhaitée" required>
                <select className="cand-select" value={form.session}
                  onChange={e => set('session', e.target.value)}>
                  <option value="" disabled>Sélectionner</option>
                  {SESSIONS.map(s => (
                    <option key={s.id} value={s.id}>{sessionFormLabel(s)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Durée souhaitée" required>
                <select className="cand-select" value={form.duree}
                  onChange={e => set('duree', e.target.value)}>
                  <option value="" disabled>Sélectionner</option>
                  <option value="1-semaine">1 semaine</option>
                  <option value="2-semaines">2 semaines</option>
                  <option value="3-semaines">3 semaines (recommandé)</option>
                  <option value="1-mois">1 mois</option>
                </select>
              </Field>
            </div>

            <Field label="Ville / pays de départ" required hint="Utilisé pour estimer les vols">
              <input className="cand-input" type="text"
                placeholder="Ex : Paris, Genève, Montréal..."
                value={form.villeDepart} onChange={e => set('villeDepart', e.target.value)} />
            </Field>

            <Field label="Es-tu disponible pour un entretien vidéo de sélection ?" required
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

            <div className="cand-row">
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
            </div>

            <Field label="Questions ou informations complémentaires">
              <textarea className="cand-textarea" rows={4}
                placeholder="Tes objectifs, tes attentes, toute information utile à ta candidature..."
                value={form.message} onChange={e => set('message', e.target.value)} />
            </Field>
          </div>
        )}

        {/* ── STEP 5 : Confirmation ── */}
        {step === 4 && (
          <div className="cand-panel">
            <h3 className="cand-panel-title">Confirme ta candidature</h3>

            <div className="cand-recap">
              <div className="cand-recap-row"><span>Candidat</span><strong>{form.prenom} {form.nom}</strong></div>
              <div className="cand-recap-row"><span>Pays</span><strong>{form.pays}</strong></div>
              <div className="cand-recap-row"><span>Email</span><strong>{form.email}</strong></div>
              <div className="cand-recap-row"><span>Discipline</span><strong>{form.disciplinePrincipale}</strong></div>
              <div className="cand-recap-row"><span>Niveau</span><strong>{form.niveau}</strong></div>
              <div className="cand-recap-row"><span>Années</span><strong>{form.anneesPratique}</strong></div>
              <div className="cand-recap-row"><span>Session</span><strong>{form.session}</strong></div>
              <div className="cand-recap-row"><span>Durée</span><strong>{form.duree}</strong></div>
              <div className="cand-recap-row"><span>Départ de</span><strong>{form.villeDepart}</strong></div>
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

        {/* Errors */}
        {errors.length > 0 && (
          <div className="cand-errors" role="alert">
            {errors.map((e, i) => <span key={i}>{e}</span>)}
          </div>
        )}

        {/* Navigation */}
        <div className="cand-nav">
          {step > 0 && (
            <button type="button" className="cand-btn-back" onClick={prev}>
              ← Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" className="cand-btn-next" onClick={next}>
              Étape suivante →
            </button>
          ) : (
            <button type="submit" className="cand-btn-submit">
              ENVOYER MA CANDIDATURE
            </button>
          )}
        </div>
      </form>
    </>
  )
}
