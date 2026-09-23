// Carte "Acquisition" (onglet Profil, composant serveur) : d'ou vient le
// candidat (Google Ads en premier), avec le detail brut de l'attribution
// (campagne, mot-cle, annonce, identifiant de clic, site referent, page
// d'atterrissage, date de capture).

import Icon from '@/components/admin/ui/Icon'
import { DefList } from './ProfileCards'
import { formatDateTime } from '@/lib/admin/format'
import { sourceLabel } from '@/lib/admin/row-helpers'

const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'] as const

export default function AcquisitionCard({
  source,
  attribution,
}: {
  source: string | null
  attribution: Record<string, unknown> | null
}) {
  const attr = attribution ?? {}
  const str = (k: string): string | null => {
    const v = attr[k]
    return typeof v === 'string' && v.trim() ? v.trim() : null
  }
  const clickKey = CLICK_IDS.find((k) => str(k))
  const capturedAt = str('ts')
  const isGoogleAds = source === 'google_ads'

  const rows: [string, React.ReactNode][] = [
    ['Source', source ? sourceLabel(source) : <span className="adm-def-val--muted">Inconnue (accès direct ou non capturé)</span>],
  ]
  if (str('utm_source')) rows.push(['utm_source', str('utm_source')])
  if (str('utm_medium')) rows.push(['utm_medium', str('utm_medium')])
  if (str('utm_campaign')) rows.push(['Campagne (utm_campaign)', str('utm_campaign')])
  if (str('utm_term')) rows.push(['Mot-clé (utm_term)', str('utm_term')])
  if (str('utm_content')) rows.push(['Annonce (utm_content)', str('utm_content')])
  if (clickKey) rows.push([clickKey, <code key="cid" className="adm-mono adm-dossier-break">{str(clickKey)}</code>])
  if (str('referrer')) rows.push(['Site référent', <span key="ref" className="adm-dossier-break">{str('referrer')}</span>])
  if (str('landing')) rows.push(['Page d’atterrissage', <span key="land" className="adm-dossier-break">{str('landing')}</span>])
  if (capturedAt) rows.push(['Capture', formatDateTime(capturedAt)])

  return (
    <section className="adm-card" aria-labelledby="adm-profil-acquisition">
      <h2 id="adm-profil-acquisition" className="adm-card-title">
        <Icon name="zap" size={14} />
        Acquisition
      </h2>
      {isGoogleAds && (
        <p className="adm-dossier-note adm-tone--info">
          <Icon name="zap" size={16} />
          <span>Ce candidat vient de Google Ads.</span>
        </p>
      )}
      <DefList items={rows} />
    </section>
  )
}
