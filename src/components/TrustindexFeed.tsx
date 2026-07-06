'use client'

import { useEffect, useRef } from 'react'

/* Widget feed Instagram Trustindex (@mkrcamp).
 *
 * Trustindex injecte son widget a la position DOM de son <script>. On ajoute
 * donc le script DANS notre conteneur (et non via <head>) pour maitriser
 * l'emplacement : la section "Suivez le camp" juste avant le footer. Injection
 * cote client (useEffect) avec garde anti-double-montage (StrictMode / retour
 * de navigation).
 *
 * Necessite l'origine cdn.trustindex.io dans la CSP (script-src + style-src +
 * font-src) et *.trustindex.io dans connect-src. Voir next.config.ts.
 * Pour changer de feed : remplacer l'ID a la fin de TRUSTINDEX_SRC.
 */

const TRUSTINDEX_SRC =
  'https://cdn.trustindex.io/loader-feed.js?eaa0efc7528997977a063a08604'

export default function TrustindexFeed() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    // Evite un double widget (StrictMode dev, ou re-montage sur navigation SPA).
    if (container.querySelector('script[data-trustindex-feed]')) return
    const script = document.createElement('script')
    script.src = TRUSTINDEX_SRC
    script.async = true
    script.defer = true
    script.setAttribute('data-trustindex-feed', '')
    container.appendChild(script)
  }, [])

  return <div ref={ref} className="ti-feed-mount" />
}
