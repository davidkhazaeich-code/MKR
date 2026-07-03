// Source unique des transitions de status admin pour les candidatures.
// Reflète le diagramme §4.1 de PLAN_GESTION_INSCRIPTIONS.md.
// Flow : form -> RECUE -> Ruslan valide -> VALIDEE -> visio + virement/cash post-visio -> SOLDEE -> camp -> CAMP_FAIT.
// Branches : REFUSEE (avant paiement), ANNULEE / REPORTEE (à toute étape).
// Pas de paiement upfront, pas de Stripe : tout passe par virement bancaire ou espèces après l'entretien visio.

export const STATUS_VALUES = [
  'recue',
  'validee',
  'refusee',
  'soldee',
  'camp_fait',
  'annulee',
  'reportee',
] as const

export type Status = (typeof STATUS_VALUES)[number]

export const STATUS_LABEL: Record<Status, string> = {
  recue: 'Reçue',
  validee: 'Validée',
  refusee: 'Refusée',
  soldee: 'Soldée',
  camp_fait: 'Camp fait',
  annulee: 'Annulée',
  reportee: 'Reportée',
}

export const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  recue: ['validee', 'refusee', 'annulee', 'reportee'],
  validee: ['soldee', 'annulee', 'reportee'],
  soldee: ['camp_fait', 'annulee'],
  refusee: [],
  annulee: [],
  reportee: [],
  camp_fait: [],
}

export function canTransition(from: Status, to: Status): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

// Note manuelle ajoutée à audit_log pour rappeler à Ruslan ce qu'il doit
// faire hors-app (envoi du RIB, vérification du virement reçu, etc.).
export const TRANSITION_REMINDER: Partial<Record<Status, string>> = {
  validee: 'À FAIRE : planifier la visio avec le candidat, puis préparer et envoyer le contrat depuis la carte Contrat (le RIB est inclus dans le contrat et l’email).',
  refusee: 'Aucun paiement n\'a été pris : pas de remboursement à effectuer.',
  reportee: 'Recaler le candidat sur une session ultérieure ou des dates sur mesure (90 j minimum).',
  soldee: 'À VÉRIFIER : montant total reçu (virement ou espèces) avant le départ du camp.',
  annulee: 'Si un paiement a été reçu, appliquer la grille d\'annulation (100% à >60j, 50% à 30-60j, 0% à <30j).',
}
