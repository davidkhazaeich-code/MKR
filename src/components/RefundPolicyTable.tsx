import { REFUND_TIERS, REFUND_TONE_COLOR } from '@/data/refund-policy'

interface RefundPolicyTableProps {
  /** Libellé de la première colonne (défaut : "Délai avant le camp") */
  delayHeader?: string
  /** Libellé de la deuxième colonne (défaut : "Remboursement") */
  refundHeader?: string
  /** Style supplémentaire sur le wrapper */
  className?: string
}

export default function RefundPolicyTable({
  delayHeader = 'Délai avant le camp',
  refundHeader = 'Remboursement',
  className,
}: RefundPolicyTableProps) {
  return (
    <table className={`table-tonal${className ? ` ${className}` : ''}`}>
      <thead>
        <tr>
          <th>{delayHeader}</th>
          <th>{refundHeader}</th>
        </tr>
      </thead>
      <tbody>
        {REFUND_TIERS.map((tier, i) => (
          <tr key={i}>
            <td>{tier.delay}</td>
            <td style={{ color: REFUND_TONE_COLOR[tier.tone] }}>{tier.refund}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
