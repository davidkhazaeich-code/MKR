'use client'

import { useEffect } from 'react'
import {
  ATTR_COOKIE_NAME,
  ATTR_COOKIE_MAX_AGE,
  buildAttributionFromLocation,
  classifyAttribution,
  sourcePriority,
  type AttributionData,
} from '@/lib/attribution'

// Capture d'attribution cote client, montee dans le layout [locale] (toutes les
// pages publiques FR + EN, y compris /inscription et /en/apply).
//
// A chaque chargement de page (clic sur une annonce Google Ads = full load avec
// ?gclid=...), on lit l'URL et on pose/rafraichit le cookie first-party mkr_attr.
// On NE strippe PAS l'URL (gtag.js lit le gclid pour ses propres conversions).
//
// Arbitrage last-touch avec priorite : une visite directe/organique ulterieure
// n'ecrase jamais une attribution payante (google_ads / meta_ads) deja capturee,
// pour qu'on sache toujours si un clic Ad a amene ce lead.
function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[1]) : null
}

function readExisting(): AttributionData | null {
  const raw = readCookie(ATTR_COOKIE_NAME)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as AttributionData) : null
  } catch {
    return null
  }
}

export default function AttributionCapture() {
  useEffect(() => {
    try {
      const next = buildAttributionFromLocation(
        window.location.search,
        document.referrer,
        window.location.pathname,
        new Date().toISOString(),
      )
      // Pas de signal marketing sur cette page : on ne touche a rien (une visite
      // directe ne doit pas ecraser une attribution existante).
      if (!next) return

      const existing = readExisting()
      if (existing) {
        const existingPrio = sourcePriority(classifyAttribution(existing))
        const nextPrio = sourcePriority(classifyAttribution(next))
        // Ne pas retrograder une attribution plus forte deja posee.
        if (nextPrio < existingPrio) return
      }

      const secure = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie =
        `${ATTR_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(next))}` +
        `; Max-Age=${ATTR_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`
    } catch {
      // Capture best-effort : ne jamais casser le rendu de la page.
    }
    // Montage uniquement : les clics d'annonces sont des chargements complets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
