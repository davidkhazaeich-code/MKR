'use client'

import { useEffect } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'
import { useTranslations } from 'next-intl'

// Lien Cal.com de Ruslan (event "15min" = visio de selection). Surchargeable via
// NEXT_PUBLIC_CAL_LINK pour pouvoir changer l'event sans toucher au code.
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || 'ruslan-mukhtarov-mkr/15min'
const CAL_NAMESPACE = '15min'
// URL publique de repli si l'embed ne charge pas (reseau bloque, adblock...).
const CAL_FALLBACK_URL = `https://cal.com/${CAL_LINK}`

type Props = {
  prenom: string
  nom: string
  email: string
}

/**
 * Calendrier Cal.com inline affiche sur l'ecran de confirmation de candidature.
 * Le candidat reserve sa visio de selection avec Ruslan ; Cal.com envoie alors
 * nativement l'invitation iCal (.ics) au candidat et a Ruslan. Pre-rempli avec
 * le nom + email deja saisis dans le formulaire.
 */
export default function VisioBooking({ prenom, nom, email }: Props) {
  const t = useTranslations('inscription.success.booking')

  useEffect(() => {
    ;(async () => {
      try {
        const cal = await getCalApi({ namespace: CAL_NAMESPACE })
        cal('ui', { hideEventTypeDetails: false, layout: 'month_view' })
      } catch {
        // L'embed n'a pas pu s'initialiser : on garde le lien de repli visible.
      }
    })()
  }, [])

  const fullName = `${prenom} ${nom}`.trim()

  return (
    <section className="visio-booking" aria-labelledby="visio-booking-title">
      <span className="label-tag visio-booking-step" style={{ color: 'var(--primary)' }}>
        {t('step')}
      </span>
      <h3 id="visio-booking-title" className="visio-booking-title">
        {t('title')}
      </h3>
      <p className="visio-booking-sub">{t('subtitle')}</p>

      <div className="visio-booking-embed">
        <Cal
          namespace={CAL_NAMESPACE}
          calLink={CAL_LINK}
          style={{ width: '100%', height: '100%', overflow: 'scroll' }}
          config={{
            layout: 'month_view',
            name: fullName,
            email,
          }}
        />
      </div>

      <p className="visio-booking-fallback">
        {t('fallback_prefix')}{' '}
        <a href={CAL_FALLBACK_URL} target="_blank" rel="noopener noreferrer">
          {t('fallback_link')}
        </a>
      </p>
    </section>
  )
}
