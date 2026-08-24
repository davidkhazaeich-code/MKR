// Verifie que le CRM reagit correctement a la rotation des saisons :
// dossiers restes sur un camp parti, camps termines a cloturer, bloc sessions.
// Lancement : node --experimental-strip-types --import ./scripts/_alias-hook.mjs scripts/crm-rotation-check.mts
import { buildDigestData, formatDigestSlack, selectPredeparture, type AutomationRow } from '../src/lib/automation/selectors.ts'

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

console.log('\n--- rendu du digest ---')
const txt = formatDigestSlack(d, { dryRun: true, automationEnabled: false, sentVisio: [], wouldSendVisio: [], sentPayment: [], wouldSendPayment: [], sentPredeparture: [], wouldSendPredeparture: [] })
check('le digest ne dit pas RAS', !txt.includes('[OK] RAS'))
check('bloc camp deja parti present', txt.includes('DEJA PARTI'))
check('bloc sessions ouvertes present', txt.includes('Sessions ouvertes'))
console.log('\n----- extrait -----')
console.log(txt.split('\n\n').filter(p => p.includes('DEJA PARTI') || p.includes('Sessions ouvertes') || p.includes('cloturer')).map(p => p.split('\n').slice(0, 4).join('\n')).join('\n\n'))

console.log(ko === 0 ? '\nTOUT VERT' : `\n${ko} ECHEC(S)`)
process.exit(ko === 0 ? 0 : 1)
