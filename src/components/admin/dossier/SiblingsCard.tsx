// Autres dossiers du meme candidat (onglet Profil, composant serveur) :
// session ou tunnel, statut, date de reception, lien vers la fiche (ligne a
// lien etire). Rien quand le candidat n'a qu'un dossier.

import Link from 'next/link'
import Icon from '@/components/admin/ui/Icon'
import StatusLabel from '@/components/admin/ui/StatusLabel'
import type { SiblingDossier } from '@/lib/admin/data'
import { formatNumericDate, plural } from '@/lib/admin/format'
import { TUNNEL_LABEL, sessionShortNameFromId } from '@/lib/admin/labels'
import { dossierHref } from '@/lib/admin/row-helpers'

export default function SiblingsCard({ siblings }: { siblings: SiblingDossier[] }) {
  if (siblings.length === 0) return null
  return (
    <section className="adm-card" aria-labelledby="adm-profil-siblings">
      <div className="adm-card-header">
        <h2 id="adm-profil-siblings" className="adm-card-title">
          <Icon name="list" size={14} />
          Autres dossiers du candidat
        </h2>
        <span className="adm-section-count">{plural(siblings.length, 'dossier', 'dossiers')}</span>
      </div>
      <ul className="adm-rows adm-dossier-siblings">
        {siblings.map((s) => (
          <li key={s.id} className="adm-row">
            <div className="adm-row-main">
              <Link href={dossierHref(s.id)} className="adm-row-link adm-row-title">
                {sessionShortNameFromId(s.session_id) ?? TUNNEL_LABEL[s.tunnel_type]}
              </Link>
              <p className="adm-row-meta adm-meta">
                <span>
                  <StatusLabel status={s.status} />
                </span>
                <span>reçu le {formatNumericDate(s.created_at)}</span>
              </p>
            </div>
            <Icon name="chevron-right" size={18} className="adm-dossier-row-chevron" />
          </li>
        ))}
      </ul>
    </section>
  )
}
