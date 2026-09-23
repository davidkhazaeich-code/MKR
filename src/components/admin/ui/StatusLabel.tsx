// Statut d'un dossier : point de 8 px au ton du statut + libelle en couleur de
// texte (jamais une pastille bordee). ToneText : texte au ton, avec icone
// optionnelle (prochaine etape en liste).

import { STATUS_LABEL, STATUS_TONE } from '@/lib/admin/labels'
import type { Status, Tone } from '@/lib/admin/types'
import Icon, { type IconName } from './Icon'

export interface StatusLabelProps {
  status: Status
  /** md : lignes et listes (14 px) ; lg : en-tete de fiche (15 px, point de 10 px). */
  size?: 'md' | 'lg'
}

export default function StatusLabel({ status, size = 'md' }: StatusLabelProps) {
  const cls = ['adm-status', `adm-tone--${STATUS_TONE[status]}`]
  if (size === 'lg') cls.push('adm-status--lg')
  return (
    <span className={cls.join(' ')}>
      <span className="adm-status-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  )
}

export { StatusLabel }

export interface ToneTextProps {
  tone: Tone
  icon?: IconName
  children: React.ReactNode
  /** 600 au lieu de 500 (etape qui attend une action). */
  strong?: boolean
}

export function ToneText({ tone, icon, children, strong = false }: ToneTextProps) {
  const cls = ['adm-tone-text', `adm-tone--${tone}`]
  if (strong) cls.push('adm-tone-text--strong')
  return (
    <span className={cls.join(' ')}>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
    </span>
  )
}
