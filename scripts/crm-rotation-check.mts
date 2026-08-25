// Verifie que le CRM reagit correctement a la rotation des saisons :
// dossiers restes sur un camp parti, camps termines a cloturer, bloc sessions.
// Lancement : node --experimental-strip-types --import ./scripts/_alias-hook.mjs scripts/crm-rotation-check.mts
import { buildDigestData, formatDigestSlack, selectPredeparture, selectRebookingReminders, type AutomationRow } from '../src/lib/automation/selectors.ts'
import { buildRebookingEmail } from '../src/lib/rebooking-email.ts'

const NOW = new Date('2026-08-21T07:00:00Z')

function row(over: Partial<AutomationRow>): AutomationRow {
  return {
    id: over.id ?? 'x', status: 'recue', created_at: '2026-06-01T10:00:00Z',
    status_changed_at: '2026-06-01T10:00:00Z', submission_language: 'fr',
    camp_discipline: 'lutte', duree_semaines: 3, cancel_token: 't',
    session_id: null, visio_booked_at: '2026-06-02T10:00:00Z', visio_reminder_sent_at: null,
    visio_reminder_count: 0, contract_sent_at: null, contract_payment_deadline: null,
    package_paid_at: null, payment_method: null, package_amount_cents: null,
    contract_number: null, contract_start_date: null, payment_reminder_sent_at: null,
    payment_reminder_count: null,
    candidate: { prenom: over.id ?? 'X', email: `${over.id ?? 'x'}@test.ch` },
    predeparture_sent_at: null,
    tunnel_type: 'session',
    rebooking_sent_at: null,
    rebooking_sent_count: 0,
    ...over,
  } as AutomationRow
}

// Miroir de la vraie base au 2026-08-21 (aout-2026 a demarre le 17).
const rows: AutomationRow[] = [
  ...Array.from({ length: 9 }, (_, i) => row({ id: `aout-recue-${i}`, session_id: 'aout-2026', status: 'recue' })),
  ...Array.from({ length: 5 }, (_, i) => row({ id: `aout-validee-${i}`, session_id: 'aout-2026', status: 'validee', contract_sent_at: '2026-07-01T10:00:00Z', contract_payment_deadline: '2026-08-01' })),
  ...Array.from({ length: 6 }, (_, i) => row({ id: `touss-${i}`, session_id: 'toussaint-2026', status: i === 0 ? 'recue' : 'validee' })),
  row({ id: 'solde-camp-fini', session_id: 'paques-2026', status: 'soldee', package_paid_at: '2026-03-01T10:00:00Z' }),
  row({ id: 'solde-sans-contrat', session_id: 'toussaint-2026', status: 'soldee', package_paid_at: '2026-08-01T10:00:00Z' }),
]

const d = buildDigestData(rows, NOW)
let ko = 0
const check = (nom: string, ok: boolean, detail = '') => { if (!ok) ko++; console.log(ok ? 'OK ' : 'KO ', nom, detail) }

console.log('--- alertes de rotation ---')
check('9 recue + 5 validee sur aout-2026 signalees', d.dossiersSessionPartie.length === 14, `(${d.dossiersSessionPartie.length})`)
check('le dossier solde sur paques-2026 est a cloturer', d.campTermineSansCloture.length === 1, `(${d.campTermineSansCloture.length})`)
check('les dossiers toussaint-2026 ne sont PAS signales', !d.dossiersSessionPartie.some(l => l.includes('Toussaint')))
check('4 sessions ouvertes listees', d.sessionsOuvertes.length === 4, `(${d.sessionsOuvertes.length})`)
check('la ligne Toussaint compte ses 7 dossiers', d.sessionsOuvertes.some(l => l.includes('Toussaint') && l.includes('7 dossier')))
check('la ligne Ete 2027 existe et est vide', d.sessionsOuvertes.some(l => l.includes('Août 2027') && l.includes('aucun dossier')))
check('aout-2026 n a PAS de ligne session ouverte', !d.sessionsOuvertes.some(l => l.includes('Août 2026')))

console.log('\n--- pre-depart : repli sur la date de session ---')
const pre = selectPredeparture([row({ id: 'pre', session_id: 'toussaint-2026', status: 'soldee', package_paid_at: '2026-08-01T10:00:00Z' })], new Date('2026-10-10T07:00:00Z'))
check('cible un solde sans contract_start_date, via la session', pre.length === 1 && pre[0].startDate === '2026-10-17', JSON.stringify(pre.map(p => p.startDate)))
const preContrat = selectPredeparture([row({ id: 'pre2', session_id: 'toussaint-2026', status: 'soldee', contract_start_date: '2026-10-24', package_paid_at: '2026-08-01T10:00:00Z' })], new Date('2026-10-17T07:00:00Z'))
check('contract_start_date reste prioritaire', preContrat.length === 1 && preContrat[0].startDate === '2026-10-24', JSON.stringify(preContrat.map(p => p.startDate)))

console.log('\n--- A4 : rappel 3 jours apres le repositionnement ---')
const D3 = '2026-08-18T22:00:00Z'   // 3 jours calendaires avant NOW (21/08)
const D2 = '2026-08-19T06:00:00Z'   // 2 jours calendaires : trop tot
const base = { session_id: 'aout-2026', status: 'recue' as const, rebooking_sent_count: 1 }
const cases: [string, AutomationRow, boolean][] = [
  ['relance au 3e jour, quelle que soit l heure d envoi', row({ id: 'r-3j', ...base, rebooking_sent_at: D3 }), true],
  ['pas de relance au 2e jour', row({ id: 'r-2j', ...base, rebooking_sent_at: D2 }), false],
  ['pas de 2e relance', row({ id: 'r-deja', ...base, rebooking_sent_at: D3, rebooking_sent_count: 2 }), false],
  ['appel reserve depuis l envoi = pas de relance', row({ id: 'r-visio', ...base, rebooking_sent_at: D3, visio_booked_at: '2026-08-19T10:00:00Z' }), false],
  ['jamais repositionne = pas concerne', row({ id: 'r-jamais', session_id: 'aout-2026', status: 'recue' }), false],
  ['dossier annule = pas de relance', row({ id: 'r-annule', ...base, status: 'annulee' as never, rebooking_sent_at: D3 }), false],
]
for (const [nom, r, attendu] of cases) {
  const got = selectRebookingReminders([r], NOW).length === 1
  check(nom, got === attendu)
}
// Redepot de candidature : une 2e ligne pour le MEME email, creee apres l'envoi.
const relance = row({ id: 'r-redepot', ...base, rebooking_sent_at: D3 })
const redepot = row({ id: 'r-redepot', session_id: 'toussaint-2026', status: 'recue', created_at: '2026-08-20T10:00:00Z' })
check('candidature redeposee depuis l envoi = pas de relance', selectRebookingReminders([relance, redepot], NOW).length === 0)

console.log('\n--- copie de la relance (FR) ---')
const rel = buildRebookingEmail({ locale: 'fr', prenom: 'Yazid', variant: 'recue', missedSessionId: 'aout-2026', campDiscipline: 'lutte', dureeSemaines: 1, tunnel: 'session', stage: 'reminder', now: NOW })
const premier = buildRebookingEmail({ locale: 'fr', prenom: 'Yazid', variant: 'recue', missedSessionId: 'aout-2026', campDiscipline: 'lutte', dureeSemaines: 1, tunnel: 'session', now: NOW })
check('la relance a un objet different du 1er envoi', rel.subject !== premier.subject)
// Ce qui compte n'est pas un nombre de caracteres absolu, mais que la relance
// soit nettement plus legere que le premier envoi.
check('la relance est nettement plus courte', rel.text.length < premier.text.length * 0.8, `(${rel.text.length} vs ${premier.text.length} car.)`)
check('aucun reproche dans la relance', !/pas répondu|sans réponse|relanc|dernier rappel/i.test(rel.text))
console.log(`\nObjet : ${rel.subject}\n`)
console.log(rel.text)

console.log('\n--- rendu du digest ---')
const txt = formatDigestSlack(d, { dryRun: true, automationEnabled: false, sentVisio: [], wouldSendVisio: [], sentPayment: [], wouldSendPayment: [], sentPredeparture: [], wouldSendPredeparture: [], sentRebooking: [], wouldSendRebooking: [] })
check('le digest ne dit pas RAS', !txt.includes('[OK] RAS'))
check('bloc camp deja parti present', txt.includes('DEJA PARTI'))
check('bloc sessions ouvertes present', txt.includes('Sessions ouvertes'))
console.log('\n----- extrait -----')
console.log(txt.split('\n\n').filter(p => p.includes('DEJA PARTI') || p.includes('Sessions ouvertes') || p.includes('cloturer')).map(p => p.split('\n').slice(0, 4).join('\n')).join('\n\n'))

console.log(ko === 0 ? '\nTOUT VERT' : `\n${ko} ECHEC(S)`)
process.exit(ko === 0 ? 0 : 1)
