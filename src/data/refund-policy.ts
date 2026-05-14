/**
 * Politique d'annulation MKR — source unique.
 * Utilisée par /comment-ca-marche, /sessions, /cgv Article 4, /faq Inscription.
 *
 * Si la politique change, modifier ce fichier uniquement.
 */

export interface RefundTier {
  /** Délai avant le départ */
  delay: string
  /** Pourcentage remboursé */
  refund: string
  /** Couleur d'accent (vert/jaune/rouge) */
  tone: 'success' | 'warning' | 'danger'
}

export const REFUND_TIERS: RefundTier[] = [
  { delay: 'Plus de 60 jours', refund: '100%', tone: 'success' },
  { delay: '30 à 60 jours', refund: '50%', tone: 'warning' },
  { delay: 'Moins de 30 jours', refund: 'Non remboursable', tone: 'danger' },
]

export const REFUND_TONE_COLOR: Record<RefundTier['tone'], string> = {
  success: '#22c55e',
  warning: '#facc15',
  danger: '#ef4444',
}
