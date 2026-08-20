// Teste le VRAI module data/sessions.ts (aucun import externe dedans).
import { getSessions, getNextSession, getUnfinishedSessions, sessionFromId, isSessionOpen, sessionYearRange } from '../src/data/sessions.ts'

const CAS: [string, string[]][] = [
  ['2026-08-16', ['aout-2026', 'toussaint-2026', 'fevrier-2027', 'paques-2027']],
  ['2026-08-17', ['toussaint-2026', 'fevrier-2027', 'paques-2027', 'aout-2027']],
  ['2026-08-21', ['toussaint-2026', 'fevrier-2027', 'paques-2027', 'aout-2027']],
  ['2026-10-17', ['fevrier-2027', 'paques-2027', 'aout-2027', 'toussaint-2027']],
  ['2027-02-13', ['paques-2027', 'aout-2027', 'toussaint-2027', 'fevrier-2028']],
  ['2027-04-03', ['aout-2027', 'toussaint-2027', 'fevrier-2028', 'paques-2028']],
  ['2029-11-30', ['fevrier-2030', 'paques-2030', 'aout-2030', 'toussaint-2030']],
]
let ko = 0
console.log('--- bascule de saison ---')
for (const [jour, attendu] of CAS) {
  const now = new Date(`${jour}T12:00:00Z`)
  const ids = getSessions(now).map(s => s.id)
  const ok = JSON.stringify(ids) === JSON.stringify(attendu)
  if (!ok) ko++
  console.log(ok ? 'OK ' : 'KO ', jour, '->', ids.join(' '), ok ? '' : `(attendu ${attendu.join(' ')})`)
}
console.log('\n--- garde-fous ---')
const now = new Date('2026-08-21T12:00:00Z')
const checks: [string, boolean][] = [
  ['toujours 4 sessions', getSessions(now).length === 4],
  ['prochaine = toussaint-2026', getNextSession(now).id === 'toussaint-2026'],
  ['plage annees = 2026 / 2027', sessionYearRange(getSessions(now)) === '2026 / 2027'],
  ['aout-2026 fermee aux inscriptions', isSessionOpen('aout-2026', now) === false],
  ['aout-2027 ouverte', isSessionOpen('aout-2027', now) === true],
  ['camp en cours visible cote admin', getUnfinishedSessions(now).map(s => s.id).includes('aout-2026')],
  ['session historique 2026 resolue', sessionFromId('aout-2026')?.startDate === '2026-08-17'],
  ['session tres ancienne resolue', sessionFromId('paques-2024')?.startDate === '2024-04-06'],
  ['id inconnu -> null', sessionFromId('sur-mesure') === null],
  ['id vide -> null', sessionFromId(null) === null],
  ['capacite par defaut 15/15', getNextSession(now).maxCapacity.lutte === 15],
]
for (const [nom, ok] of checks) { if (!ok) ko++; console.log(ok ? 'OK ' : 'KO ', nom) }
console.log(ko === 0 ? '\nTOUT VERT' : `\n${ko} ECHEC(S)`)
process.exit(ko === 0 ? 0 : 1)
