// Tests pour les modules purs du back office admin.
// Lancement : node --experimental-strip-types --import ./scripts/_alias-hook.mjs scripts/admin-next-step-check.mts

import { type DossierRow } from '../src/lib/admin/types.ts'
import { zurichDay, daysBetween, formatEuros, formatDayLong, formatDayMonth, formatVisioMoment, formatVisioShort, relativeDay, formatAgo, ageOn } from '../src/lib/admin/format.ts'
import { computeNextStep, type NextStep } from '../src/lib/admin/next-step.ts'
import { describeAuditEvent, type AuditRow, actorLabel } from '../src/lib/admin/audit-labels.ts'
import { buildQueue } from '../src/lib/admin/queue.ts'
import { buildSessionsOverview, placesSummary } from '../src/lib/admin/sessions-stats.ts'
import {
  parseFilters, filtersToQuery, DEFAULT_FILTERS, matchesFilters, statusCounts, sortItems, countExtraFilters,
  buildFilterOptions, activeFilterChips, filterValueLabel, TRI_OPTIONS,
} from '../src/lib/admin/list-filters.ts'
import {
  STEP_ICON, dossierHref, candidateName, firstNameOf, whatsappHref, campParts, sourceLabel, originOf, mmaLevelToCheck,
} from '../src/lib/admin/row-helpers.ts'

const NOW = new Date('2026-09-23T10:00:00Z')

function row(over: Partial<DossierRow>): DossierRow {
  return {
    id: 'x',
    created_at: '2026-09-01T10:00:00Z',
    status_changed_at: '2026-09-01T10:00:00Z',
    tunnel_type: 'session',
    session_id: null,
    duree_semaines: null,
    date_debut_souhaitee: null,
    camp_discipline: null,
    status: 'recue',
    package_amount_cents: null,
    package_paid_at: null,
    payment_method: null,
    payment_date: null,
    notes_admin: null,
    referral_code: null,
    referral_code_valid: null,
    referral_partner_name: null,
    referral_partner_type: null,
    referral_bonus_eur: null,
    referral_payout_status: null,
    submission_language: 'fr',
    attribution_source: null,
    visio_booked_at: null,
    visio_starts_at: null,
    visio_booking_uid: null,
    visio_reminder_sent_at: null,
    visio_reminder_count: null,
    rebooking_sent_at: null,
    rebooking_sent_count: null,
    contract_sent_at: null,
    contract_payment_deadline: null,
    contract_start_date: null,
    contract_end_date: null,
    candidate: { prenom: 'Test', nom: 'Dossier', email: 'test@example.com', telephone: null, pays: 'France' },
    ...over,
  }
}

let ko = 0
const check = (nom: string, ok: boolean, detail = '') => { if (!ok) ko++; console.log(ok ? 'OK ' : 'KO ', nom, detail) }

console.log('--- format ---')
check('zurichDay passe minuit a Zurich', zurichDay('2026-09-23T22:30:00Z') === '2026-09-24')
check('daysBetween', daysBetween('2026-09-23', '2026-10-17') === 24)
check('formatEuros entier', formatEuros(139000).replace(/\s/g, ' ') === '1 390 €')
check('formatEuros decimal', formatEuros(139050).replace(/\s/g, ' ') === '1 390,50 €')
check('formatDayLong', formatDayLong('2026-10-09T08:00:00Z') === 'vendredi 9 octobre')
check('formatDayLong date seule', formatDayLong('2026-10-17') === 'samedi 17 octobre')
check('formatVisioMoment aujourd hui', formatVisioMoment('2026-09-23T12:15:00Z', NOW) === "aujourd'hui à 14:15")
check('formatVisioMoment demain', formatVisioMoment('2026-09-24T07:00:00Z', NOW) === 'demain à 09:00')
check('formatVisioShort plus tard', formatVisioShort('2026-10-09T08:00:00Z', NOW) === '9 oct. 10:00')
check('relativeDay futur', relativeDay('2026-10-17', NOW) === 'dans 24 j')
check('relativeDay passe', relativeDay('2026-09-20T10:00:00Z', NOW) === 'il y a 3 j')
check('formatAgo minutes', formatAgo('2026-09-23T09:48:00Z', NOW) === 'il y a 12 min')
check('ageOn', ageOn('2000-09-24', NOW) === 25 && ageOn('2000-09-23', NOW) === 26)
// next-step : une assertion par ligne du tableau de la spec (section 5)
const k = (over: Partial<DossierRow>) => computeNextStep(row(over), NOW).kind
check('clos refusee', k({ status: 'refusee' }) === 'clos')
check('camp parti recue (aout-2026)', k({ session_id: 'aout-2026' }) === 'camp_parti')
check('camp parti ignore la soldee', k({ status: 'soldee', session_id: 'aout-2026', package_paid_at: '2026-07-01T10:00:00Z' }) === 'camp_a_cloturer')
check('visio a venir', k({ visio_booked_at: '2026-09-20T10:00:00Z', visio_starts_at: '2026-10-09T08:00:00Z' }) === 'visio_a_venir')
check('visio commencee il y a 20 min reste a venir', k({ visio_booked_at: '2026-09-20T10:00:00Z', visio_starts_at: '2026-09-23T09:40:00Z' }) === 'visio_a_venir')
check('visio passee apres 30 min', k({ visio_booked_at: '2026-09-20T10:00:00Z', visio_starts_at: '2026-09-23T09:20:00Z' }) === 'visio_passee')
check('visio reservee sans heure', k({ visio_booked_at: '2026-09-20T10:00:00Z' }) === 'visio_reservee')
check('devis groupe', k({ tunnel_type: 'groupe' }) === 'devis_a_envoyer')
check('nouvelle < 3 j', k({ created_at: '2026-09-21T10:00:00Z' }) === 'nouvelle')
check('a relancer >= 3 j', k({ created_at: '2026-09-20T09:00:00Z' }) === 'a_relancer')
check('a solder', k({ status: 'validee', package_paid_at: '2026-09-20T10:00:00Z' }) === 'a_solder')
check('contrat a envoyer', k({ status: 'validee' }) === 'contrat_a_envoyer')
check('contrat sans echeance', k({ status: 'validee', contract_sent_at: '2026-09-10T10:00:00Z' }) === 'contrat_sans_echeance')
check('paiement en retard', k({ status: 'validee', contract_sent_at: '2026-09-01T10:00:00Z', contract_payment_deadline: '2026-09-19' }) === 'paiement_en_retard')
check('paiement attendu', k({ status: 'validee', contract_sent_at: '2026-09-01T10:00:00Z', contract_payment_deadline: '2026-10-01' }) === 'paiement_attendu')
check('depart a venir', k({ status: 'soldee', session_id: 'toussaint-2026', package_paid_at: '2026-09-01T10:00:00Z' }) === 'depart_a_venir')
check('cloture sur mesure via contract_end_date', k({ status: 'soldee', contract_end_date: '2026-09-01' }) === 'camp_a_cloturer')
check('camp parti prime sur la visio', k({ session_id: 'aout-2026', visio_booked_at: '2026-08-01T10:00:00Z', visio_starts_at: '2026-08-02T10:00:00Z' }) === 'camp_parti')
const retard = computeNextStep(row({ status: 'validee', contract_sent_at: '2026-09-01T10:00:00Z', contract_payment_deadline: '2026-09-19', package_amount_cents: 139000 }), NOW)
check('detail retard chiffre', retard.detail.includes('1') && retard.detail.includes('en retard de 4 jours') && retard.tone === 'danger' && retard.needsAction)
const allSteps = [
  row({ session_id: 'aout-2026' }), row({ visio_booked_at: '2026-09-10T10:00:00Z', visio_starts_at: '2026-09-18T09:45:00Z' }),
  row({ created_at: '2026-09-01T10:00:00Z', visio_reminder_count: 2, visio_reminder_sent_at: '2026-09-15T10:00:00Z' }),
  row({ status: 'validee' }), row({ status: 'soldee', session_id: 'toussaint-2026', package_paid_at: '2026-09-01T10:00:00Z' }),
  row({ status: 'annulee' }), row({ tunnel_type: 'groupe' }),
].map((r) => computeNextStep(r, NOW))
check('aucun em dash ni esperluette dans les textes', !JSON.stringify(allSteps).includes('—') && !JSON.stringify(allSteps).includes('&'))
// audit
const d = (event: string, extra: Partial<AuditRow> = {}) => describeAuditEvent({ id: 1, event, from_value: null, to_value: null, data: null, actor_email: 'admin', at: '2026-09-20T10:00:00Z', ...extra })
check('visio_booked traduit avec heure', d('visio_booked', { data: { start_time: '2026-10-09T08:00:00Z' }, actor_email: 'cal-webhook' }).label === 'Visio réservée' && d('visio_booked', { data: { start_time: '2026-10-09T08:00:00Z' } }).detail === 'pour le vendredi 9 octobre à 10:00')
check('package_amount_estimated traduit', d('package_amount_estimated', { to_value: { package_amount_cents: 319000 } }).label === 'Montant estimé depuis la grille tarifaire')
check('evenement inconnu lisible', d('some_new_event').label === 'Some new event')
check('acteur cron', actorLabel('system-cron') === 'Automatique')
// queue
const q = buildQueue([
  row({ id: 'a', visio_booked_at: '2026-09-20T10:00:00Z', visio_starts_at: '2026-09-23T12:15:00Z' }),
  row({ id: 'b', visio_booked_at: '2026-09-10T10:00:00Z', visio_starts_at: '2026-09-18T09:45:00Z' }),
  row({ id: 'c', status: 'validee', contract_sent_at: '2026-09-01T10:00:00Z', contract_payment_deadline: '2026-09-19' }),
  row({ id: 'd', status: 'validee', contract_sent_at: '2026-09-01T10:00:00Z', contract_payment_deadline: '2026-10-01' }),
  row({ id: 'e', referral_payout_status: 'due', status: 'soldee', session_id: 'toussaint-2026', package_paid_at: '2026-09-01T10:00:00Z' }),
], NOW)
check('agenda : visio du jour dans today', q.agenda.find((g) => g.key === 'today')?.items[0]?.row.id === 'a')
check('a trancher contient b', q.sections.find((s) => s.key === 'a_trancher')?.items.length === 1)
check('paiements : retard avant attendu', q.sections.find((s) => s.key === 'paiements')?.items.map((i) => i.row.id).join() === 'c,d')
check('bonus du', q.sections.find((s) => s.key === 'bonus')?.items[0]?.row.id === 'e')
check('pipeline', q.pipeline.recue === 2 && q.pipeline.validee === 2 && q.pipeline.soldee === 1)
// sessions
const so = buildSessionsOverview([
  row({ id: 's1', session_id: 'toussaint-2026', camp_discipline: 'lutte' }),
  row({ id: 's2', session_id: 'toussaint-2026', camp_discipline: 'mma', status: 'validee', package_amount_cents: 139000 }),
  row({ id: 's3', session_id: 'toussaint-2026', camp_discipline: 'lutte', status: 'refusee' }),
  row({ id: 's4', session_id: null, tunnel_type: 'custom' }),
  row({ id: 's5', session_id: 'ete-2031' }),
], NOW)
const t = so.current.find((s) => s.id === 'toussaint-2026')!
check('toussaint places', t.lutte.prises === 1 && t.mma.prises === 1 && t.lutte.max === 15)
check('toussaint montants', t.engagedCents === 139000 && t.collectedCents === 0)
check('toussaint depart dans 24 j', t.daysToStart === 24 && t.state === 'a_venir')
check('sur mesure compte', so.surMesure.total === 1)
check('orphelin', so.orphans.some((o) => o.id === 'ete-2031'))
check('placesSummary', placesSummary(t) === 'Lutte 1/15 · MMA 1/15')
// filtres
const f = parseFilters(new URLSearchParams('status=validee&referralCode=STRIKE'))
check('anciens parametres', f.statut === 'validee' && f.partenaire === 'STRIKE')
check('serialisation par defaut vide', filtersToQuery(DEFAULT_FILTERS) === '')
check('serialisation aller-retour', parseFilters(new URLSearchParams(filtersToQuery({ ...DEFAULT_FILTERS, q: 'él', session: 'toussaint-2026' }))).session === 'toussaint-2026')
const item = (over: Partial<DossierRow>) => { const r = row(over); return { row: r, step: computeNextStep(r, NOW) } }
const karim = item({ candidate: { prenom: 'Karim', nom: 'Dupré', email: 'karim@example.com', telephone: '+33600000012', pays: 'France' } })
check('recherche sans accent', matchesFilters(karim, { ...DEFAULT_FILTERS, q: 'dupre' }))
check('recherche telephone format national', matchesFilters(karim, { ...DEFAULT_FILTERS, q: '06 00 00 00 12' }))
check('recherche telephone format international', matchesFilters(karim, { ...DEFAULT_FILTERS, q: '+33 6 00 00 00 12' }))
check('recherche trop courte ne matche pas les chiffres', !matchesFilters(karim, { ...DEFAULT_FILTERS, q: '0012' }))
check('actifs exclut refusee', !matchesFilters(item({ status: 'refusee' }), DEFAULT_FILTERS))
check('facettes ignorent le statut', statusCounts([item({}), item({ status: 'refusee' })], DEFAULT_FILTERS).tous === 2)
// liste : horloge de la page pour "Camps a venir" (toussaint-2026 finit le 7 novembre)
const toussaint = item({ session_id: 'toussaint-2026' })
check('camps a venir a la date de la page', matchesFilters(toussaint, { ...DEFAULT_FILTERS, session: 'upcoming' }, undefined, NOW))
check('camps a venir : session terminee a cette date', !matchesFilters(toussaint, { ...DEFAULT_FILTERS, session: 'upcoming' }, undefined, new Date('2027-01-05T10:00:00Z')))
check('facettes a la date de la page', statusCounts([toussaint], { ...DEFAULT_FILTERS, session: 'upcoming' }, new Date('2027-01-05T10:00:00Z')).tous === 0
  && statusCounts([toussaint], { ...DEFAULT_FILTERS, session: 'upcoming' }, NOW).recue === 1)
check('sans session', matchesFilters(item({ tunnel_type: 'custom' }), { ...DEFAULT_FILTERS, session: 'none' }) && !matchesFilters(toussaint, { ...DEFAULT_FILTERS, session: 'none' }))
check('source absente = inconnue', matchesFilters(item({}), { ...DEFAULT_FILTERS, source: 'inconnue' }) && !matchesFilters(item({ attribution_source: 'google_ads' }), { ...DEFAULT_FILTERS, source: 'inconnue' }))
check('partenaire : code, invalide, sans code, bonus du',
  matchesFilters(item({ referral_code: 'STRIKE', referral_code_valid: true }), { ...DEFAULT_FILTERS, partenaire: 'STRIKE' })
  && matchesFilters(item({ referral_code: 'FAKE10', referral_code_valid: false }), { ...DEFAULT_FILTERS, partenaire: 'invalid' })
  && matchesFilters(item({}), { ...DEFAULT_FILTERS, partenaire: 'none' })
  && !matchesFilters(item({ referral_code: 'STRIKE' }), { ...DEFAULT_FILTERS, partenaire: 'none' })
  && matchesFilters(item({ referral_payout_status: 'due', referral_code: 'STRIKE' }), { ...DEFAULT_FILTERS, partenaire: 'due' }))
check('etape : groupe de kinds', matchesFilters(item({ status: 'validee', contract_sent_at: '2026-09-10T10:00:00Z' }), { ...DEFAULT_FILTERS, etape: 'contrat' }))
check('filtres du panneau comptes (ni recherche, ni statut, ni tri)', countExtraFilters({ ...DEFAULT_FILTERS, q: 'x', statut: 'tous', tri: 'nom', session: 'none', langue: 'en' }) === 2)
const sorted = sortItems([item({ id: 'b', created_at: '2026-09-02T10:00:00Z' }), item({ id: 'a', created_at: '2026-09-05T10:00:00Z' })], 'recentes')
check('tri plus recentes', sorted.map((i) => i.row.id).join() === 'a,b')
const listRows = [
  row({ id: 'r1', session_id: 'toussaint-2026', camp_discipline: 'lutte', attribution_source: 'meta_ads' }),
  row({ id: 'r2', session_id: 'toussaint-2026', camp_discipline: 'mma', status: 'validee', attribution_source: 'google_ads' }),
  row({ id: 'r3', session_id: 'aout-2026', status: 'annulee', attribution_source: 'tiktok' }),
  row({ id: 'r4', session_id: 'ete-2031' }),
  row({ id: 'r5', tunnel_type: 'custom' }),
]
const opts = buildFilterOptions(listRows, NOW)
const sessionLabels = opts.session.map((o) => o.label)
check('session : toutes puis camps a venir', opts.session[0].value === '' && sessionLabels[0] === 'Toutes les sessions' && opts.session[1].value === 'upcoming' && sessionLabels[1] === 'Camps à venir')
check('session courante avec date et places', sessionLabels[2] === 'Toussaint 2026 · 17 oct. · Lutte 1/15 · MMA 1/15', sessionLabels[2])
check('session passee portant un dossier', sessionLabels.includes('Août 2026 (passée)'))
check('id inconnu du calendrier', sessionLabels.includes('ete-2031 (inconnue)'))
check('sans session en dernier', opts.session.at(-1)?.value === 'none' && sessionLabels.at(-1) === 'Sans session (sur mesure)')
check('ordre : courantes, passees, inconnues, sans session', opts.session.map((o) => o.value).slice(-3).join() === 'aout-2026,ete-2031,none')
check('sources presentes (Google Ads en tete) puis inconnue', opts.source.map((o) => o.value).join() === ',google_ads,meta_ads,tiktok,inconnue', opts.source.map((o) => o.value).join())
check('source inconnue du site : valeur brute', opts.source.find((o) => o.value === 'tiktok')?.label === 'tiktok')
check('partenaires : codes actifs puis cas speciaux', opts.partenaire[0].label === 'Tous'
  && opts.partenaire.some((o) => o.value === 'STRIKE' && o.label === 'STRIKE · Strike Academy (Progress Gym SA)')
  && opts.partenaire.slice(-3).map((o) => o.label).join() === 'Code invalide,Sans code,Bonus dû')
check('valeur courante absente ajoutee', buildFilterOptions(listRows, NOW, { ...DEFAULT_FILTERS, partenaire: 'ANCIEN', session: 'fevrier-2025' }).partenaire.at(-1)?.value === 'ANCIEN'
  && buildFilterOptions(listRows, NOW, { ...DEFAULT_FILTERS, session: 'fevrier-2025' }).session.some((o) => o.value === 'fevrier-2025' && o.label === 'Février 2025'))
check('tunnel, discipline, langue, etape, tri', opts.tunnel.map((o) => o.label).join() === 'Tous,Session officielle,Sur mesure,Famille,Club et Groupe'
  && opts.discipline.map((o) => o.label).join() === 'Toutes,Lutte,MMA,Combo Lutte + MMA' && opts.langue.map((o) => o.label).join() === 'Toutes,Français,Anglais'
  && opts.source[0].label === 'Toutes' && opts.etape[0].label === 'Toutes' && opts.etape.length === 11 && opts.tri === TRI_OPTIONS && TRI_OPTIONS[0].value === DEFAULT_FILTERS.tri)
check('libelles des valeurs', filterValueLabel('session', 'upcoming') === 'Camps à venir' && filterValueLabel('session', 'none') === 'Sans session'
  && filterValueLabel('session', 'toussaint-2026') === 'Toussaint 2026' && filterValueLabel('source', 'inconnue') === 'Inconnue'
  && filterValueLabel('partenaire', 'due') === 'Bonus dû' && filterValueLabel('langue', 'en') === 'Anglais' && filterValueLabel('etape', 'a_relancer') === 'À relancer')
const chips = activeFilterChips({ ...DEFAULT_FILTERS, q: 'x', partenaire: 'STRIKE', source: 'inconnue', session: 'toussaint-2026' })
check('pastilles dans l ordre du panneau', chips.map((c) => c.label).join(' | ') === 'Session : Toussaint 2026 | Source : Inconnue | Partenaire : STRIKE', chips.map((c) => c.label).join(' | '))
check('aucune pastille par defaut', activeFilterChips(DEFAULT_FILTERS).length === 0)
check('options et pastilles sans em dash ni esperluette', !/[\u2013\u2014&]/.test(JSON.stringify([opts, chips])))
// lignes (accueil et liste)
check('icone pour chaque etape', Object.keys(STEP_ICON).length === 15 && STEP_ICON.a_relancer === 'bell' && STEP_ICON.clos === 'check')
check('lien de fiche', dossierHref('abc') === '/admin/inscriptions/abc')
check('nom absent', candidateName(row({ candidate: null })) === 'Nom non renseigné' && firstNameOf(row({})) === 'Test')
check('whatsapp', whatsappHref('+33 6 00 00 00 12') === 'https://wa.me/33600000012' && whatsappHref('123') === null && whatsappHref(null) === null)
check('camp : discipline puis session, ou le tunnel', campParts(row({ camp_discipline: 'mma', session_id: 'toussaint-2026' })).join() === 'MMA,Toussaint 2026'
  && campParts(row({ tunnel_type: 'groupe' })).join() === 'Club et Groupe')
check('source referent accentuee', sourceLabel('referral') === 'Site référent' && sourceLabel('inconnu') === 'inconnu')
check('origine : partenaire prioritaire', originOf(row({ referral_code: 'STRIKE', referral_code_valid: true, attribution_source: 'google_ads' }))?.text === 'Code STRIKE')
check('origine : code invalide au ton warn', JSON.stringify(originOf(row({ referral_code: 'FAKE10', referral_code_valid: false }))) === JSON.stringify({ text: 'Code invalide (FAKE10)', warn: true }))
check('origine : source, sinon rien', originOf(row({ attribution_source: 'google_ads' }))?.text === 'Google Ads' && originOf(row({})) === null)
check('niveau MMA a verifier', mmaLevelToCheck(row({ camp_discipline: 'mma' })) && !mmaLevelToCheck(row({ camp_discipline: 'mma', status: 'validee' }))
  && !mmaLevelToCheck(row({ camp_discipline: 'mma', tunnel_type: 'groupe' })) && !mmaLevelToCheck(row({ camp_discipline: 'lutte' })))

console.log(ko === 0 ? '\nTOUT VERT' : '\n' + ko + ' ECHEC(S)')
process.exit(ko === 0 ? 0 : 1)

