// Visualisation funnel horizontale.
// Affiche les segments status proportionnellement aux comptes.

import type { Status } from '@/lib/admin-transitions'

const SEGMENT_ORDER: Array<{ key: Status; label: string; color: string }> = [
  { key: 'recue', label: 'Reçues', color: 'var(--adm-status-recue)' },
  { key: 'validee', label: 'Validées', color: 'var(--adm-status-validee)' },
  { key: 'soldee', label: 'Soldées', color: 'var(--adm-status-soldee)' },
  { key: 'camp_fait', label: 'Camp fait', color: 'var(--adm-status-camp_fait)' },
]

interface Props {
  counts: Record<Status, number>
}

export default function Pipeline({ counts }: Props) {
  const segments = SEGMENT_ORDER.map((s) => ({ ...s, count: counts[s.key] ?? 0 }))
  const total = segments.reduce((sum, s) => sum + s.count, 0)

  if (total === 0) {
    return (
      <div className="adm-pipeline" aria-label="Pipeline vide">
        <div className="adm-pipeline-segment adm-pipeline-segment-empty">Aucun dossier en pipeline</div>
      </div>
    )
  }

  return (
    <div className="adm-pipeline" aria-label="Pipeline candidatures">
      {segments.map((s) => {
        if (s.count === 0) return null
        const pct = (s.count / total) * 100
        return (
          <div
            key={s.key}
            className="adm-pipeline-segment"
            style={{
              ['--adm-pipeline-flex' as string]: String(s.count),
              ['--adm-pipeline-color' as string]: `${s.color}`,
              flex: s.count,
              background: `color-mix(in srgb, ${s.color} 55%, transparent)`,
            }}
            title={`${s.label} : ${s.count} (${Math.round(pct)} %)`}
          >
            {pct >= 14 && (
              <span style={{ padding: '0 0.4rem', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                {s.count} {s.label.toLowerCase()}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
