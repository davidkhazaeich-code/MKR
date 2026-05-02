// Stepper horizontal montrant la progression d'un dossier.
// 4 etapes principales: Recue -> Validee -> Soldee -> Camp fait.
// Branches refusee/annulee/reportee = etapes terminales sans progression.

import type { Status } from '@/lib/admin-transitions'

interface Step {
  key: Status
  label: string
}

const MAIN_FLOW: Step[] = [
  { key: 'recue', label: 'Reçue' },
  { key: 'validee', label: 'Validée' },
  { key: 'soldee', label: 'Soldée' },
  { key: 'camp_fait', label: 'Camp fait' },
]

const TERMINAL: Record<string, string> = {
  refusee: 'Refusée',
  annulee: 'Annulée',
  reportee: 'Reportée',
}

export default function Progress({ status }: { status: Status }) {
  if (TERMINAL[status]) {
    return (
      <ol className="adm-progress" aria-label="Progression">
        <li className="adm-progress-step adm-progress-step--current">
          <span>{TERMINAL[status]}</span>
        </li>
      </ol>
    )
  }

  const currentIndex = MAIN_FLOW.findIndex((s) => s.key === status)
  return (
    <ol className="adm-progress" aria-label="Progression">
      {MAIN_FLOW.map((step, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex
        const cls = ['adm-progress-step']
        if (isDone) cls.push('adm-progress-step--done')
        if (isCurrent) cls.push('adm-progress-step--current')
        return (
          <li key={step.key} className={cls.join(' ')}>
            <span>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
