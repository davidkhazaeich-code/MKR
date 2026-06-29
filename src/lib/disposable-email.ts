// Detection des adresses email jetables / temporaires les plus courantes.
// But : bloquer les inscriptions spam qui utilisent une boite throwaway, sans
// dependance externe ni appel API (aucune latence, aucune cle).
//
// Liste volontairement CONSERVATRICE (domaines ultra-connus uniquement) pour
// ne jamais bloquer un email professionnel inhabituel mais legitime. Si un
// vrai candidat tombe dessus, le message d'erreur lui demande poliment une
// adresse permanente.
const DISPOSABLE_DOMAINS = new Set<string>([
  '0-mail.com', '10minutemail.com', '10minutemail.net', '20minutemail.com',
  '33mail.com', 'anonbox.net', 'discard.email', 'dispostable.com',
  'emailondeck.com', 'fakeinbox.com', 'fakemailgenerator.com', 'getairmail.com',
  'getnada.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamailblock.com', 'inboxkitten.com', 'luxusmail.org',
  'mailcatch.com', 'maildrop.cc', 'mailinator.com', 'mailinator.net',
  'mailnesia.com', 'mailnull.com', 'mailtemp.net', 'mintemail.com',
  'moakt.com', 'mohmal.com', 'mytemp.email', 'nada.email',
  'sharklasers.com', 'spam4.me', 'spamgourmet.com', 'temp-mail.io',
  'temp-mail.org', 'tempmail.com', 'tempmailo.com', 'tempr.email',
  'throwawaymail.com', 'tmpeml.com', 'tmpmail.org', 'trashmail.com',
  'trashmail.de', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
])

/**
 * Retourne true si l'email utilise un domaine jetable connu (ou un sous-domaine
 * d'un domaine jetable, ex: foo.guerrillamail.com). Insensible a la casse.
 * Ne valide PAS le format de l'email (deja fait en amont).
 */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf('@')
  if (at === -1) return false
  const domain = email.slice(at + 1).trim().toLowerCase()
  if (!domain) return false
  if (DISPOSABLE_DOMAINS.has(domain)) return true
  for (const d of DISPOSABLE_DOMAINS) {
    if (domain.endsWith('.' + d)) return true
  }
  return false
}
