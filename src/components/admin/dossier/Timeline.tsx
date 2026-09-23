// Historique du dossier (onglet Historique, composant serveur) : chaque
// evenement traduit par describeAuditEvent, point au ton de l'evenement,
// date (Europe/Zurich) et acteur, detail, puis le rappel post-transition.
// Du plus recent au plus ancien ; la lecture serveur s'arrete a 80 evenements.

import Icon from '@/components/admin/ui/Icon'
import { describeAuditEvent, type AuditRow } from '@/lib/admin/audit-labels'
import { formatDateTime, plural } from '@/lib/admin/format'

const AUDIT_LIMIT = 80

export default function Timeline({ audit }: { audit: AuditRow[] }) {
  return (
    <section className="adm-card" aria-labelledby="adm-historique-title">
      <div className="adm-card-header">
        <h2 id="adm-historique-title" className="adm-card-title">
          <Icon name="history" size={14} />
          Historique
        </h2>
        {audit.length > 0 && (
          <span className="adm-section-count">
            {audit.length >= AUDIT_LIMIT ? `${AUDIT_LIMIT} derniers événements` : plural(audit.length, 'événement', 'événements')}
          </span>
        )}
      </div>
      {audit.length === 0 ? (
        <p className="adm-action-empty">Aucun événement enregistré.</p>
      ) : (
        <ol className="adm-timeline">
          {audit.map((e) => {
            const d = describeAuditEvent(e)
            const dot = d.tone ? `adm-timeline-dot adm-timeline-dot--accent adm-tone--${d.tone}` : 'adm-timeline-dot'
            return (
              <li key={e.id} className="adm-timeline-item">
                <span className={dot} aria-hidden="true" />
                <p className="adm-timeline-event">{d.label}</p>
                <p className="adm-timeline-time">
                  <time dateTime={e.at}>{formatDateTime(e.at)}</time> · {d.actor}
                </p>
                {d.detail && <p className="adm-timeline-detail">{d.detail}</p>}
                {d.reminder && (
                  <p className="adm-timeline-reminder">
                    <Icon name="alert-triangle" size={14} />
                    <span>{d.reminder}</span>
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
