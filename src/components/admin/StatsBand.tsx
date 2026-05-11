// Bande de KPIs en haut de la liste admin.
// "À traiter" en hero, 3 secondaires en row compact.

import Icon from './ui/Icon'
import type { Status } from '@/lib/admin-transitions'

interface Props {
  countsByStatus: Record<Status, number>
  staleVisioCount: number
  total: number
}

export default function StatsBand({ countsByStatus, staleVisioCount, total }: Props) {
  const aTraiter = countsByStatus.recue ?? 0
  const validees = countsByStatus.validee ?? 0
  const enCours = (countsByStatus.soldee ?? 0) + (countsByStatus.camp_fait ?? 0)
  const aTraiterAlert = aTraiter >= 5

  return (
    <div className="adm-stats-band" aria-label="Indicateurs clés">
      {/* Hero : À traiter (le KPI qui doit attirer l'œil de Ruslan) */}
      <div
        className={`adm-stat-hero${aTraiterAlert ? ' adm-stat-hero--alert' : ''}`}
        style={{ ['--adm-stat-accent' as string]: 'var(--adm-status-recue)' }}
        title={`${aTraiter} candidatures reçues à traiter`}
      >
        <div className="adm-stat-hero-content">
          <p className="adm-stat-hero-label">
            <span style={{ color: 'var(--adm-status-recue)', display: 'inline-flex' }}>
              <Icon name="inbox" size={18} strokeWidth={2.2} />
            </span>
            À traiter
          </p>
          <p className="adm-stat-hero-value">{aTraiter}</p>
          <p className="adm-stat-hero-hint">
            {aTraiter === 0
              ? 'Aucun dossier en attente d\'appel'
              : aTraiter === 1
                ? 'dossier à appeler aujourd\'hui'
                : 'dossiers à appeler aujourd\'hui'}
          </p>
        </div>
        <div className="adm-stat-hero-decor" aria-hidden="true" />
      </div>

      {/* Row des 3 KPI secondaires */}
      <div className="adm-stats-secondary">
        <StatCard
          icon="alert-triangle"
          label="Visio en retard"
          value={staleVisioCount}
          accent="var(--adm-status-refusee)"
          alert={staleVisioCount > 0}
          title={`${staleVisioCount} dossiers en attente depuis plus de 7 jours`}
        />
        <StatCard
          icon="check-circle"
          label="Validées · à régler"
          value={validees}
          accent="var(--adm-status-validee)"
          title={`${validees} dossiers validés en attente de paiement`}
        />
        <StatCard
          icon="sparkles"
          label="Soldées + Camp fait"
          value={enCours}
          accent="var(--adm-status-soldee)"
          title={`${enCours} dossiers soldés ou camp effectué (sur ${total} au total)`}
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  accent,
  alert,
  title,
}: {
  icon: 'inbox' | 'alert-triangle' | 'check-circle' | 'sparkles'
  label: string
  value: number
  accent: string
  alert?: boolean
  title: string
}) {
  return (
    <div
      className={alert ? 'adm-stat-card adm-stat-card--alert' : 'adm-stat-card'}
      style={{ ['--adm-stat-accent' as string]: accent }}
      title={title}
    >
      <p className="adm-stat-label">
        <span style={{ color: accent, display: 'inline-flex', alignItems: 'center' }}>
          <Icon name={icon} size={14} strokeWidth={2.2} />
        </span>
        {label}
      </p>
      <p className={alert && value > 0 ? 'adm-stat-value adm-stat-value--alert' : 'adm-stat-value'}>
        {value}
      </p>
    </div>
  )
}
